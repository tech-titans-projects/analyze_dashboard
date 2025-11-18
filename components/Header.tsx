
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        Tech Titans Sentiment Analysis Dashboard
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Instantly analyze emotional tone in text. Upload a file or enter text below to get started.
      </p>
    </header>
  );
};