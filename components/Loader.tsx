
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
      <p className="ml-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Analyzing Sentiments...</p>
    </div>
  );
};
