'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './ui/IconButton';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="help-title" className="text-2xl font-semibold text-neutral-900">
            How to Play
          </h2>
          <IconButton onClick={onClose} title="Close">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="space-y-4 text-sm text-neutral-700">
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
            <p className="font-semibold text-pink-700 mb-2">Heyyyy pookie! 💚🩷</p>
            <p className="text-neutral-700">
              This isn't your regular Wordle! Here's what makes this special:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-neutral-700">
              <li><strong>Unlimited play</strong> - Play as many games as you want, whenever you want!</li>
              <li><strong>Customizable difficulty</strong> - Choose word length (4-8 letters) and max guesses (4-8 attempts)</li>
              <li><strong>Your stats</strong> - Track your wins, streaks, and guess distribution</li>
              <li><strong>Share your wins</strong> - Share with me please I want to see how you like it!</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-2xl transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

