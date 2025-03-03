import { Prisma } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string | null;
}
export interface ChatSettings {
  chatbotName: string | number | readonly string[] | undefined;
  id?: string; // Optional, not used in create
  chatbotId?: string; // Optional, not used in create
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo?: string | null;
  chatWidth: number;
  chatHeight: number;
  chatOffsetX: number;
  chatOffsetY: number;
  chatIcon?: string;
  quickReplies: { text: string; action: string }[] | null;
  welcomeMessage?: string;
  chatTitle?: string;
  
  // Added missing types
  showEmailCapture: boolean;
  emailPlaceholder: string;
  userBubbleColor: string;
  aiBubbleColor: string;
  headingColor: string;
}


export interface EmbedCode {
  react: string;
  vanillaJs: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date | string;
}

export interface AnalyticsData {
  date: string;
  messages: number;
  total_messages: number;
  total_conversations: number;
  usage: Array<{ date: string; messages: number }>;
}

export interface RateLimiterResponse {
  success: boolean;
  remaining: number;
}

export interface Chatbot {
  id: string;
  name: string;
  connectionString: string;
  userId: string;
  createdAt: Date;
  settings: ChatSettings | null;
  conversations: Array<{
    id: string;
    messages: Message[];
  }>;
  prompts: Prompt[];
}

export interface Prompt {
  id: string;
  chatbotId: string;
  trigger: string;
  response: string;
  createdAt: Date;
}