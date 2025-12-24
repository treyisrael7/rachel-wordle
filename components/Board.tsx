'use client';

import { GuessEvaluation } from '@/lib/wordle';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BoardProps {
  wordLength: number;
  maxGuesses: number;
  guesses: string[];
  evaluations: GuessEvaluation[];
  currentGuess: string;
  shakeRow?: number | null;
  isRevealing?: boolean;
  onRevealComplete?: () => void;
  gameStatus?: 'playing' | 'won' | 'lost';
}

type TileAnimationState = 'idle' | 'pop' | 'flip' | 'bounce';

export default function Board({
  wordLength,
  maxGuesses,
  guesses,
  evaluations,
  currentGuess,
  shakeRow = null,
  isRevealing = false,
  onRevealComplete,
  gameStatus = 'playing',
}: BoardProps) {
  const rows = Array(maxGuesses).fill(null);
  const [tileSize, setTileSize] = useState('w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14');
  const [textSize, setTextSize] = useState('text-base sm:text-lg md:text-xl lg:text-2xl');
  
  // Track previous state to detect changes for animations
  const prevCurrentGuess = useRef<string>('');
  const prevGuessesLength = useRef<number>(0);
  const prevEvaluationsLength = useRef<number>(0);
  const [tileAnimations, setTileAnimations] = useState<Record<string, TileAnimationState>>({});
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [flipColorDelay, setFlipColorDelay] = useState<Record<string, boolean>>({});
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const updateTileSize = () => {
      const vh = window.innerHeight;
      if (vh < 600) {
        setTileSize('w-9 h-9 sm:w-10 sm:h-10');
        setTextSize('text-sm sm:text-base');
      } else if (vh < 700) {
        setTileSize('w-10 h-10 sm:w-11 sm:h-11');
        setTextSize('text-base sm:text-lg');
      } else {
        setTileSize('w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14');
        setTextSize('text-base sm:text-lg md:text-xl lg:text-2xl');
      }
    };

    updateTileSize();
    window.addEventListener('resize', updateTileSize);
    return () => window.removeEventListener('resize', updateTileSize);
  }, []);

  // Handle typing pop animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const currentRowIndex = guesses.length;
    const newAnimations: Record<string, TileAnimationState> = {};
    
    // Detect which tile just got a new letter
    for (let i = 0; i < currentGuess.length; i++) {
      const prevChar = prevCurrentGuess.current[i] || '';
      const currentChar = currentGuess[i] || '';
      
      if (currentChar && currentChar !== prevChar) {
        const tileKey = `${currentRowIndex}-${i}`;
        newAnimations[tileKey] = 'pop';
        
        // Clear pop animation after it completes
        setTimeout(() => {
          setTileAnimations(prev => {
            const updated = { ...prev };
            delete updated[tileKey];
            return updated;
          });
        }, 140);
      }
    }
    
    if (Object.keys(newAnimations).length > 0) {
      setTileAnimations(prev => ({ ...prev, ...newAnimations }));
    }
    
    prevCurrentGuess.current = currentGuess;
  }, [currentGuess, guesses.length, prefersReducedMotion]);

  // Handle reveal flip animation
  useEffect(() => {
    if (prefersReducedMotion) {
      if (isRevealing && onRevealComplete) {
        // Skip animation, call complete immediately
        setTimeout(() => onRevealComplete(), 0);
      }
      return;
    }

    // Detect when a new guess was evaluated (reveal animation)
    if (evaluations.length > prevEvaluationsLength.current) {
      const newRowIndex = evaluations.length - 1;
      setRevealingRow(newRowIndex);
      
      // Set color delay for each tile - color changes at 50% of flip (300ms + stagger)
      const newColorDelays: Record<string, boolean> = {};
      for (let i = 0; i < wordLength; i++) {
        const tileKey = `${newRowIndex}-${i}`;
        const delay = i * 100 + 300; // 300ms = 50% of 600ms flip
        setTimeout(() => {
          setFlipColorDelay(prev => ({ ...prev, [tileKey]: true }));
        }, delay);
      }
      
      // Calculate total animation time: stagger delay + flip duration
      const staggerDelay = (wordLength - 1) * 100; // Last tile delay
      const flipDuration = 600; // Flip animation duration
      const totalTime = staggerDelay + flipDuration;
      
      // After reveal completes, check if it's a win and trigger bounce
      setTimeout(() => {
        setRevealingRow(null);
        // Clear color delays
        setFlipColorDelay(prev => {
          const updated = { ...prev };
          for (let i = 0; i < wordLength; i++) {
            delete updated[`${newRowIndex}-${i}`];
          }
          return updated;
        });
        
        if (gameStatus === 'won' && newRowIndex === guesses.length - 1) {
          setBouncingRow(newRowIndex);
          setTimeout(() => {
            setBouncingRow(null);
          }, 600);
        }
        
        if (onRevealComplete) {
          onRevealComplete();
        }
      }, totalTime);
    }
    
    prevEvaluationsLength.current = evaluations.length;
  }, [evaluations.length, wordLength, gameStatus, guesses.length, isRevealing, onRevealComplete, prefersReducedMotion]);

  const getCellContent = (rowIndex: number, colIndex: number): string => {
    if (rowIndex < guesses.length) {
      return guesses[rowIndex][colIndex] || '';
    }
    if (rowIndex === guesses.length && colIndex < currentGuess.length) {
      return currentGuess[colIndex];
    }
    return '';
  };

  const getCellState = (rowIndex: number, colIndex: number): string => {
    if (rowIndex < evaluations.length) {
      const eval_ = evaluations[rowIndex];
      if (eval_ && eval_.evaluations[colIndex]) {
        const state = eval_.evaluations[colIndex].state;
        if (state === 'correct') return 'bg-green-500 text-white';
        if (state === 'present') return 'bg-yellow-500 text-white';
        if (state === 'absent') return 'bg-gray-400 text-white';
      }
    }
    return 'bg-white border-2 border-neutral-400 shadow-inner';
  };

  return (
    <div className="flex flex-col gap-2 justify-center" style={{ minHeight: 'fit-content', perspective: '1000px' }}>
      {rows.map((_, rowIndex) => {
        const isShaking = shakeRow === rowIndex;
        const isRevealingThisRow = revealingRow === rowIndex;
        const isBouncingThisRow = bouncingRow === rowIndex;
        const isCurrentRow = rowIndex === guesses.length;
        const hasEvaluation = rowIndex < evaluations.length;
        
        return (
          <div 
            key={rowIndex} 
            className={cn(
              'flex gap-2 justify-center',
              isShaking && !prefersReducedMotion && 'animate-row-shake'
            )}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {Array(wordLength)
              .fill(null)
              .map((_, colIndex) => {
                const content = getCellContent(rowIndex, colIndex);
                const tileKey = `${rowIndex}-${colIndex}`;
                const tileAnimation = tileAnimations[tileKey];
                const shouldShowColor = flipColorDelay[tileKey] || !isRevealingThisRow || !hasEvaluation;
                
                // Get cell state, but delay color change during flip
                const cellState = shouldShowColor 
                  ? getCellState(rowIndex, colIndex)
                  : 'bg-white border-2 border-neutral-400 shadow-inner';
                const isEmpty = !content;
                
                // Determine animation classes
                const animationClasses = [];
                if (tileAnimation === 'pop' && !prefersReducedMotion) {
                  animationClasses.push('animate-tile-pop');
                }
                if (isRevealingThisRow && hasEvaluation && !prefersReducedMotion) {
                  animationClasses.push('animate-tile-flip');
                }
                // Calculate stagger delay for flip animation
                const flipDelay = isRevealingThisRow && hasEvaluation && !prefersReducedMotion
                  ? colIndex * 100
                  : 0;
                
                // Calculate stagger delay for bounce animation (separate from flip)
                const bounceDelay = isBouncingThisRow && !prefersReducedMotion
                  ? colIndex * 50 // Smaller stagger for bounce
                  : 0;
                
                if (isBouncingThisRow && !prefersReducedMotion) {
                  animationClasses.push('animate-tile-bounce');
                }

                return (
                  <div
                    key={colIndex}
                    className={cn(
                      tileSize,
                      'flex items-center justify-center',
                      textSize,
                      'font-semibold rounded-2xl',
                      cellState,
                      isEmpty && 'border-2 border-neutral-400 bg-white shadow-inner',
                      animationClasses,
                      !prefersReducedMotion && 'transition-colors duration-200'
                    )}
                    style={{
                      animationDelay: isRevealingThisRow && flipDelay > 0
                        ? `${flipDelay}ms`
                        : isBouncingThisRow && bounceDelay > 0
                        ? `${bounceDelay}ms`
                        : undefined,
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {content}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
