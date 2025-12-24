export type LetterState = 'correct' | 'present' | 'absent';

export interface LetterEvaluation {
  letter: string;
  state: LetterState;
}

export interface GuessEvaluation {
  guess: string;
  evaluations: LetterEvaluation[];
}

/**
 * Evaluates a guess against the answer, following Wordle rules:
 * - Green (correct): letter is in the correct position
 * - Yellow (present): letter exists in answer but in different position
 * - Gray (absent): letter is not in answer (or extra duplicates)
 * 
 * Handles duplicate letters correctly:
 * - Each letter in the answer can only be matched once
 * - Priority: correct position matches first, then present matches
 */
export function evaluateGuess(guess: string, answer: string): GuessEvaluation {
  const guessUpper = guess.toUpperCase();
  const answerUpper = answer.toUpperCase();
  
  if (guessUpper.length !== answerUpper.length) {
    throw new Error('Guess and answer must have the same length');
  }

  const evaluations: LetterEvaluation[] = [];
  const answerLetters = answerUpper.split('');
  const guessLetters = guessUpper.split('');
  
  // Track which positions in the answer have been matched
  const answerMatched = new Array(answerUpper.length).fill(false);
  // Track which positions in the guess have been evaluated
  const guessEvaluated = new Array(guessUpper.length).fill(false);

  // First pass: mark correct positions (green)
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      evaluations[i] = {
        letter: guessLetters[i],
        state: 'correct',
      };
      answerMatched[i] = true;
      guessEvaluated[i] = true;
    }
  }

  // Second pass: mark present letters (yellow)
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessEvaluated[i]) {
      continue; // Already marked as correct
    }

    // Find the first unmatched occurrence of this letter in the answer
    for (let j = 0; j < answerLetters.length; j++) {
      if (!answerMatched[j] && guessLetters[i] === answerLetters[j]) {
        evaluations[i] = {
          letter: guessLetters[i],
          state: 'present',
        };
        answerMatched[j] = true;
        guessEvaluated[i] = true;
        break;
      }
    }

    // If no match found, mark as absent
    if (!guessEvaluated[i]) {
      evaluations[i] = {
        letter: guessLetters[i],
        state: 'absent',
      };
      guessEvaluated[i] = true;
    }
  }

  return {
    guess: guessUpper,
    evaluations,
  };
}

/**
 * Gets the best state for a letter across all guesses
 * Priority: correct > present > absent
 */
export function getBestLetterState(
  letter: string,
  evaluations: GuessEvaluation[]
): LetterState {
  let bestState: LetterState = 'absent';

  for (const eval_ of evaluations) {
    const letterEval = eval_.evaluations.find(e => e.letter === letter);
    if (letterEval) {
      if (letterEval.state === 'correct') {
        return 'correct';
      } else if (letterEval.state === 'present') {
        bestState = 'present';
      }
    }
  }

  return bestState;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  answer: string;
  guesses: string[];
  evaluations: GuessEvaluation[];
  currentGuess: string;
  status: GameStatus;
  wordLength: number;
  maxGuesses: number;
}

export function createGameState(
  wordLength: number,
  maxGuesses: number,
  answer: string
): GameState {
  return {
    answer: answer.toUpperCase(),
    guesses: [],
    evaluations: [],
    currentGuess: '',
    status: 'playing',
    wordLength,
    maxGuesses,
  };
}

export function addLetterToGuess(state: GameState, letter: string): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  if (state.currentGuess.length >= state.wordLength) {
    return state;
  }

  return {
    ...state,
    currentGuess: state.currentGuess + letter.toUpperCase(),
  };
}

export function removeLetterFromGuess(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  return {
    ...state,
    currentGuess: state.currentGuess.slice(0, -1),
  };
}

export function submitGuess(
  state: GameState,
  isValidWordFn: (word: string) => boolean
): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  if (state.currentGuess.length !== state.wordLength) {
    return state; // Not enough letters
  }

  if (!isValidWordFn(state.currentGuess)) {
    return state; // Invalid word - will be handled by UI
  }

  const evaluation = evaluateGuess(state.currentGuess, state.answer);
  const newGuesses = [...state.guesses, state.currentGuess];
  const newEvaluations = [...state.evaluations, evaluation];

  let newStatus: GameStatus = 'playing';
  if (state.currentGuess === state.answer) {
    newStatus = 'won';
  } else if (newGuesses.length >= state.maxGuesses) {
    newStatus = 'lost';
  }

  return {
    ...state,
    guesses: newGuesses,
    evaluations: newEvaluations,
    currentGuess: '',
    status: newStatus,
  };
}

