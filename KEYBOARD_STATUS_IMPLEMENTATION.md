# Keyboard Status Implementation Summary

## Overview
Added keyboard status tracking to reflect guessed letter states with proper precedence and persistence.

## Files Modified

### 1. `lib/wordle.ts`
**Changes:**
- Added `KeyStatus` type: `'absent' | 'present' | 'correct'`
- Added `keyStatusMap: Record<string, KeyStatus>` to `GameState` interface
- Updated `createGameState()` to initialize empty `keyStatusMap`
- Added `updateKeyStatusMap()` function with precedence logic:
  - **correct > present > absent**
  - Once a key is "correct", it never downgrades
  - Present only sets if not already correct
  - Absent only sets if no status exists
- Updated `submitGuess()` to call `updateKeyStatusMap()` and include it in returned state

**Key Logic:**
```typescript
// Precedence: correct > present > absent
// Once correct, never downgrade
if (currentStatus === 'correct') continue;

if (newStatus === 'correct') {
  newMap[letter] = 'correct';
} else if (newStatus === 'present') {
  if (currentStatus !== 'present') {
    newMap[letter] = 'present';
  }
} else if (newStatus === 'absent') {
  if (currentStatus === undefined) {
    newMap[letter] = 'absent';
  }
}
```

### 2. `components/Keyboard.tsx`
**Changes:**
- Removed dependency on `evaluations` and `getBestLetterState()`
- Added `keyStatusMap: Record<string, KeyStatus>` prop
- Updated `getKeyState()` to use `keyStatusMap` directly:
  - `keyStatusMap[letter] === 'correct'` → green
  - `keyStatusMap[letter] === 'present'` → yellow
  - `keyStatusMap[letter] === 'absent'` → gray
  - No status → default gray

**Before:**
```typescript
const state = getBestLetterState(letter, evaluations);
```

**After:**
```typescript
const status = keyStatusMap[letter];
```

### 3. `app/page.tsx`
**Changes:**
- Updated `loadGameState()` to handle backward compatibility:
  - Adds empty `keyStatusMap: {}` if missing from old saved states
- Updated `Keyboard` component usage:
  - Changed from `evaluations={gameState.evaluations}` 
  - To `keyStatusMap={gameState.keyStatusMap}`

## Key Features

### 1. Status Precedence
- **correct** (green) is highest priority
- **present** (yellow) is medium priority
- **absent** (gray) is lowest priority
- Once a key is marked "correct", it never downgrades

### 2. Persistence
- `keyStatusMap` is stored in `GameState`
- `GameState` is saved to localStorage
- Keyboard colors persist across page refreshes
- Resets when starting a new game

### 3. Invalid Word Handling
- Invalid words do NOT update keyboard status
- Invalid words do NOT consume a guess
- Only valid submitted guesses update keyboard status

### 4. Real-time Updates
- Keyboard updates immediately after each valid guess submission
- No delay or lag in status updates
- Visual feedback is instant

## State Flow

1. **User submits valid guess** → `submitGuess()` called
2. **Guess evaluated** → `evaluateGuess()` returns evaluation
3. **Keyboard status updated** → `updateKeyStatusMap()` processes evaluation
4. **State saved** → `keyStatusMap` included in new `GameState`
5. **UI updates** → `Keyboard` component receives new `keyStatusMap`
6. **Colors applied** → Keys colored based on status

## Backward Compatibility

- Old saved game states without `keyStatusMap` are handled gracefully
- `loadGameState()` adds empty `keyStatusMap: {}` if missing
- Existing functionality remains unchanged

## Testing

See `KEYBOARD_STATUS_TEST_CHECKLIST.md` for comprehensive test scenarios.

### Quick Test:
1. Submit a guess with letters in correct positions → keys turn green
2. Submit another guess with same letters in wrong positions → keys stay green (no downgrade)
3. Submit guess with new letters → keys update appropriately
4. Refresh page → keyboard colors persist
5. Start new game → keyboard resets to default

