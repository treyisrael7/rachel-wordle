'use client';

interface SettingsTabProps {
  wordLength: number;
  maxGuesses: number;
  onWordLengthChange: (length: number) => void;
  onMaxGuessesChange: (guesses: number) => void;
}

export default function SettingsTab({
  wordLength,
  maxGuesses,
  onWordLengthChange,
  onMaxGuessesChange,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-3">
          Word Length: <span className="text-neutral-900 font-semibold">{wordLength}</span>
        </label>
        <input
          type="range"
          min="4"
          max="8"
          value={wordLength}
          onChange={(e) => onWordLengthChange(parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-2">
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-3">
          Max Guesses: <span className="text-neutral-900 font-semibold">{maxGuesses}</span>
        </label>
        <input
          type="range"
          min="4"
          max="8"
          value={maxGuesses}
          onChange={(e) => onMaxGuessesChange(parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-2">
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
        </div>
      </div>
    </div>
  );
}

