import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { CrownIcon } from './icons/CrownIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
    </div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-400/10">
                <CrownIcon className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div className={`p-4 rounded-2xl max-w-lg lg:max-w-2xl xl:max-w-4xl prose prose-invert prose-p:my-2 prose-headings:text-amber-400 prose-strong:text-amber-400 prose-code:bg-gray-900/80 prose-code:p-1 prose-code:rounded-md prose-code:text-sm prose-pre:bg-gray-900/80 prose-pre:p-4 prose-pre:rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-amber-500/80 text-gray-900 rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              {typeof msg.content === 'string' ? <p>{msg.content}</p> : msg.content}
            </div>
             {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-bold">
                V
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-amber-400">
                    <CrownIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="p-4 bg-gray-800 rounded-2xl rounded-bl-none">
                    <TypingIndicator />
                </div>
            </div>
        )}
      </div>
      <div ref={endOfMessagesRef} />
    </div>
  );
};
