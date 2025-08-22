import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  QrCode,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { QRCodeDisplay } from "../components/QRCodeDisplay";
import { PollResults } from "../components/PollResults";
import { ShareButton } from "../components/ShareButton";
import { useSocket } from "../hooks/useSocket";
import PollTimer from "../components/PollTimer";

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiry: string;
  createdAt: string; // ✅ added this
  expired: boolean;
  shareUrl: string;
  results: {
    total: number;
    choices: Record<number, number>;
    percentages: Record<number, number>;
  };
}

export function PollPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);

  const socket = useSocket();

  useEffect(() => {
    if (id) fetchPoll();
  }, [id]);

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
      const res = await fetch(`/api/polls/${id}`);
      if (!res.ok) throw new Error("Poll not found");
      const data = await res.json();
      setPoll(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async () => {
    if (selectedChoice === null || !poll) return;
    setIsVoting(true);
    setVoteError(null);

    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: selectedChoice }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit vote");
      }
      const data = await res.json();
      setHasVoted(true);
      setPoll((prev) => (prev ? { ...prev, results: data.results } : null));
      if (data.insight) setInsight(data.insight);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit vote";
      setVoteError(msg);
      if (msg.includes("already voted")) setHasVoted(true);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-center">
          <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-20 w-64 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            <ShareButton shareUrl={poll.shareUrl} />
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poll Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Question */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-xl font-bold leading-relaxed">
              {poll.question}
            </h1>
          </div>

          {/* Poll status */}
          <div className="flex justify-between items-center p-4 text-sm text-slate-600 border-b">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {poll.results.total} votes
            </span>
            {poll.expired ? (
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <Clock className="w-4 h-4" /> Expired
              </span>
            ) : (
              <PollTimer expiry={poll.expiry} createdAt={poll.createdAt} />
            )}
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="p-6 border-b border-gray-200">
              <QRCodeDisplay pollId={poll.id} />
            </div>
          )}

          {/* Voting */}
          {!hasVoted && !poll.expired && (
            <div className="p-6 space-y-4">
              {poll.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`block p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedChoice === idx
                      ? "border-blue-600 bg-blue-50 shadow-md scale-[1.02]"
                      : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={idx}
                    checked={selectedChoice === idx}
                    onChange={() => setSelectedChoice(idx)}
                    className="sr-only"
                  />
                  <span className="font-medium text-slate-800">{option}</span>
                </label>
              ))}

              {voteError && <p className="text-red-600 text-sm">{voteError}</p>}

              <button
                onClick={submitVote}
                disabled={selectedChoice === null || isVoting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {isVoting ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
          )}

          {/* Results */}
          {(hasVoted || poll.expired) && (
            <div className="p-6">
              {hasVoted && !poll.expired && (
                <div className="mb-4 p-4 bg-green-50 rounded-xl flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Thanks for voting!</span>
                </div>
              )}
              <PollResults
                poll={poll}
                selectedChoice={hasVoted ? selectedChoice : null}
                insight={insight}
              />
              <div className="mt-6 pt-4 border-t text-right">
                <Link
                  to={`/results/${id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View full results →
                </Link>
              </div>
            </div>
          )}

          {/* Expired */}
          {poll.expired && !hasVoted && (
            <div className="p-8 text-center text-slate-600">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold">Poll Expired</h3>
              <p>Check out the final results above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
