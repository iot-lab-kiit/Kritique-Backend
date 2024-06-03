export interface ProfanityData {
  id: string;
  words: string[];
  lookalike: Lookalike;
}

export type Lookalike = Record<string | number, string>;
