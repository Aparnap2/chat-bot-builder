// components/PromptSuggestions.tsx
export const PromptSuggestions = () => {
    const suggestions = [
      "How do I reset my password?",
      "What's your return policy?",
      "Where are you located?"
    ]
  
    function handleSuggestionClick(text: string): void {
        throw new Error("Function not implemented.")
    }

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {suggestions.map((text, i) => (
          <button
            key={i}
            className="btn btn-xs btn-outline"
            onClick={() => handleSuggestionClick(text)}
          >
            {text}
          </button>
        ))}
      </div>
    )
  }