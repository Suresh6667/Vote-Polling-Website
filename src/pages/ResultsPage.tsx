import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  QrCode,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PollResults } from "../components/PollResults";
import { QRCodeDisplay } from "../components/QRCodeDisplay";
import { ShareButton } from "../components/ShareButton";
import { useSocket } from "../hooks/useSocket";

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiry: string;
  expired: boolean;
  shareUrl: string;
  results: {
    total: number;
    choices: Record<number, number>;
    percentages: Record<number, number>;
  };
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const socket = useSocket();

  // 🔹 Fetch poll initially
  useEffect(() => {
    if (id) fetchPoll();
  }, [id]);

  // 🔹 Socket updates for live results
  useEffect(() => {
    if (socket && id) {
      socket.emit("joinPoll", id);

      socket.on("pollUpdate", (data) => {
        if (data.pollId === id) {
          setPoll((prev) => (prev ? { ...prev, results: data.results } : null));
          if (data.insight) setInsight(data.insight);
        }
      });

      return () => {
        socket.emit("leavePoll", id);
        socket.off("pollUpdate");
      };
    }
  }, [socket, id]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/polls/${id}`);
      if (!response.ok) throw new Error("Poll not found");

      const data = await response.json();
      setPoll(data);

      // Initial insight
      const resultsResponse = await fetch(`/api/polls/${id}/results`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        if (resultsData.insight) setInsight(resultsData.insight);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading UI
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <motion.div
          className="flex items-center gap-3 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading poll results...</span>
        </motion.div>
      </div>
    );
  }

  // 🔹 Error UI
  if (error || !poll) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Poll Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // 🔹 Main Results Page
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/poll/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Poll
          </Link>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Poll Results <Sparkles className="w-6 h-6 text-yellow-500" />
            </h1>
            <div className="flex items-center gap-2">
              <ShareButton shareUrl={poll.shareUrl} />
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Show QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <QRCodeDisplay pollId={poll.id} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {poll.question}
            </h2>
          </div>
          <div className="p-6">
            <PollResults poll={poll} selectedChoice={null} insight={insight} />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="flex-1 text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
          >
            Create Your Own Poll
          </Link>
          <Link
            to={`/poll/${id}`}
            className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
          >
            View Poll Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
