// useChatSettings.ts
import { useState } from "react";

export const useChatSettings = () => {
  const [brandColor, setBrandColor] = useState("#10B981");
  const [chatBackground, setChatBackground] = useState("#1A1A1A");
  const [chatOpacity, setChatOpacity] = useState(95);
  const [chatBorderRadius, setChatBorderRadius] = useState(16);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [chatWidth, setChatWidth] = useState<number>(300);
  const [chatHeight, setChatHeight] = useState<number>(450);
  const [showEmailCapture, setShowEmailCapture] = useState<boolean>(false);
  const [emailPlaceholder, setEmailPlaceholder] = useState<string>("Enter your email");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  return {
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
  };
};