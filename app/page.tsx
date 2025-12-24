'use client';

import { useState, useEffect, useCallback } from 'react';
import Board from '@/components/Board';
import Keyboard from '@/components/Keyboard';
import Settings from '@/components/Settings';
import Modal from '@/components/Modal';
import {
  GameState,
  createGameState,
  addLetterToGuess,
  removeLetterFromGuess,
  submitGuess,
  GameStatus,
} from '@/lib/wordle';
import { getRandomWord, isValidWord } from '@/lib/wordlist';

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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [shakeRow, setShakeRow] = useState<number | null>(null);

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
  }, [gameState]);

  const handleReset = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const newState = startNewGame(5, 6);
    setGameState(newState);
    setShowResultModal(false);
    setErrorMessage('');
  }, []);

  const handleSettingsChange = useCallback(
    (newWordLength: number, newMaxGuesses: number) => {
      const newState = startNewGame(newWordLength, newMaxGuesses);
      setGameState(newState);
      setShowSettings(false);
    },
    []
  );

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const resultTitle =
    gameState.status === 'won' ? 'You Won!' : 'Game Over';
  const resultMessage =
    gameState.status === 'won'
      ? `Congratulations! You guessed the word in ${gameState.guesses.length} tries.`
      : `The word was: ${gameState.answer}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Wordle Unlimited</h1>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Reset
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

        {/* Result Modal */}
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={resultTitle}
          message={resultMessage}
          buttonText="New Game"
          onButtonClick={handleNewGame}
        />
      </div>
    </div>
  );
}

