
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality } from "@google/genai";

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
 * Audio Overview Engine: Generates a 2-person podcast script and audio
 */
export const generateAudioOverview = async (content: string) => {
  const ai = getAIClient();
  
  // 1. Generate Podcast Script
  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this content, write a highly engaging, casual podcast conversation between Joe and Jane. 
               They should simplify complex ideas, use analogies, and banter naturally.
               Content: "${content.substring(0, 5000)}"`,
    config: {
      systemInstruction: "Format the output strictly as a conversation starting with names like 'Joe:' and 'Jane:'."
    }
  });

  const script = scriptResponse.text || "";

  // 2. Generate Audio via Multi-Speaker TTS
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

/**
 * Semantic Mind-Map Extraction
 */
export const getSemanticMap = async (documents: any[]) => {
  const ai = getAIClient();
  const context = documents.map(d => `${d.title}: ${d.content.substring(0, 500)}`).join('\n---\n');
  
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
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                group: { type: Type.STRING }
              }
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                relationship: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"nodes":[], "links":[]}');
};

/**
 * Debate Mode: Generates two opposing expert perspectives
 */
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
  const imagePart = {
    inlineData: { mimeType: 'image/jpeg', data: base64Image },
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: "Analyze this and extract markdown text, title, and category." }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          content: { type: Type.STRING }
        },
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

/**
 * Explains a selected concept within the context of a document.
 */
export const explainConcept = async (concept: string, context: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the following concept: "${concept}" within the context of this text: "${context.substring(0, 2000)}"`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return { text: response.text || "", sources: getSources(response) };
};

/**
 * Generates a practice quiz based on content.
 */
export const generateQuiz = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this content, generate a multiple choice quiz to test understanding: "${content.substring(0, 4000)}"`,
  });
  return response.text;
};

/**
 * Creates a study roadmap for a document.
 */
export const createStudyRoadmap = async (content: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a step-by-step study roadmap to master this material: "${content.substring(0, 4000)}"`,
  });
  return response.text;
};
