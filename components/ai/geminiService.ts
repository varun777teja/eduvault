
// Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";
import { Source, Flashcard, QuizQuestion, MindMapData } from "./types";

const MAX_CONTEXT_CHARS = 28000;
const API_KEYS = (process.env.API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

export class GeminiService {

  // Helper to run content generation with key rotation on failure
  private async generateContent(params: any): Promise<any> {
    if (API_KEYS.length === 0) {
      throw new Error("No API Keys found!");
    }

    let lastError: any = null;

    // Try each key in order until one works
    for (let i = 0; i < API_KEYS.length; i++) {
      const key = API_KEYS[i];
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        // Direct call to the model's generateContent
        const result = await ai.models.generateContent(params);
        console.log(`Success with API Key index ${i}`);
        return result;
      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message?.toLowerCase() || "";
        const isQuotaError = errorMsg.includes('429') || errorMsg.includes('resource_exhausted') || errorMsg.includes('quota');

        if (isQuotaError) {
          console.warn(`Key index ${i} exhausted/throttled. Switching to next key...`);
          continue; // Try next key
        }

        // If it's a non-quota error (e.g. invalid request), throw immediately
        throw error;
      }
    }

    // If all keys failed
    throw lastError || new Error("All API keys failed.");
  }

  // Wrapped execution for generic retries (network glitches), 
  // though generateContent handles the quota retries now.
  private async callWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      // If it gets here, it means all keys failed or it's a non-quota error
      // We can still retry a bit for transient network issues
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  public getSourceContext(sources: Source[], limit: number = MAX_CONTEXT_CHARS): string {
    let context = "";
    for (const s of sources) {
      const header = `SOURCE ID: ${s.id}\nTITLE: ${s.title}\nCONTENT: `;
      const footer = `\n---\n\n`;

      const currentLen = context.length + header.length + footer.length;
      if (currentLen >= limit) break;

      const availableChars = limit - currentLen;
      const contentToAppend = s.content.length > availableChars
        ? s.content.substring(0, availableChars) + "... [TRUNCATED]"
        : s.content;

      context += `${header}${contentToAppend}${footer}`;
    }
    return context;
  }

  async generateTutorQuestion(sources: Source[], pageContext?: string): Promise<string> {
    return this.callWithRetry(async () => {
      const context = pageContext || this.getSourceContext(sources, 5000);
      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Based on this specific document context, generate one thought-provoking, Socratic question to test the reader's deep understanding. Do not ask simple facts; ask for synthesis or application. Context:\n${context}`,
        config: {
          systemInstruction: "You are Brahma Tutor. Your goal is to help users master content by asking challenging questions.",
          temperature: 0.7
        },
      });
      return response.text || "What is the most significant takeaway from this section in your opinion?";
    });
  }

  async solveComplexProblem(problemText: string, sources: Source[]): Promise<string> {
    return this.callWithRetry(async () => {
      const context = this.getSourceContext(sources, 10000);
      const prompt = `
        PROBLEM TO SOLVE:
        ${problemText}

        REFERENCE CONTEXT:
        ${context}

        INSTRUCTIONS:
        1. Identify the core problem.
        2. Provide a step-by-step logical solution.
        3. Reference specific parts of the context used.
        4. If it's a math/scientific problem, show the derivation.
      `;

      const response = await this.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
          systemInstruction: "You are Brahma Solver. Provide rigorous, academic, step-by-step solutions to problems.",
          temperature: 0.2
        },
      });

      return response.text || "I was unable to derive a solution based on the available research.";
    });
  }

  async chat(prompt: string, sources: Source[]): Promise<{ text: string; citations: any[] }> {
    return this.callWithRetry(async () => {
      const context = this.getSourceContext(sources, MAX_CONTEXT_CHARS - 2000);
      const systemInstruction = `
        You are Brahma, an elite research engine. 
        Always answer using the provided SOURCE ID markers for grounding.
        Focus on synthesis, cross-referencing, and pattern detection.
      `;

      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `CONTEXT:\n${context}\n\nQUESTION: ${prompt}`,
        config: { systemInstruction, temperature: 0.1 },
      });

      return {
        text: response.text || "I couldn't generate a response based on the sources.",
        citations: []
      };
    });
  }

  async processYouTubeUrl(url: string): Promise<{ title: string, transcript: string }> {
    return this.callWithRetry(async () => {
      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze this YouTube video URL: ${url}. 
        Return ONLY a JSON object with "title" and "transcript" (a detailed summary if transcript is missing).`,
        config: {
          // tools: [{ googleSearch: {} }], // Disabled temporarily or needs correct tool config
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              transcript: { type: Type.STRING }
            },
            required: ["title", "transcript"]
          }
        },
      });

      const parsed = JSON.parse(response.text || '{"title":"Video Source", "transcript":""}');
      return parsed;
    });
  }

  async generateLearningMaterials(sources: Source[]): Promise<{ flashcards: Flashcard[], quiz: QuizQuestion[] }> {
    return this.callWithRetry(async () => {
      const context = this.getSourceContext(sources, MAX_CONTEXT_CHARS - 1000);
      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Generate 10 high-fidelity flashcards and 5 critical quiz questions from this context:\n${context}. Focus on the most important concepts.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ["question", "answer"]
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER }
                  },
                  required: ["question", "options", "correctIndex"]
                }
              }
            },
            required: ["flashcards", "quiz"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"flashcards":[], "quiz":[]}');
      return parsed;
    });
  }

  async generateMindMap(sources: Source[]): Promise<MindMapData> {
    return this.callWithRetry(async () => {
      const context = this.getSourceContext(sources, MAX_CONTEXT_CHARS - 1000);
      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Create a semantic knowledge graph and roadmap for this research:\n${context}`,
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
                    group: { type: Type.NUMBER },
                    importance: { type: Type.NUMBER },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "label", "group", "importance", "keyPoints"]
                }
              },
              links: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ["source", "target", "value"]
                }
              },
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isFuture: { type: Type.BOOLEAN }
                  },
                  required: ["title", "description", "topics"]
                }
              }
            },
            required: ["nodes", "links", "roadmap"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"nodes":[],"links":[],"roadmap":[]}');
      return parsed;
    });
  }

  async answerLearningQuestion(question: string, sources: Source[]): Promise<string> {
    return this.callWithRetry(async () => {
      const context = this.getSourceContext(sources, MAX_CONTEXT_CHARS - 2000);
      const response = await this.generateContent({
        model: 'gemini-1.5-flash',
        contents: `CONTEXT:\n${context}\n\nUSER QUESTION: ${question}`,
        config: { temperature: 0.2 },
      });
      return response.text || "No relevant data found in library.";
    });
  }

  async solveQuestionPaper(paper: Source, researchSources: Source[]): Promise<string> {
    return this.callWithRetry(async () => {
      const researchContext = this.getSourceContext(researchSources, MAX_CONTEXT_CHARS - 5000);
      const prompt = `
        SOLVE EXAM PAPER:
        ${paper.content}

        RESEARCH BASIS:
        ${researchContext}
      `;

      const response = await this.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
          systemInstruction: "You are Brahma. Solve the exam paper with academic rigor using research context.",
          temperature: 0.2
        },
      });

      return response.text || "Failed to solve the paper.";
    });
  }

  async predictExamPaper(questionPapers: Source[]): Promise<string> {
    return this.callWithRetry(async () => {
      const papersContext = this.getSourceContext(questionPapers, MAX_CONTEXT_CHARS - 1000);
      const prompt = `Analyze historical patterns and predict upcoming exam themes:\n${papersContext}`;

      const response = await this.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
          systemInstruction: "You are Brahma. Predict exam patterns based on historical question data.",
          temperature: 0.3
        },
      });

      return response.text || "Failed to generate prediction.";
    });
  }
}

export const gemini = new GeminiService();
