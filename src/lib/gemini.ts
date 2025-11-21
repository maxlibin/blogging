import { GoogleGenAI } from "@google/genai";

export const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

