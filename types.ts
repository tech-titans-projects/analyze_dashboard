export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export interface SentimentResult {
  originalText: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  explanation: string;
}
