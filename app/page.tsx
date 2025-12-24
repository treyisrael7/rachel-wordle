'use client';

import { useState, useEffect, useCallback } from 'react';
import Board from '@/components/Board';
import Keyboard from '@/components/Keyboard';
import Settings from '@/components/Settings';
import Modal from '@/components/Modal';
import StatsModal from '@/components/StatsModal';
import {
  GameState,
  createGameState,
  addLetterToGuess,
  removeLetterFromGuess,
  submitGuess,
  GameStatus,
} from '@/lib/wordle';
import { getRandomWord, isValidWord } from '@/lib/wordlist';
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
      return JSON.parse(stored);
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
  return createGameState(wordLength, maxGuesses, answer);
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [winMessage, setWinMessage] = useState<string>('');

  // Initialize game
  useEffect(() => {
    const saved = loadGameState();
    if (saved && saved.status === 'playing') {
      setGameState(saved);
    } else {
      const newState = startNewGame(5, 6);
      setGameState(newState);
      saveGameState(newState);
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
      if (gameState.status !== 'playing') {
        // Update stats when game ends
        if (gameState.status === 'won') {
          const guessesUsed = gameState.guesses.length;
          const newStats = updateStatsOnWin(
            guessesUsed,
            gameState.answer,
            gameState.maxGuesses
          );
          setStats(newStats);
          setWinMessage(getRandomWinMessage());
        } else if (gameState.status === 'lost') {
          const newStats = updateStatsOnLoss(gameState.answer);
          setStats(newStats);
        }
        setShowResultModal(true);
      }
    }
  }, [gameState]);

  // Handle physical keyboard
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;

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
  }, [gameState, handleEnter, handleBackspace, handleKeyPress]);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (!gameState || gameState.status !== 'playing') return;
      setGameState(addLetterToGuess(gameState, letter));
      setErrorMessage('');
    },
    [gameState]
  );

  const handleBackspace = useCallback(() => {
    if (!gameState || gameState.status !== 'playing') return;
    setGameState(removeLetterFromGuess(gameState));
    setErrorMessage('');
  }, [gameState]);

  const handleEnter = useCallback(() => {
    if (!gameState || gameState.status !== 'playing') return;

    if (gameState.currentGuess.length !== gameState.wordLength) {
      setErrorMessage('Not enough letters');
      return;
    }

    if (!isValidWord(gameState.currentGuess, gameState.wordLength)) {
      setErrorMessage('Not a valid word');
      setShakeRow(gameState.guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    const newState = submitGuess(gameState, (word) =>
      isValidWord(word, gameState.wordLength)
    );
    setGameState(newState);
    setErrorMessage('');
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    if (!gameState) return;
    const newState = startNewGame(gameState.wordLength, gameState.maxGuesses);
    setGameState(newState);
    setShowResultModal(false);
    setErrorMessage('');
    setWinMessage('');
  }, [gameState]);

  const handleReset = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const newState = startNewGame(5, 6);
    setGameState(newState);
    setShowResultModal(false);
    setErrorMessage('');
    setWinMessage('');
  }, []);

  const handleSettingsChange = useCallback(
    (newWordLength: number, newMaxGuesses: number) => {
      const newState = startNewGame(newWordLength, newMaxGuesses);
      setGameState(newState);
      setShowSettings(false);
    },
    []
  );

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

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-2"
            style={{ color: 'var(--primary)' }}
          >
            {BRANDING.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {BRANDING.subtitle}
          </p>
          <div className="flex justify-center gap-2 sm:gap-4 mt-4 flex-wrap">
            <button
              onClick={() => setShowStats(true)}
              className="text-white font-semibold py-2 px-4 rounded transition-colors text-sm sm:text-base"
              style={{
                backgroundColor: 'var(--accent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }}
            >
              📊 Stats
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-white font-semibold py-2 px-4 rounded transition-colors text-sm sm:text-base"
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
              ⚙️ Settings
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors text-sm sm:text-base"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-center text-red-600 mb-4 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Board */}
        <div
          className={`mb-6 ${
            shakeRow !== null ? 'animate-shake' : ''
          }`}
        >
          <Board
            wordLength={gameState.wordLength}
            maxGuesses={gameState.maxGuesses}
            guesses={gameState.guesses}
            evaluations={gameState.evaluations}
            currentGuess={gameState.currentGuess}
          />
        </div>

        {/* Keyboard */}
        <Keyboard
          evaluations={gameState.evaluations}
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
        />

        {/* Settings Modal */}
        <Settings
          wordLength={gameState.wordLength}
          maxGuesses={gameState.maxGuesses}
          onWordLengthChange={(length) =>
            handleSettingsChange(length, gameState.maxGuesses)
          }
          onMaxGuessesChange={(guesses) =>
            handleSettingsChange(gameState.wordLength, guesses)
          }
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Stats Modal */}
        <StatsModal
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          stats={stats}
          maxGuesses={gameState.maxGuesses}
          onStatsReset={handleStatsReset}
        />

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
      </div>
    </div>
  );
}
