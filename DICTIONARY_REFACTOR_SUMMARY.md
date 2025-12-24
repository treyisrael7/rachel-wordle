# Dictionary Refactor Summary

## Overview
Refactored the app to use `/public/words.txt` as the source of truth for word validation and answer selection, replacing the hardcoded word lists.

## Files Created

### 1. `lib/words.ts` (NEW)
- **Purpose**: Core dictionary loader and utilities
- **Key Functions**:
  - `loadWordsByLength()`: Fetches `/words.txt`, parses into `Record<number, Set<string>>` for lengths 4-8
  - Caches result in memory to avoid repeated fetches
  - Handles CRLF, LF, and CR line endings
  - Includes fallback word lists for emergency use
  - `clearWordCache()`: Clears cache for retry scenarios
  - `isValidWord()`: Checks if word exists in dictionary for given length
  - `getRandomWord()`: Gets random word of specified length

### 2. `DICTIONARY_TEST_CHECKLIST.md` (NEW)
- Comprehensive manual testing checklist covering all scenarios

## Files Modified

### 1. `lib/wordlist.ts`
- **Changes**: Now delegates to `lib/words.ts` for backward compatibility
- **Maintains**: Same public API (`getRandomWord`, `isValidWord`, `getWordList`)
- **Adds**: Re-exports `loadWordsByLength` and `clearWordCache`

### 2. `app/page.tsx`
- **Added State**:
  - `wordsLoaded`: Boolean indicating if dictionary is loaded
  - `wordsError`: Error message if loading fails
  - `isLoadingWords`: Loading state flag
- **Added Effects**:
  - Dictionary loading on mount
  - Game initialization after dictionary loads
- **Updated Handlers**:
  - All input handlers check `wordsLoaded` before processing
  - `handleRetryLoad()`: Retry mechanism for failed loads
- **UI Changes**:
  - Loading screen while dictionary loads
  - Error screen with retry button on failure
  - Keyboard disabled (opacity + pointer-events) until loaded

## Key Features

### 1. Dictionary Loading
- Fetches `/words.txt` once on app load
- Caches in memory (no repeated fetches)
- Handles all line ending types (CRLF, LF, CR)
- Filters words to lengths 4-8 and letters only
- Normalizes to uppercase

### 2. Loading States
- Shows "Loading dictionary..." message
- Disables all input (keyboard + physical keys)
- Prevents game initialization until loaded

### 3. Error Handling
- Shows friendly error message on fetch failure
- Provides "Retry" button to attempt reload
- Falls back to minimal hardcoded lists if needed
- Clears cache on retry to force fresh load

### 4. Integration
- Word validation uses dictionary: `wordsByLength[length].has(word)`
- Answer selection uses dictionary: random from `wordsByLength[length]`
- Settings changes restart game with correct length words
- Persistence works (game state doesn't include wordlist)

### 5. Performance
- Single fetch on app load
- In-memory cache prevents refetching
- Set-based lookups for O(1) validation

## Testing

See `DICTIONARY_TEST_CHECKLIST.md` for comprehensive test scenarios.

### Quick Test Steps:
1. Verify `/public/words.txt` exists and is accessible at `http://localhost:3000/words.txt`
2. Load app - should show "Loading dictionary..." then game appears
3. Enter valid word - should accept
4. Enter invalid word - should show error and shake
5. Change word length in settings - new game with correct length
6. Refresh page - game state should restore correctly

## Backward Compatibility

- `lib/wordlist.ts` maintains the same API
- Existing code using `getRandomWord()` and `isValidWord()` continues to work
- Old word list files (`lib/wordlists/*.ts`) are no longer used but can be kept for reference

## Notes

- Dictionary is loaded client-side (browser fetch)
- No backend/database required
- Wordlist is NOT stored in localStorage (only game state)
- Fallback words ensure app doesn't crash if dictionary is empty for a length
- All words are normalized to uppercase for consistency

