# Two Word List Integration Test Checklist

## Setup
- [ ] Verify `/public/valid-words.txt` exists and is accessible
- [ ] Verify `/public/answer-words.txt` exists and is accessible
- [ ] Check that `http://localhost:3000/valid-words.txt` loads in browser
- [ ] Check that `http://localhost:3000/answer-words.txt` loads in browser
- [ ] Verify both files contain lowercase words, one per line
- [ ] Verify both files have words of lengths 4-8

## Loading State
- [ ] App shows "Loading words..." on initial load
- [ ] Input is disabled while loading (keyboard and physical keys don't work)
- [ ] Game board is not visible until both lists are loaded
- [ ] Loading completes and game appears
- [ ] Both word lists load successfully (check Network tab - should see 2 requests)

## Word Validation (valid-words.txt)
- [ ] Enter a valid word from valid-words.txt - should accept
- [ ] Enter an invalid word (not in valid-words.txt) - should show "Not a valid word" and shake
- [ ] Invalid word does NOT consume a guess attempt
- [ ] Invalid word does NOT update keyboard status
- [ ] Try words of different lengths (4-8) - validation works for each
- [ ] Verify case-insensitive validation (try lowercase, uppercase, mixed case)
- [ ] Try a word that's in answer-words.txt but NOT in valid-words.txt - should be rejected

## Answer Selection (answer-words.txt)
- [ ] Start new game - answer is always a valid word from answer-words.txt
- [ ] Answer is always of the correct length (matches wordLength setting)
- [ ] Multiple new games produce different answers
- [ ] Answers are from answer-words.txt (can verify by guessing the answer)
- [ ] If answer-words.txt is empty for a length, falls back to valid-words.txt
- [ ] If both are empty, uses hardcoded fallback

## Keyboard Status
- [ ] Submit valid guess - keyboard keys update with colors
- [ ] Submit invalid guess - keyboard keys do NOT update
- [ ] Submit multiple valid guesses - keyboard status accumulates correctly
- [ ] Keyboard colors persist after page refresh
- [ ] Keyboard status follows precedence: correct > present > absent

## Settings Integration
- [ ] Change word length from 5 to 6 - new game starts with 6-letter word from answer-words.txt
- [ ] Change word length from 6 to 4 - new game starts with 4-letter word from answer-words.txt
- [ ] Change max guesses - game restarts with new max guesses
- [ ] Verify answer is always correct length after settings change
- [ ] Verify answer comes from answer-words.txt for the new length

## Persistence
- [ ] Start a game, make some valid guesses
- [ ] Refresh page - game state is restored correctly
- [ ] Verify answer is still valid after refresh
- [ ] Verify guesses are preserved
- [ ] Verify keyboard colors are preserved
- [ ] Complete a game, refresh - new game should start (not stuck in completed state)

## Error Handling
- [ ] Temporarily rename/delete valid-words.txt
- [ ] Refresh page - should show error message
- [ ] Click "Retry" button - should attempt to reload
- [ ] Restore valid-words.txt and retry - should load successfully
- [ ] Test with answer-words.txt missing - should fallback to valid-words.txt
- [ ] Test with both files missing - should use hardcoded fallback

## Edge Cases
- [ ] Test with answer-words.txt empty for one length - should fallback to valid-words.txt
- [ ] Test with valid-words.txt having words but answer-words.txt empty - should work
- [ ] Test with very large word lists (if available)
- [ ] Test with words.txt containing CRLF line endings
- [ ] Test with words.txt containing LF line endings
- [ ] Test with words.txt containing mixed case (should be normalized to uppercase)
- [ ] Test with words.txt containing non-letter characters (should be filtered out)
- [ ] Test with words.txt containing words outside 4-8 length range (should be filtered)

## Performance
- [ ] Both word lists load once and are cached (check Network tab - only 2 requests)
- [ ] Changing settings doesn't reload word lists
- [ ] Multiple games don't trigger additional word list loads
- [ ] Validation is fast (Set lookup is O(1))

## Mobile
- [ ] Loading state displays correctly on mobile
- [ ] Error state displays correctly on mobile
- [ ] Retry button is tappable on mobile
- [ ] Both word lists load on mobile network

