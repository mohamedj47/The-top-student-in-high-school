
import { GoogleGenAI, Content, Modality } from "@google/genai";
import { Message, Sender, GradeLevel, Subject, Attachment } from "../types";
import { getCurriculumStringForAI } from "../data/curriculum";
import { getApiKey, rotateApiKey } from "../utils/apiKeyManager";

const SYSTEM_INSTRUCTION = `
أنت نظام تعليم ذكي متخصص لطلاب الثانوية العامة المصرية (الصفوف: الأول، الثاني، والثالث).

**فلسفة العمل**: "خير الكلام ما قل ودل".
مهمتك هي تقديم المعلومات الدراسية بشكل **مختصر جداً، مركز، ومنظم**.

**التعليمات الصارمة**:
1. **الاختصار**: تجنب الشرح المطول والسرد الإنشائي.
2. **العناصر**: اعتمد على القوائم النقطية (Bullet Points) لعرض المعلومات.
3. **المباشرة**: أجب عن السؤال فوراً دون مقدمات طويلة.

**عرض البيانات والمقارنات (هام جداً)**:
- **يمنع منعاً باتاً** توليد أكواد JSON أو رسوم بيانية (Charts).
- استخدم **الجداول (Markdown Tables)** حصراً لعرض أي بيانات رقمية، إحصائيات، أو مقارنات. الجداول هي الوسيلة الوحيدة المعتمدة.
- في العلاقات (مثل الطردية والعكسية)، اشرح العلاقة نصياً باختصار (مثال: "كلما زاد الجهد زاد التيار").

**سياق الطالب**:
- الصف: [GRADE_LEVEL]
- المادة: [SUBJECT]

[CURRICULUM_LIST]
`;

export interface GenerationOptions {
  useThinking?: boolean;
  useSearch?: boolean;
}

// Helper to get a fresh AI instance with the current active key
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

export const generateStreamResponse = async (
  userMessage: string,
  grade: GradeLevel,
  subject: Subject,
  history: Message[],
  onChunk: (text: string) => void,
  attachment?: Attachment,
  options?: GenerationOptions,
  retryCount = 0
): Promise<string> => {
  
  // Filter history
  const chatHistory: Content[] = history.map((msg) => {
    return {
        role: msg.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: msg.text }],
    };
  });

  // Get Curriculum List (Formatted String)
  const curriculumString = getCurriculumStringForAI(grade, subject);

  // Inject dynamic context
  const dynamicInstruction = SYSTEM_INSTRUCTION
    .replace('[GRADE_LEVEL]', grade)
    .replace('[SUBJECT]', subject)
    .replace('[CURRICULUM_LIST]', curriculumString);

  try {
    const ai = getAIClient(); // Use dynamic key
    let model = 'gemini-2.5-flash';
    let config: any = {
        systemInstruction: dynamicInstruction,
        temperature: 0.7,
    };

    // Configure Thinking Mode
    if (options?.useThinking) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
    } else {
        config.maxOutputTokens = 2000;
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    // Configure Search Grounding
    if (options?.useSearch && !options?.useThinking) {
        config.tools = [{ googleSearch: {} }];
    }

    const chat = ai.chats.create({
      model: model,
      config: config,
      history: chatHistory,
    });

    let messageParts: any[] = [];
    
    if (attachment) {
        messageParts.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.data
            }
        });
    }

    let promptText = userMessage;
    if (!promptText.trim() && attachment) {
        if (attachment.type === 'audio') promptText = "لخص ما في هذا التسجيل.";
        else if (attachment.type === 'image') promptText = "لخص ما في الصورة.";
        else promptText = "لخص هذا الملف.";
    }
    
    messageParts.push({ text: promptText });

    const resultStream = await chat.sendMessageStream({ 
        message: messageParts 
    });

    let fullText = '';
    const groundingSources: Set<string> = new Set();

    for await (const chunk of resultStream) {
      const chunkText = chunk.text || '';
      fullText += chunkText;

      // Extract Grounding Metadata (Search URLs)
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          chunk.candidates[0].groundingMetadata.groundingChunks.forEach((c: any) => {
              if (c.web?.uri) {
                  groundingSources.add(`[${c.web.title || 'مصدر'}](${c.web.uri})`);
              }
          });
      }

      onChunk(fullText);
    }

    // Append sources if any found
    if (groundingSources.size > 0) {
        const sourcesText = "\n\n**المصادر:**\n" + Array.from(groundingSources).map(s => `- ${s}`).join('\n');
        fullText += sourcesText;
        onChunk(fullText);
    }

    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Failover Logic: If error is quota related or generic 4xx/5xx
    // We try to rotate the key and retry up to 3 times (or however many keys we have)
    if (retryCount < 4) {
        const rotated = rotateApiKey();
        if (rotated) {
            console.log(`Retrying request with new key (Attempt ${retryCount + 1})...`);
            return generateStreamResponse(userMessage, grade, subject, history, onChunk, attachment, options, retryCount + 1);
        }
    }
    
    // Better error message for the user
    return "عذراً، الخدمة مشغولة جداً حالياً (نفذ رصيد المفاتيح). يرجى المحاولة لاحقاً أو التواصل مع الدعم.";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    // Simple retry for speech
    if (rotateApiKey()) {
        return generateSpeech(text);
    }
    return null;
  }
};

export const streamSpeech = async (text: string, onAudioChunk: (base64: string) => void, retryCount = 0): Promise<void> => {
  try {
    const ai = getAIClient();
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    for await (const chunk of responseStream) {
      const audioData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        onAudioChunk(audioData);
      }
    }
  } catch (error) {
    console.error("TTS Stream Error:", error);
    // FIX: Limit retries to prevent infinite loops/browser freeze when quota is exhausted
    // We retry max 3 times (trying different keys) then stop.
    if (retryCount < 3 && rotateApiKey()) {
       streamSpeech(text, onAudioChunk, retryCount + 1);
    }
  }
};
