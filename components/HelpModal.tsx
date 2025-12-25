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
            <p className="font-semibold text-pink-700 mb-3">Heyyyy pookie! 💚🩷</p>
            <p className="text-neutral-700 mb-3">
              This isn't your average Wordle...it's your own.
            </p>
            <ul className="list-none space-y-2 mt-3 text-neutral-700">
              <li>• Play unlimited games anytime</li>
              <li>• Customize the difficulty (4–8 letter words, 4–8 guesses)</li>
              <li>• Track your stats, streaks, and guess history</li>
              <li>• Share your wins with me (pleaseeeee)</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              Have fun, and don't forget I made this just for you 🩷
            </p>
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

