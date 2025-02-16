import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateChatResponse(
  prompt: string,
  context: string,
  history: Array<{ role: string; content: string }>
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  const result = await chat.sendMessage(
    `Context: ${context}\n\nUser: ${prompt}`
  );
  
  return result.response.text();
}

export async function generateCode(language: string, prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(
    `Generate ${language} code for: ${prompt}`
  );
  return result.response.text();}