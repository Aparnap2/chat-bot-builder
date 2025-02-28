import { useState } from "react";
import { Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react";
import { LoaderFunctionArgs, redirect, json, ActionFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { ChatPreview } from "~/components/chatPreview";

import { ChatSettings, Message } from "~/types/types";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "~/config/env";
import { TaskType } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import { Logger } from "~/utils/logger.server";

interface LoaderData {
  chatbot: { id: string; name: string; conversations: { messages: Message[] }[] };
  settings: ChatSettings;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) throw redirect("/login");

  const user = await getUser();
  if (!user) throw json({ error: "User not found" }, { status: 401 });

  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: { settings: true, conversations: { include: { messages: true }, take: 1 } },
  });

  if (!chatbot) throw json({ error: "Chatbot not found" }, { status: 404 });

  const settings: ChatSettings = chatbot.settings
    ? {
        ...chatbot.settings,
        chatbotId: chatbot.id,
        quickReplies: Array.isArray(chatbot.settings.quickReplies)
          ? chatbot.settings.quickReplies as { text: string; action: string }[]
          : [],
      }
    : {
        chatbotId: params.id!,
        brandColor: "#2563eb",
        chatBackground: "#ffffff",
        chatOpacity: 1.0,
        chatBorderRadius: 8,
        customLogo: null,
        chatWidth: 400,
        chatHeight: 600,
        showEmailCapture: false,
        emailPlaceholder: "Enter your email",
        quickReplies: [],
        userBubbleColor: "#e0e0e0",
        aiBubbleColor: "#2563eb",
        headingColor: "#000000",
      };

  return json<LoaderData>({
    chatbot: {
      id: chatbot.id,
      name: chatbot.name,
      conversations: chatbot.conversations.map((conv) => ({
        messages: conv.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant" | "system",
          createdAt: msg.createdAt,
        })),
      })),
    },
    settings,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser();
  if (!user) return json({ error: "User not found" }, { status: 401 });

  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "updateSettings") {
    const quickReplies = formData.get("quickReplies")
      ? JSON.parse(formData.get("quickReplies") as string)
      : [];

    const settingsData = {
      brandColor: formData.get("brandColor") as string,
      chatBackground: formData.get("chatBackground") as string,
      chatOpacity: Number(formData.get("chatOpacity")),
      chatBorderRadius: Number(formData.get("chatBorderRadius")),
      customLogo: (formData.get("customLogo") as string) || null,
      chatWidth: Number(formData.get("chatWidth")),
      chatHeight: Number(formData.get("chatHeight")),
      showEmailCapture: formData.get("showEmailCapture") === "true",
      emailPlaceholder: formData.get("emailPlaceholder") as string,
      quickReplies,
      userBubbleColor: formData.get("userBubbleColor") as string,
      aiBubbleColor: formData.get("aiBubbleColor") as string,
      headingColor: formData.get("headingColor") as string,
      chatbotName: formData.get("chatbotName") as string,
    };

    await prisma.$transaction(async (tx) => {
      await tx.chatSettings.upsert({
        where: { chatbotId: params.id },
        create: {
          
          ...settingsData,
          chatbot: {
            connect: { id: params.id }, // Connect to the existing Chatbot with this ID
          },
        },
        update: {
          ...settingsData,
          chatbot: {
            connect: { id: params.id }, // Connect to the existing Chatbot with this ID
          },
        },
      });

      await tx.chatbot.update({
        where: { id: params.id },
        data: { name: settingsData.chatbotName },
      });
    });

    Logger.info("Settings updated", { chatbotId: params.id });
    return json<ActionData>({ success: true });
  }

  if (actionType === "uploadDocuments") {
    const file = formData.get("document") as File;
    if (!file) return json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamically import pdf-parse to avoid SSR issues
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.createDocuments([text]);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: env.GOOGLE_API_KEY, // Note: You mentioned `GOOGLE_API_KEY` here, but your env.ts uses `GEMINI_API_KEY`. Ensure consistency.
      modelName: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    await AstraDBVectorStore.fromDocuments(docs, embeddings, {
      token: env.ASTRA_DB_APPLICATION_TOKEN,
      endpoint: env.ASTRA_DB_ENDPOINT,
      collection: `chatbot_docs_${user.id}`,
    });

    Logger.info("Document uploaded and vectorized", { userId: user.id });
    return json<ActionData>({ success: true });
  }

  return json({ error: "Invalid action type" }, { status: 400 });
};

