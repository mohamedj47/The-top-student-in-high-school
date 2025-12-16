
import React, { useState } from 'react';
import { X, PlayCircle, BookOpen, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { GradeLevel, Subject } from '../types';
import { getCurriculumFor } from '../data/curriculum';
import { getVideoForLesson, VideoResult } from '../data/videoData';

interface LessonBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeLevel;
  subject: Subject;
  onPlayVideo: (lesson: string, data: VideoResult) => void;
  onExplain: (lesson: string) => void;
}

export const LessonBrowser: React.FC<LessonBrowserProps> = ({ isOpen, onClose, grade, subject, onPlayVideo, onExplain }) => {
  const [activeTab, setActiveTab] = useState<'term1' | 'term2'>('term1');

  if (!isOpen) return null;

  // Safe data retrieval
  const curriculum = getCurriculumFor(grade, subject);
  const term1Lessons = curriculum.term1 || [];
  const term2Lessons = curriculum.term2 || [];

  const handleVideoClick = (lesson: string) => {
    const videoData = getVideoForLesson(grade, subject, lesson);
    onPlayVideo(lesson, videoData);
  };

  const currentLessons = activeTab === 'term1' ? term1Lessons : term2Lessons;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={24} />
                فهرس الدروس
              </h2>
              <p className="text-sm text-slate-500">{subject} - {grade}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Term Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('term1')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'term1' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                الترم الأول
             </button>
             <button 
                onClick={() => setActiveTab('term2')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'term2' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                الترم الثاني
             </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentLessons.length > 0 ? (
            currentLessons.map((lesson, idx) => (
              <div key={idx} className="group bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in fill-mode-backwards" style={{animationDelay: `${idx * 50}ms`}}>
                <div className="flex-1 w-full">
                  <p className="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
                    {lesson}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  {/* Explain Button */}
                  <button 
                    onClick={() => onExplain(lesson)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-lg transition-all active:scale-95 border border-indigo-100"
                    title="شرح كتابي من المعلم الذكي"
                  >
                    <Sparkles size={16} />
                    <span className="text-xs font-bold">شرح AI</span>
                  </button>

                  {/* Video Button */}
                  <button 
                    onClick={() => handleVideoClick(lesson)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition-all active:scale-95 border border-red-100"
                    title="شاهد شرح فيديو"
                  >
                    <PlayCircle size={16} />
                    <span className="text-xs font-bold">فيديو</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-70">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                  {activeTab === 'term2' ? 'لم يعلن عنه بعد' : 'لا توجد دروس'}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  {activeTab === 'term2' 
                   ? 'سيتم إضافة منهج الترم الثاني فور إقراره رسمياً من وزارة التربية والتعليم.' 
                   : 'لا توجد بيانات متاحة لهذا القسم حالياً.'}
              </p>
              {activeTab === 'term2' && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <AlertCircle size={14} />
                      <span>نتابع قرارات الوزارة لحظة بلحظة</span>
                  </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center shrink-0">
          <p className="text-xs text-slate-500">
             تم تحديث المنهج وفقاً لأحدث مقررات وزارة التربية والتعليم
          </p>
        </div>

      </div>
    </div>
  );
};
