import React from 'react';
import { FunctionType } from '../types';

interface FunctionSelectorProps {
  selected: FunctionType;
  onSelect: (type: FunctionType) => void;
}

export const FunctionSelector: React.FC<FunctionSelectorProps> = ({ selected, onSelect }) => {
  const functions = [FunctionType.TEXT, FunctionType.IMAGE, FunctionType.CODE, FunctionType.SLIDES, FunctionType.PROFESSOR];

  return (
    <div className="flex justify-center p-4 space-x-2 md:space-x-4 border-b border-gray-800 overflow-x-auto shrink-0">
      {functions.map((func) => {
        const isSelected = selected === func;
        return (
          <button
            key={func}
            onClick={() => onSelect(func)}
            className={`
              px-4 py-2 text-sm md:px-6 md:py-2.5 md:text-base font-semibold rounded-full transition-all duration-300 transform shrink-0
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400
              ${isSelected
                ? 'bg-amber-400 text-gray-900 shadow-lg shadow-amber-400/20 scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            {func}
          </button>
        );
      })}
    </div>
  );
};
