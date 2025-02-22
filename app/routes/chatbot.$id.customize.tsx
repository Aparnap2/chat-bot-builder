// app/routes/chatbot.$id.customize.tsx
import { useState } from "react";
import { Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react";
import { LoaderFunctionArgs, redirect, json, ActionFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { Trash2 } from "lucide-react";
import { ChatPreview } from "~/components/chatPreview";
import { Prisma } from "@prisma/client";

// Type definitions
interface QuickReply {
  text: string;
  action: string;
}

interface ChatSettings {
  id: string;
  chatbotId: string;
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo: string | null;
  chatWidth: number;
  chatHeight: number;
  showEmailCapture: boolean;
  emailPlaceholder: string;
  quickReplies: QuickReply[];
  userBubbleColor: string;
  aiBubbleColor: string;
  headingColor: string;
}

interface LoaderData {
  chatbot: {
    id: string;
    name: string;
    conversations: Array<{
      messages: Array<{
        content: string;
        isUser: boolean;
        createdAt: string;
      }>;
    }>;
  };
  settings: ChatSettings;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { isAuthenticated } = await getKindeSession(request);
  if (!(await isAuthenticated())) throw redirect("/login");

  const user = await (await getKindeSession(request)).getUser();
  if (!user) throw json({ error: "User not found" }, { status: 401 });

  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: { 
      settings: true,
      conversations: {
        include: { messages: true }, // Include messages in each conversation
        take: 1,
        orderBy: { createdAt: 'asc' }
      }
    },
  });

  if (!chatbot) throw json({ error: "Chatbot not found" }, { status: 404 });

  const conversations = chatbot.conversations.map(convo => ({
    messages: convo.messages.map(msg => ({
      content: msg.content,
      isUser: msg.role === "user", // Map role to isUser
      createdAt: msg.createdAt.toISOString(), // convert Date to string
    }))
  }));
  

  // Default settings with proper type assertion
  const settings: ChatSettings = chatbot.settings ? {
    ...(chatbot.settings as unknown as ChatSettings),
    quickReplies: chatbot.settings.quickReplies as unknown as QuickReply[] || []
  } : {
    id: '',
    chatbotId: params.id!,
    brandColor: "#2563eb",
    chatBackground: "#ffffff",
    chatOpacity: 1.0,
    chatBorderRadius: 8,
    customLogo: null,
    chatWidth: 300,
    chatHeight: 400,
    showEmailCapture: false,
    emailPlaceholder: "Enter your email",
    quickReplies: [],
    userBubbleColor: "#e0e0e0",
    aiBubbleColor: "#2563eb",
    headingColor: "#000000"
  };

  return json<LoaderData>({ 
    chatbot: {
      id: chatbot.id,
      name: chatbot.name,
      conversations
    },
    settings
  });
};


