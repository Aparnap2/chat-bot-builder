import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { TaskType } from "@google/generative-ai";
import { env } from "~/config/env";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Logger } from "./logger.server";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API_KEY,
  modelName: "text-embedding-004",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const llm = new ChatGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
  model: "gemini-1.5-pro",
  temperature: 0.7,
  maxRetries: 2,
});

export async function initializeVectorStore(userId: string) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = [
      "Chatbots are AI-powered conversational agents that assist users.",
      "To customize your chatbot, adjust colors, sizes, and quick replies in the settings panel.",
      "For support, contact us at support@chatbuilder.com.",
    ];
    const splitDocs = await splitter.createDocuments(docs);
    await AstraDBVectorStore.fromDocuments(splitDocs, embeddings, {
      token: env.ASTRA_DB_APPLICATION_TOKEN,
      endpoint: env.ASTRA_DB_ENDPOINT,
      collection: `chatbot_docs_${userId}`,
    });
    Logger.info("Vector store initialized successfully for user", { userId });
  } catch (error) {
    Logger.error("Failed to initialize vector store", { error, userId });
    throw error;
  }
}

export const generateResponse = async (message: string, context: string, userId: string): Promise<string> => {
  try {
    const vectorStore = await AstraDBVectorStore.fromExistingIndex(embeddings, {
      token: env.ASTRA_DB_APPLICATION_TOKEN,
      endpoint: env.ASTRA_DB_ENDPOINT,
      collection: `chatbot_docs_${userId}`,
    });

    const retriever = vectorStore.asRetriever();
    const prompt = PromptTemplate.fromTemplate(
      "Answer based on the following context:\n{context}\n\nQuestion: {question}"
    );

    const chain = RunnableSequence.from([
      RunnableMap.from({
        context: retriever.pipe((docs) => docs.map((doc) => doc.pageContent).join("\n")),
        question: (input: string) => input,
      }),
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke(message);
    Logger.info("Generated response successfully", { userId });
    return response;
  } catch (error) {
    Logger.error("Error generating response", { error, userId });
    return "Sorry, I couldn’t process your request.";
  }
};