import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { identifyMisspelledWords, getSpellingSuggestions } from '../services/geminiService';
import { SuggestionsPopover } from './SuggestionsPopover';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface SpellCheckTextareaProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

export const SpellCheckTextarea: React.FC<SpellCheckTextareaProps> = ({ value, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [misspelledWords, setMisspelledWords] = useState<Set<string>>(new Set());
  const [popover, setPopover] = useState<{ top: number; left: number; word: string; suggestions: string[]; selectionStart: number; selectionEnd: number; } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const debouncedValue = useDebounce(value, 1000);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const checkSpelling = async () => {
      if (!debouncedValue.trim()) {
        setMisspelledWords(new Set());
        return;
      }
      setIsChecking(true);
      const words = await identifyMisspelledWords(debouncedValue);
      setMisspelledWords(new Set(words.map(w => w.toLowerCase())));
      setIsChecking(false);
    };
    checkSpelling();
  }, [debouncedValue]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleWordHover = useCallback(async (e: React.MouseEvent<HTMLSpanElement>, word: string, selectionStart: number, selectionEnd: number) => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }

    const target = e.currentTarget; // Read property synchronously

    hoverTimeoutRef.current = window.setTimeout(async () => {
        if (popover?.word === word) return;

        const rect = target.getBoundingClientRect();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const textareaRect = textarea.getBoundingClientRect();
        const top = rect.bottom - textareaRect.top + textarea.offsetTop - textarea.scrollTop;
        const left = rect.left - textareaRect.left + textarea.offsetLeft - textarea.scrollLeft;
        
        setPopover({ 
            top,
            left,
            word, 
            suggestions: ['Checking...'],
            selectionStart,
            selectionEnd,
        });

        const suggestions = await getSpellingSuggestions(word);
        setPopover(p => p && p.word === word ? { ...p, suggestions: suggestions.length > 0 ? suggestions : ['No suggestions'] } : p);
    }, 300);
  }, [popover?.word]);

  const handleWordMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
  }, []);
  
  const renderHighlightedText = useMemo(() => {
    if (misspelledWords.size === 0) {
      return value;
    }
    const safeWords = Array.from(misspelledWords).map((w: string) => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
    if (!safeWords) return value;
    const regex = new RegExp(`\\b(${safeWords})\\b`, 'gi');
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let result;
    
    while ((result = regex.exec(value)) !== null) {
      if (result.index > lastIndex) {
        elements.push(value.substring(lastIndex, result.index));
      }
      
      const word = result[0];
      const startIndex = result.index;
      const endIndex = startIndex + word.length;

      elements.push(
        <span
          key={`${startIndex}-${word}`}
          className="misspelled-word"
          onMouseEnter={(e) => handleWordHover(e, word, startIndex, endIndex)}
          onMouseLeave={handleWordMouseLeave}
        >
          {word}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < value.length) {
      elements.push(value.substring(lastIndex));
    }
    return elements;
  }, [value, misspelledWords, handleWordHover, handleWordMouseLeave]);

  const handleSuggestionClick = (suggestion: string) => {
    if (!popover || suggestion === 'No suggestions' || suggestion === 'Checking...') return;
    const { selectionStart, selectionEnd } = popover;
    const newValue = value.substring(0, selectionStart) + suggestion + value.substring(selectionEnd);
    onChange(newValue);
    setPopover(null);
  };
  
  const baseClasses = "w-full p-3 border rounded-lg transition-all duration-200 h-64 whitespace-pre-wrap font-inherit text-base leading-relaxed tracking-wide box-border";
  const textareaClasses = `${baseClasses} absolute top-0 left-0 bg-transparent caret-black dark:caret-white resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 z-10`;
  const backdropClasses = `${baseClasses} border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 overflow-auto backdrop-scroll`;

  return (
    <div className="relative font-sans">
       <style>{`
        .misspelled-word {
          text-decoration: underline;
          text-decoration-color: red;
          text-decoration-style: wavy;
          background-color: rgba(255, 0, 0, 0.05);
          cursor: pointer;
        }
        .font-inherit { font: inherit; }
        .backdrop-scroll::-webkit-scrollbar { display: none; }
        .backdrop-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .spellcheck-textarea {
          color: transparent;
        }
        .dark .spellcheck-textarea {
          color: transparent;
        }
        .spellcheck-textarea::selection {
          background-color: rgba(20, 184, 166, 0.3); /* teal-500 with opacity */
          color: #111827; /* gray-900 */
        }
        .dark .spellcheck-textarea::selection {
          background-color: rgba(45, 212, 191, 0.4); /* teal-400 with opacity */
          color: #f3f4f6; /* gray-100 */
        }
       `}</style>
      <div
        ref={backdropRef}
        className={backdropClasses}
      >
        {renderHighlightedText}
        {' '}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onClick={() => popover && setPopover(null)}
        disabled={disabled}
        className={`${textareaClasses} spellcheck-textarea`}
        placeholder="Enter text for analysis. Each new line will be analyzed separately."
        spellCheck={false}
      />
       {isChecking && <small className="absolute bottom-2 right-2 text-gray-400 z-20">Checking spelling...</small>}
       {popover && (
         <SuggestionsPopover 
           top={popover.top}
           left={popover.left}
           suggestions={popover.suggestions}
           onSelect={handleSuggestionClick}
           onClose={() => setPopover(null)}
         />
       )}
    </div>
  );
};