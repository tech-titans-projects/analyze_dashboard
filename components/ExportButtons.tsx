
import React from 'react';
import type { SentimentResult } from '../types';
import { exportAsJSON, exportAsCSV, exportAsPDF } from '../utils/export';
import { CsvIcon, JsonIcon, PdfIcon } from './Icons';

interface ExportButtonsProps {
  results: SentimentResult[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ results }) => {
  return (
    <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-2">Export as:</span>
      <button 
        onClick={() => exportAsJSON(results)} 
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-semibold text-sm transition-colors"
        aria-label="Export as JSON"
        >
        <JsonIcon />
        JSON
      </button>
      <button 
        onClick={() => exportAsCSV(results)} 
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-semibold text-sm transition-colors"
        aria-label="Export as CSV"
        >
        <CsvIcon />
        CSV
      </button>
      <button 
        onClick={() => exportAsPDF(results)} 
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-semibold text-sm transition-colors"
        aria-label="Export as PDF"
        >
        <PdfIcon />
        PDF
      </button>
    </div>
  );
};
