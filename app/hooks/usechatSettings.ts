import { useState, useEffect } from "react";

interface ChatSettings {
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo?: string;
  fontSize: number;
  fontFamily: string;
  chatWidth: number;
  chatHeight: number;
  showEmailCapture: boolean;
  emailPlaceholder: string;
  quickReplies: Array<{ text: string; action: string }>;
  capturedEmail?: string;
}

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(() => {
    // Load initial settings from localStorage or defaults
    const saved = localStorage.getItem("chatSettings");
    return saved
      ? JSON.parse(saved)
      : {
          brandColor: "#2563eb",
          chatBackground: "#ffffff",
          chatOpacity: 1.0,
          chatBorderRadius: 8,
          customLogo: undefined,
          fontSize: 16,
          fontFamily: "Inter",
          chatWidth: 400,
          chatHeight: 600,
          showEmailCapture: false,
          emailPlaceholder: "Enter your email...",
          quickReplies: [],
          capturedEmail: undefined,
        };
  });

  useEffect(() => {
    // Persist settings to localStorage
    localStorage.setItem("chatSettings", JSON.stringify(settings));
  }, [settings]);

  return {
    brandColor: settings.brandColor,
    setBrandColor: (value: string) => setSettings((prev) => ({ ...prev, brandColor: value })),
    chatBackground: settings.chatBackground,
    setChatBackground: (value: string) => setSettings((prev) => ({ ...prev, chatBackground: value })),
    chatOpacity: settings.chatOpacity,
    setChatOpacity: (value: number) => setSettings((prev) => ({ ...prev, chatOpacity: value })),
    chatBorderRadius: settings.chatBorderRadius,
    setChatBorderRadius: (value: number) => setSettings((prev) => ({ ...prev, chatBorderRadius: value })),
    customLogo: settings.customLogo,
    setCustomLogo: (value?: string) => setSettings((prev) => ({ ...prev, customLogo: value })),
    fontSize: settings.fontSize,
    setFontSize: (value: number) => setSettings((prev) => ({ ...prev, fontSize: value })),
    fontFamily: settings.fontFamily,
    setFontFamily: (value: string) => setSettings((prev) => ({ ...prev, fontFamily: value })),
    chatWidth: settings.chatWidth,
    setChatWidth: (value: number) => setSettings((prev) => ({ ...prev, chatWidth: value })),
    chatHeight: settings.chatHeight,
    setChatHeight: (value: number) => setSettings((prev) => ({ ...prev, chatHeight: value })),
    showEmailCapture: settings.showEmailCapture,
    setShowEmailCapture: (value: boolean) => setSettings((prev) => ({ ...prev, showEmailCapture: value })),
    emailPlaceholder: settings.emailPlaceholder,
    setEmailPlaceholder: (value: string) => setSettings((prev) => ({ ...prev, emailPlaceholder: value })),
    quickReplies: settings.quickReplies,
    setQuickReplies: (value: Array<{ text: string; action: string }>) =>
      setSettings((prev) => ({ ...prev, quickReplies: value })),
    capturedEmail: settings.capturedEmail,
    setCapturedEmail: (value?: string) => setSettings((prev) => ({ ...prev, capturedEmail: value })),
  };
}