import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, getVideoOperation } from '../services/geminiService';
import { DownloadIcon } from './icons/DownloadIcon';

interface VideoGeneratorProps {
  prompt: string;
  image?: { data: string; mimeType: string };
}

const STATUS_MESSAGES = [
    "Consultando as musas da criação...",
    "Ajustando os parâmetros cósmicos...",
    "Renderizando pixels em movimento...",
    "Compilando sua obra-prima cinematográfica...",
    "Adicionando um toque de magia...",
    "Quase pronto! A pipoca já está no micro-ondas?",
];

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ prompt, image }) => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Inicializando a criação do vídeo...");
  const pollingIntervalRef = useRef<number | null>(null);
  const statusIntervalRef = useRef<number | null>(null);

  const startGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    
    // Clear any previous intervals
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);

    try {
        const keySelected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);
        if (!keySelected) {
            setIsLoading(false);
            return;
        }

        setStatusText("Gerando seu vídeo... Isso pode levar alguns minutos.");
        statusIntervalRef.current = window.setInterval(() => {
            setStatusText(STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)]);
        }, 4000);

        let operation = await generateVideo(prompt, image);

        pollingIntervalRef.current = window.setInterval(async () => {
            operation = await getVideoOperation(operation);
            if (operation.done) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
                
                const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (uri) {
                    const finalUrl = `${uri}&key=${process.env.API_KEY}`;
                    setVideoUrl(finalUrl);
                } else {
                     setError("Não foi possível obter o vídeo gerado. Tente novamente.");
                }
                setIsLoading(false);
            }
        }, 10000);

    } catch (err: any) {
        console.error("Video generation error:", err);
        if (err.message?.includes("Requested entity was not found")) {
            setError("Sua chave de API parece inválida. Por favor, selecione uma chave válida para continuar.");
            setHasApiKey(false);
        } else {
             setError("Ocorreu um erro ao iniciar a geração do vídeo. Verifique o console para mais detalhes.");
        }
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
        setIsLoading(false);
    }
  };

  useEffect(() => {
    startGeneration();
    return () => { // Cleanup on unmount
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [prompt, image]);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    startGeneration();
  };

  if (hasApiKey === false) {
    return (
        <div className="p-4 border border-amber-500/50 rounded-lg bg-gray-800/50 text-center">
            <h4 className="font-bold text-amber-400">Chave de API Necessária</h4>
            <p className="text-sm text-gray-300 my-2">Para gerar vídeos, você precisa selecionar uma chave de API do Google AI Studio.</p>
            <p className="text-xs text-gray-400 mb-4">A geração de vídeo é um recurso avançado e pode incorrer em custos. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">Saiba mais sobre preços.</a></p>
            <button onClick={handleSelectKey} className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-full hover:bg-amber-300 transition-colors">
                Selecionar Chave de API
            </button>
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 text-center">
        <div className="flex justify-center items-center mb-3">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-amber-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-amber-400 font-semibold">{statusText}</p>
        <p className="text-xs text-gray-400 mt-2">A criação de vídeos é um processo complexo e pode demorar vários minutos.</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-4 border border-red-500/50 rounded-lg bg-red-900/20 text-center">
          <p className="text-red-400 font-semibold">Falha na Criação</p>
          <p className="text-sm text-gray-300 mt-1">{error}</p>
       </div>
    );
  }

  if (videoUrl) {
    return (
         <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 flex flex-col gap-4">
            <h3 className="font-bold text-amber-400">Seu Vídeo Está Pronto!</h3>
             <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                <video src={videoUrl} controls className="w-full h-full object-contain" />
             </div>
             <a
                href={videoUrl}
                download={`video_braga_ia.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 text-base font-semibold rounded-full transition-all duration-300
                            bg-amber-400 text-gray-900 hover:bg-amber-300
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Baixar Vídeo (.mp4)
            </a>
         </div>
    )
  }

  return null;
};
