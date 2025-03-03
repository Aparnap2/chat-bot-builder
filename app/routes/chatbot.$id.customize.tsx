import type React from "react"
import { useState } from "react"
import { Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react"
import { json } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { ChatbotPreview } from "../components/chatPreview"
import { CodeSnippet } from "../components/code-snippets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Slider } from "../components/ui/slider"
import { Textarea } from "../components/ui/textarea"
import { AlertCircle, Check, Trash2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "../components/ui/alert"

// Define types
interface ChatSettings {
  chatbotId: string
  quickReplies: { text: string; action: string }[]
  brandColor: string
  chatBackground: string
  chatOpacity: number
  chatBorderRadius: number
  customLogo: string | null
  chatWidth: number
  chatHeight: number
  showEmailCapture: boolean
  emailPlaceholder: string
  userBubbleColor: string
  aiBubbleColor: string
  headingColor: string
  chatOffsetX: number
  chatOffsetY: number
  useRag: boolean
  welcomeMessage: string
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  createdAt: Date
}

interface LoaderData {
  chatbot: {
    id: string
    name: string
    conversations: { messages: Message[] }[]
  }
  settings: ChatSettings
}

interface ActionData {
  success?: boolean
  error?: string
}

// Validate and transform quickReplies
const validateQuickReplies = (replies: unknown): { text: string; action: string }[] => {
  if (!Array.isArray(replies)) return []
  return replies.filter(
    (reply): reply is { text: string; action: string } =>
      reply !== null &&
      typeof reply === "object" &&
      "text" in reply &&
      typeof reply.text === "string" &&
      "action" in reply &&
      typeof reply.action === "string",
  )
}

// Mock loader function - in a real app, this would fetch data from your database
export const loader = async ({ request, params }: LoaderFunctionArgs): Promise<Response> => {
  // Authentication check would go here
  // const { isAuthenticated, getUser } = await getAuthSession(request);
  // if (!(await isAuthenticated())) return redirect('/login');

  if (!params.id) return json({ error: "Chatbot ID is required" }, { status: 400 })

  // Mock data - in a real app, this would come from your database
  const chatbot = {
    id: params.id,
    name: "My Awesome Chatbot",
    conversations: [
      {
        messages: [
          {
            id: "1",
            content: "Hello! How can I help you today?",
            role: "assistant" as const,
            createdAt: new Date(),
          },
          {
            id: "2",
            content: "I have a question about your services.",
            role: "user" as const,
            createdAt: new Date(),
          },
          {
            id: "3",
            content: "I'd be happy to help with that! What would you like to know about our services?",
            role: "assistant" as const,
            createdAt: new Date(),
          },
        ],
      },
    ],
  }

  // Default settings
  const settings: ChatSettings = {
    chatbotId: params.id,
    quickReplies: [
      { text: "Pricing", action: "Ask about pricing" },
      { text: "Features", action: "What features do you offer?" },
    ],
    brandColor: "#2563eb",
    chatBackground: "#ffffff",
    chatOpacity: 1.0,
    chatBorderRadius: 8,
    customLogo: null,
    chatWidth: 400,
    chatHeight: 600,
    showEmailCapture: false,
    emailPlaceholder: "Enter your email",
    userBubbleColor: "#e0e0e0",
    aiBubbleColor: "#2563eb",
    headingColor: "#000000",
    chatOffsetX: 0,
    chatOffsetY: 0,
    useRag: false,
    welcomeMessage: "Hello! How can I help you today?",
  }

  const responseData: LoaderData = {
    chatbot,
    settings,
  }

  return json(responseData)
}

// Transform form data to settings object
const transformSettingsData = (data: Record<string, FormDataEntryValue>): Omit<ChatSettings, "chatbotId"> => {
  const quickRepliesRaw = data.quickReplies ? JSON.parse(data.quickReplies as string) : []
  return {
    quickReplies: Array.isArray(quickRepliesRaw)
      ? quickRepliesRaw.map((r: unknown) => ({
          text: typeof r === "object" && r && "text" in r ? String(r.text) : "",
          action: typeof r === "object" && r && "action" in r ? String(r.action) : "",
        }))
      : [],
    brandColor: typeof data.brandColor === "string" ? data.brandColor : "#2563eb",
    chatBackground: typeof data.chatBackground === "string" ? data.chatBackground : "#ffffff",
    chatOpacity: Math.min(Math.max(Number(data.chatOpacity) || 1.0, 0), 1),
    chatBorderRadius: Math.min(Math.max(Number(data.chatBorderRadius) || 8, 0), 50),
    customLogo: typeof data.customLogo === "string" && data.customLogo ? data.customLogo : null,
    chatWidth: Math.min(Math.max(Number(data.chatWidth) || 400, 300), 800),
    chatHeight: Math.min(Math.max(Number(data.chatHeight) || 600, 400), 1000),
    showEmailCapture: data.showEmailCapture === "true",
    emailPlaceholder: typeof data.emailPlaceholder === "string" ? data.emailPlaceholder : "Enter your email",
    userBubbleColor: typeof data.userBubbleColor === "string" ? data.userBubbleColor : "#e0e0e0",
    aiBubbleColor: typeof data.aiBubbleColor === "string" ? data.aiBubbleColor : "#2563eb",
    headingColor: typeof data.headingColor === "string" ? data.headingColor : "#000000",
    chatOffsetX: Number(data.chatOffsetX) || 0,
    chatOffsetY: Number(data.chatOffsetY) || 0,
    useRag: data.useRag === "true",
    welcomeMessage: typeof data.welcomeMessage === "string" ? data.welcomeMessage : "Hello! How can I help you today?",
  }
}

// Mock action function - in a real app, this would save data to your database
export const action = async ({ request, params }: ActionFunctionArgs): Promise<Response> => {
  // Authentication check would go here
  // const { isAuthenticated, getUser } = await getAuthSession(request);
  // if (!(await isAuthenticated())) return json({ error: 'Unauthorized' }, { status: 401 });

  if (!params.id) return json({ error: "Chatbot ID is required" }, { status: 400 })

  const formData = await request.formData()
  const actionType = formData.get("actionType") as string | null

  if (!actionType) return json({ error: "Action type is required" }, { status: 400 })

  if (actionType === "updateSettings") {
    const settingsData = transformSettingsData(Object.fromEntries(formData))
    const chatbotName = String(formData.get("chatbotName") ?? "Unnamed Chatbot")

    try {
      // In a real app, this would save to your database
      // await prisma.$transaction(async (tx) => {
      //   await tx.chatSettings.upsert({
      //     where: { chatbotId: params.id },
      //     create: { ...settingsData, chatbotId: params.id },
      //     update: settingsData,
      //   });
      //   await tx.chatbot.update({
      //     where: { id: params.id },
      //     data: { name: chatbotName },
      //   });
      // });

      console.log("Settings updated", { chatbotId: params.id })
      return json<ActionData>({ success: true })
    } catch (error) {
      console.error("Settings update failed", { error: String(error) })
      return json<ActionData>({ error: "Failed to update settings" }, { status: 500 })
    }
  }

  if (actionType === "uploadDocuments") {
    const file = formData.get("document")
    if (!(file instanceof File)) return json<ActionData>({ error: "No file uploaded" }, { status: 400 })

    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
      return json<ActionData>({ error: "Only PDFs under 10MB are allowed" }, { status: 400 })
    }

    try {
      // In a real app, this would process the document and store vectors
      // const buffer = Buffer.from(await file.arrayBuffer());
      // const pdfData = await pdfParse(buffer);
      // const text = pdfData.text ?? '';

      console.log("Document uploaded", { fileName: file.name })
      return json<ActionData>({ success: true })
    } catch (error) {
      console.error("Document upload failed", { error: String(error) })
      return json<ActionData>({ error: "Failed to process document" }, { status: 500 })
    }
  }

  return json<ActionData>({ error: "Invalid action type" }, { status: 400 })
}

export default function CustomizeChatbot() {
  const { chatbot, settings } = useLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  // Initialize state with strict typing and defaults
  const [brandColor, setBrandColor] = useState<string>(settings.brandColor)
  const [chatBackground, setChatBackground] = useState<string>(settings.chatBackground)
  const [chatOpacity, setChatOpacity] = useState<number>(settings.chatOpacity)
  const [chatBorderRadius, setChatBorderRadius] = useState<number>(settings.chatBorderRadius)
  const [customLogo, setCustomLogo] = useState<string | null>(settings.customLogo)
  const [chatWidth, setChatWidth] = useState<number>(settings.chatWidth)
  const [chatHeight, setChatHeight] = useState<number>(settings.chatHeight)
  const [showEmailCapture, setShowEmailCapture] = useState<boolean>(settings.showEmailCapture)
  const [emailPlaceholder, setEmailPlaceholder] = useState<string>(settings.emailPlaceholder)
  const [quickReplies, setQuickReplies] = useState<{ text: string; action: string }[]>(settings.quickReplies)
  const [userBubbleColor, setUserBubbleColor] = useState<string>(settings.userBubbleColor)
  const [aiBubbleColor, setAiBubbleColor] = useState<string>(settings.aiBubbleColor)
  const [headingColor, setHeadingColor] = useState<string>(settings.headingColor)
  const [chatbotName, setChatbotName] = useState<string>(chatbot.name)
  const [useRag, setUseRag] = useState<boolean>(settings.useRag)
  const [welcomeMessage, setWelcomeMessage] = useState<string>(settings.welcomeMessage)
  const [activeTab, setActiveTab] = useState<string>("appearance")

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onloadend = () => setCustomLogo(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      alert("Please upload an image file under 5MB.")
    }
  }

  const addQuickReply = () => setQuickReplies([...quickReplies, { text: "", action: "" }])
  const removeQuickReply = (index: number) => setQuickReplies(quickReplies.filter((_, i) => i !== index))
  const updateQuickReply = (index: number, field: "text" | "action", value: string) => {
    const newReplies = [...quickReplies]
    newReplies[index] = { ...newReplies[index], [field]: value }
    setQuickReplies(newReplies)
  }

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
    chatOffsetX: settings.chatOffsetX,
    chatOffsetY: settings.chatOffsetY,
    useRag,
    welcomeMessage,
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Customize: {chatbotName}</h1>

        {actionData?.success && (
          <Alert className="mb-4 bg-green-900 border-green-700">
            <Check className="h-4 w-4" />
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {actionData?.error && (
          <Alert className="mb-4 bg-red-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionData.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              </TabsList>

              <Form method="post" className="space-y-6">
                <input type="hidden" name="actionType" value="updateSettings" />
                <input type="hidden" name="quickReplies" value={JSON.stringify(quickReplies)} />
                <input type="hidden" name="useRag" value={useRag.toString()} />
                <input type="hidden" name="showEmailCapture" value={showEmailCapture.toString()} />

                <TabsContent value="appearance" className="space-y-4">
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chatbotName">Chatbot Name</Label>
                        <Input
                          id="chatbotName"
                          name="chatbotName"
                          value={chatbotName}
                          onChange={(e) => setChatbotName(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea
                          id="welcomeMessage"
                          name="welcomeMessage"
                          value={welcomeMessage}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          className="bg-gray-700 border-gray-600 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">Colors</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brandColor">Brand Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="brandColor"
                            name="brandColor"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="chatBackground">Background</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="chatBackground"
                            name="chatBackground"
                            value={chatBackground}
                            onChange={(e) => setChatBackground(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={chatBackground}
                            onChange={(e) => setChatBackground(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="userBubbleColor">User Bubble</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="userBubbleColor"
                            name="userBubbleColor"
                            value={userBubbleColor}
                            onChange={(e) => setUserBubbleColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={userBubbleColor}
                            onChange={(e) => setUserBubbleColor(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="aiBubbleColor">AI Bubble</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="aiBubbleColor"
                            name="aiBubbleColor"
                            value={aiBubbleColor}
                            onChange={(e) => setAiBubbleColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={aiBubbleColor}
                            onChange={(e) => setAiBubbleColor(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="headingColor">Heading</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="headingColor"
                            name="headingColor"
                            value={headingColor}
                            onChange={(e) => setHeadingColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={headingColor}
                            onChange={(e) => setHeadingColor(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">Dimensions & Style</h2>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between">
                          <Label htmlFor="chatWidth">Width: {chatWidth}px</Label>
                        </div>
                        <Slider
                          id="chatWidth"
                          name="chatWidth"
                          value={[chatWidth]}
                          min={300}
                          max={800}
                          step={10}
                          onValueChange={(value) => setChatWidth(value[0])}
                          className="py-4"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <Label htmlFor="chatHeight">Height: {chatHeight}px</Label>
                        </div>
                        <Slider
                          id="chatHeight"
                          name="chatHeight"
                          value={[chatHeight]}
                          min={400}
                          max={1000}
                          step={10}
                          onValueChange={(value) => setChatHeight(value[0])}
                          className="py-4"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <Label htmlFor="chatBorderRadius">Border Radius: {chatBorderRadius}px</Label>
                        </div>
                        <Slider
                          id="chatBorderRadius"
                          name="chatBorderRadius"
                          value={[chatBorderRadius]}
                          min={0}
                          max={50}
                          step={1}
                          onValueChange={(value) => setChatBorderRadius(value[0])}
                          className="py-4"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <Label htmlFor="chatOpacity">Opacity: {chatOpacity.toFixed(1)}</Label>
                        </div>
                        <Slider
                          id="chatOpacity"
                          name="chatOpacity"
                          value={[chatOpacity]}
                          min={0.1}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setChatOpacity(value[0])}
                          className="py-4"
                        />
                      </div>

                      <div>
                        <Label htmlFor="customLogo">Logo</Label>
                        <Input
                          id="customLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="bg-gray-700 border-gray-600"
                        />
                        {customLogo && (
                          <div className="mt-2">
                            <img
                              src={customLogo || "/placeholder.svg"}
                              alt="Logo"
                              className="w-16 h-16 rounded object-contain bg-white p-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">User Interaction</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showEmailCapture">Email Capture</Label>
                        <Switch
                          id="showEmailCapture"
                          checked={showEmailCapture}
                          onCheckedChange={setShowEmailCapture}
                        />
                      </div>

                      {showEmailCapture && (
                        <div>
                          <Label htmlFor="emailPlaceholder">Email Placeholder</Label>
                          <Input
                            id="emailPlaceholder"
                            name="emailPlaceholder"
                            value={emailPlaceholder}
                            onChange={(e) => setEmailPlaceholder(e.target.value)}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Label htmlFor="useRag">Use RAG (Retrieval Augmented Generation)</Label>
                        <Switch id="useRag" checked={useRag} onCheckedChange={setUseRag} />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Replies</h2>
                    <div className="space-y-4">
                      {quickReplies.map((reply, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input
                              value={reply.text}
                              onChange={(e) => updateQuickReply(index, "text", e.target.value)}
                              className="bg-gray-700 border-gray-600"
                              placeholder="Button text"
                            />
                            <Input
                              value={reply.action}
                              onChange={(e) => updateQuickReply(index, "action", e.target.value)}
                              className="bg-gray-700 border-gray-600"
                              placeholder="Message to send"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeQuickReply(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button type="button" variant="outline" onClick={addQuickReply} className="w-full">
                        <Plus className="h-4 w-4 mr-2" /> Add Quick Reply
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-4">
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-300">
                        Upload documents to train your chatbot. The content will be processed and made available for the
                        chatbot to reference when answering questions.
                      </p>

                      <div className="bg-gray-700 border border-gray-600 rounded-md p-4">
                        <h3 className="text-md font-medium mb-2">Upload Documents</h3>
                        <p className="text-sm text-gray-300 mb-4">Supported formats: PDF (max 10MB)</p>

                        <Input type="file" name="document" accept=".pdf" className="bg-gray-600 border-gray-500" />

                        <Button
                          type="submit"
                          formAction={`/chatbot/${chatbot.id}/customize?index`}
                          className="mt-4"
                          name="actionType"
                          value="uploadDocuments"
                        >
                          Upload & Process
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
              <div className="flex justify-center">
                <ChatbotPreview settings={previewSettings} messages={chatbot.conversations[0]?.messages ?? []} />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
              <p className="text-sm text-gray-300 mb-4">
                Copy and paste this code snippet into your website to integrate your chatbot. The script will
                automatically create a chat widget on your page.
              </p>

              <CodeSnippet chatbotId={chatbot.id} settings={previewSettings} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

