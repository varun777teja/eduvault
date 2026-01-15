
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const getEnv = (key: string): string => {
  try {
    return (window as any).process?.env?.[key] || (process?.env?.[key]) || '';
  } catch {
    return '';
  }
};

const getAIClient = () => {
  const apiKey = getEnv('API_KEY');
  if (!apiKey) {
    console.warn("Gemini API Key missing. AI features will be unavailable.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Internal map to persist chat sessions for different documents
const chatSessions = new Map<string, Chat>();

export const getOrCreateChatSession = (docId: string, docContent: string): Chat | null => {
  if (chatSessions.has(docId)) {
    return chatSessions.get(docId)!;
  }

  const ai = getAIClient();
  if (!ai) return null;

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `
        You are the EduVault Academic Assistant. You are a world-class Socratic tutor.
        CONTEXT: You are helping a student read a document. Here is a snippet of the content:
        "${docContent.substring(0, 3000)}"
        
        RULES:
        1. Be encouraging, precise, and academic.
        2. Use Markdown (bold, lists, tables) for clarity.
        3. Do not just provide answers; explain the reasoning.
        4. If the student asks something unrelated to the document, politely guide them back to their studies but answer briefly if it helps their general knowledge.
        5. Use analogies to explain complex topics.
      `,
    }
  });

  chatSessions.set(docId, chat);
  return chat;
};

export const clearChatSession = (docId: string) => {
  chatSessions.delete(docId);
};

export async function* streamChat(docId: string, message: string, docContent: string) {
  const chat = getOrCreateChatSession(docId, docContent);
  if (!chat) {
    yield "Error: AI API Key not configured. Please add your API_KEY to the environment variables.";
    return;
  }
  
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (error) {
    console.error("Streaming Chat Error:", error);
    yield "Error: I encountered a problem connecting to the AI. Please try again.";
  }
}

export const generateQuiz = async (content: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  const prompt = `
    Based on the following study material, generate a 5-question quiz to test a student's understanding.
    Include a mix of Multiple Choice and Short Answer.
    Provide the correct answers at the very end in a 'Key' section.
    
    CONTENT:
    ${content.substring(0, 5000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert examiner. Create challenging but fair questions that focus on core concepts, not trivial details.",
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    return "Failed to generate quiz.";
  }
};

export const createStudyRoadmap = async (content: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  const prompt = `
    Analyze this document and create a structured Study Roadmap.
    Break it down into:
    1. Prerequisites (What to know before reading).
    2. Core Learning Objectives (3-5 main points).
    3. Step-by-step study guide.
    4. Estimated time to mastery.
    
    CONTENT:
    ${content.substring(0, 5000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Study Architect. Organize information logically from simple to complex.",
        temperature: 0.3,
      }
    });
    return response.text;
  } catch (error) {
    return "Failed to create roadmap.";
  }
};

export const explainConcept = async (concept: string, documentContext?: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  const model = "gemini-3-flash-preview";

  const prompt = documentContext 
    ? `Context from the student's document: "${documentContext}"\n\nQuestion or Concept to explain: "${concept}"`
    : `Explain this concept clearly for a student: "${concept}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert academic tutor. Use Markdown. Be encouraging and concise.",
        temperature: 0.7,
      },
    });
    return response.text || "I couldn't generate an explanation.";
  } catch (error) {
    return "Error connecting to AI tutor.";
  }
};

export const chatWithAI = async (query: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: "You are the EduVault Academic Assistant. Provide helpful, concise academic advice and answer student questions clearly based on general knowledge or common study practices.",
        temperature: 0.7,
      },
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("General AI Chat Error:", error);
    return "Failed to get a response from the assistant.";
  }
};
