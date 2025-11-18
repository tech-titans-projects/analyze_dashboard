
import React from 'react';
import type { Sentiment } from '../types';

interface KeywordPillProps {
  keyword: string;
  sentiment: Sentiment;
}

const sentimentPillClasses: Record<Sentiment, string> = {
  Positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export const KeywordPill: React.FC<KeywordPillProps> = ({ keyword, sentiment }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sentimentPillClasses[sentiment]}`}>
      {keyword}
    </span>
  );
};