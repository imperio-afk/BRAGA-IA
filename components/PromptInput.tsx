
import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneIcon } from './icons/PaperPlaneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';

interface PromptInputProps {
  onSubmit: (prompt: string, image?: {data: string, mimeType: string}) => void;
  isLoading: boolean;
  placeholder: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading, placeholder }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 192; // 48 * 4px = 12rem
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((prompt.trim() || image) && !isLoading) {
      onSubmit(prompt, image ? {data: image.data, mimeType: image.mimeType} : undefined);
      setPrompt('');
      setImage(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = (loadEvent.target?.result as string)?.split(',')[1];
        if (base64) {
          setImage({ data: base64, mimeType: file.type, name: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
             {image && (
                <div className="mb-2 p-2 bg-gray-700/50 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <img src={`data:${image.mimeType};base64,${image.data}`} alt="Preview" className="w-10 h-10 rounded-md object-cover" />
                        <span className="text-sm text-gray-300 truncate">{image.name}</span>
                    </div>
                    <button onClick={() => {
                        setImage(null);
                        if(fileInputRef.current) fileInputRef.current.value = '';
                    }} className="p-1 text-gray-400 hover:text-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end bg-gray-800 rounded-2xl p-2 border border-gray-700 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="mr-2 p-2 text-gray-400 rounded-full transition-colors
                                hover:text-amber-400 hover:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                    <PaperclipIcon className="w-6 h-6" />
                </button>
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48 p-2"
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || (!prompt.trim() && !image)}
                    className="ml-2 p-3 bg-amber-400 rounded-full text-gray-900 transition-all duration-200
                                hover:bg-amber-300 disabled:bg-gray-600 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <PaperPlaneIcon className="w-5 h-5" />
                    )}
                </button>
            </form>
        </div>
    </div>
  );
};
