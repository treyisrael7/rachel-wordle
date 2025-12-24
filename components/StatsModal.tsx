'use client';

import { GameStats, getWinRate, getMaxGuessCount, resetStats } from '@/lib/stats';
import { useState } from 'react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  maxGuesses: number;
  onStatsReset: () => void;
}

export default function StatsModal({
  isOpen,
  onClose,
  stats,
  maxGuesses,
  onStatsReset,
}: StatsModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const winRate = getWinRate(stats);
  const maxGuessCount = getMaxGuessCount(stats);
  const maxBarValue = Math.max(...Object.values(stats.guessDistribution), 1);

  const handleReset = () => {
    resetStats();
    onStatsReset();
    setShowResetConfirm(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Statistics</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.bestStreak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">
            Guess Distribution
          </h3>
          <div className="space-y-2">
            {Array.from({ length: maxGuesses }, (_, i) => {
              const guessNum = i + 1;
              const count = stats.guessDistribution[guessNum] || 0;
              const percentage = maxBarValue > 0 ? (count / maxBarValue) * 100 : 0;

              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <div className="w-8 text-sm font-medium">{guessNum}</div>
                  <div className="flex-1 bg-gray-200 rounded h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: count > 0 ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-white">
                          {count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        {showResetConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center mb-2">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
            >
              Reset Stats
            </button>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

