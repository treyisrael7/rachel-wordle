// Word dictionary loader from /public/valid-words.txt and /public/answer-words.txt

export type WordsByLength = Record<number, Set<string>>;
export type AnswersByLength = Record<number, string[]>;

export interface WordSets {
  validByLength: WordsByLength;
  answersByLength: AnswersByLength;
}

let cachedWordSets: WordSets | null = null;
let loadPromise: Promise<WordSets> | null = null;

// Fallback word lists (minimal, only for emergency fallback)
const FALLBACK_VALID: WordsByLength = {
  4: new Set(['ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK', 'BALL']),
  5: new Set(['ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN']),
  6: new Set(['ABACUS', 'ABDUCT', 'ABJECT', 'ABLAZE', 'ABOUND', 'ABROAD', 'ABSORB', 'ABSURD', 'ACCEPT', 'ACCORD']),
  7: new Set(['ABILITY', 'ABSENCE', 'ACADEMY', 'ACCOUNT', 'ACHIEVE', 'ACQUIRE', 'ADDRESS', 'ADVANCE', 'ADVERSE', 'ADVISED']),
  8: new Set(['ABANDONS', 'ABERRANT', 'ABNORMAL', 'ABORTIVE', 'ABRASIVE', 'ABRIDGED', 'ABSOLUTE', 'ABSTRACT', 'ACADEMIC', 'ACCENTED']),
};

const FALLBACK_ANSWERS: AnswersByLength = {
  4: ['ABLE', 'ACID', 'AGED', 'ALSO', 'AREA'],
  5: ['ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE'],
  6: ['ABACUS', 'ABDUCT', 'ABJECT', 'ABLAZE', 'ABOUND'],
  7: ['ABILITY', 'ABSENCE', 'ACADEMY', 'ACCOUNT', 'ACHIEVE'],
  8: ['ABANDONS', 'ABERRANT', 'ABNORMAL', 'ABORTIVE', 'ABRASIVE'],
};

/**
 * Parses a text file into words organized by length (4-8)
 */
function parseWordsFile(text: string): WordsByLength {
  const wordsByLength: WordsByLength = {
    4: new Set<string>(),
    5: new Set<string>(),
    6: new Set<string>(),
    7: new Set<string>(),
    8: new Set<string>(),
  };

  // Split by any line ending (CRLF, LF, or CR) and process each line
  const lines = text.split(/\r?\n|\r/);
  
  for (const line of lines) {
    const word = line.trim().toUpperCase();
    
    // Only include words that are 4-8 characters and contain only letters
    if (word.length >= 4 && word.length <= 8 && /^[A-Z]+$/.test(word)) {
      wordsByLength[word.length as keyof WordsByLength].add(word);
    }
  }

  return wordsByLength;
}

/**
 * Loads both word lists from /valid-words.txt and /answer-words.txt
 * Caches the result in memory to avoid repeated fetches
 * Handles CRLF and LF line endings
 */
export async function loadWordSets(): Promise<WordSets> {
  // Return cached result if available
  if (cachedWordSets) {
    return cachedWordSets;
  }

  // Return existing promise if load is in progress
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading
  loadPromise = (async () => {
    try {
      // Load both files in parallel
      const [validResponse, answerResponse] = await Promise.all([
        fetch('/valid-words.txt'),
        fetch('/answer-words.txt'),
      ]);
      
      if (!validResponse.ok) {
        throw new Error(`Failed to fetch valid-words.txt: ${validResponse.status} ${validResponse.statusText}`);
      }
      
      if (!answerResponse.ok) {
        throw new Error(`Failed to fetch answer-words.txt: ${answerResponse.status} ${answerResponse.statusText}`);
      }

      const validText = await validResponse.text();
      const answerText = await answerResponse.text();

      const validByLength = parseWordsFile(validText);
      const answerWordsByLength = parseWordsFile(answerText);

      // Convert answer Sets to arrays for easier random selection
      const answersByLength: AnswersByLength = {
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
      };

      for (let length = 4; length <= 8; length++) {
        const answerSet = answerWordsByLength[length];
        if (answerSet && answerSet.size > 0) {
          answersByLength[length] = Array.from(answerSet);
        } else {
          // Fallback to valid words if answer list is empty
          console.warn(`No answer words found for length ${length}, using valid words as fallback`);
          const validSet = validByLength[length];
          if (validSet && validSet.size > 0) {
            answersByLength[length] = Array.from(validSet);
          } else {
            // Final fallback to hardcoded words
            console.warn(`No valid words found for length ${length}, using hardcoded fallback`);
            answersByLength[length] = FALLBACK_ANSWERS[length];
            validByLength[length] = FALLBACK_VALID[length];
          }
        }
      }

      // Ensure valid words exist for all lengths (for validation)
      for (let length = 4; length <= 8; length++) {
        if (validByLength[length].size === 0) {
          console.warn(`No valid words found for length ${length}, using fallback`);
          validByLength[length] = FALLBACK_VALID[length];
        }
      }

      cachedWordSets = {
        validByLength,
        answersByLength,
      };
      
      return cachedWordSets;
    } catch (error) {
      console.error('Error loading word dictionaries:', error);
      // Return fallback on error
      const fallbackValid: WordsByLength = { ...FALLBACK_VALID };
      const fallbackAnswers: AnswersByLength = { ...FALLBACK_ANSWERS };
      cachedWordSets = {
        validByLength: fallbackValid,
        answersByLength: fallbackAnswers,
      };
      return cachedWordSets;
    } finally {
      // Clear the promise so retries can work
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Clears the cached word sets (useful for retry scenarios)
 */
export function clearWordCache(): void {
  cachedWordSets = null;
  loadPromise = null;
}

/**
 * Gets valid words for a specific length
 * Returns empty Set if words haven't been loaded yet
 */
export function getValidWordsForLength(length: number): Set<string> {
  if (!cachedWordSets) {
    return new Set<string>();
  }
  return cachedWordSets.validByLength[length] || new Set<string>();
}

/**
 * Gets answer words for a specific length
 * Returns empty array if words haven't been loaded yet
 */
export function getAnswerWordsForLength(length: number): string[] {
  if (!cachedWordSets) {
    return [];
  }
  return cachedWordSets.answersByLength[length] || [];
}

/**
 * Checks if a word is valid for the given length (using valid-words.txt)
 */
export function isValidWord(word: string, length: number): boolean {
  if (!cachedWordSets) {
    return false;
  }
  const words = cachedWordSets.validByLength[length];
  if (!words) {
    return false;
  }
  return words.has(word.toUpperCase());
}

/**
 * Gets a random word of the specified length (using answer-words.txt with fallback)
 */
export function getRandomWord(length: number): string {
  if (!cachedWordSets) {
    throw new Error('Words not loaded yet. Please wait for dictionary to load.');
  }
  
  const answers = cachedWordSets.answersByLength[length];
  if (!answers || answers.length === 0) {
    // Fallback to valid words if answer list is empty
    const validSet = cachedWordSets.validByLength[length];
    if (!validSet || validSet.size === 0) {
      throw new Error(`No words available for length ${length}. Dictionary may not be fully loaded.`);
    }
    const validArray = Array.from(validSet);
    return validArray[Math.floor(Math.random() * validArray.length)];
  }
  
  return answers[Math.floor(Math.random() * answers.length)];
}

// Legacy function for backward compatibility
export async function loadWordsByLength(): Promise<WordsByLength> {
  const wordSets = await loadWordSets();
  return wordSets.validByLength;
}
