import React, { useState, useCallback } from 'react';
import { analyzeSentimentBatch } from './services/geminiService';
import type { SentimentResult } from './types';
import { Header } from './components/Header';
import { TextInputSection } from './components/TextInputSection';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'input' | 'results'>('input');

  const handleAnalyze = useCallback(async () => {
    const textsToAnalyze = inputText.split('\n').filter(t => t.trim() !== '');
    if (textsToAnalyze.length === 0) {
      setError("Please enter some text to analyze.");
      return;
    }

    if (textsToAnalyze.length > 50) {
      setError("You can analyze a maximum of 50 statements at a time. Please reduce the number of lines.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sentimentResults = await analyzeSentimentBatch(textsToAnalyze);
      setResults(sentimentResults);
      setView('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);
  
  const handleGoBack = useCallback(() => {
    setView('input');
    setResults([]);
    setInputText('');
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Header />

        {view === 'input' && (
          <>
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
              <TextInputSection 
                inputText={inputText} 
                setInputText={setInputText} 
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />
            </div>
            {isLoading && <Loader />}
            {error && <ErrorMessage message={error} />}
          </>
        )}
        
        {view === 'results' && results.length > 0 && !isLoading && (
          <div className="mt-8">
            <ResultsDisplay results={results} onGoBack={handleGoBack} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;