
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const chatSessions = new Map<string, Chat>();

/**
 * Extracts grounding sources from a response
 */
export const getSources = (response: any) => {
  return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference Source",
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];
};

// Fix for Reader.tsx: Added missing export clearChatSession
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
 * Enhanced OCR: Converts an image to structured study text
 */
export const scanDocumentImage = async (base64Image: string) => {
  const ai = getAIClient();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  
  const prompt = `
    Analyze this image of a student's notes or textbook.
    1. Extract all text accurately.
    2. Format it into clean Markdown.
    3. Suggest a clear title and a logical academic category (e.g., Biology, Calculus).
    4. Provide a brief summary of the content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            content: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["title", "category", "content"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};

export async function* streamChat(docId: string, message: string, docContent: string) {
  const chat = getOrCreateChatSession(docId, docContent);
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield {
        text: c.text || "",
        sources: getSources(c)
      };
    }
  } catch (error) {
    yield { text: "Error: AI Tutor is currently unavailable.", sources: [] };
  }
}

export const explainConcept = async (concept: string, documentContext?: string) => {
  const ai = getAIClient();
  const prompt = documentContext 
    ? `Context: "${documentContext}"\nExplain: "${concept}"`
    : `Explain this academic concept clearly: "${concept}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert tutor. Provide accurate info with sources if needed.",
      },
    });
    return {
      text: response.text || "I couldn't explain that.",
      sources: getSources(response)
    };
  } catch (error) {
    return { text: "Network error.", sources: [] };
  }
};

export const chatWithAI = async (query: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are EduVault AI. Help students find academic info and careers.",
      },
    });
    return {
      text: response.text || "",
      sources: getSources(response)
    };
  } catch (error) {
    return { text: "Failed to get AI response.", sources: [] };
  }
};

// Fix for Reader.tsx: Added missing export generateQuiz
export const generateQuiz = async (docContent: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a challenging 5-question multiple choice quiz with answers and explanations based on this content: "${docContent.substring(0, 4000)}"`,
    });
    return response.text || "Failed to generate quiz.";
  } catch (error) {
    return "Error generating quiz.";
  }
};

// Fix for Reader.tsx: Added missing export createStudyRoadmap
export const createStudyRoadmap = async (docContent: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a logical study roadmap to master the concepts in this document: "${docContent.substring(0, 4000)}"`,
    });
    return response.text || "Failed to create roadmap.";
  } catch (error) {
    return "Error creating roadmap.";
  }
};
