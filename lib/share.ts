// Share functionality - generate emoji grid

import { GuessEvaluation } from './wordle';

export function generateShareText(
  evaluations: GuessEvaluation[],
  guessesUsed: number,
  maxGuesses: number,
  siteUrl?: string
): string {
  const lines: string[] = [];
  
  // Title line
  lines.push(`Rachel's Wordle — ${guessesUsed}/${maxGuesses}`);
  lines.push(''); // blank line

  // Emoji grid
  for (const eval_ of evaluations) {
    const emojiRow = eval_.evaluations
      .map((e) => {
        if (e.state === 'correct') return '🟩';
        if (e.state === 'present') return '🟨';
        return '⬛';
      })
      .join('');
    lines.push(emojiRow);
  }

  // Add site link if available
  if (siteUrl) {
    lines.push('');
    lines.push(`Play: ${siteUrl}`);
  }

  // Add personalized message
  lines.push('');
  lines.push('Share with me please I want to see how you like it!');

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

export function getSiteUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.origin;
}

