
import React from 'react';
import { X, ExternalLink, Youtube } from 'lucide-react';
import { VideoResult } from '../data/videoData';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: VideoResult | null;
  lessonTitle: string;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, videoData, lessonTitle }) => {
  if (!isOpen || !videoData) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <Youtube className="text-red-600 fill-current" size={24} />
            <h3 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{lessonTitle}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
          {videoData.type === 'embed' ? (
            <iframe 
              src={videoData.url} 
              title={lessonTitle}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="text-center p-8 space-y-6 max-w-md">
              <div className="w-20 h-20 bg-red-600/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Youtube size={40} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">بحث ذكي عن الفيديو</h4>
                <p className="text-slate-400 mb-4">
                  لم نجد فيديو مثبت لهذا الدرس، ولكن قمنا بتجهيز بحث دقيق لك.
                </p>
                <div className="bg-slate-800 p-3 rounded-lg text-sm text-indigo-300 font-mono mb-6 border border-slate-700">
                  بحث عن: {videoData.query}
                </div>
              </div>
              
              <a 
                href={videoData.url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105"
              >
                <span>مشاهدة على YouTube</span>
                <ExternalLink size={18} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
