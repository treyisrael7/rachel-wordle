# Manual Test Checklist

## Mobile Layout
- [ ] Open app on mobile device (or mobile viewport in dev tools)
- [ ] Verify header title and subtitle are readable and not cut off
- [ ] Check that board tiles fit on screen without horizontal scroll
- [ ] Verify keyboard buttons are appropriately sized for touch
- [ ] Test that modals (Settings, Stats, Result) fit on screen
- [ ] Check safe-area-inset padding on devices with notches (iPhone X+)
- [ ] Verify all buttons are easily tappable (min 44x44px touch target)

## Theme & Branding
- [ ] Verify "Rachel's Wordle" title appears in green
- [ ] Check subtitle "Unlimited puzzles, made with love 💚🩷" displays correctly
- [ ] Confirm buttons use green (primary) and pink (accent) colors
- [ ] Verify Stats button is pink
- [ ] Verify Settings button is green
- [ ] Check that keyboard Enter/Backspace buttons are pink
- [ ] Verify Wordle tile colors remain standard (green/yellow/gray for results)
- [ ] Test focus states on interactive elements

## Stats Tracking
- [ ] Play and win a game - verify stats update
- [ ] Check that gamesPlayed increments
- [ ] Verify wins count increases
- [ ] Confirm currentStreak increments on win
- [ ] Check that bestStreak updates when currentStreak exceeds it
- [ ] Verify guessDistribution shows correct count for guess number
- [ ] Play and lose a game - verify currentStreak resets to 0
- [ ] Check that gamesPlayed still increments on loss
- [ ] Open Stats modal - verify all numbers display correctly
- [ ] Check win rate percentage calculation
- [ ] Verify guess distribution bars render correctly
- [ ] Test "Reset Stats" button with confirmation
- [ ] Refresh page - verify stats persist in localStorage

## Share Functionality
- [ ] Win a game and click "Share" button
- [ ] Verify emoji grid is copied to clipboard
- [ ] Paste clipboard and check format:
  - [ ] Title line: "Rachel's Wordle — X/Y"
  - [ ] Blank line
  - [ ] Emoji rows (🟩🟨⬛)
  - [ ] Site URL line (if available)
- [ ] Test on device without clipboard API - verify fallback alert shows
- [ ] Verify share button shows "Copied! ✓" feedback

## Win/Lose Messages
- [ ] Win multiple games - verify win messages rotate randomly
- [ ] Check that win message appears in modal title
- [ ] Verify guess count appears in message
- [ ] Lose a game - verify encouraging lose message appears
- [ ] Check that answer is shown in lose message

## Persistence
- [ ] Start a game, make some guesses
- [ ] Refresh page - verify game state is restored
- [ ] Complete a game (win or lose)
- [ ] Refresh page - verify new game starts (not stuck in completed state)
- [ ] Change settings - verify new game starts with new settings
- [ ] Reset game - verify localStorage is cleared

## Gameplay (should remain unchanged)
- [ ] Verify duplicate letter handling still works correctly
- [ ] Test that green > yellow > gray priority is maintained
- [ ] Confirm word validation works
- [ ] Check that invalid words show shake animation
- [ ] Verify physical keyboard input works
- [ ] Test that Enter submits and Backspace deletes

## Edge Cases
- [ ] Win game, refresh immediately - verify no double counting
- [ ] Lose game, refresh immediately - verify no double counting
- [ ] Change settings mid-game - verify new game starts
- [ ] Reset stats while viewing stats modal
- [ ] Share after losing (should not show share button)

