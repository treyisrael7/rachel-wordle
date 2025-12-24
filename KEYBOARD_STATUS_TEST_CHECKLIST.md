# Keyboard Status & Dictionary Integration Test Checklist

## Dictionary Loading
- [ ] App shows "Loading dictionary..." on initial load
- [ ] Input is disabled while loading (keyboard and physical keys don't work)
- [ ] Dictionary loads successfully from `/public/words.txt`
- [ ] Verify `http://localhost:3000/words.txt` is accessible
- [ ] Loading completes and game appears

## Word Validation
- [ ] Enter a valid word from dictionary - should accept
- [ ] Enter an invalid word (not in dictionary) - should show "Not a valid word" and shake
- [ ] Invalid word does NOT update keyboard status
- [ ] Invalid word does NOT consume a guess
- [ ] Try words of different lengths (4-8) - validation works for each
- [ ] Verify case-insensitive validation works

## Keyboard Status - Basic Functionality
- [ ] Submit a guess with correct letters - keyboard keys turn green
- [ ] Submit a guess with present letters - keyboard keys turn yellow
- [ ] Submit a guess with absent letters - keyboard keys turn gray
- [ ] Keyboard updates immediately after each valid guess submission

## Keyboard Status - Precedence Rules
- [ ] Letter marked as "correct" (green) stays green even if used in wrong position later
- [ ] Letter marked as "present" (yellow) upgrades to "correct" (green) when in correct position
- [ ] Letter marked as "absent" (gray) upgrades to "present" (yellow) when found in word
- [ ] Letter marked as "absent" (gray) upgrades to "correct" (green) when in correct position
- [ ] Once a key is "correct", it never downgrades (test with multiple guesses)

## Keyboard Status - Edge Cases
- [ ] Submit guess with duplicate letters where one is correct and one is present
  - Correct position should be green
  - Present position should be yellow (if not already green)
- [ ] Submit guess with duplicate letters where both are absent
  - Both should be gray
- [ ] Submit guess with duplicate letters where one is correct and one is absent
  - Correct position should be green
  - Absent position should remain gray (or upgrade if appropriate)

## Persistence
- [ ] Start a game, make some guesses, keyboard shows colored keys
- [ ] Refresh page - keyboard colors persist (keys remain colored)
- [ ] Verify keyStatusMap is saved in localStorage
- [ ] Complete a game, refresh - new game should start with empty keyboard status
- [ ] Change word length in settings - new game starts with empty keyboard status

## Settings Integration
- [ ] Change word length from 5 to 6 - new game starts with 6-letter word
- [ ] Keyboard status resets when word length changes
- [ ] Change max guesses - game restarts, keyboard status preserved for current game
- [ ] Verify answer is always correct length after settings change

## Error Handling
- [ ] Temporarily rename/delete words.txt
- [ ] Refresh page - should show error message
- [ ] Click "Retry" button - should attempt to reload
- [ ] Restore words.txt and retry - should load successfully

## Visual Verification
- [ ] Green keys are clearly visible (correct letters)
- [ ] Yellow keys are clearly visible (present letters)
- [ ] Gray keys are clearly visible (absent letters)
- [ ] Unused keys remain default gray color
- [ ] Keyboard colors match tile colors on board
- [ ] Keyboard is disabled (opacity) while dictionary loads

## Mobile Testing
- [ ] Keyboard status works on mobile
- [ ] Keyboard colors are visible on mobile
- [ ] Touch interactions work correctly
- [ ] Dictionary loads on mobile network

## Performance
- [ ] Dictionary loads once and is cached
- [ ] Keyboard updates are instant after guess submission
- [ ] No lag when typing or submitting guesses

