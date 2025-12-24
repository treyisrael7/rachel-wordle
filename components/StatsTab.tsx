'use client';

import { 
  GameStats, 
  getWinRate, 
  getMaxGuessCount, 
  resetStats,
  getStatsForWordLength,
  getAvailableWordLengths,
  getWinRateForWordLength,
  getMaxGuessCountForWordLength,
  WordLengthStats
} from '@/lib/stats';
import { useState } from 'react';
import Button from './ui/Button';
import { cn } from '@/lib/utils';

interface StatsTabProps {
  stats: GameStats;
  maxGuesses: number;
  wordLength: number;
  onStatsReset: () => void;
}

export default function StatsTab({ stats, maxGuesses, wordLength: currentWordLength, onStatsReset }: StatsTabProps) {
  const availableLengths = getAvailableWordLengths(stats);
  const hasPerLengthStats = availableLengths.length > 0;
  
  // Default to current word length if it has stats, otherwise 'all'
  const defaultView: 'all' | number = hasPerLengthStats && availableLengths.includes(currentWordLength)
    ? currentWordLength
    : 'all';
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedView, setSelectedView] = useState<'all' | number>(defaultView);
  
  // Determine which stats to display
  const displayStats: WordLengthStats | GameStats = selectedView === 'all' 
    ? stats 
    : getStatsForWordLength(stats, selectedView);
  
  const displayWinRate = selectedView === 'all'
    ? getWinRate(stats)
    : getWinRateForWordLength(stats, selectedView);
  
  const displayMaxGuessCount = selectedView === 'all'
    ? getMaxGuessCount(stats)
    : getMaxGuessCountForWordLength(stats, selectedView);
  
  const maxBarValue = Math.max(...Object.values(displayStats.guessDistribution), 1);

  const handleReset = () => {
    resetStats();
    onStatsReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Word Length Selector */}
      {hasPerLengthStats && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-neutral-500 block">
            View Stats
          </label>
          <div 
            className="relative inline-flex w-full rounded-2xl p-1 overflow-hidden"
            style={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Active pill indicator */}
            <div
              className="absolute inset-1 rounded-xl transition-transform duration-200 ease-out pointer-events-none"
              style={{
                backgroundColor: 'var(--primary)',
                width: `calc((100% - 0.5rem) / ${availableLengths.length + 1})`,
                transform: selectedView === 'all'
                  ? 'translateX(0%)'
                  : `translateX(${(availableLengths.indexOf(selectedView) + 1) * 100}%)`,
              }}
            />
            <button
              onClick={() => setSelectedView('all')}
              className={cn(
                'relative z-10 flex-1 rounded-xl px-3 py-2 text-sm font-medium leading-none transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                selectedView === 'all'
                  ? 'text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              All
            </button>
            {availableLengths.map((length) => (
              <button
                key={length}
                onClick={() => setSelectedView(length)}
                className={cn(
                  'relative z-10 flex-1 rounded-xl px-3 py-2 text-sm font-medium leading-none transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                  selectedView === length
                    ? 'text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {length} Letters
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-neutral-50 rounded-2xl">
          <div className="text-3xl font-semibold text-neutral-900">{displayStats.gamesPlayed}</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mt-1">Games Played</div>
        </div>
        <div className="text-center p-4 bg-neutral-50 rounded-2xl">
          <div className="text-3xl font-semibold text-green-600">{displayWinRate}%</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mt-1">Win Rate</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-100">
          <div className="text-3xl font-semibold text-pink-600">{displayStats.currentStreak}</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mt-1">Current Streak</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-100">
          <div className="text-3xl font-semibold text-pink-600">{displayStats.bestStreak}</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mt-1">Best Streak</div>
        </div>
      </div>

      {/* Guess Distribution */}
      <div>
        <h3 className="text-sm font-semibold mb-4 text-neutral-900">
          Guess Distribution
          {selectedView !== 'all' && (
            <span className="text-xs font-normal text-neutral-500 ml-2">
              ({selectedView} letters)
            </span>
          )}
        </h3>
        <div className="space-y-2">
          {Array.from({ length: maxGuesses }, (_, i) => {
            const guessNum = i + 1;
            const count = displayStats.guessDistribution[guessNum] || 0;
            const percentage = maxBarValue > 0 ? (count / maxBarValue) * 100 : 0;

            return (
              <div key={guessNum} className="flex items-center gap-3">
                <div className="w-6 text-sm font-medium text-neutral-600">{guessNum}</div>
                <div className="flex-1 bg-neutral-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: count > 0 ? '#10b981' : 'transparent',
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
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 text-center">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleReset}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Yes, Reset
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center pt-4 border-t border-neutral-200">
          <Button
            variant="secondary"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Stats
          </Button>
        </div>
      )}
    </div>
  );
}

