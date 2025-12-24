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
export type KeyStatus = 'absent' | 'present' | 'correct';

export interface GameState {
  answer: string;
  guesses: string[];
  evaluations: GuessEvaluation[];
  currentGuess: string;
  status: GameStatus;
  wordLength: number;
  maxGuesses: number;
  keyStatusMap: Record<string, KeyStatus>;
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
    keyStatusMap: {},
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

/**
 * Updates keyStatusMap based on evaluation with proper precedence:
 * - correct > present > absent
 * - Once a key is "correct", it never downgrades
 */
function updateKeyStatusMap(
  currentMap: Record<string, KeyStatus>,
  evaluation: GuessEvaluation
): Record<string, KeyStatus> {
  const newMap = { ...currentMap };

  for (const letterEval of evaluation.evaluations) {
    const letter = letterEval.letter;
    const currentStatus: KeyStatus | undefined = newMap[letter];
    const newStatus: KeyStatus = letterEval.state as KeyStatus;

    // Precedence: correct > present > absent
    // Once correct, never downgrade
    if (currentStatus === 'correct') {
      continue; // Keep as correct
    }

    // Update based on new status with proper precedence
    if (newStatus === 'correct') {
      newMap[letter] = 'correct';
    } else if (newStatus === 'present') {
      // Only set to present if not already correct (we know it's not from the check above)
      // and not already present
      if (currentStatus !== 'present') {
        newMap[letter] = 'present';
      }
    } else if (newStatus === 'absent') {
      // Only set to absent if no status yet
      if (currentStatus === undefined) {
        newMap[letter] = 'absent';
      }
    }
  }

  return newMap;
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

  // Normalize guess to uppercase for validation
  const guessUpper = state.currentGuess.toUpperCase();
  
  if (!isValidWordFn(guessUpper)) {
    return state; // Invalid word - will be handled by UI
  }

  const evaluation = evaluateGuess(guessUpper, state.answer);
  const newGuesses = [...state.guesses, guessUpper];
  const newEvaluations = [...state.evaluations, evaluation];
  const newKeyStatusMap = updateKeyStatusMap(state.keyStatusMap, evaluation);

  let newStatus: GameStatus = 'playing';
  if (guessUpper === state.answer) {
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
    keyStatusMap: newKeyStatusMap,
  };
}

