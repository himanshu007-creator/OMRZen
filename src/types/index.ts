export interface TestConfig {
  questionCount: number;
  positiveMarks: number;
  negativeMarks: number;
  timeInMinutes: number;
}

export interface Answer {
  questionNumber: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export interface TestState {
  config: TestConfig;
  userAnswers: Answer[];
  correctAnswers: Answer[];
  isChecking: boolean;
  timeRemaining: number;
  isTestStarted: boolean;
  isTestSubmitted: boolean;
}