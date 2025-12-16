
import React, { useState, useEffect } from 'react';
import { Printer, Volume2, VolumeX } from 'lucide-react';

export const FloatingTools: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices on mount and when changed
  useEffect(() => {
    const updateVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
    };

    updateVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handlePrint = () => {
    window.scrollTo(0, 0);
    window.print();
  };

  const handleReadPage = () => {
    // 1. Cancel current
    window.speechSynthesis.cancel();
    
    // 2. Find text content (Smart Selection)
    let textToRead = "";
    
    const botMessages = document.querySelectorAll('.markdown-body');
    if (botMessages.length > 0) {
        // Read the last bot explanation first if available
        const lastMsg = botMessages[botMessages.length - 1] as HTMLElement;
        textToRead = lastMsg.innerText;
    } else {
        const headers = document.querySelectorAll('h1, h2, h3');
        headers.forEach(h => {
             textToRead += (h as HTMLElement).innerText + ". ";
        });
    }

    if (!textToRead.trim()) return;

    // 3. Clean Text
    const cleanText = textToRead
      .replace(/[*#`_\-]/g, '')
      .replace(/https?:\/\/\S+/g, 'رابط')
      .trim();

    // 4. Utterance Setup
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Doctor Style: Calm and Explanatory
    utterance.pitch = 1.0;
    utterance.lang = 'ar-EG';
    
    // 5. Smart Voice Selection (Consistent with MessageBubble)
    if (voices.length > 0) {
        let selectedVoice = voices.find(v => v.lang === 'ar-EG' || v.lang === 'ar-SA');
        
        // Prioritize Female/Google Voices for the "Professor" effect
        const googleVoice = voices.find(v => (v.lang.startsWith('ar')) && v.name.includes('Google'));
        if (googleVoice) selectedVoice = googleVoice;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        }
    }

    // 6. Events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("Speech Error:", e);
        setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="fixed top-20 left-4 z-50 flex flex-col gap-3 no-print group">
      {/* Visual Label */}
      <div className="absolute -top-8 left-0 bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold shadow-sm">
        أدوات الطالب
      </div>

      {isSpeaking && (
        <button
          onClick={handleStopSpeaking}
          className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all border-2 border-white animate-pulse"
          title="إيقاف القراءة"
        >
          <VolumeX size={20} />
        </button>
      )}

      {!isSpeaking && (
        <button
          onClick={handleReadPage}
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all border-2 border-white hover:scale-105"
          title="قراءة الصفحة (المعلم الذكي)"
        >
          <Volume2 size={20} />
        </button>
      )}

      <button
        onClick={handlePrint}
        className="p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-900 transition-all border-2 border-white hover:scale-105"
        title="طباعة / حفظ PDF"
      >
        <Printer size={20} />
      </button>
    </div>
  );
};