// Define a type for the settings update data that matches what Prisma expects
type ChatSettingsUpdateInput = Omit<ChatSettings, "id" | "chatbotId" | "quickReplies"> & {
  quickReplies: Prisma.JsonValue;
};
export const action: ActionFunction = async ({ request, params }) => {
  const { isAuthenticated } = await getKindeSession(request);
  if (!(await isAuthenticated()))
    return json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();

  const quickRepliesRaw = formData.get("quickReplies") as string;
  const quickReplies: { text: string; action: string }[] = quickRepliesRaw
    ? JSON.parse(quickRepliesRaw)
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
  };

  try {
    await prisma.chatSettings.upsert({
      where: { chatbotId: params.id },
      create: {
        chatbotId: params.id!,
        ...settingsData,
        quickReplies: settingsData.quickReplies as Prisma.InputJsonValue,
      },
      update: {
        ...settingsData,
        quickReplies: settingsData.quickReplies as Prisma.InputJsonValue,
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return json({ error: "Failed to update settings" }, { status: 500 });
  }
};
export default function CustomizeChatbot() {
  const { chatbot, settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // State initialization with proper types
  const [brandColor, setBrandColor] = useState(settings.brandColor);
  const [chatBackground, setChatBackground] = useState(settings.chatBackground);
  const [chatOpacity, setChatOpacity] = useState(settings.chatOpacity);
  const [chatBorderRadius, setChatBorderRadius] = useState(settings.chatBorderRadius);
  const [customLogo, setCustomLogo] = useState(settings.customLogo);
  const [chatWidth, setChatWidth] = useState(settings.chatWidth);
  const [chatHeight, setChatHeight] = useState(settings.chatHeight);
  const [showEmailCapture, setShowEmailCapture] = useState(settings.showEmailCapture);
  const [emailPlaceholder, setEmailPlaceholder] = useState(settings.emailPlaceholder);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(settings.quickReplies);
  const [userBubbleColor, setUserBubbleColor] = useState(settings.userBubbleColor);
  const [aiBubbleColor, setAiBubbleColor] = useState(settings.aiBubbleColor);
  const [headingColor, setHeadingColor] = useState(settings.headingColor);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addQuickReply = () => {
    setQuickReplies([...quickReplies, { text: "", action: "" }]);
  };

  const removeQuickReply = (index: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  };

  const handleQuickReplyChange = (index: number, field: keyof QuickReply, value: string) => {
    const newReplies = [...quickReplies];
    newReplies[index] = { ...newReplies[index], [field]: value };
    setQuickReplies(newReplies);
  };

  const defaultMessage = { 
    content: "Hello! How can I help you today?", 
    isUser: false, 
    createdAt: new Date().toISOString() 
  };
  
  const previewMessages = chatbot.conversations[0]?.messages || [defaultMessage];

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Customize Chatbot: {chatbot.name}</h1>
        
        {actionData?.success && (
          <div className="alert alert-success mb-4">Settings saved successfully!</div>
        )}
        {actionData?.error && (
          <div className="alert alert-error mb-4">{actionData.error}</div>
        )}

        <Form method="post" className="space-y-6">
          {/* Hidden inputs for form data */}
          <input type="hidden" name="brandColor" value={brandColor} />
          <input type="hidden" name="chatBackground" value={chatBackground} />
          <input type="hidden" name="chatOpacity" value={chatOpacity.toString()} />
          <input type="hidden" name="chatBorderRadius" value={chatBorderRadius.toString()} />
          <input type="hidden" name="customLogo" value={customLogo || ""} />
          <input type="hidden" name="chatWidth" value={chatWidth.toString()} />
          <input type="hidden" name="chatHeight" value={chatHeight.toString()} />
          <input type="hidden" name="showEmailCapture" value={showEmailCapture.toString()} />
          <input type="hidden" name="emailPlaceholder" value={emailPlaceholder} />
          <input type="hidden" name="quickReplies" value={JSON.stringify(quickReplies)} />
          <input type="hidden" name="userBubbleColor" value={userBubbleColor} />
          <input type="hidden" name="aiBubbleColor" value={aiBubbleColor} />
          <input type="hidden" name="headingColor" value={headingColor} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Customization Section */}
            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Brand Customization</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Brand Color</span>
                </label>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-20 h-12 cursor-pointer rounded-lg"
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Upload Logo</span>
                </label>
                <div className="flex items-center gap-4">
                  {customLogo && (
                    <img
                      src={customLogo}
                      className="w-16 h-16 rounded-lg object-contain border border-base-300"
                      alt="Custom logo"
                    />
                  )}
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    {customLogo ? "Change Logo" : "Upload Logo"}
                  </label>
                </div>
              </div>
            </div>

            {/* Chat Appearance Section */}
            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Chat Appearance</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Chat Background</span>
                  </label>
                  <input
                    type="color"
                    value={chatBackground}
                    onChange={(e) => setChatBackground(e.target.value)}
                    className="w-20 h-12 cursor-pointer rounded-lg"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">User Bubble Color</span>
                  </label>
                  <input
                    type="color"
                    value={userBubbleColor}
                    onChange={(e) => setUserBubbleColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer rounded-lg"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">AI Bubble Color</span>
                  </label>
                  <input
                    type="color"
                    value={aiBubbleColor}
                    onChange={(e) => setAiBubbleColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer rounded-lg"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Heading Color</span>
                  </label>
                  <input
                    type="color"
                    value={headingColor}
                    onChange={(e) => setHeadingColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions & Style Section */}
            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Dimensions & Style</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Width (px)</span>
                  </label>
                  <input
                    type="number"
                    value={chatWidth}
                    onChange={(e) => setChatWidth(Number(e.target.value))}
                    className="input input-bordered"
                    min="200"
                    max="800"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Height (px)</span>
                  </label>
                  <input
                    type="number"
                    value={chatHeight}
                    onChange={(e) => setChatHeight(Number(e.target.value))}
                    className="input input-bordered"
                    min="200"
                    max="800"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Border Radius (px)</span>
                  </label>
                  <input
                    type="number"
                    value={chatBorderRadius}
                    onChange={(e) => setChatBorderRadius(Number(e.target.value))}
                    className="input input-bordered"
                    min="0"
                    max="50"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Opacity</span>
                  </label>
                  <input
                    type="number"
                    value={chatOpacity}
                    onChange={(e) => setChatOpacity(Number(e.target.value))}
                    className="input input-bordered"
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Quick Replies Section */}
            <div className="card bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Replies</h2>
              
              <div className="space-y-3">
                {quickReplies.map((reply, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={reply.text}
                      onChange={(e) => handleQuickReplyChange(index, 'text', e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={reply.action}
                      onChange={(e) => handleQuickReplyChange(index, 'action', e.target.value)}
                      className="input input-bordered w-1/3"
                      placeholder="Action"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuickReply(index)}
                      className="btn btn-square btn-sm btn-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addQuickReply}
                  className="btn btn-primary btn-sm mt-2"
                >
                  Add Quick Reply
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="card bg-base-100 p-6 shadow-sm mt-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            // In chatToggler.tsx
<ChatPreview 
  settings={{
    chatbotId: chatbot.id,
    chatWidth: 400,  // Add default value
    chatHeight: 600, // Add default value
    chatBackground: '#ffffff',
    chatOpacity: 1,
    chatBorderRadius: 8,
    brandColor: '#2563eb',
    customLogo: undefined,
    showEmailCapture: false,
    emailPlaceholder: '',
    quickReplies: [],
    userBubbleColor: '#e0e0e0', // Add missing property
    aiBubbleColor: '#2563eb',    // Add missing property
    headingColor: '#000000'
  }}
  messages={[]}
  onSendMessage={() => {}}
/>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
              {isSubmitting && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}