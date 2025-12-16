
import { Subject, GradeLevel } from '../types';

// 1. Default Teachers Mapping (One per subject)
export const DEFAULT_TEACHERS: Partial<Record<Subject, string>> = {
  [Subject.ARABIC]: "رضا الفاروق",
  [Subject.ENGLISH]: "مستر انجليزي",
  [Subject.FRENCH]: "مسيو فرنسي",
  [Subject.GERMAN]: "هير ألماني",
  [Subject.PHYSICS]: "محمود مجدي",
  [Subject.CHEMISTRY]: "خالد صقر",
  [Subject.BIOLOGY]: "محمد صالح",
  [Subject.MATH]: "أحمد عصام",
  [Subject.HISTORY]: "بسطتهالك",
  [Subject.GEOGRAPHY]: "القيصر",
  [Subject.PHILOSOPHY]: "الخطة",
  [Subject.PSYCHOLOGY]: "الخطة",
  [Subject.GEOLOGY]: "ماجد إمام",
  // Add others as needed
};

// 2. Specific Video IDs (Optional - for direct embedding)
// Format: "Lesson Title": "YouTubeVideoID"
export const DIRECT_VIDEO_IDS: Record<string, string> = {
  // Example: "مقدمة في الفيزياء": "dQw4w9WgXcQ", 
};

export interface VideoResult {
  type: 'embed' | 'search';
  url: string;
  teacher: string;
  query: string;
}

// 3. Helper to generate the video action
export const getVideoForLesson = (grade: GradeLevel, subject: Subject, lessonTitle: string): VideoResult => {
  const teacher = DEFAULT_TEACHERS[subject] || "أفضل مدرس";
  
  // Check for direct ID first
  if (DIRECT_VIDEO_IDS[lessonTitle]) {
    return {
      type: 'embed',
      url: `https://www.youtube.com/embed/${DIRECT_VIDEO_IDS[lessonTitle]}`,
      teacher,
      query: lessonTitle
    };
  }

  // Fallback to Search
  // Query: Subject + Lesson + Grade + Teacher + Explain
  const query = `شرح ${lessonTitle} ${subject} ${grade} ${teacher}`;
  const encodedQuery = encodeURIComponent(query);

  return {
    type: 'search',
    url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
    teacher,
    query
  };
};
