'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Board from '@/components/Board';
import Keyboard from '@/components/Keyboard';
import Modal from '@/components/Modal';
import HelpModal from '@/components/HelpModal';
import StatsTab from '@/components/StatsTab';
import SettingsTab from '@/components/SettingsTab';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { RotateCcw, HelpCircle } from 'lucide-react';
import {
  GameState,
  createGameState,
  addLetterToGuess,
  removeLetterFromGuess,
  submitGuess,
  GameStatus,
} from '@/lib/wordle';
import { getRandomWord, isValidWord, loadWordSets, clearWordCache } from '@/lib/wordlist';
import {
  BRANDING,
  getRandomWinMessage,
  getLoseMessage,
} from '@/lib/config';
import {
  GameStats,
  loadStats,
  updateStatsOnWin,
  updateStatsOnLoss,
} from '@/lib/stats';
import {
  generateShareText,
  copyToClipboard,
  getSiteUrl,
} from '@/lib/share';

const STORAGE_KEY = 'wordle-game-state';

function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure keyStatusMap exists for backward compatibility
      if (!parsed.keyStatusMap) {
        parsed.keyStatusMap = {};
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return null;
}

function saveGameState(state: GameState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

function startNewGame(wordLength: number, maxGuesses: number): GameState {
  const answer = getRandomWord(wordLength);
  console.log('Starting new game with answer:', answer, 'length:', wordLength);
  const state = createGameState(wordLength, maxGuesses, answer);
  // Verify answer is set correctly and is a valid word
  if (state.answer !== answer.toUpperCase() || state.answer.length !== wordLength) {
    throw new Error(`Answer validation failed: expected length ${wordLength}, got ${state.answer.length}`);
  }
  // Verify the answer is in the dictionary
  if (!isValidWord(state.answer, wordLength)) {
    throw new Error(`Generated answer "${state.answer}" is not in dictionary for length ${wordLength}`);
  }
  return state;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('board');
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [winMessage, setWinMessage] = useState<string>('');
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [wordsError, setWordsError] = useState<string | null>(null);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const initializedRef = useRef(false);

  // Load dictionaries on mount
  useEffect(() => {
    let mounted = true;
    
    const loadDictionaries = async () => {
      try {
        setIsLoadingWords(true);
        setWordsError(null);
        await loadWordSets();
        if (mounted) {
          setWordsLoaded(true);
          setIsLoadingWords(false);
        }
      } catch (error) {
        console.error('Failed to load dictionaries:', error);
        if (mounted) {
          setWordsError(error instanceof Error ? error.message : 'Failed to load dictionaries');
          setIsLoadingWords(false);
        }
      }
    };

    loadDictionaries();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize game after words are loaded (only once)
  useEffect(() => {
    if (!wordsLoaded || initializedRef.current) {
      return; // Don't re-initialize
    }

    try {
      initializedRef.current = true;
      const saved = loadGameState();
      if (saved && saved.status === 'playing') {
        setGameState(saved);
      } else {
        // Only start new game if gameState is null (not already set by reset)
        // Use a function to check current state to avoid stale closure
        setGameState((currentState) => {
          if (currentState) {
            // Game state already exists (e.g., from reset), don't overwrite
            return currentState;
          }
          // No game state exists, start new game
          return startNewGame(5, 6);
        });
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setWordsError('Failed to initialize game. Please refresh the page.');
      initializedRef.current = false; // Allow retry
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsLoaded]); // Only depend on wordsLoaded, not gameState

  // Save game state whenever it changes
  useEffect(() => {
    if (!gameState) return;
    
    // Only save if game is actually in progress or completed (not during initialization)
    if (initializedRef.current) {
      saveGameState(gameState);
    }
    
    if (gameState.status !== 'playing') {
      // Update stats when game ends
      if (gameState.status === 'won') {
        const guessesUsed = gameState.guesses.length;
        const newStats = updateStatsOnWin(
          guessesUsed,
          gameState.answer,
          gameState.maxGuesses,
          gameState.wordLength
        );
        setStats(newStats);
        setWinMessage(getRandomWinMessage());
      } else if (gameState.status === 'lost') {
        const newStats = updateStatsOnLoss(gameState.answer, gameState.wordLength);
        setStats(newStats);
      }
      setShowResultModal(true);
    }
  }, [gameState]);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (!gameState || gameState.status !== 'playing' || !wordsLoaded || isRevealing) return;
      setGameState(addLetterToGuess(gameState, letter));
      setErrorMessage('');
    },
    [gameState, wordsLoaded, isRevealing]
  );

  const handleBackspace = useCallback(() => {
    if (!gameState || gameState.status !== 'playing' || !wordsLoaded || isRevealing) return;
    setGameState(removeLetterFromGuess(gameState));
    setErrorMessage('');
  }, [gameState, wordsLoaded, isRevealing]);

  const handleEnter = useCallback(() => {
    if (!gameState || gameState.status !== 'playing' || !wordsLoaded || isRevealing) {
      return;
    }

    if (gameState.currentGuess.length !== gameState.wordLength) {
      setErrorMessage('Not enough letters');
      return;
    }

    const guessUpper = gameState.currentGuess.toUpperCase();
    const isValid = isValidWord(guessUpper, gameState.wordLength);
    
    if (!isValid) {
      setErrorMessage('Not a valid word');
      setShakeRow(gameState.guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    // Start reveal animation
    setIsRevealing(true);
    
    const newState = submitGuess(gameState, (word) => {
      const valid = isValidWord(word, gameState.wordLength);
      if (!valid) {
        console.log('Word validation failed:', word, 'for length', gameState.wordLength, 'Answer is:', gameState.answer);
      }
      return valid;
    });
    
    // Check if state actually changed (submitGuess returns same state if invalid)
    if (newState.guesses.length === gameState.guesses.length && 
        newState.currentGuess === gameState.currentGuess) {
      // State didn't change, something went wrong
      console.log('State did not change after submitGuess - word may be invalid');
      setIsRevealing(false);
      return;
    }
    
    console.log('Guess submitted successfully. Answer is:', newState.answer, 'Guesses:', newState.guesses.length);
    setGameState(newState);
    setErrorMessage('');
  }, [gameState, wordsLoaded, isRevealing]);

  // Handle physical keyboard
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || !wordsLoaded || isRevealing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnter();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, wordsLoaded, isRevealing, handleEnter, handleBackspace, handleKeyPress]);

  const handleNewGame = useCallback(() => {
    if (!gameState || !wordsLoaded) return;
    try {
      const newState = startNewGame(gameState.wordLength, gameState.maxGuesses);
      setGameState(newState);
      setShowResultModal(false);
      setErrorMessage('');
      setWinMessage('');
    } catch (error) {
      console.error('Failed to start new game:', error);
      setErrorMessage('Failed to start new game. Please refresh the page.');
    }
  }, [gameState, wordsLoaded]);

  const handleReset = useCallback(async () => {
    // Ensure words are loaded before resetting
    if (!wordsLoaded) {
      setErrorMessage('Please wait for dictionary to load before resetting.');
      return;
    }
    
    // Clear localStorage first
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    // Double-check by trying to load words if needed
    try {
      await loadWordSets();
      const newState = startNewGame(5, 6);
      // Verify the answer was generated
      if (!newState.answer || newState.answer.length !== 5) {
        throw new Error('Failed to generate valid answer');
      }
      // Set state directly - the save useEffect will handle saving
      setGameState(newState);
      setShowResultModal(false);
      setErrorMessage('');
      setWinMessage('');
    } catch (error) {
      console.error('Failed to start new game:', error);
      setErrorMessage('Failed to start new game. Please refresh the page.');
    }
  }, [wordsLoaded]);

  const handleSettingsChange = useCallback(
    (newWordLength: number, newMaxGuesses: number) => {
      if (wordsLoaded) {
        try {
          const newState = startNewGame(newWordLength, newMaxGuesses);
          setGameState(newState);
        } catch (error) {
          console.error('Failed to start new game:', error);
          setErrorMessage('Failed to start new game. Please refresh the page.');
        }
      }
    },
    [wordsLoaded]
  );

  const handleRetryLoad = useCallback(async () => {
    clearWordCache();
    setWordsLoaded(false);
    setWordsError(null);
    setIsLoadingWords(true);
    
    try {
      await loadWordSets();
      setWordsLoaded(true);
      setIsLoadingWords(false);
    } catch (error) {
      setWordsError(error instanceof Error ? error.message : 'Failed to load dictionary');
      setIsLoadingWords(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!gameState || gameState.status !== 'won') return;

    const shareText = generateShareText(
      gameState.evaluations,
      gameState.guesses.length,
      gameState.maxGuesses,
      getSiteUrl()
    );

    const success = await copyToClipboard(shareText);
    if (!success) {
      // Fallback: show text in alert
      alert(`Share text:\n\n${shareText}`);
    }
  }, [gameState]);

  const handleStatsReset = useCallback(() => {
    setStats(loadStats());
  }, []);

  // Loading state
  if (isLoadingWords) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
            {BRANDING.title}
          </div>
          <div className="text-base sm:text-lg text-gray-600">Loading dictionary...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (wordsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
            {BRANDING.title}
          </div>
          <div className="text-base sm:text-lg text-red-600 mb-4">
            Failed to load word lists
          </div>
          <div className="text-sm text-gray-600 mb-6">
            {wordsError}
          </div>
          <button
            onClick={handleRetryLoad}
            className="text-white font-semibold py-2 px-6 rounded transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !wordsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-base sm:text-lg">Loading...</div>
      </div>
    );
  }

  const resultTitle =
    gameState.status === 'won' ? winMessage || "You Won!" : 'Game Over';
  const resultMessage =
    gameState.status === 'won'
      ? `You guessed the word in ${gameState.guesses.length} ${gameState.guesses.length === 1 ? 'try' : 'tries'}!`
      : getLoseMessage(gameState.answer);

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--page-bg)' }}>
      {/* App Bar */}
      <header className="shrink-0 px-4 pt-4 pb-3 border-b border-neutral-300 bg-white shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">
              {BRANDING.title}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {BRANDING.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <IconButton onClick={handleReset} title="Reset Game">
              <RotateCcw className="h-5 w-5" />
            </IconButton>
            <IconButton onClick={() => setShowHelpModal(true)} title="Help">
              <HelpCircle className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-md mx-auto w-full px-4 flex-1 flex flex-col min-h-0">
          <Tabs
            tabs={[
              { id: 'board', label: 'Board' },
              { id: 'stats', label: 'Stats' },
              { id: 'settings', label: 'Settings' },
            ]}
            defaultTab={activeTab}
            onTabChange={setActiveTab}
          >
            {(currentTab) => {
              if (currentTab === 'board') {
                return (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Error Message */}
                    {errorMessage && (
                      <div className="text-center text-red-600 mb-3 text-sm font-medium shrink-0">
                        {errorMessage}
                      </div>
                    )}

                    {/* Board Card - Scrollable board section only */}
                    <Card className="p-6 flex-1 flex flex-col min-h-0">
                      {/* Scrollable board section */}
                      <div 
                        className="flex-1 overflow-y-auto overscroll-contain pb-6"
                      >
                        <div className="flex justify-center">
                          <Board
                            wordLength={gameState.wordLength}
                            maxGuesses={gameState.maxGuesses}
                            guesses={gameState.guesses}
                            evaluations={gameState.evaluations}
                            currentGuess={gameState.currentGuess}
                            shakeRow={shakeRow}
                            isRevealing={isRevealing}
                            onRevealComplete={() => setIsRevealing(false)}
                            gameStatus={gameState.status}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              }
              if (currentTab === 'stats') {
                return (
                  <div>
                    {/* Error Message */}
                    {errorMessage && (
                      <div className="text-center text-red-600 mb-4 text-sm font-medium">
                        {errorMessage}
                      </div>
                    )}
                    <Card className="p-6">
                      <StatsTab
                        stats={stats}
                        maxGuesses={gameState.maxGuesses}
                        wordLength={gameState.wordLength}
                        onStatsReset={handleStatsReset}
                      />
                    </Card>
                  </div>
                );
              }
              if (currentTab === 'settings') {
                return (
                  <div>
                    {/* Error Message */}
                    {errorMessage && (
                      <div className="text-center text-red-600 mb-4 text-sm font-medium">
                        {errorMessage}
                      </div>
                    )}
                    <Card className="p-6">
                      <SettingsTab
                        wordLength={gameState.wordLength}
                        maxGuesses={gameState.maxGuesses}
                        onWordLengthChange={(length) =>
                          handleSettingsChange(length, gameState.maxGuesses)
                        }
                        onMaxGuessesChange={(guesses) =>
                          handleSettingsChange(gameState.wordLength, guesses)
                        }
                      />
                    </Card>
                  </div>
                );
              }
              return null;
            }}
          </Tabs>
        </div>

        {/* Keyboard - Outside max-w-md container, full-width */}
        {activeTab === 'board' && gameState && wordsLoaded && (
          <div 
            ref={keyboardRef}
            className="shrink-0 w-full max-w-none pt-3 pb-4 px-2 bg-white border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <Keyboard
              keyStatusMap={gameState.keyStatusMap}
              onKeyPress={handleKeyPress}
              onEnter={handleEnter}
              onBackspace={handleBackspace}
              disabled={isRevealing}
            />
          </div>
        )}
      </main>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultTitle}
        message={resultMessage}
        buttonText="New Game"
        onButtonClick={handleNewGame}
        showShare={gameState.status === 'won'}
        onShare={handleShare}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
