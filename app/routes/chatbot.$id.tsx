import { json, redirect, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { ChatToggler } from "~/components/chatToggler";

import { generateResponse } from "~/utils/gemini.server";
import { checkRateLimit, trackUsage } from "~/utils/usage.server";
import { Chatbot, Message } from "~/types/types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { generateEmbedCode } from "~/utils/embed.server";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LoaderData {
  chatbot: Chatbot;
  messageCount: number;
  codeSnippets: { vanillaJs: string; react: string };
  metrics: {
    totalMessages: number;
    totalConversations: number;
    usage: Array<{ date: string; messages: number }>;
  };
}

interface ActionData {
  userMessage?: Message;
  aiMessage?: Message;
  error?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) throw redirect("/login");

  const chatbotRaw = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      settings: true,
      conversations: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });

  if (!chatbotRaw) throw json({ error: "Chatbot not found" }, { status: 404 });

  const chatbot: Chatbot = {
    ...chatbotRaw,
    createdAt: chatbotRaw.createdAt || new Date(),
    settings: chatbotRaw.settings
      ? {
          ...chatbotRaw.settings,
          quickReplies: Array.isArray(chatbotRaw.settings.quickReplies)
            ? chatbotRaw.settings.quickReplies as { text: string; action: string }[]
            : [],
        }
      : null,
    conversations: chatbotRaw.conversations.map((conv) => ({
      id: conv.id,
      messages: conv.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as "user" | "assistant" | "system",
        createdAt: msg.createdAt,
      })),
    })),
  };

  const messageCount = await prisma.message.count({
    where: { conversation: { chatbotId: params.id } },
  });

  const totalConversations = chatbot.conversations.length;
  const usage = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      return prisma.message.count({
        where: {
          conversation: { chatbotId: params.id },
          createdAt: { gte: new Date(dateStr), lte: new Date(dateStr + "T23:59:59") },
        },
      }).then((messages) => ({ date: dateStr, messages }));
    })
  ).then((results) => results.reverse());

  const codeSnippets = chatbot.settings
    ? generateEmbedCode(chatbot.settings, chatbot.connectionString, chatbot.name)
    : { vanillaJs: "", react: "" };

  return json<LoaderData>({
    chatbot,
    messageCount,
    codeSnippets,
    metrics: { totalMessages: messageCount, totalConversations, usage },
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const messageCount = await prisma.message.count({
    where: { conversation: { chatbotId: params.id } },
  });

  const { success } = await checkRateLimit(user.id);
  if (!success || messageCount >= 10) {
    return redirect("/checkout");
  }

  const formData = await request.formData();
  const message = formData.get("message") as string;
  const conversationId = formData.get("conversationId") as string;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true },
  });
  if (!conversation) return json({ error: "Conversation not found" }, { status: 404 });

  const userMessage = await prisma.message.create({
    data: { conversationId, content: message, role: "user" },
  });

  await trackUsage(params.id!, user.id);

  const context = conversation.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const response = await generateResponse(message, context, user.id);

  const aiMessage = await prisma.message.create({
    data: { conversationId, content: response, role: "assistant" },
  });

  return json<ActionData>({
    userMessage: { ...userMessage, role: "user" as const },
    aiMessage: { ...aiMessage, role: "assistant" as const },
  });
};

export default function ChatbotPage() {
  const { chatbot, messageCount, codeSnippets, metrics } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();
  const [messages, setMessages] = useState<Message[]>(chatbot.conversations[0]?.messages || []);
  const [activeTab, setActiveTab] = useState<"vanillaJs" | "react">("vanillaJs");

  const handleSendMessage = (msg: string) => {
    if (!msg.trim()) return;
    const formData = new FormData();
    formData.append("message", msg);
    formData.append("conversationId", chatbot.conversations[0]?.id || "");
    fetcher.submit(formData, { method: "post" });
  };

  useEffect(() => {
    const data = fetcher.data;
    if (data && "userMessage" in data && "aiMessage" in data && data.userMessage && data.aiMessage) {
      setMessages((prev) => [...prev, data.userMessage!, data.aiMessage!]);
    }
  }, [fetcher.data]);

  const chartData = {
    labels: metrics.usage.length ? metrics.usage.map((u) => u.date) : ["No Data"],
    datasets: [
      {
        label: "Messages",
        data: metrics.usage.length ? metrics.usage.map((u) => u.messages) : [0],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Message Activity (Last 7 Days)" },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white">
     
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">{chatbot.name}</h1>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Total Messages</p>
            <p className="text-2xl font-bold">{metrics.totalMessages}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Conversations</p>
            <p className="text-2xl font-bold">{metrics.totalConversations}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Messages Used</p>
            <p className="text-2xl font-bold">{messageCount}/10</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <Line data={chartData} options={chartOptions as any} />
        </div>

        {/* Chat Preview */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Chat Preview</h2>
          <ChatToggler
            settings={chatbot.settings!}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={fetcher.state === "submitting"}
          />
        </div>

        {/* Code Snippets */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Embed Code</h2>
          <div className="tabs tabs-bordered mb-4">
            <button
              className={`tab ${activeTab === "vanillaJs" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("vanillaJs")}
            >
              Vanilla JS
            </button>
            <button
              className={`tab ${activeTab === "react" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("react")}
            >
              React
            </button>
          </div>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(codeSnippets[activeTab])}
            className="btn btn-outline mt-4"
          >
            Copy {activeTab === "vanillaJs" ? "Vanilla JS" : "React"} Code
          </button>
        </div>
      </div>
    </div>
  );
}