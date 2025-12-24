// Stats management for localStorage

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: Record<number, number>; // guess count -> number of wins
  lastCompletedAt: number | null; // timestamp
  lastAnswer: string | null; // prevent double counting
  lastResult: 'won' | 'lost' | null;
}

const STATS_STORAGE_KEY = 'rachel-wordle-stats';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessDistribution: {},
  lastCompletedAt: null,
  lastAnswer: null,
  lastResult: null,
};

export function loadStats(): GameStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure guessDistribution is an object
      if (!parsed.guessDistribution || typeof parsed.guessDistribution !== 'object') {
        parsed.guessDistribution = {};
      }
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return DEFAULT_STATS;
}

export function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function updateStatsOnWin(
  guessesUsed: number,
  answer: string,
  maxGuesses: number
): GameStats {
  const stats = loadStats();
  const now = Date.now();

  // Prevent double counting if same answer was just completed
  if (
    stats.lastAnswer === answer &&
    stats.lastCompletedAt &&
    now - stats.lastCompletedAt < 60000 // 1 minute window
  ) {
    return stats;
  }

  const newStats: GameStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins + 1,
    currentStreak: stats.currentStreak + 1,
    bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1),
    guessDistribution: {
      ...stats.guessDistribution,
      [guessesUsed]: (stats.guessDistribution[guessesUsed] || 0) + 1,
    },
    lastCompletedAt: now,
    lastAnswer: answer,
    lastResult: 'won',
  };

  saveStats(newStats);
  return newStats;
}

export function updateStatsOnLoss(answer: string): GameStats {
  const stats = loadStats();
  const now = Date.now();

  // Prevent double counting if same answer was just completed
  if (
    stats.lastAnswer === answer &&
    stats.lastCompletedAt &&
    now - stats.lastCompletedAt < 60000 // 1 minute window
  ) {
    return stats;
  }

  const newStats: GameStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastCompletedAt: now,
    lastAnswer: answer,
    lastResult: 'lost',
  };

  saveStats(newStats);
  return newStats;
}

export function resetStats(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset stats:', e);
  }
}

export function getWinRate(stats: GameStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.gamesPlayed) * 100);
}

export function getMaxGuessCount(stats: GameStats): number {
  const counts = Object.keys(stats.guessDistribution).map(Number);
  return Math.max(...counts, 0);
}

