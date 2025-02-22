// app/routes/chatbot.$id.tsx
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { ChatPreview } from "~/components/chatPreview";
import { useState } from "react";
import { Trash2 } from "lucide-react";

// LangChain and Astra DB imports
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { TaskType } from "@google/generative-ai";

// Read configuration from environment variables
const token = process.env.ASTRA_DB_APPLICATION_TOKEN!;
const endpoint = process.env.ASTRA_DB_ENDPOINT!;
const collection = process.env.ASTRA_DB_COLLECTION!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: { 
      settings: true, 
      conversations: { include: { messages: true } } 
    },
  });

  if (!chatbot) return json({ error: "Chatbot not found" }, { status: 404 });

  const messageCount = await prisma.message.count({
    where: { conversation: { chatbotId: params.id, chatbot: { userId: user.id } } },
  });

  return json({ chatbot, messageCount });
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const messageCount = await prisma.message.count({
    where: { conversation: { chatbotId: params.id, chatbot: { userId: user.id } } },
  });

  if (messageCount >= 10) {
    return redirect("/payment");
  }

  const formData = await request.formData();
  const actionType = formData.get("action");

  switch (actionType) {
    case "sendMessage": {
      const message = formData.get("message") as string;
      const conversationId = formData.get("conversationId") as string;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });
      if (!conversation)
        return json({ error: "Conversation not found" }, { status: 404 });

      // Save the user's message
      const userMessage = await prisma.message.create({
        data: { conversationId, content: message, role: "user" },
      });

      // --- RAG using LangChain and Astra DB ---
      // Instantiate the vector store using the official fromExistingIndex method
      const vectorStore = await AstraDBVectorStore.fromExistingIndex(embeddings, {
        token,
        endpoint,
        collection,
        collectionOptions: {
          vector: {
            dimension: 768,
            metric: "cosine",
          },
        },
      });

      const retriever = vectorStore.asRetriever();
      const docs = await retriever.getRelevantDocuments(message);
      const context = docs.map((doc) => doc.pageContent).join("\n");

      const prompt = PromptTemplate.fromTemplate(
        "Answer based on the following context:\n{context}\n\nQuestion: {question}"
      );

      const chain = RunnableSequence.from([
        prompt,
        llm,
        new StringOutputParser(),
      ]);

      const response = await chain.invoke({ context, question: message });

      // Save the AI's response
      const aiMessage = await prisma.message.create({
        data: { conversationId, content: response, role: "assistant" },
      });

      return json({ userMessage, aiMessage });
    }
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function ChatbotPage() {
  const { chatbot, messageCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  if ("error" in chatbot) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error">
          <span>{chatbot.error}</span>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  const codeSnippet = `
    <div id="chatbot" style="width: ${chatbot.settings.chatWidth}px; height: ${chatbot.settings.chatHeight}px; background: ${chatbot.settings.chatBackground}; opacity: ${chatbot.settings.chatOpacity}; border-radius: ${chatbot.settings.chatBorderRadius}px;">
      <div style="background: ${chatbot.settings.brandColor}; color: ${chatbot.settings.headingColor}; padding: 10px; border-radius: ${chatbot.settings.chatBorderRadius}px ${chatbot.settings.chatBorderRadius}px 0 0;">
        ${chatbot.name}
      </div>
      <div style="padding: 10px;">
        ${chatbot.conversations[0]?.messages.map((msg: { role: string; content: any; }) => `
          <div style="background: ${msg.role === 'user' ? chatbot.settings.userBubbleColor : chatbot.settings.aiBubbleColor}; padding: 8px; margin: 4px 0; border-radius: 4px;">
            ${msg.content}
          </div>
        `).join('')}
      </div>
      ${chatbot.settings.quickReplies.length > 0 ? `
        <div style="padding: 10px;">
          ${chatbot.settings.quickReplies.map((reply: { text: any; }) => `
            <button style="background: ${chatbot.settings.brandColor}; color: white; padding: 6px 12px; margin: 4px; border-radius: 4px;">
              ${reply.text}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{chatbot.name}</h1>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setShowPreview(!showPreview)} className="btn btn-outline">
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <span className="text-sm">Messages Used: {messageCount}/10</span>
        </div>

        {showPreview && (
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Chat Preview</h2>
              <ChatPreview
                messages={
                  chatbot.conversations[0]?.messages.map((msg: { createdAt: any; }) => ({
                    ...msg,
                    createdAt: msg.createdAt || new Date().toISOString(),
                  })) || []
                }
                onSendMessage={() => {}}
                settings={chatbot.settings}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            <Form method="post" onSubmit={handleSendMessage}>
              <input type="hidden" name="action" value="sendMessage" />
              <input type="hidden" name="conversationId" value={chatbot.conversations[0]?.id || ""} />
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Message</span>
                </label>
                <textarea
                  name="message"
                  className="textarea textarea-bordered"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              {actionData?.error && <div className="alert alert-error mt-4">{actionData.error}</div>}
              <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : "Send"}
              </button>
            </Form>
            {actionData?.userMessage && actionData?.aiMessage && (
              <div className="mt-4">
                <p>
                  <strong>You:</strong> {actionData.userMessage.content}{" "}
                  <small>{new Date(actionData.userMessage.createdAt).toLocaleTimeString()}</small>
                </p>
                <p>
                  <strong>AI:</strong> {actionData.aiMessage.content}{" "}
                  <small>{new Date(actionData.aiMessage.createdAt).toLocaleTimeString()}</small>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Embed Code</h2>
            <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
              <code>{codeSnippet.trim()}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(codeSnippet.trim())}
              className="btn btn-outline mt-4"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
