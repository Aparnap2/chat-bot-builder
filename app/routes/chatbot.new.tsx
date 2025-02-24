import { useState } from "react";
import { Form, useNavigation, redirect, useActionData } from "@remix-run/react";
import { LoaderFunctionArgs, json, ActionFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { v4 as uuidv4 } from "uuid";
import { ChatPreview } from "~/components/chatPreview";

import { Logger } from "~/utils/logger.server";
import { ChatSettings } from "~/types/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated()) || !getUser()) throw redirect("/login");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const { getUser } = await getKindeSession(request);
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const brandColor = formData.get("brandColor") as string || "#2563eb";
  const initialMessage = formData.get("initialMessage") as string || "Hello! How can I help you today?";
  const customLogo = formData.get("customLogo") as string | null;
  const quickRepliesRaw = formData.get("quickReplies") as string;
  const quickReplies = quickRepliesRaw ? JSON.parse(quickRepliesRaw) : [];

  if (!name) return json({ error: "Name is required" }, { status: 400 });

  try {
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        connectionString: `chtbt_${uuidv4().replace(/-/g, "")}`,
        userId: user.id,
        settings: {
          create: {
            brandColor,
            customLogo: customLogo || null,
            chatBackground: "#ffffff",
            chatOpacity: 1.0,
            chatBorderRadius: 8,
            chatWidth: 400,
            chatHeight: 600,
            showEmailCapture: false,
            emailPlaceholder: "Enter your email",
            quickReplies,
            userBubbleColor: "#e0e0e0",
            aiBubbleColor: "#2563eb",
            headingColor: "#000000",
          },
        },
        conversations: {
          create: [{ messages: { create: [{ content: initialMessage, role: "system" }] } }],
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.chatSettings.update({
        where: { chatbotId: chatbot.id },
        data: { chatbotId: chatbot.id },
      });
    });

    Logger.info("Chatbot created", { chatbotId: chatbot.id });
    return redirect("/dashboard");
  } catch (error) {
    Logger.error("Error creating chatbot", { error });
    return json({ error: "Failed to create chatbot" }, { status: 500 });
  }
};

export default function NewChatbot() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [initialMessage, setInitialMessage] = useState("Hello! How can I help you today?");
  const [quickReplies, setQuickReplies] = useState<Array<{ text: string; action: string }>>([]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addQuickReply = () => setQuickReplies([...quickReplies, { text: "", action: "" }]);
  const removeQuickReply = (index: number) => setQuickReplies(quickReplies.filter((_, i) => i !== index));
  const handleQuickReplyChange = (index: number, field: keyof { text: string; action: string }, value: string) => {
    const newReplies = [...quickReplies];
    newReplies[index][field] = value;
    setQuickReplies(newReplies);
  };

  const previewSettings: ChatSettings = {
    chatbotId: "preview-id",
    chatWidth: 400,
    chatHeight: 600,
    chatBackground: "#ffffff",
    chatOpacity: 1.0,
    chatBorderRadius: 8,
    brandColor,
    customLogo: logoPreview || null,
    showEmailCapture: false,
    emailPlaceholder: "Enter your email",
    quickReplies,
    userBubbleColor: "#e0e0e0",
    aiBubbleColor: "#2563eb",
    headingColor: "#000000",
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Chatbot</h1>
        {actionData?.error && <div className="alert alert-error mb-4">{actionData.error}</div>}
        <Form method="post" className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm">Chatbot Name</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full"
                    required
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
                  <label className="block text-sm">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file-input file-input-bordered w-full"
                  />
                  {logoPreview && <img src={logoPreview} alt="Preview" className="mt-2 w-16 h-16 rounded" />}
                  <input type="hidden" name="customLogo" value={logoPreview || ""} />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Initial Setup</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm">Welcome Message</label>
                  <textarea
                    name="initialMessage"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    className="textarea textarea-bordered w-full h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm">Quick Replies</label>
                  {quickReplies.map((reply, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={reply.text}
                        onChange={(e) => handleQuickReplyChange(index, "text", e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="Text"
                      />
                      <input
                        type="text"
                        value={reply.action}
                        onChange={(e) => handleQuickReplyChange(index, "action", e.target.value)}
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
                  <input type="hidden" name="quickReplies" value={JSON.stringify(quickReplies)} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <ChatPreview
              messages={[{ id: "preview", content: initialMessage, role: "system", createdAt: new Date() }]}
              onSendMessage={() => {}}
              settings={previewSettings}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Chatbot"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}