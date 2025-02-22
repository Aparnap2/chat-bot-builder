import { useState } from "react";
import { Form, useNavigation, redirect, useActionData } from "@remix-run/react";
import { LoaderFunctionArgs, json, ActionFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { v4 as uuidv4 } from "uuid";
import { ChatPreview } from "~/components/chatPreview";
import { Trash2 } from "lucide-react";
import { Logger } from "~/utils/logger.server";
import { ChatSettings } from "~/types/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  const authenticated = await isAuthenticated();
  const user = await getUser();

  if (!authenticated || !user) {
    Logger.warn("User not authenticated in chatbot.new loader", {
      authenticated,
      userId: user?.id,
      email: user?.email,
    });
    throw redirect("/login");
  }

  Logger.info("User authenticated for new chatbot", { userId: user.id, email: user.email });
  return json({ userId: user.id });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) {
    Logger.warn("No user in chatbot.new action");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const brandColor = (formData.get("brandColor") as string) || "#2563eb";
  const initialMessage = (formData.get("initialMessage") as string) || "Hello! How can I help you today?";
  const customLogo = formData.get("customLogo") as string | null;
  const quickRepliesRaw = formData.get("quickReplies") as string;
  const quickReplies: { text: string; action: string }[] = quickRepliesRaw ? JSON.parse(quickRepliesRaw) : [];

  if (!name) return json({ error: "Name is required" }, { status: 400 });

  try {
    await prisma.user.upsert({
      where: { kindeId: user.id },
      create: { kindeId: user.id, email: user.email!, name: user.given_name || user.email || "Unnamed User" },
      update: { email: user.email!, name: user.given_name || user.email || "Unnamed User" },
    });

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
            chatWidth: 300,
            chatHeight: 400,
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

    Logger.info("Chatbot created", { chatbotId: chatbot.id, userId: user.id });
    return redirect("/dashboard");
  } catch (error) {
    Logger.error("Error creating chatbot", { error });
    return json({ error: "Failed to create chatbot. Check server logs." }, { status: 500 });
  }
};

export default function NewChatbot() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const [brandColor, setBrandColor] = useState<string>("#2563eb");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [initialMessage, setInitialMessage] = useState<string>("Hello! How can I help you today?");
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
  const handleQuickReplyChange = (index: number, field: "text" | "action", value: string) => {
    const newReplies = [...quickReplies];
    newReplies[index][field] = value;
    setQuickReplies(newReplies);
  };

  const handleSubmit = () => {
    if (!actionData?.error) {
      setName("");
      setBrandColor("#2563eb");
      setLogoPreview(null);
      setInitialMessage("Hello! How can I help you today?");
      setQuickReplies([]);
    }
  };

  // In app/routes/chatbot.new.tsx
const previewSettings: ChatSettings = {
  chatbotId: "preview-chatbot-id", // Add this
  chatWidth: 300,
  chatHeight: 400,
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
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Chatbot</h1>
        {actionData?.error && <div className="alert alert-error mb-4">{actionData.error}</div>}
        <Form method="post" className="space-y-6" encType="multipart/form-data" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="form-control">
                <label className="label"><span className="label-text">Chatbot Name</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="My Awesome Chatbot"
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mt-4">
                <label className="label"><span className="label-text">Brand Color</span></label>
                <input
                  type="color"
                  name="brandColor"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-20 h-12 cursor-pointer"
                />
              </div>
              <div className="form-control mt-4">
                <label className="label"><span className="label-text">Upload Logo</span></label>
                <div className="flex items-center gap-4">
                  {logoPreview && <img src={logoPreview} className="w-16 h-16 rounded-lg object-contain" alt="Logo" />}
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </label>
                </div>
                <input type="hidden" name="customLogo" value={logoPreview || ""} />
              </div>
            </div>

            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Initial Configuration</h2>
              <div className="form-control">
                <label className="label"><span className="label-text">Welcome Message</span></label>
                <textarea
                  name="initialMessage"
                  className="textarea textarea-bordered h-32"
                  placeholder="Enter initial greeting message..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                />
              </div>
              <div className="form-control mt-4">
                <h3 className="text-lg font-semibold mb-2">Quick Replies</h3>
                {quickReplies.map((reply, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      value={reply.text}
                      onChange={(e) => handleQuickReplyChange(index, "text", e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={reply.action}
                      onChange={(e) => handleQuickReplyChange(index, "action", e.target.value)}
                      className="input input-bordered w-1/3"
                      placeholder="Action (optional)"
                    />
                    <button type="button" onClick={() => removeQuickReply(index)} className="btn btn-square btn-sm btn-error">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addQuickReply} className="btn btn-primary btn-sm mt-2">
                  Add Quick Reply
                </button>
                <input type="hidden" name="quickReplies" value={JSON.stringify(quickReplies)} />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <ChatPreview
  messages={[{ content: initialMessage, role: "system", id: "preview", createdAt: new Date() }]} // Use Date object
  onSendMessage={() => {}}
  settings={previewSettings}
/>
          </div>

          <div className="flex justify-end gap-4">
            <button type="submit" className="btn btn-primary gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                </svg>
              )}
              Create Chatbot
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}