// app/types/types.ts
import { Prisma } from "@prisma/client";

export interface ChatSettings {
  id?: string;
  chatbotId: string;
  brandColor: string;
  chatBackground: string;
  chatOpacity: number;
  chatBorderRadius: number;
  customLogo?: string | null;
  chatWidth: number;
  chatHeight: number;
  showEmailCapture: boolean;
  emailPlaceholder: string;
  quickReplies: Array<{ text: string; action: string }>;
  userBubbleColor: string;
  aiBubbleColor: string;
  headingColor: string;
}

// Define a type for Prisma input
export type ChatSettingsCreateInput = Omit<ChatSettings, "id"> & {
  quickReplies: Prisma.JsonValue; // Prisma expects JsonValue for JSON fields
};
interface ChatbotWithEmbed {
  id: string;
  name: string;
  connectionString: string;
  createdAt: string;
  settings: ChatSettings | null;
  embed: EmbedCode;
}export interface User {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}


export interface EmbedCode {
  react: string;
  vanillaJs: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system"; // Add "system"
  createdAt: Date | string;
}

export interface AnalyticsData {
  date: any;
  messages: any;
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
}