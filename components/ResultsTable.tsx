
import React from 'react';
import type { SentimentResult } from '../types';
import { Sentiment } from '../types';
import { KeywordPill } from './KeywordPill';

interface ResultsTableProps {
  results: SentimentResult[];
}

const sentimentColorClasses = {
  [Sentiment.Positive]: "text-green-600 dark:text-green-400",
  [Sentiment.Negative]: "text-red-600 dark:text-red-400",
  [Sentiment.Neutral]: "text-gray-600 dark:text-gray-400",
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sentiment</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Confidence</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {results.map((result, index) => (
            <tr key={index}>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`font-bold ${sentimentColorClasses[result.sentiment]}`}>{result.sentiment}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {(result.confidence * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2" title={result.originalText}>
                  "{result.originalText}"
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{result.explanation}</p>
                <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                        <KeywordPill key={i} keyword={kw} sentiment={result.sentiment} />
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};