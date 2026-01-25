
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality, LiveServerMessage, Blob } from "@google/genai";

// Standardize client initialization for every call to prevent stale key issues
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatSessions = new Map<string, Chat>();

export const getSources = (response: any) => {
  return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference Source",
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];
};

export const clearChatSession = (docId: string) => {
  chatSessions.delete(docId);
};

export const getOrCreateChatSession = (docId: string, docContent: string): Chat => {
  if (chatSessions.has(docId)) return chatSessions.get(docId)!;
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the EduVault Academic Assistant. Document Context: "${docContent.substring(0, 4000)}". Help students learn efficiently.`,
      tools: [{ googleSearch: {} }]
    }
  });
  chatSessions.set(docId, chat);
  return chat;
};

/**
 * Notebook AI: Improve Note Content
 */
export const improveNoteContent = async (text: string, instruction: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Task: ${instruction}\nText: "${text}"`,
    config: {
      systemInstruction: "You are a professional academic editor. Improve the provided text while maintaining the original meaning."
    }
  });
  return response.text || text;
};

/**
 * Notebook AI: Generate Summary for a Note
 */
export const generateNoteSummary = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this note into 3 key bullet points:\n${content.substring(0, 5000)}`,
  });
  return response.text;
};

/**
 * Generate Flashcards from text
 */
export const generateFlashcards = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 flashcards (Question/Answer) from this content: ${content.substring(0, 3000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getDailyAcademicInsight = async () => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "One-sentence inspiring study tip.",
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Small steps lead to great heights.";
  } catch { return "Stay curious."; }
};

export const generateBookCover = async (title: string, category: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Minimalist book cover: ${title}, category: ${category}` }] },
    config: { imageConfig: { aspectRatio: "3:4" } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

// Add missing explainConcept function to fix import error in Reader.tsx and SearchView.tsx
export const explainConcept = async (concept: string, context?: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the concept: "${concept}". ${context ? `Context: ${context}` : ""} Keep it concise and student-friendly.`,
  });
  return response.text;
};

// Add missing scanDocumentImage function to fix import error in LibraryView.tsx
export const scanDocumentImage = async (base64Data: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        },
        { text: "Extract and transcribe all text from this academic document image." }
      ]
    }
  });
  return response.text;
};

export const connectLiveAssistant = (callbacks: any, docContent: string) => {
  const ai = getAIClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      systemInstruction: `Study buddy. Context: ${docContent.substring(0, 5000)}`,
    },
  });
};

export const generateAudioOverview = async (content: string) => {
  const ai = getAIClient();
  const scriptRes = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write an engaging podcast script summarizing this: ${content.substring(0, 4000)}`,
  });
  const audioRes = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `TTS conversation: ${scriptRes.text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
          ]
        }
      }
    }
  });
  return { script: scriptRes.text, base64Audio: audioRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data };
};

export const getSemanticMap = async (documents: any[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Concept map for: ${documents.map(d => d.title).join(", ")}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING } } } },
          links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING } } } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"nodes":[], "links":[]}');
};

export const getPerspectiveDebate = async (topic: string, content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Academic debate about ${topic} based on: ${content.substring(0, 3000)}`,
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
  return response.text;
};

export async function* streamChat(docId: string, message: string, docContent: string) {
  const chat = getOrCreateChatSession(docId, docContent);
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield { text: c.text || "", sources: getSources(c) };
    }
  } catch { yield { text: "AI unavailable.", sources: [] }; }
}

export const chatWithAI = async (query: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { text: response.text || "", sources: getSources(response) };
  } catch { return { text: "Search failed.", sources: [] }; }
};
