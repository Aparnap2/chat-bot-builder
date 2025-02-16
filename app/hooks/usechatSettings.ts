import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatSettings {
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo: string;
  fontSize: number;
  fontFamily: string;
  chatWidth: number;
  chatHeight: number;
  showEmailCapture: boolean;
  emailPlaceholder: string;
  quickReplies: Array<{ text: string; action: string }>;
}

interface ChatSettingsStore extends ChatSettings {
  setBrandColor: (color: string) => void;
  setChatBackground: (background: string) => void;
  setChatOpacity: (opacity: number) => void;
  setChatBorderRadius: (radius: number) => void;
  setCustomLogo: (logo: string) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setChatWidth: (width: number) => void;
  setChatHeight: (height: number) => void;
  setShowEmailCapture: (show: boolean) => void;
  setEmailPlaceholder: (placeholder: string) => void;
  setQuickReplies: (replies: Array<{ text: string; action: string }>) => void;
}

export const useChatSettings = create<ChatSettingsStore>()(
  persist(
    (set) => ({
      brandColor: "#007AFF",
      chatBackground: "#ffffff",
      chatOpacity: 1,
      chatBorderRadius: 8,
      customLogo: "",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      chatWidth: 360,
      chatHeight: 600,
      showEmailCapture: false,
      emailPlaceholder: "Enter your email",
      quickReplies: [],
      setBrandColor: (color) => set(() => ({ brandColor: color })),
      setChatBackground: (background) => set(() => ({ chatBackground: background })),
      setChatOpacity: (opacity) => set(() => ({ chatOpacity: opacity })),
      setChatBorderRadius: (radius) => set(() => ({ chatBorderRadius: radius })),
      setCustomLogo: (logo) => set(() => ({ customLogo: logo })),
      setFontSize: (size) => set(() => ({ fontSize: size })),
      setFontFamily: (family) => set(() => ({ fontFamily: family })),
      setChatWidth: (width) => set(() => ({ chatWidth: width })),
      setChatHeight: (height) => set(() => ({ chatHeight: height })),
      setShowEmailCapture: (show) => set(() => ({ showEmailCapture: show })),
      setEmailPlaceholder: (placeholder) => set(() => ({ emailPlaceholder: placeholder })),
      setQuickReplies: (replies) => set(() => ({ quickReplies: replies })),
    }),
    {
      name: "chat-settings",
    }
  )
);
