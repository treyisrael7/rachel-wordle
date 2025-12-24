// Stats management for localStorage

export interface WordLengthStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: Record<number, number>; // guess count -> number of wins
  lastCompletedAt: number | null; // timestamp
  lastAnswer: string | null; // prevent double counting
  lastResult: 'won' | 'lost' | null;
}

export interface GameStats {
  // Overall stats (aggregated across all word lengths)
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: Record<number, number>; // guess count -> number of wins
  lastCompletedAt: number | null; // timestamp
  lastAnswer: string | null; // prevent double counting
  lastResult: 'won' | 'lost' | null;
  // Per-word-length stats
  statsByWordLength: Record<number, WordLengthStats>;
}

const STATS_STORAGE_KEY = 'rachel-wordle-stats';

const DEFAULT_WORD_LENGTH_STATS: WordLengthStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessDistribution: {},
  lastCompletedAt: null,
  lastAnswer: null,
  lastResult: null,
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessDistribution: {},
  lastCompletedAt: null,
  lastAnswer: null,
  lastResult: null,
  statsByWordLength: {},
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
      // Ensure statsByWordLength exists and is an object
      if (!parsed.statsByWordLength || typeof parsed.statsByWordLength !== 'object') {
        parsed.statsByWordLength = {};
      }
      // Migrate old stats format: if statsByWordLength is empty but we have overall stats, initialize
      if (Object.keys(parsed.statsByWordLength).length === 0 && parsed.gamesPlayed > 0) {
        // Keep overall stats as-is for backward compatibility
      }
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return DEFAULT_STATS;
}

function getWordLengthStats(stats: GameStats, wordLength: number): WordLengthStats {
  if (!stats.statsByWordLength[wordLength]) {
    stats.statsByWordLength[wordLength] = { ...DEFAULT_WORD_LENGTH_STATS };
  }
  return stats.statsByWordLength[wordLength];
}

function updateOverallStats(stats: GameStats, wordLengthStats: WordLengthStats): void {
  // Aggregate overall stats from all word lengths
  let totalGames = 0;
  let totalWins = 0;
  let overallBestStreak = 0;
  const overallGuessDistribution: Record<number, number> = {};
  
  // Sum up stats from all word lengths
  Object.values(stats.statsByWordLength).forEach((wlStats) => {
    totalGames += wlStats.gamesPlayed;
    totalWins += wlStats.wins;
    overallBestStreak = Math.max(overallBestStreak, wlStats.bestStreak);
    Object.entries(wlStats.guessDistribution).forEach(([guess, count]) => {
      overallGuessDistribution[Number(guess)] = (overallGuessDistribution[Number(guess)] || 0) + count;
    });
  });
  
  // Calculate overall current streak (longest active streak across all word lengths)
  const activeStreaks = Object.values(stats.statsByWordLength)
    .filter(s => s.lastResult === 'won')
    .map(s => s.currentStreak);
  const overallCurrentStreak = activeStreaks.length > 0 ? Math.max(...activeStreaks) : 0;
  
  stats.gamesPlayed = totalGames;
  stats.wins = totalWins;
  stats.currentStreak = overallCurrentStreak;
  stats.bestStreak = overallBestStreak;
  stats.guessDistribution = overallGuessDistribution;
  
  // Set overall last completed to the most recent
  const allLastCompleted = Object.values(stats.statsByWordLength)
    .map(s => s.lastCompletedAt)
    .filter((t): t is number => t !== null);
  stats.lastCompletedAt = allLastCompleted.length > 0 ? Math.max(...allLastCompleted) : null;
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
  maxGuesses: number,
  wordLength: number
): GameStats {
  const stats = loadStats();
  const now = Date.now();
  const wordLengthStats = getWordLengthStats(stats, wordLength);

  // Prevent double counting if same answer was just completed for this word length
  if (
    wordLengthStats.lastAnswer === answer &&
    wordLengthStats.lastCompletedAt &&
    now - wordLengthStats.lastCompletedAt < 60000 // 1 minute window
  ) {
    updateOverallStats(stats, wordLengthStats);
    saveStats(stats);
    return stats;
  }

  // Update per-word-length stats
  const updatedWordLengthStats: WordLengthStats = {
    ...wordLengthStats,
    gamesPlayed: wordLengthStats.gamesPlayed + 1,
    wins: wordLengthStats.wins + 1,
    currentStreak: wordLengthStats.currentStreak + 1,
    bestStreak: Math.max(wordLengthStats.bestStreak, wordLengthStats.currentStreak + 1),
    guessDistribution: {
      ...wordLengthStats.guessDistribution,
      [guessesUsed]: (wordLengthStats.guessDistribution[guessesUsed] || 0) + 1,
    },
    lastCompletedAt: now,
    lastAnswer: answer,
    lastResult: 'won',
  };

  stats.statsByWordLength[wordLength] = updatedWordLengthStats;
  updateOverallStats(stats, updatedWordLengthStats);
  
  // Set overall last result and answer
  stats.lastAnswer = answer;
  stats.lastResult = 'won';

  saveStats(stats);
  return stats;
}

export function updateStatsOnLoss(answer: string, wordLength: number): GameStats {
  const stats = loadStats();
  const now = Date.now();
  const wordLengthStats = getWordLengthStats(stats, wordLength);

  // Prevent double counting if same answer was just completed for this word length
  if (
    wordLengthStats.lastAnswer === answer &&
    wordLengthStats.lastCompletedAt &&
    now - wordLengthStats.lastCompletedAt < 60000 // 1 minute window
  ) {
    updateOverallStats(stats, wordLengthStats);
    saveStats(stats);
    return stats;
  }

  // Update per-word-length stats
  const updatedWordLengthStats: WordLengthStats = {
    ...wordLengthStats,
    gamesPlayed: wordLengthStats.gamesPlayed + 1,
    currentStreak: 0,
    lastCompletedAt: now,
    lastAnswer: answer,
    lastResult: 'lost',
  };

  stats.statsByWordLength[wordLength] = updatedWordLengthStats;
  updateOverallStats(stats, updatedWordLengthStats);
  
  // Set overall last result and answer
  stats.lastAnswer = answer;
  stats.lastResult = 'lost';

  saveStats(stats);
  return stats;
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

export function getStatsForWordLength(stats: GameStats, wordLength: number): WordLengthStats {
  return getWordLengthStats(stats, wordLength);
}

export function getAvailableWordLengths(stats: GameStats): number[] {
  const lengths = Object.keys(stats.statsByWordLength)
    .map(Number)
    .filter(length => stats.statsByWordLength[length].gamesPlayed > 0)
    .sort((a, b) => a - b);
  return lengths;
}

export function getWinRateForWordLength(stats: GameStats, wordLength: number): number {
  const wlStats = getStatsForWordLength(stats, wordLength);
  if (wlStats.gamesPlayed === 0) return 0;
  return Math.round((wlStats.wins / wlStats.gamesPlayed) * 100);
}

export function getMaxGuessCountForWordLength(stats: GameStats, wordLength: number): number {
  const wlStats = getStatsForWordLength(stats, wordLength);
  const counts = Object.keys(wlStats.guessDistribution).map(Number);
  return Math.max(...counts, 0);
}

