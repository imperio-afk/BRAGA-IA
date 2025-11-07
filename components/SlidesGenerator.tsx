import React, { useState, useEffect } from 'react';
import { SlideData, Slide } from '../types';
import { generateImage } from '../services/geminiService';
import { SlidesViewer } from './SlidesViewer';

interface SlidesGeneratorProps {
  data: SlideData;
}

export const SlidesGenerator: React.FC<SlidesGeneratorProps> = ({ data }) => {
  const [processedData, setProcessedData] = useState<SlideData>(data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processSlides = async () => {
      const slidesWithImages: Slide[] = [...data.slides];

      for (let i = 0; i < slidesWithImages.length; i++) {
        if (!isMounted) return;

        try {
          const imageUrl = await generateImage(slidesWithImages[i].imageQuery);
          
          if (isMounted) {
              slidesWithImages[i] = { ...slidesWithImages[i], imageUrl };
              setProcessedData(prev => ({
                ...prev,
                slides: [...slidesWithImages] 
              }));
          }
        } catch (err) {
            if (isMounted) {
                console.error(`Failed to generate image for slide ${i + 1}:`, err);
                // Optionally set an error state or a placeholder error image
                slidesWithImages[i] = { ...slidesWithImages[i], imageUrl: undefined }; // Mark as failed
                 setProcessedData(prev => ({
                    ...prev,
                    slides: [...slidesWithImages] 
                 }));
                 setError("Algumas imagens não puderam ser geradas. A apresentação ainda pode ser exportada.");
            }
        }
      }
    };

    processSlides();

    return () => {
      isMounted = false;
    };
  }, [data]);

  return (
    <>
        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
        <SlidesViewer data={processedData} />
    </>
  );
};