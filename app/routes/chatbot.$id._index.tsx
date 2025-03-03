import { json, redirect, LoaderFunction, ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { ChatToggler } from "~/components/chatToggler";
import { generateResponse } from "~/utils/gemini.server";
import { checkRateLimit, trackUsage } from "~/utils/usage.server";
import { Chatbot, ChatSettings, Message } from "~/types/types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { generateEmbedCode } from "~/utils/embed.server";
import { Logger } from "~/utils/logger.server";

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
// Validation function for quickReplies
function validateQuickReplies(replies: unknown): { text: string; action: string }[] {
  // If replies is not an array, return an empty array as a safe default
  if (!Array.isArray(replies)) return [];

  // Filter the array to ensure each element matches the expected structure
  return replies.filter((reply): reply is { text: string; action: string } =>
    reply !== null &&
    typeof reply === "object" &&
    "text" in reply &&
    "action" in reply &&
    typeof reply.text === "string" &&
    typeof reply.action === "string"
  );
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) throw redirect("/login");

  const user = await getUser();
  if (!user) throw json({ error: "User not found" }, { status: 401 });

  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: { settings: true },
  });

  if (!chatbot) throw json({ error: "Chatbot not found" }, { status: 404 });

  // Construct the settings object with validation
  const settings: ChatSettings = chatbot.settings
    ? {
        ...chatbot.settings,
        chatbotId: chatbot.id,
        quickReplies: validateQuickReplies(chatbot.settings.quickReplies),
        chatOffsetX: chatbot.settings.chatOffsetX ?? 20,
        chatOffsetY: chatbot.settings.chatOffsetY ?? 20
      }
    : {
        chatbotId: params.id!,
        brandColor: '#2563eb',
        chatBackground: '#ffffff',
        chatOpacity: 1,
        chatBorderRadius: 8,
        chatWidth: 400,
        chatHeight: 600,
        chatOffsetX: 20,
        chatOffsetY: 20,
        quickReplies: [],
        showEmailCapture: false,
        emailPlaceholder: 'Enter your email',
        userBubbleColor: '#2563eb',
        aiBubbleColor: '#e5e7eb',
        headingColor: '#ffffff'
      };

  return json({ settings });
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

  if (!message || !conversationId) {
    return json({ error: "Message and conversation ID are required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true },
  });
  if (!conversation) return json({ error: "Conversation not found" }, { status: 404 });

  try {
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
      userMessage: { ...userMessage, role: "user" },
      aiMessage: { ...aiMessage, role: "assistant" },
    });
  } catch (error) {
    Logger.error("Error processing message", { error });
    return json({ error: "Failed to process message" }, { status: 500 });
  }
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
      legend: { position: "top" as const },
      title: { display: true, text: "Message Activity (Last 7 Days)" },
    },
    scales: {
      y: { beginAtZero: true },
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
          <Line data={chartData} options={chartOptions} />
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
