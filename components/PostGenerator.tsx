import React, { useState, useEffect } from 'react';
import { PostData } from '../types';
import { generateImage } from '../services/geminiService';
import { PostViewer } from './PostViewer';

interface PostGeneratorProps {
  data: PostData;
}

export const PostGenerator: React.FC<PostGeneratorProps> = ({ data }) => {
  const [processedData, setProcessedData] = useState<PostData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const createPostImage = async () => {
      try {
        const imageUrl = await generateImage(data.imageQuery);
        if (isMounted) {
          setProcessedData(prev => ({ ...prev, imageUrl }));
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Failed to generate image for post:`, err);
          setError("A imagem para o post não pôde ser gerada, mas o texto está pronto.");
        }
      } finally {
        if (isMounted) {
            setIsGenerating(false);
        }
      }
    };

    createPostImage();

    return () => {
      isMounted = false;
    };
  }, [data]);

  return (
    <>
      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
      <PostViewer data={processedData} isGeneratingImage={isGenerating} />
    </>
  );
};