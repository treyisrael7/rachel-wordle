# Two Word List Implementation Summary

## Overview
Refactored the app to use two separate word lists:
- `/public/valid-words.txt` - Large list for validating guesses
- `/public/answer-words.txt` - Cleaner list for selecting secret answers

## Files Modified

### 1. `lib/words.ts` (COMPLETELY REWRITTEN)
**Changes:**
- Replaced single `loadWordsByLength()` with `loadWordSets()` that loads both files
- Returns `WordSets` interface with:
  - `validByLength: Record<number, Set<string>>` - for validation
  - `answersByLength: Record<number, string[]>` - for answer selection
- Loads both files in parallel using `Promise.all()`
- Implements fallback logic:
  - If answer-words.txt is empty for a length → fallback to valid-words.txt
  - If both are empty → use hardcoded fallback
- Maintains backward compatibility with `loadWordsByLength()` (delegates to `loadWordSets()`)

**Key Functions:**
- `loadWordSets()`: Main function that loads both lists
- `parseWordsFile()`: Helper to parse a text file into WordsByLength
- `isValidWord()`: Checks against valid-words.txt
- `getRandomWord()`: Selects from answer-words.txt with fallback

### 2. `lib/wordlist.ts` (UPDATED)
**Changes:**
- Updated imports to use new `loadWordSets()` function
- Re-exports `loadWordSets` for convenience
- Maintains backward compatibility with existing API

### 3. `app/page.tsx` (UPDATED)
**Changes:**
- Updated import to use `loadWordSets` instead of `loadWordsByLength`
- Updated loading logic to call `loadWordSets()`
- Updated retry handler to use `loadWordSets()`
- Updated reset handler to use `loadWordSets()`
- Changed loading message from "Loading dictionary..." to "Loading words..."
- Changed error message from "Failed to load dictionary" to "Failed to load word lists"

## Key Features

### 1. Separate Word Lists
- **Valid Words**: Used for guess validation (larger list)
- **Answer Words**: Used for secret answer selection (cleaner list)
- Both lists are loaded in parallel for efficiency

### 2. Fallback Logic
- If `answer-words.txt` is empty for a length → uses `valid-words.txt` for that length
- If both are empty → uses hardcoded fallback words
- Ensures game always has words to work with

### 3. Validation
- Guesses are validated against `valid-words.txt`
- Invalid guesses:
  - Do NOT consume a guess attempt
  - Do NOT update keyboard status
  - Show error message and shake animation

### 4. Answer Selection
- Answers are randomly selected from `answer-words.txt`
- Falls back to `valid-words.txt` if answer list is empty
- Always ensures answer is valid and of correct length

### 5. Keyboard Status
- Only updates after valid submitted guesses
- Invalid guesses do not affect keyboard colors
- Status persists across page refreshes

## State Flow

1. **App Loads** → `loadWordSets()` called
2. **Both Lists Load** → `valid-words.txt` and `answer-words.txt` fetched in parallel
3. **Words Cached** → Both lists organized by length and cached in memory
4. **Game Starts** → Answer selected from `answersByLength[wordLength]`
5. **User Submits Guess** → Validated against `validByLength[wordLength]`
6. **If Valid** → Guess processed, keyboard status updated
7. **If Invalid** → Error shown, no state changes

## Backward Compatibility

- `loadWordsByLength()` still works (delegates to `loadWordSets()`)
- Existing code using the old API continues to work
- All public APIs remain the same

## Testing

See `TWO_WORDLIST_TEST_CHECKLIST.md` for comprehensive test scenarios.

### Quick Test:
1. Verify both word list files exist and are accessible
2. Load app - should show "Loading words..." then game appears
3. Enter valid word from valid-words.txt - should accept
4. Enter word only in answer-words.txt (not in valid-words.txt) - should reject
5. Start new game - answer should be from answer-words.txt
6. Submit invalid guess - keyboard should NOT update
7. Submit valid guess - keyboard should update

