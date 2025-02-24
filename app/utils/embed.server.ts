import { ChatSettings, EmbedCode } from "~/types/types";

export function generateEmbedCode(settings: ChatSettings, connectionString: string, name: string): EmbedCode {
  const {
    brandColor, customLogo, chatWidth, chatHeight, chatBackground,
    chatOpacity, chatBorderRadius, userBubbleColor, aiBubbleColor, headingColor,
    quickReplies,
  } = settings;

  const reactCode = `
import React from 'react';
import { ChatbotWidget } from 'chatbot-sdk';

export const Chatbot = () => (
  <ChatbotWidget
    connectionString="${connectionString}"
    brandColor="${brandColor}"
    ${customLogo ? `customLogo="${customLogo}"` : ""}
    chatWidth={${chatWidth}}
    chatHeight={${chatHeight}}
    chatBackground="${chatBackground}"
    chatOpacity={${chatOpacity}}
    chatBorderRadius={${chatBorderRadius}}
    userBubbleColor="${userBubbleColor}"
    aiBubbleColor="${aiBubbleColor}"
    headingColor="${headingColor}"
    quickReplies={${JSON.stringify(quickReplies)}}
  />
);
`.trim();

  const vanillaJsCode = `
<script src="https://yourdomain.com/chatbot.js"></script>
<div id="chatbot-container"></div>
<script>
  const chatbot = new Chatbot({
    connectionString: "${connectionString}",
    brandColor: "${brandColor}",
    ${customLogo ? `customLogo: "${customLogo}",` : ""}
    chatWidth: ${chatWidth},
    chatHeight: ${chatHeight},
    chatBackground: "${chatBackground}",
    chatOpacity: ${chatOpacity},
    chatBorderRadius: ${chatBorderRadius},
    userBubbleColor: "${userBubbleColor}",
    aiBubbleColor: "${aiBubbleColor}",
    headingColor: "${headingColor}",
    quickReplies: ${JSON.stringify(quickReplies)}
  });
  chatbot.init("chatbot-container");
</script>
`.trim();

  return { react: reactCode, vanillaJs: reactCode };
}