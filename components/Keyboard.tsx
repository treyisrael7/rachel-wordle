'use client';

import { KeyStatus } from '@/lib/wordle';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardProps {
  keyStatusMap: Record<string, KeyStatus>;
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
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
  disabled = false,
}: KeyboardProps) {
  const [keySizes, setKeySizes] = useState({ 
    letter: 'min-w-[32px] sm:min-w-[36px] md:min-w-[40px] h-11 sm:h-12 px-2 sm:px-2.5', 
    special: 'min-w-[60px] sm:min-w-[70px] md:min-w-[80px] h-11 sm:h-12 px-3 sm:px-4' 
  });

  useEffect(() => {
    const updateKeySize = () => {
      const vh = window.innerHeight;
      // Ensure minimum 44px height and readable width for touch targets on mobile
      if (vh < 600) {
        setKeySizes({ 
          letter: 'min-w-[30px] sm:min-w-[34px] h-11 sm:h-12 px-1.5 sm:px-2', 
          special: 'min-w-[55px] sm:min-w-[65px] h-11 sm:h-12 px-2 sm:px-3' 
        });
      } else if (vh < 700) {
        setKeySizes({ 
          letter: 'min-w-[32px] sm:min-w-[36px] h-11 sm:h-12 px-2 sm:px-2.5', 
          special: 'min-w-[60px] sm:min-w-[70px] h-11 sm:h-12 px-2.5 sm:px-3' 
        });
      } else {
        setKeySizes({ 
          letter: 'min-w-[32px] sm:min-w-[36px] md:min-w-[40px] h-11 sm:h-12 px-2 sm:px-2.5', 
          special: 'min-w-[60px] sm:min-w-[70px] md:min-w-[80px] h-11 sm:h-12 px-3 sm:px-4' 
        });
      }
    };

    updateKeySize();
    window.addEventListener('resize', updateKeySize);
    return () => window.removeEventListener('resize', updateKeySize);
  }, []);

  const getKeyState = (letter: string): string => {
    const status = keyStatusMap[letter];
    if (status === 'correct') return 'bg-green-500 text-white';
    if (status === 'present') return 'bg-yellow-500 text-white';
    if (status === 'absent') return 'bg-gray-400 text-white';
    return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  };

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-none">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center items-center">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            const keyState = isSpecial
              ? ''
              : getKeyState(key);

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={cn(
                  keyState,
                  'font-medium rounded-2xl transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                  'active:scale-95 active:opacity-80',
                  'min-h-[44px]',
                  disabled && 'opacity-50 cursor-not-allowed',
                  isSpecial
                    ? `${keySizes.special} text-xs sm:text-sm text-white shadow-sm hover:shadow-md bg-pink-500 hover:bg-pink-600`
                    : `${keySizes.letter} text-sm sm:text-base`
                )}
                style={{
                  touchAction: 'manipulation',
                }}
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
