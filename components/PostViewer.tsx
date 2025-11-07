import React, { useState } from 'react';
import { PostData } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';

interface PostViewerProps {
  data: PostData;
  isGeneratingImage: boolean;
}

export const PostViewer: React.FC<PostViewerProps> = ({ data, isGeneratingImage }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const fullText = `${data.text}\n\n${data.hashtags.join(' ')}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 flex flex-col gap-4">
            <h3 className="font-bold text-amber-400">Post para: <span className="text-white font-semibold">{data.platform}</span></h3>
            
            <div className="aspect-video bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                {isGeneratingImage ? (
                    <div className="w-8 h-8 border-4 border-gray-500 border-t-amber-400 rounded-full animate-spin"></div>
                ) : data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.imageQuery} className="w-full h-full object-cover" />
                ) : (
                    <p className="text-gray-400 text-sm">Imagem não disponível</p>
                )}
            </div>

            <div className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                {data.text}
            </div>
            
            <div className="flex flex-wrap gap-2">
                {data.hashtags.map((tag, i) => (
                    <span key={i} className="text-amber-400 text-xs font-semibold bg-gray-700/50 px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>

            <div className="flex gap-2 mt-2">
                 <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300
                            bg-gray-700 text-white hover:bg-gray-600
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
                >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    {copied ? "Copiado!" : "Copiar Texto"}
                </button>
                <a
                    href={data.imageUrl}
                    download={`post_imagem_braga_ia.png`}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300
                            bg-amber-400 text-gray-900 hover:bg-amber-300
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400
                            ${!data.imageUrl || isGeneratingImage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Baixar Imagem
                </a>
            </div>
        </div>
    );
};