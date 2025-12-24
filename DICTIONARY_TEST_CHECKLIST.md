# Dictionary Integration Test Checklist

## Setup
- [ ] Verify `/public/words.txt` exists and is accessible
- [ ] Verify `http://localhost:3000/words.txt` loads in browser
- [ ] Check that words.txt contains lowercase words, one per line
- [ ] Verify words.txt has words of lengths 4-8

## Loading State
- [ ] App shows "Loading dictionary..." on initial load
- [ ] Input is disabled while loading (keyboard and physical keys don't work)
- [ ] Game board is not visible until dictionary loads
- [ ] Loading completes and game appears

## Word Validation
- [ ] Enter a valid word of the current length - should accept
- [ ] Enter an invalid word (not in dictionary) - should show "Not a valid word" and shake
- [ ] Enter a word of wrong length - should show "Not enough letters"
- [ ] Try words of different lengths (4-8) - validation works for each
- [ ] Verify case-insensitive validation (try lowercase, uppercase, mixed case)

## Answer Selection
- [ ] Start new game - answer is always a valid word
- [ ] Answer is always of the correct length (matches wordLength setting)
- [ ] Multiple new games produce different answers
- [ ] Answers are from the dictionary (can verify by guessing the answer)

## Settings Integration
- [ ] Change word length from 5 to 6 - new game starts with 6-letter word
- [ ] Change word length from 6 to 4 - new game starts with 4-letter word
- [ ] Change max guesses - game restarts with new max guesses
- [ ] Verify answer is always correct length after settings change

## Persistence
- [ ] Start a game, make some guesses
- [ ] Refresh page - game state is restored correctly
- [ ] Verify answer is still valid after refresh
- [ ] Verify guesses are preserved
- [ ] Complete a game, refresh - new game should start (not stuck in completed state)

## Error Handling
- [ ] Temporarily rename/delete words.txt
- [ ] Refresh page - should show error message
- [ ] Click "Retry" button - should attempt to reload
- [ ] Restore words.txt and retry - should load successfully
- [ ] Verify fallback words are used if dictionary is empty for a length

## Performance
- [ ] Dictionary loads once and is cached (check Network tab - only one request)
- [ ] Changing settings doesn't reload dictionary
- [ ] Multiple games don't trigger additional dictionary loads

## Edge Cases
- [ ] Test with very large words.txt file (if available)
- [ ] Test with words.txt containing CRLF line endings
- [ ] Test with words.txt containing LF line endings
- [ ] Test with words.txt containing mixed case (should be normalized to uppercase)
- [ ] Test with words.txt containing non-letter characters (should be filtered out)
- [ ] Test with words.txt containing words outside 4-8 length range (should be filtered)

## Mobile
- [ ] Loading state displays correctly on mobile
- [ ] Error state displays correctly on mobile
- [ ] Retry button is tappable on mobile
- [ ] Dictionary loads on mobile network

