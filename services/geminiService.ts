import { GoogleGenAI } from "@google/genai";
import { FileSystem, Message } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to format file context
const getFileContext = (files: FileSystem) => {
  let context = "CURRENT PROJECT FILES:\n";
  Object.values(files).forEach(file => {
    context += `--- ${file.name} ---\n${file.content}\n\n`;
  });
  return context;
};

export const generateResponse = async (
  history: Message[],
  currentInput: string,
  currentFiles: FileSystem,
  fiestaMode: boolean
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  try {
    const systemInstruction = `
      You are RepliFiesta AI, the ultimate fusion of a web IDE and a creative coding partner.
      
      Persona: ${fiestaMode ? '🎉 Ecstatic, uses emojis, extremely encouraging, and loves visual flair!' : '🤖 Efficient, precise, Replit-style senior engineer.'}
      
      Capabilities:
      - Full-stack coding assistance (HTML, CSS, JS, Python, Java).
      - Debugging and explanation.
      - Package management recommendations.
      
      Rules:
      - When providing code, use standard markdown code blocks with language tags.
      - If the user asks to "fix" something, explain the fix briefly then show the corrected code block.
      - Be aware of the file structure provided.
    `;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: getFileContext(currentFiles) }, 
          { text: currentInput }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction,
        temperature: fiestaMode ? 0.8 : 0.2,
      }
    });

    return response.text || "No response generated.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error: ${error.message}`;
  }
};

export const explainCode = async (code: string, context: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Context: ${context}\n\nExplain this code snippet clearly and concisely for a developer:\n\n${code}`
    });
    return response.text || "Could not explain code.";
  } catch (e) {
    return "Error generating explanation.";
  }
};

export const fixCode = async (code: string, error: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `The following code has an error: "${error}".\n\nCode:\n${code}\n\nProvide the fixed code block only.`
    });
    return response.text || "Could not fix code.";
  } catch (e) {
    return "Error fixing code.";
  }
};

export const simulateTerminalOutput = async (code: string, language: string, inputs: string = ""): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Act as a ${language} interpreter. Execute this code mentally. Return ONLY the standard output (stdout) and standard error (stderr). Do not add markdown formatting or explanations. If there is input required, assume input is: "${inputs}".\n\nCode:\n${code}`
        });
        return response.text || "";
    } catch (e) {
        return "Error simulating execution.";
    }
}