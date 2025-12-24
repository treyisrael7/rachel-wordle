'use client';

import { GuessEvaluation } from '@/lib/wordle';

interface BoardProps {
  wordLength: number;
  maxGuesses: number;
  guesses: string[];
  evaluations: GuessEvaluation[];
  currentGuess: string;
}

export default function Board({
  wordLength,
  maxGuesses,
  guesses,
  evaluations,
  currentGuess,
}: BoardProps) {
  const rows = Array(maxGuesses).fill(null);

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
    return 'bg-gray-200 border-2 border-gray-300';
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {Array(wordLength)
            .fill(null)
            .map((_, colIndex) => {
              const content = getCellContent(rowIndex, colIndex);
              const cellState = getCellState(rowIndex, colIndex);
              const isEmpty = !content;

              return (
                <div
                  key={colIndex}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                    flex items-center justify-center
                    text-xl sm:text-2xl font-bold
                    rounded
                    transition-all duration-150
                    ${cellState}
                    ${isEmpty ? 'border-2 border-gray-300' : ''}
                  `}
                >
                  {content}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

