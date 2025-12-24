'use client';

import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  showShare?: boolean;
  onShare?: () => void;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  onButtonClick,
  showShare = false,
  onShare,
}: ModalProps) {
  const [shareCopied, setShareCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    if (onShare) {
      onShare();
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--primary)' }}>
          {title}
        </h2>
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex flex-col gap-2">
          {showShare && onShare && (
            <button
              onClick={handleShare}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded transition-colors"
              style={{
                backgroundColor: shareCopied ? 'var(--primary)' : 'var(--accent)',
              }}
            >
              {shareCopied ? 'Copied! ✓' : 'Share'}
            </button>
          )}
          <button
            onClick={() => {
              onButtonClick();
              onClose();
            }}
            className="w-full text-white font-semibold py-2 px-6 rounded transition-colors"
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
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

