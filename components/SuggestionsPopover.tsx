
import React, { useEffect, useRef } from 'react';

interface SuggestionsPopoverProps {
  top: number;
  left: number;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

export const SuggestionsPopover: React.FC<SuggestionsPopoverProps> = ({ top, left, suggestions, onSelect, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSelect = (suggestion: string) => {
    if (suggestion !== 'No suggestions' && suggestion !== 'Checking...') {
        onSelect(suggestion);
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-w-[200px]"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <ul className="py-1 max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() => handleSelect(suggestion)}
            className={`px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                (suggestion === 'No suggestions' || suggestion === 'Checking...') 
                ? 'italic text-gray-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
            }`}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};
