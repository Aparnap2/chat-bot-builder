// types.ts
export interface ChatSettings {
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
  export interface ChatMessage {
    content: string;
    isUser: boolean;
    timestamp: Date;
  }
  
  export interface QuickReply {
    text: string;
    action?: string;
  }