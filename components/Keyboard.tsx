'use client';

import { KeyStatus } from '@/lib/wordle';

interface KeyboardProps {
  keyStatusMap: Record<string, KeyStatus>;
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function Keyboard({
  keyStatusMap,
  onKeyPress,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  const getKeyState = (letter: string): string => {
    const status = keyStatusMap[letter];
    if (status === 'correct') return 'bg-green-500 text-white';
    if (status === 'present') return 'bg-yellow-500 text-white';
    if (status === 'absent') return 'bg-gray-400 text-white';
    return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  };

  const handleKeyClick = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-8">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            const keyState = isSpecial
              ? ''
              : getKeyState(key);

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`
                  ${keyState}
                  font-semibold
                  rounded
                  transition-colors
                  active:scale-95
                  ${
                    isSpecial
                      ? 'px-3 sm:px-4 h-10 sm:h-12 text-xs sm:text-sm text-white'
                      : 'w-8 sm:w-10 h-10 sm:h-12 text-sm sm:text-base'
                  }
                `}
                style={
                  isSpecial
                    ? {
                        backgroundColor: 'var(--accent)',
                      }
                    : undefined
                }
                onMouseEnter={
                  isSpecial
                    ? (e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-dark)';
                      }
                    : undefined
                }
                onMouseLeave={
                  isSpecial
                    ? (e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent)';
                      }
                    : undefined
                }
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