export default function CustomizeChatbot() {
  const { chatbot, settings } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [brandColor, setBrandColor] = useState(settings.brandColor);
  const [chatBackground, setChatBackground] = useState(settings.chatBackground);
  const [chatOpacity, setChatOpacity] = useState(settings.chatOpacity);
  const [chatBorderRadius, setChatBorderRadius] = useState(settings.chatBorderRadius);
  const [customLogo, setCustomLogo] = useState(settings.customLogo);
  const [chatWidth, setChatWidth] = useState(settings.chatWidth);
  const [chatHeight, setChatHeight] = useState(settings.chatHeight);
  const [showEmailCapture, setShowEmailCapture] = useState(settings.showEmailCapture);
  const [emailPlaceholder, setEmailPlaceholder] = useState(settings.emailPlaceholder);
  const [quickReplies, setQuickReplies] = useState(settings.quickReplies);
  const [userBubbleColor, setUserBubbleColor] = useState(settings.userBubbleColor);
  const [aiBubbleColor, setAiBubbleColor] = useState(settings.aiBubbleColor);
  const [headingColor, setHeadingColor] = useState(settings.headingColor);
  const [chatbotName, setChatbotName] = useState(chatbot.name);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addQuickReply = () => setQuickReplies([...quickReplies, { text: "", action: "" }]);
  const removeQuickReply = (index: number) => setQuickReplies(quickReplies.filter((_, i) => i !== index));
  const updateQuickReply = (index: number, field: "text" | "action", value: string) => {
    const newReplies = [...quickReplies];
    newReplies[index][field] = value;
    setQuickReplies(newReplies);
  };

  const previewSettings: ChatSettings = {
    chatbotId: chatbot.id,
    brandColor,
    chatBackground,
    chatOpacity,
    chatBorderRadius,
    customLogo,
    chatWidth,
    chatHeight,
    showEmailCapture,
    emailPlaceholder,
    quickReplies,
    userBubbleColor,
    aiBubbleColor,
    headingColor,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
     
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Customize: {chatbot.name}</h1>
        {actionData?.success && <div className="alert alert-success mb-4">Settings saved!</div>}
        {actionData?.error && <div className="alert alert-error mb-4">{actionData.error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="actionType" value="updateSettings" />
              <input type="hidden" name="quickReplies" value={JSON.stringify(quickReplies)} />
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm">Chatbot Name</label>
                    <input
                      type="text"
                      name="chatbotName"
                      value={chatbotName}
                      onChange={(e) => setChatbotName(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Brand Color</label>
                    <input
                      type="color"
                      name="brandColor"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-20 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Chat Background</label>
                    <input
                      type="color"
                      name="chatBackground"
                      value={chatBackground}
                      onChange={(e) => setChatBackground(e.target.value)}
                      className="w-20 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">User Bubble Color</label>
                    <input
                      type="color"
                      name="userBubbleColor"
                      value={userBubbleColor}
                      onChange={(e) => setUserBubbleColor(e.target.value)}
                      className="w-20 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">AI Bubble Color</label>
                    <input
                      type="color"
                      name="aiBubbleColor"
                      value={aiBubbleColor}
                      onChange={(e) => setAiBubbleColor(e.target.value)}
                      className="w-20 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Heading Color</label>
                    <input
                      type="color"
                      name="headingColor"
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                      className="w-20 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="customLogo"
                      onChange={handleLogoChange}
                      className="file-input file-input-bordered w-full"
                    />
                    {customLogo && <img src={customLogo} alt="Logo" className="mt-2 w-16 h-16 rounded" />}
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Dimensions & Style</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm">Width (px)</label>
                    <input
                      type="number"
                      name="chatWidth"
                      value={chatWidth}
                      onChange={(e) => setChatWidth(Number(e.target.value))}
                      className="input input-bordered w-full"
                      min="300"
                      max="800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Height (px)</label>
                    <input
                      type="number"
                      name="chatHeight"
                      value={chatHeight}
                      onChange={(e) => setChatHeight(Number(e.target.value))}
                      className="input input-bordered w-full"
                      min="400"
                      max="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Border Radius (px)</label>
                    <input
                      type="number"
                      name="chatBorderRadius"
                      value={chatBorderRadius}
                      onChange={(e) => setChatBorderRadius(Number(e.target.value))}
                      className="input input-bordered w-full"
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Opacity (0-1)</label>
                    <input
                      type="number"
                      name="chatOpacity"
                      value={chatOpacity}
                      onChange={(e) => setChatOpacity(Number(e.target.value))}
                      className="input input-bordered w-full"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Quick Replies</h2>
                {quickReplies.map((reply, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={reply.text}
                      onChange={(e) => updateQuickReply(index, "text", e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Text"
                    />
                    <input
                      type="text"
                      value={reply.action}
                      onChange={(e) => updateQuickReply(index, "action", e.target.value)}
                      className="input input-bordered w-1/3"
                      placeholder="Action"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuickReply(index)}
                      className="btn btn-error btn-sm"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addQuickReply} className="btn btn-primary btn-sm mt-2">
                  Add Reply
                </button>
              </div>
              <div className="flex justify-end mt-6">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Form>
            <Form method="post" encType="multipart/form-data" className="mt-6">
              <input type="hidden" name="actionType" value="uploadDocuments" />
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
                <input
                  type="file"
                  name="document"
                  accept=".pdf"
                  className="file-input file-input-bordered w-full"
                />
                <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </Form>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <ChatPreview
              settings={previewSettings}
              messages={chatbot.conversations[0]?.messages || []}
              onSendMessage={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}