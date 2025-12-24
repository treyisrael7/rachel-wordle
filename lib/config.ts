// Branding and theme configuration

export const BRANDING = {
  title: "Rachel's Wordle",
  subtitle: "Unlimited puzzles, made with love 💚🩷",
} as const;

export const WIN_MESSAGES = [
  "Great job pookie! ✨",
  "Daaaang baby girl! 🎉",
  "You're killing it!' 💪",
  "Go sexy! 🌟",
  "Are you cheating? 🎯",
  "You are a genius! 🚀",
] as const;

export const LOSE_MESSAGES = [
  "Nice try! The word was {answer}. You'll get it next time! 💪",
  "So close! It was {answer}. Keep going! 🌟",
  "That's okay! The answer was {answer}. Try again! ✨",
] as const;

export function getRandomWinMessage(): string {
  return WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
}

export function getLoseMessage(answer: string): string {
  const message = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
  return message.replace('{answer}', answer);
}

// Theme colors (green + pink)
export const THEME = {
  primary: '#10b981', // green-500
  primaryDark: '#059669', // green-600
  accent: '#ec4899', // pink-500
  accentDark: '#db2777', // pink-600
  bg: '#f9fafb', // gray-50
  card: '#ffffff',
  text: '#111827', // gray-900
  muted: '#6b7280', // gray-500
  border: '#e5e7eb', // gray-200
} as const;

