import { useState } from "react";
import { Navbar } from "../components/layout/navbar";
import {
  Palette, MessageSquare, Code, FileText, Upload, Plus, Trash2, Send
  ,

  MessageCircle, X
} from "lucide-react";
const CustomizationPanel = () => {
  const [activeTab, setActiveTab] = useState("branding");
  const [brandColor, setBrandColor] = useState("#10B981");
  const [botName, setBotName] = useState("AI Assistant");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [customPrompt, setCustomPrompt] = useState("");
  const [staticResponses, setStaticResponses] = useState([{ trigger: "", response: "" }]);
  const [files, setFiles] = useState<File[]>([]);
  const [togglerIcon, setTogglerIcon] = useState("MessageCircle");
  const [togglerSize, setTogglerSize] = useState("56");
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewChat, setPreviewChat] = useState<Array<{ role: 'user' | 'bot', content: string }>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const addStaticResponse = () => {
    setStaticResponses([...staticResponses, { trigger: "", response: "" }]);
  };

  const removeStaticResponse = (index: number) => {
    setStaticResponses(staticResponses.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handlePreviewSend = () => {
    if (!previewMessage.trim()) return;

    setPreviewChat([
      ...previewChat,
      { role: 'user', content: previewMessage },
      { role: 'bot', content: "This is a preview response. Your actual bot will use your configured responses and AI model." }
    ]);
    setPreviewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-
4 sm:p-
8 rounded-2xl">
            <h1 className="text-
2xl sm:text-
3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-8">    Customize Your Chatbot
            </h1>

            {/* Custom Tabs */}
            <div className="flex flex-wrap gap-2 p-1 mb-6 bg-gray-800/50 rounded-lg
 overflow-x-auto
">
              {[
                { id: "branding", icon: <Palette className="w-4 h-4" />, label: "Branding" },
                { id: "responses", icon: <MessageSquare className="w-4 h-4" />, label: "Static Responses" },
                { id: "prompts", icon: <Code className="w-4 h-4" />, label: "Prompt Engineering" },
                { id: "docs", icon: <FileText className="w-4 h-4" />, label: "Documentation" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-
                    3
                     py-2 rounded-lg transition-colors 
                    whitespace-nowrap text-sm sm:text-base 
                     ${activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/50"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Branding Tab */}
              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">Bot Name</label>
                    <input
                      type="text"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="Enter your bot's name"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">Brand Color</label>
                    <div className="flex gap-4">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-10 w-20 p-1 bg-black/30 border border-white/10 rounded-lg"
                      />
                      <input
                        type="text"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#HEX"
                        className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">Toggler Icon Size (px)</label>
                    <input
                      type="number"
                      value={togglerSize}
                      onChange={(e) => setTogglerSize(e.target.value)}
                      min="32"
                      max="80"
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              )}

              {/* Static Responses Tab */}
              {activeTab === "responses" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">Welcome Message</label>
                    <textarea
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Enter your welcome message"
                      className="w-full h-24 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-200">Static Responses</label>
                    {staticResponses.map((response, index) => (
                      <div key={index} className="glass-card p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-4">
                          <input
                            placeholder="When user says..."
                            value={response.trigger}
                            onChange={(e) => {
                              const newResponses = [...staticResponses];
                              newResponses[index].trigger = e.target.value;
                              setStaticResponses(newResponses);
                            }}
                            className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <input
                            placeholder="Bot responds with..."
                            value={response.response}
                            onChange={(e) => {
                              const newResponses = [...staticResponses];
                              newResponses[index].response = e.target.value;
                              setStaticResponses(newResponses);
                            }}
                            className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button
                            onClick={() => removeStaticResponse(index)}
                            className="text-red-500 hover:text-red-400 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addStaticResponse}
                      className="flex items-center gap-2 text-primary hover:text-primary-hover"
                    >
                      <Plus className="w-4 h-4" /> Add Response
                    </button>
                  </div>
                </div>
              )}

              {/* Prompt Engineering Tab */}
              {activeTab === "prompts" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">System Prompt</label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom system prompt"
                      className="w-full h-48 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <h3 className="text-lg font-medium text-white">Prompt Engineering Tips</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Be specific and clear with instructions</li>
                      <li>Include examples of desired output format</li>
                      <li>Define the tone and personality</li>
                      <li>Set clear boundaries and limitations</li>
                      <li>Use context and memory efficiently</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Documentation Tab */}
              {activeTab === "docs" && (
                <div className="space-y-6">
                  <div
                    onClick={() => document.getElementById("fileInput")?.click()}
                    className="glass-card p-8 rounded-xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">
                      Drop your documentation files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOCX, TXT, MD (max 10MB)
                    </p>
                    <input
                      id="fileInput"
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="glass-card p-4 rounded-xl">
                      <h3 className="text-lg font-medium text-white mb-4">Uploaded Files</h3>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">{file.name}</span>
                              <span className="text-gray-500 text-sm">
                                ({Math.round(file.size / 1024)}KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
            <button
 className="neo-brutalism px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover">
                Save Changes
              </button>
            </div>
          </div>

            {/* Live Preview - Now shows as a floating chat window */}
            <div className="hidden lg:block glass-card p-8 rounded-2xl h-[800px]">
            <h2 className="text-xl font-semibold text-white mb-4">Desktop Preview</h2>
            <div className="relative w-full h-full bg-gray-900/50 rounded-xl p-4">
              {/* Preview of the toggle button */}
              <div 
                className="absolute bottom-4 right-4 cursor-pointer transform transition-transform hover:scale-105"
                style={{ backgroundColor: brandColor }}
              >
                <MessageCircle size={Number(togglerSize)} className="text-white p-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Preview (Mobile & Desktop) */}
      <div className={`fixed ${isChatOpen ? 'inset-0 lg:inset-auto lg:bottom-4 lg:right-4' : 'bottom-4 right-4'} z-50 transition-all duration-300`}>
        {isChatOpen ? (
          <div className={`
            glass-card 
            ${isChatOpen ? 'w-full h-full lg:w-96 lg:h-[600px]' : 'w-auto h-auto'} 
            flex flex-col
            rounded-none lg:rounded-2xl
            overflow-hidden
          `}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColor }} />
                <h2 className="text-xl font-semibold text-white">{botName}</h2>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  AI
                </div>
                <div className="glass-card p-3 rounded-xl max-w-[80%]">
                  <p className="text-white">{welcomeMessage}</p>
                </div>
              </div>

              {previewChat.map((message, index) => (
                <div key={index} className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                      AI
                    </div>
                  )}
                  <div className={`glass-card p-3 rounded-xl max-w-[80%] ${
                    message.role === 'user' ? 'bg-primary text-white' : ''
                  }`}>
                    <p className="text-white">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      You
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewMessage}
                  onChange={(e) => setPreviewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePreviewSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handlePreviewSend}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="rounded-full shadow-lg transform transition-transform hover:scale-105 flex items-center justify-center"
            style={{ 
              backgroundColor: brandColor,
              width: `${togglerSize}px`,
              height: `${togglerSize}px`
            }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomizationPanel;