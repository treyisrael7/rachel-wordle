// Legacy wordlist interface - now delegates to words.ts
// This maintains backward compatibility while using the new dictionary system

import { 
  loadWordSets, 
  loadWordsByLength, 
  getValidWordsForLength, 
  isValidWord as checkValidWord, 
  getRandomWord as getRandomWordFromDict,
  clearWordCache 
} from './words';

export type WordsByLength = Record<number, Set<string>>;

// Re-export for convenience
export { loadWordSets, loadWordsByLength, clearWordCache } from './words';

/**
 * @deprecated Use loadWordSets() instead
 * Returns empty array for backward compatibility
 */
export function getWordList(length: number): string[] {
  const words = getValidWordsForLength(length);
  return Array.from(words);
}

/**
 * Gets a random word of the specified length
 * Requires words to be loaded first via loadWordSets() or loadWordsByLength()
 */
export function getRandomWord(length: number): string {
  return getRandomWordFromDict(length);
}

/**
 * Checks if a word is valid for the given length
 * Requires words to be loaded first via loadWordSets() or loadWordsByLength()
 */
export function isValidWord(word: string, length: number): boolean {
  return checkValidWord(word, length);
}
