import React, { useState } from 'react';
import type { SentimentResult } from '../types';
import { SentimentChart } from './SentimentChart';
import { ResultsTable } from './ResultsTable';
import { ExportButtons } from './ExportButtons';
import { SentimentBarChart } from './SentimentBarChart';
import { RefreshIcon } from './Icons';

interface ResultsDisplayProps {
  results: SentimentResult[];
  onGoBack: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onGoBack }) => {
  const [activeTab, setActiveTab] = useState<'pie' | 'bar'>('pie');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Analysis Results</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <ExportButtons results={results} />
          <button
            onClick={onGoBack}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-md shadow-sm hover:shadow-md transform hover:-translate-y-px transition-all duration-200"
            aria-label="Analyze new text"
          >
            <RefreshIcon />
            New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-center">Sentiment Distribution</h3>
          <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('pie')}
              className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
                activeTab === 'pie'
                  ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
              }`}
              aria-pressed={activeTab === 'pie'}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setActiveTab('bar')}
              className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
                activeTab === 'bar'
                  ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
              }`}
              aria-pressed={activeTab === 'bar'}
            >
              Bar Chart
            </button>
          </div>
          <div className="mt-4">
            {activeTab === 'pie' && <SentimentChart results={results} />}
            {activeTab === 'bar' && <SentimentBarChart results={results} />}
          </div>
        </div>
        <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Detailed Breakdown</h3>
            <ResultsTable results={results} />
        </div>
      </div>
    </div>
  );
};