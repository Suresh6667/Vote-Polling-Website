import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Vote, Clock, Lightbulb } from "lucide-react";

export function CreatePollPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiryHours, setExpiryHours] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ✅ Detect quick-create pattern globally
  const quickCreatePattern = /[,|]/;
  const hasQuickPattern = quickCreatePattern.test(question);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    let finalOptions = options.filter((opt) => opt.trim() !== "");
    let cleanedQuestion = question.trim();

    // ✅ Detect Quick-Create Pattern
    const quickCreatePattern = /[,|]/;
    if (quickCreatePattern.test(question)) {
      // Example: "Favorite Food? Pizza, Burgers, Tacos"
      const parts = question.split("?");
      const qText = parts[0].trim(); // Only the actual question (before "?")
      const rawOptions = parts[1] ? parts[1] : "";

      // Extract options
      if (rawOptions) {
        finalOptions = rawOptions
          .split(quickCreatePattern)
          .map((opt) => opt.trim())
          .filter((opt) => opt.length > 0);
      }

      // ✅ Replace actual question with cleaned text (remove options part)
      cleanedQuestion = qText.endsWith("?") ? qText : qText + "?";
    }

    if (finalOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanedQuestion, // ✅ use cleaned question only
          options: finalOptions,
          expiryHours,
        }),
      });

      if (!response.ok) throw new Error("Failed to create poll");

      const poll = await response.json();
      navigate(`/poll/${poll.id}`);
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a Poll
          </h1>
          <p className="text-gray-600">
            Ask a question and get instant feedback from your audience.
          </p>
        </div>
        {/* Quick Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Quick Create Tip
              </h3>
              <p className="text-blue-700 text-sm">
                Type your question with options separated by commas{" "}
                <strong>or</strong> pipes:
                <br />
                <code className="bg-blue-100 px-1 rounded text-xs mt-1 block">
                  {"What's for lunch? Pizza, Burgers, Tacos, Salad"}
                </code>
                <code className="bg-blue-100 px-1 rounded text-xs mt-1 block">
                  {"What's for lunch? Pizza | Burgers | Tacos | Salad"}
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Question */}
          <div className="mb-6">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Question
            </label>
            <div className="relative">
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask? (e.g., What's the best programming language?)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={120}
                required
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {question.length}/120
              </div>
            </div>

            {hasQuickPattern && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✨ Quick-create detected! We'll automatically split this into
                  options for you.
                </p>
              </div>
            )}
          </div>

          {/* Options (only show if no quick pattern) */}
          {!hasQuickPattern && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex-shrink-0 p-1 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 4 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </button>
              )}
            </div>
          )}

          {/* Expiry */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-1 text-blue-600" />
              Poll Duration
            </label>

            <div className="flex gap-3">
              {[1, 6, 12, 24].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setExpiryHours(hrs)}
                  className={`px-4 py-2 rounded-xl border transition text-sm font-medium
                  ${
                    expiryHours === hrs
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                   >
                  {hrs === 1 && "1h"}
                  {hrs === 6 && "6h"}
                  {hrs === 12 && "12h"}
                  {hrs === 24 && "24h"}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Poll...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Vote className="w-5 h-5 mr-2" />
                Create Poll
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
