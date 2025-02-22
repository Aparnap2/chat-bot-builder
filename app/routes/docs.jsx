import React from "react";
import ReactMarkdown from "react-markdown";

const DocumentationPage = () => {
  const md = `
# Custom Chatbot Documentation

## Overview
This guide provides instructions for integrating and customizing our chatbot.

## Installation
\`\`\`bash
npm install custom-chatbot
\`\`\`

## JavaScript Integration
\`\`\`javascript
import { CustomChatbot } from 'custom-chatbot';

const bot = new CustomChatbot({
  botName: 'SupportBot',
  apiUrl: 'https://api.yourdomain.com',
  options: {
    brandColor: '#10B981',
    togglerSize: 56,
    initialMessage: 'Welcome! How can I assist you?'
  }
});

bot.init();
\`\`\`

## React Integration
\`\`\`jsx
import { CustomChatWidget } from 'custom-chatbot';

const App = () => (
  <CustomChatWidget
    botName="SupportBot"
    apiUrl="https://api.yourdomain.com"
    brandColor="#10B981"
    togglerSize={56}
    quickReplies={[{ text: 'Help', action: 'showHelp' }]}
  />
);
\`\`\`

## API Endpoints
| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | /api/chatbots          | List all chatbots                   |
| POST   | /api/chatbots          | Create a new chatbot                |
| GET    | /api/chatbots/{id}     | Get chatbot details                 |
| PUT    | /api/chatbots/{id}     | Update chatbot settings             |
| DELETE | /api/chatbots/{id}     | Delete a chatbot                    |

## Advanced Configuration
- **Custom Styling:**
  \`\`\`json
  {
    "chatWidth": 400,
    "chatHeight": 600,
    "fontFamily": "Arial"
  }
  \`\`\`
- **Event Handlers:**
  \`\`\`javascript
  bot.on('message', (msg) => console.log('New message:', msg));
  \`\`\`

## Support
Visit [Support Page](https://support.yourdomain.com) for help.
  `;

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-8">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-headings:text-primary prose-a:text-secondary">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-3xl font-semibold my-5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-2xl font-medium my-4">{children}</h3>,
              p: ({ children }) => <p className="my-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 my-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 my-3">{children}</ol>,
              a: ({ children, href }) => (
                <a className="text-secondary hover:underline" href={href}>
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto">
                  <table className="table w-full">{children}</table>
                </div>
              ),
              tr: ({ children }) => <tr className="border-b border-base-300">{children}</tr>,
              th: ({ children }) => <th className="py-2 px-4 text-left">{children}</th>,
              td: ({ children }) => <td className="py-2 px-4">{children}</td>,
              code({ node, inline, className, children, ...props }) {
                return (
                  <pre className="bg-neutral p-4 rounded-lg overflow-x-auto">
                    <code className="text-neutral-content">{children}</code>
                  </pre>
                );
              },
            }}
          >
            {md}
          </ReactMarkdown>
        </div>
        <div className="mt-8 flex space-x-4">
          <button className="btn btn-primary" onClick={() => {}}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;