// CustomizationPanel.tsx
import { useState } from "react";
import {Navbar} from "../components/layout/navbar";
import Tab from "../components/tab";
import ChatPreview from "../components/chatPreview";
import PromptEditor from "../components/PromptEditor";
import DocumentUploader from "../components/DocumentUploader";
import { useChatSettings } from "../hooks/usechatSettings";
import {
  Palette,
  Layout,
  Layers,
  Code,
  FileText,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";

const CustomizationPanel = () => {
  const [activeTab, setActiveTab] = useState("branding");

  const {
    brandColor,
    setBrandColor,
    chatBackground,
    setChatBackground,
    chatOpacity,
    setChatOpacity,
    chatBorderRadius,
    setChatBorderRadius,
    customLogo,
    setCustomLogo,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    chatWidth,
    setChatWidth,
    chatHeight,
    setChatHeight,
    showEmailCapture,
    setShowEmailCapture,
    emailPlaceholder,
    setEmailPlaceholder,
    quickReplies,
    setQuickReplies,
  } = useChatSettings() as unknown as {
    brandColor: string;
    setBrandColor: (color: string) => void;
    chatBackground: string;
    setChatBackground: (background: string) => void;
    chatOpacity: number;
    setChatOpacity: (opacity: number) => void;
    chatBorderRadius: number;
    setChatBorderRadius: (radius: number) => void;
    customLogo: string;
    setCustomLogo: (logo: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    fontFamily: string;
    setFontFamily: (family: string) => void;
    chatWidth: number;
    setChatWidth: (width: number) => void;
    chatHeight: number;
    setChatHeight: (height: number) => void;
    showEmailCapture: boolean;
    setShowEmailCapture: (show: boolean) => void;
    emailPlaceholder: string;
    setEmailPlaceholder: (placeholder: string) => void;
    quickReplies: Array<{ text: string; action: string }>;
    setQuickReplies: (replies: Array<{ text: string; action: string }>) => void;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuickReply = () => {
    setQuickReplies([...quickReplies, { text: '', action: '' }]);
  };

  const removeQuickReply = (index: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Customize Your Chatbot</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <Tab
            id="branding"
            label="Branding"
            icon={<Palette />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Tab
            id="layout"
            label="Layout"
            icon={<Layout />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Tab
            id="theme"
            label="Theme"
            icon={<Layers />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Tab
            id="prompt-engineering"
            label="Prompt Engineering"
            icon={<Code />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Tab
            id="document-upload"
            label="Document Upload"
            icon={<FileText />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Tab
            id="actions"
            label="Actions"
            icon={<Mail />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "branding" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Bot Name</label>
              <input
                type="text"
                defaultValue="AI Assistant"
                className="w-full md:w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Brand Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Logo</label>
              <div
                onClick={() => document.getElementById("logoInput")?.click()}
                className="w-full h-32 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/20"
              >
                {customLogo ? (
                  <img src={customLogo} alt="Custom Logo" className="max-h-full max-w-full" />
                ) : (
                  <p className="text-gray-400">Upload Logo</p>
                )}
              </div>
              <input
                type="file"
                id="logoInput"
                style={{ display: "none" }}
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Chat Width (px)</label>
              <input
                type="number"
                value={chatWidth}
                onChange={(e) => setChatWidth(Number(e.target.value))}
                className="w-full md:w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Chat Height (px)</label>
              <input
                type="number"
                value={chatHeight}
                onChange={(e) => setChatHeight(Number(e.target.value))}
                className="w-full md:w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Font Size (px)</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full md:w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <label className="block text-white text-sm font-medium mb-2">Font Family</label>
              <input
                type="text"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="block text-white text-sm font-medium mr-4">Email Capture</label>
              <div
                onClick={() => setShowEmailCapture(!showEmailCapture)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  showEmailCapture ? "bg-primary" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    showEmailCapture ? "translate-x-4" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
            {showEmailCapture && (
              <input
                type="text"
                value={emailPlaceholder}
                onChange={(e) => setEmailPlaceholder(e.target.value)}
                placeholder="Email input placeholder"
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white mt-2"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Quick Reply Buttons</h3>
              {quickReplies.map((reply, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={reply.text}
                    onChange={(e) => {
                      const newReplies = [...quickReplies];
                      newReplies[index].text = e.target.value;
                      setQuickReplies(newReplies);
                    }}
                    className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                    placeholder="Button text"
                  />
                  <button
                    onClick={() => removeQuickReply(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
              <button
                onClick={addQuickReply}
                className="text-primary hover:text-primary/80"
              >
                Add Quick Reply
              </button>
            </div>
          </div>
        )}

        {activeTab === "prompt-engineering" && (
          <PromptEditor />
        )}

        {activeTab === "document-upload" && (
          <DocumentUploader />
        )}

        {/* Live Preview */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Preview</h2>
          <ChatPreview
            brandColor={brandColor}
            chatBackground={chatBackground}
            chatOpacity={chatOpacity}
            chatBorderRadius={chatBorderRadius}
            customLogo={customLogo}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;