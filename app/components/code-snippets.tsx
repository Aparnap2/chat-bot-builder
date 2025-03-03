interface CodeSnippetProps {
    chatbotId: string
    settings: {
      brandColor: string
      chatWidth: number
      chatHeight: number
    }
  }
  
  export function CodeSnippet({ chatbotId, settings }: CodeSnippetProps) {
    const scriptCode = `<script>
    (function() {
      const script = document.createElement('script');
      script.src = 'https://yourdomain.com/chatbot-widget.js';
      script.async = true;
      script.dataset.chatbotId = '${chatbotId}';
      script.dataset.brandColor = '${settings.brandColor}';
      script.dataset.chatWidth = '${settings.chatWidth}';
      script.dataset.chatHeight = '${settings.chatHeight}';
      document.head.appendChild(script);
    })();
  </script>`
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(scriptCode)
      alert("Code copied to clipboard!")
    }
  
    return (
      <div className="relative">
        <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-gray-300">
          <code>{scriptCode}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
        >
          Copy
        </button>
      </div>
    )
  }
  
  