import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
//import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DocumentationPage = () => {
  const docsMarkdown = `
# Custom Chatbot Documentation

Welcome to the **Custom Chatbot** documentation. This guide will help you integrate and use our custom chatbot, complete with API integration and code snippets in various languages.

---

## JavaScript Example

\`\`\`javascript
// Import the chatbot library
import { CustomChatbot } from 'custom-chatbot';

// Initialize the chatbot with configuration
const bot = new CustomChatbot({
  botName: 'AI Assistant',
  apiUrl: 'https://your-api.com',
  options: {
    brandColor: '#10B981',
    togglerSize: 56
  }
});

// Start the chatbot
bot.init();
\`\`\`

---

## Python Example

\`\`\`python
# Import the required module
from custom_chatbot import CustomChatbot

# Create an instance of the chatbot
bot = CustomChatbot(
    bot_name="AI Assistant",
    api_url="https://your-api.com",
    brand_color="#10B981"
)

# Start listening for messages
bot.start()
\`\`\`

---

## React Example

\`\`\`jsx
import React from 'react';
import { CustomChatWidget } from 'custom-chatbot';

const ChatComponent = () => (
  <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
    <CustomChatWidget 
      botName="AI Assistant" 
      apiUrl="https://your-api.com" 
      brandColor="#10B981" 
      togglerSize={56}
    />
  </div>
);

export default ChatComponent;
\`\`\`

---

## API Usage

Our Chatbot API offers the following endpoints:

- **GET /api/chatbots**: Retrieve a list of chatbots.
- **POST /api/chatbots**: Create a new chatbot.
- **GET /api/chatbots/{id}**: Retrieve details of a specific chatbot.
- **PUT /api/chatbots/{id}**: Update the configuration of a chatbot.
- **DELETE /api/chatbots/{id}**: Remove a chatbot.

For complete details, refer to the [API Reference Documentation](https://your-api-docs.com).

---

## Configuration Options

Customize your chatbot using the following options:

- **botName**: The display name of your chatbot.
- **brandColor**: The primary color used in the chatbot interface.
- **togglerSize**: The size of the chat toggle button.

---

## Getting Started

1. **Install the Package:**

\`\`\`bash
npm install custom-chatbot
\`\`\`

2. **Configure the Chatbot** by following one of the code examples above.

3. **Integrate the API** using the provided endpoints for advanced customizations.

---

For further information or support, please visit our [Support Page](https://your-support-page.com).
  `;

  // Custom renderer for code blocks using the Dracula theme
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          //style={dark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <ReactMarkdown components={components}>
          {docsMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default DocumentationPage;