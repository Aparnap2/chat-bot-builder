// app/utils/embed.server.ts
import { ChatSettings, EmbedCode } from "~/types/types";

export function generateEmbedCode(settings: ChatSettings, connectionString: string): EmbedCode {
  const { brandColor, customLogo, chatWidth, chatHeight } = settings;

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
    chatHeight: ${chatHeight}
  });
  chatbot.init("chatbot-container");
</script>
`.trim();

  return { react: reactCode, vanillaJs: vanillaJsCode };
}