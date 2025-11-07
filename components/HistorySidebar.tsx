import React from 'react';
import { Conversation, FunctionType } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CrownIcon } from './icons/CrownIcon';

interface HistorySidebarProps {
  isOpen: boolean;
  history: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: (type: FunctionType) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, history, currentId, onSelect, onDelete, onNewChat }) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };
  
  return (
    <aside className={`
        flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 p-4' : 'w-0 p-0'}
        overflow-hidden border-r border-gray-700/50 shrink-0
    `}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-200">Histórico</h2>
        <button
            onClick={() => onNewChat(FunctionType.TEXT)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors bg-gray-700 text-white hover:bg-amber-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Novo Chat</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto -mr-4 pr-3">
        {history.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 text-sm">
            <CrownIcon className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            Nenhum chat salvo. <br />
            Comece uma nova conversa!
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors group flex justify-between items-center
                    ${currentId === conv.id ? 'bg-amber-400/20 text-amber-300' : 'hover:bg-gray-700/80'}
                  `}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">
                        {conv.title}
                    </span>
                    <span className={`text-xs ${currentId === conv.id ? 'text-amber-400/80' : 'text-gray-400'}`}>
                        {conv.functionType}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-gray-600 transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
