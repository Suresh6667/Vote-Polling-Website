import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

interface PollResultsProps {
  poll: {
    id: string;
    question: string;
    options: string[];
    results: {
      total: number;
      choices: Record<number, number>;
      percentages: Record<number, number>;
    };
  };
  selectedChoice: number | null;
  insight?: string | null;
}

export function PollResults({ poll, selectedChoice, insight }: PollResultsProps) {
  const { options, results } = poll;
  const { total, choices, percentages } = results;

  // Find winning option
  const winningChoice = Object.entries(percentages).reduce(
    (max, [choice, percentage]) => 
      percentage > max.percentage ? { choice: parseInt(choice), percentage } : max,
    { choice: 0, percentage: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">{total} total votes</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">Live Results</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {options.map((option, index) => {
          const votes = choices[index] || 0;
          const percentage = percentages[index] || 0;
          const isSelected = selectedChoice === index;
          const isWinning = winningChoice.choice === index && total > 0;

          return (
            <div
              key={index}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isWinning
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Option Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{option}</span>
                  {isWinning && total > 0 && (
                    <Award className="w-4 h-4 text-green-600" />
                  )}
                  {isSelected && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Your vote
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    {votes} vote{votes !== 1 ? 's' : ''}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out ${
                    isSelected
                      ? 'bg-blue-500'
                      : isWinning
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                  style={{
                    width: `${Math.max(percentage, 2)}%`,
                    transform: 'translateX(0)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      {insight && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Poll Insight</h3>
              <p className="text-purple-700 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Votes Message */}
      {total === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No votes yet. Be the first to vote!</p>
        </div>
      )}
    </div>
  );
}