'use client';

interface SettingsProps {
  wordLength: number;
  maxGuesses: number;
  onWordLengthChange: (length: number) => void;
  onMaxGuessesChange: (guesses: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({
  wordLength,
  maxGuesses,
  onWordLengthChange,
  onMaxGuessesChange,
  isOpen,
  onClose,
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
          Settings
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Word Length: {wordLength}
          </label>
          <input
            type="range"
            min="4"
            max="8"
            value={wordLength}
            onChange={(e) => onWordLengthChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Guesses: {maxGuesses}
          </label>
          <input
            type="range"
            min="4"
            max="8"
            value={maxGuesses}
            onChange={(e) => onMaxGuessesChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-white font-semibold py-2 px-6 rounded transition-colors"
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

