import express from 'express';
import { pollService } from '../services/pollService.js';
import QRCode from 'qrcode';

const router = express.Router();

// Create a new poll
router.post('/polls', async (req, res) => {
  try {
    const { question, options, expiryHours = 24 } = req.body;

    // Validate input
    if (!question || question.length > 120) {
      return res.status(400).json({ error: 'Question is required and must be 120 characters or less' });
    }

    if (!options || options.length < 2 || options.length > 4) {
      return res.status(400).json({ error: 'Poll must have 2-4 options' });
    }

    // Check for quick-create format
    let parsedPoll = null;
    if (options.length === 1 && options[0] === '') {
      parsedPoll = pollService.parseQuickCreate(question);
    }

    let finalQuestion, finalOptions;
    
    if (parsedPoll) {
      finalQuestion = parsedPoll.question;
      finalOptions = parsedPoll.options;
    } else {
      finalQuestion = question;
      finalOptions = options.filter(opt => opt.trim() !== '');
    }

    const poll = await pollService.createPoll(finalQuestion, finalOptions, expiryHours);
    
    res.status(201).json({
      ...poll,
      shareUrl: `${req.protocol}://${req.get('host')}/poll/${poll.id}`
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get poll details
router.get('/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await pollService.getPollWithResults(id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json({
      ...poll,
      shareUrl: `${req.protocol}://${req.get('host')}/poll/${poll.id}`
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// Submit a vote
router.post('/polls/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { choice } = req.body;
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || '';

    // Get poll to check if it exists and isn't expired
    const poll = await pollService.getPoll(id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.expired) {
      return res.status(400).json({ error: 'This poll has expired' });
    }

    // Validate choice
    if (choice < 0 || choice >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid choice' });
    }

    // Generate voter hash
    const voterHash = pollService.generateVoterHash(id, ip, userAgent);
    
    // Check if user has already voted
    const voteStatus = await pollService.hasVoted(id, voterHash);
    
    if (voteStatus.hasVoted) {
      return res.status(400).json({ 
        error: "You've already voted",
        choice: voteStatus.choice
      });
    }

    // Submit vote
    await pollService.submitVote(id, choice, voterHash);

    // Get updated results
    const results = await pollService.getPollResults(id);
    
    // Generate insight if we have enough votes
    let insight = null;
    if (results.total >= 20) {
      insight = pollService.generateInsight(poll, results);
    }

    // Broadcast updated results to all connected clients
    req.io.to(`poll_${id}`).emit('pollUpdate', {
      pollId: id,
      results,
      insight
    });

    res.json({ 
      success: true, 
      results,
      insight
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    
    if (error.message === 'Vote already exists') {
      return res.status(400).json({ error: "You've already voted" });
    }
    
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Generate QR code for poll
router.get('/polls/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    const shareUrl = `${req.protocol}://${req.get('host')}/poll/${id}`;
    
    const qrCode = await QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#3B82F6',
        light: '#FFFFFF'
      }
    });
    
    res.json({ qrCode, shareUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get poll results only
router.get('/polls/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await pollService.getPoll(id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const results = await pollService.getPollResults(id);
    
    let insight = null;
    if (results.total >= 20) {
      insight = pollService.generateInsight(poll, results);
    }

    res.json({ results, insight });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export { router as pollRoutes };