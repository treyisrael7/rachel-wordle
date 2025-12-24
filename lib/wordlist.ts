import { words4 } from './wordlists/4';
import { words5 } from './wordlists/5';
import { words6 } from './wordlists/6';
import { words7 } from './wordlists/7';
import { words8 } from './wordlists/8';

export const wordLists: Record<number, string[]> = {
  4: words4,
  5: words5,
  6: words6,
  7: words7,
  8: words8,
};

export function getWordList(length: number): string[] {
  return wordLists[length] || [];
}

export function getRandomWord(length: number): string {
  const words = getWordList(length);
  if (words.length === 0) {
    throw new Error(`No word list available for length ${length}`);
  }
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

export function isValidWord(word: string, length: number): boolean {
  const words = getWordList(length);
  return words.some(w => w.toUpperCase() === word.toUpperCase());
}

