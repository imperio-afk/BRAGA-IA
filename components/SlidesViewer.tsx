import React, { useState } from 'react';
import PptxGenJS from 'pptxgenjs';
import { SlideData } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SlidesViewerProps {
  data: SlideData;
}

export const SlidesViewer: React.FC<SlidesViewerProps> = ({ data }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = () => {
    setIsDownloading(true);
    try {
        const pptx = new PptxGenJS();
        
        pptx.defineLayout({ name: 'BRAGA', width: 10, height: 5.625 });
        pptx.layout = 'BRAGA';

        const titleSlide = pptx.addSlide();
        titleSlide.background = { color: '1C1C1C' };
        titleSlide.addText(data.presentationTitle, { 
            x: 0.5, y: 2, w: 9, h: 1, 
            fontFace: 'Arial', fontSize: 44, color: 'FBBF24',
            bold: true, align: 'center' 
        });
        titleSlide.addText('Gerado por BRAGA IA', { 
            x: 0.5, y: 4.5, w: 9, h: 0.5, 
            fontFace: 'Arial', fontSize: 14, color: 'FFFFFF', 
            align: 'center' 
        });

        data.slides.forEach(slideData => {
            const slide = pptx.addSlide();
            slide.background = { color: '1C1C1C' };
            slide.addText(slideData.title, { 
                x: 0.5, y: 0.25, w: '90%', h: 0.75, 
                fontFace: 'Arial', fontSize: 28, color: 'FBBF24', bold: true 
            });
            
            const textContent = Array.isArray(slideData.content) ? slideData.content.join('\n') : slideData.content;
            
            if (slideData.imageUrl) {
                // Layout with image
                slide.addImage({
                    data: slideData.imageUrl,
                    x: 5.25, y: 1.2, w: 4.25, h: 3.8
                });
                slide.addText(textContent, { 
                    x: 0.5, y: 1.2, w: 4.5, h: 3.8, 
                    fontFace: 'Arial', fontSize: 16, color: 'FFFFFF',
                    bullet: true 
                });
            } else {
                // Layout without image (full width)
                 slide.addText(textContent, { 
                    x: 0.5, y: 1.25, w: 9, h: 4, 
                    fontFace: 'Arial', fontSize: 18, color: 'FFFFFF',
                    bullet: true
                });
            }
        });

        const fileName = `${data.presentationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
        pptx.writeFile({ fileName });
    } catch (error) {
        console.error("Error generating PPTX file:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <h3 className="text-lg font-bold text-amber-400">{data.presentationTitle}</h3>
      <p className="text-sm text-gray-400 mb-4">{data.slides.length} slides preparados para sua apresentação.</p>
      <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto text-gray-300 pr-2">
        {data.slides.map((slide, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
                {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={`Preview for ${slide.title}`} className="w-16 h-10 object-cover rounded-md bg-gray-700 flex-shrink-0" />
                ) : (
                    <div className="w-16 h-10 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                         <div className="w-5 h-5 border-2 border-gray-500 border-t-amber-400 rounded-full animate-spin"></div>
                    </div>
                )}
                <span className="truncate"><strong>Slide {index + 1}:</strong> {slide.title}</span>
            </li>
        ))}
      </ul>
      <button
        onClick={handleExport}
        disabled={isDownloading}
        className="w-full flex items-center justify-center px-4 py-2 text-base font-semibold rounded-full transition-all duration-300
                   bg-amber-400 text-gray-900 hover:bg-amber-300
                   disabled:bg-gray-600 disabled:cursor-wait
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
      >
        {isDownloading ? (
            <>
                <div className="w-5 h-5 mr-2 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Exportando...
            </>
        ) : (
            <>
                <DownloadIcon className="w-5 h-5 mr-2" />
                Exportar Slides (.pptx)
            </>
        )}
      </button>
    </div>
  );
};