// app/utils/gemini.server.ts (Commented out original for reference)
/*
export const generateResponse = async (message: string, context: string): Promise<string> => {
  // Original Gemini logic
  return "Response from Gemini"; // Placeholder
};
*/

// Updated with LangChain and Astra DB
import { AstraDB } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const astraDb = new AstraDB(process.env.ASTRA_TOKEN, process.env.ASTRA_ENDPOINT, process.env.ASTRA_NAMESPACE);
const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GEMINI_API_KEY });
const llm = new ChatGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY, model: "gemini-1.5-pro" });

// Initialize vector store (run once or on setup)
async function initializeVectorStore() {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const docs = [
    "Sample document content about chatbots...",
    // Add more docs or load from a source
  ];
  const splitDocs = await splitter.createDocuments(docs);
  await AstraDBVectorStore.fromDocuments(splitDocs, embeddings, {
    collection: "chatbot_docs",
    client: astraDb,
  });
}

// Export this if you need to initialize elsewhere
export { initializeVectorStore };

export const generateResponse = async (message: string, context: string): Promise<string> => {
  const vectorStore = await AstraDBVectorStore.fromExistingCollection(embeddings, {
    collection: "chatbot_docs",
    client: astraDb,
  });

  const retriever = vectorStore.asRetriever();
  const prompt = PromptTemplate.fromTemplate(
    "Answer based on the following context:\n{context}\n\nQuestion: {question}"
  );

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe((docs: any[]) => docs.map((doc) => doc.pageContent).join("\n")),
      question: (input) => input.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question: message });
};