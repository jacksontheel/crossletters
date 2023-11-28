export type Puzzle = {
  letters: string[];
  questions: Question[];
};

export type Question = {
  hint: string;
  answer: string;
  correct?: boolean;
  revealed?: number;
};
