import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

class PollService {
  createPoll(question, options, expiryHours = 24) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const id = uuidv4();
      const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
      
      db.run(
        'INSERT INTO polls (id, question, options, expiry) VALUES (?, ?, ?, ?)',
        [id, question, JSON.stringify(options), expiry.toISOString()],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          const poll = {
            id,
            question,
            options,
            expiry: expiry.toISOString(),
            created_at: new Date().toISOString()
          };
          
          resolve(poll);
        }
      );
    });
  }

  getPoll(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(
        'SELECT * FROM polls WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          const poll = {
            ...row,
            options: JSON.parse(row.options),
            expired: new Date(row.expiry) < new Date()
          };
          
          resolve(poll);
        }
      );
    });
  }

  getPollWithResults(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const poll = await this.getPoll(id);
        if (!poll) {
          resolve(null);
          return;
        }

        const results = await this.getPollResults(id);
        resolve({ ...poll, results });
      } catch (err) {
        reject(err);
      }
    });
  }

  getPollResults(pollId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(
        'SELECT choice, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY choice',
        [pollId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Get total votes
          db.get(
            'SELECT COUNT(*) as total FROM votes WHERE poll_id = ?',
            [pollId],
            (err, totalRow) => {
              if (err) {
                reject(err);
                return;
              }
              
              const total = totalRow.total;
              const results = {
                total,
                choices: rows.reduce((acc, row) => {
                  acc[row.choice] = row.count;
                  return acc;
                }, {}),
                percentages: rows.reduce((acc, row) => {
                  acc[row.choice] = total > 0 ? (row.count / total) * 100 : 0;
                  return acc;
                }, {})
              };
              
              resolve(results);
            }
          );
        }
      );
    });
  }

  generateVoterHash(pollId, ip, userAgent) {
    const data = `${pollId}_${ip}_${userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  hasVoted(pollId, voterHash) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(
        'SELECT choice FROM votes WHERE poll_id = ? AND voter_hash = ?',
        [pollId, voterHash],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          resolve(row ? { hasVoted: true, choice: row.choice } : { hasVoted: false });
        }
      );
    });
  }

  submitVote(pollId, choice, voterHash) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const voteId = uuidv4();
      
      db.run(
        'INSERT OR IGNORE INTO votes (id, poll_id, choice, voter_hash) VALUES (?, ?, ?, ?)',
        [voteId, pollId, choice, voterHash],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          // Check if vote was actually inserted (not a duplicate)
          if (this.changes === 0) {
            reject(new Error('Vote already exists'));
            return;
          }
          
          resolve({ success: true, voteId });
        }
      );
    });
  }

  generateInsight(poll, results) {
    const { total, choices, percentages } = results;
    
    if (total < 20) {
      return null;
    }

    // Find leading option
    let leadingChoice = 0;
    let leadingPercentage = 0;
    
    Object.entries(percentages).forEach(([choice, percentage]) => {
      if (percentage > leadingPercentage) {
        leadingChoice = parseInt(choice);
        leadingPercentage = percentage;
      }
    });

    const leadingOption = poll.options[leadingChoice];
    const margin = leadingPercentage - Math.max(...Object.values(percentages).filter((_, i) => i !== leadingChoice));

    let insight;
    
    if (margin > 20) {
      insight = `"${leadingOption}" dominates with ${Math.round(leadingPercentage)}% - clear consensus among voters.`;
    } else if (margin > 10) {
      insight = `"${leadingOption}" leads with ${Math.round(leadingPercentage)}% - solid preference emerging.`;
    } else if (margin > 5) {
      insight = `"${leadingOption}" edges ahead with ${Math.round(leadingPercentage)}% - close competition continues.`;
    } else {
      insight = `Extremely tight race with "${leadingOption}" at ${Math.round(leadingPercentage)}% - nearly tied results.`;
    }

    return insight;
  }

  cleanupExpiredPolls() {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(
      'DELETE FROM votes WHERE poll_id IN (SELECT id FROM polls WHERE expiry < ?)',
      [now],
      (err) => {
        if (err) {
          console.error('Error cleaning up expired votes:', err);
        }
      }
    );
    
    db.run(
      'DELETE FROM polls WHERE expiry < ?',
      [now],
      (err) => {
        if (err) {
          console.error('Error cleaning up expired polls:', err);
        } else {
          console.log('Cleaned up expired polls');
        }
      }
    );
  }

  parseQuickCreate(question) {
    // Check for delimiters (, or |)
    const delimiters = /[,|]/;
    
    if (!delimiters.test(question)) {
      return null;
    }

    // Split by delimiters and clean up
    const parts = question.split(delimiters)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    if (parts.length < 2 || parts.length > 4) {
      return null;
    }

    // First part is the question, rest are options
    return {
      question: parts[0],
      options: parts.slice(1)
    };
  }
}

export const pollService = new PollService();