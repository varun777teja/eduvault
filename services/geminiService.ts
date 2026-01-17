
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality, LiveServerMessage, Blob } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

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
  if (chatSessions.has(docId)) {
    return chatSessions.get(docId)!;
  }

  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `
        You are the EduVault Academic Assistant. 
        CONTEXT: You are helping a student with the following document: "${docContent.substring(0, 4000)}"
        
        GOALS:
        1. Help the student understand complex concepts.
        2. Use Google Search grounding for facts, citations, or recent academic developments.
        3. Always provide clear, structured explanations.
      `,
      tools: [{ googleSearch: {} }]
    }
  });

  chatSessions.set(docId, chat);
  return chat;
};

/**
 * Generates a short, inspiring daily academic insight for the student dashboard.
 */
export const getDailyAcademicInsight = async () => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence inspiring academic insight or a quick study tip for a high-performing student.",
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Success is the sum of small efforts repeated day in and day out.";
  } catch (error) {
    return "The secret of getting ahead is getting started.";
  }
};

/**
 * AI Book Cover Generator using nano banana series
 */
export const generateBookCover = async (title: string, category: string) => {
  const ai = getAIClient();
  const prompt = `A professional, modern, and academic book cover for a book titled "${title}" in the category of "${category}". Style: Clean, high-contrast, minimalist graphic design. No text on the image, just visual metaphors.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "3:4" }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Live Study Assistant (Real-time voice)
 */
export const connectLiveAssistant = (callbacks: any, docContent: string) => {
  const ai = getAIClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: `You are a real-time study buddy. Help the student understand this document: ${docContent.substring(0, 5000)}. Keep your spoken responses concise and conversational.`,
    },
  });
};

/**
 * Audio Overview Engine
 */
export const generateAudioOverview = async (content: string) => {
  const ai = getAIClient();
  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this content, write a highly engaging, casual podcast conversation between Joe and Jane. 
               They should simplify complex ideas, use analogies, and banter naturally.
               Content: "${content.substring(0, 5000)}"`,
  });

  const script = scriptResponse.text || "";
  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `TTS the following conversation between Joe and Jane: ${script}` }] }],
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

  const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return { script, base64Audio };
};

export const getSemanticMap = async (documents: any[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these documents and create a network of related concepts. 
               Return a JSON object with 'nodes' (id, label, group) and 'links' (source, target, relationship).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, group: { type: Type.STRING } }
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, relationship: { type: Type.STRING } }
            }
          }
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
    contents: `Regarding "${topic}" in the context of this document: "${content.substring(0, 3000)}", 
               provide a debate between a "Skeptical Academic" and a "Visionary Futurist".`,
  });
  return response.text;
};

export const scanDocumentImage = async (base64Image: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: "Analyze and extract text, title, and category." }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, category: { type: Type.STRING }, content: { type: Type.STRING } },
        required: ["title", "category", "content"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export async function* streamChat(docId: string, message: string, docContent: string) {
  const chat = getOrCreateChatSession(docId, docContent);
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield { text: c.text || "", sources: getSources(c) };
    }
  } catch (error) {
    yield { text: "Error: AI Tutor is currently unavailable.", sources: [] };
  }
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
  } catch (error) {
    return { text: "Failed to get AI response.", sources: [] };
  }
};

export const explainConcept = async (concept: string, context: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain: "${concept}" within the context: "${context.substring(0, 2000)}"`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return { text: response.text || "", sources: getSources(response) };
};

export const generateQuiz = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a practice quiz for: "${content.substring(0, 4000)}"`,
  });
  return response.text;
};

export const createStudyRoadmap = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a study roadmap for: "${content.substring(0, 4000)}"`,
  });
  return response.text;
};
