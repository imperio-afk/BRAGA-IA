import React from 'react';
import { CrownIcon } from './icons/CrownIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface HeaderProps {
    onToggleHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory }) => {
  return (
    <header className="flex items-center justify-between p-4 text-white border-b border-gray-700/50 shrink-0">
      <div className="flex items-center">
        <CrownIcon className="w-8 h-8 text-amber-400 mr-3" />
        <h1 className="text-2xl font-bold tracking-wider text-amber-400">
          BRAGA <span className="text-white font-light">IA</span>
        </h1>
      </div>
      <button 
        onClick={onToggleHistory}
        className="p-2 rounded-full text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="Toggle history"
      >
        <HistoryIcon className="w-6 h-6" />
      </button>
    </header>
  );
};
