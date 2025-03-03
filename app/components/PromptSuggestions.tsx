import { useCallback } from "react";
import { Prompt } from "~/types/types";

interface PromptSuggestionsProps {
  onSelect: (prompt: Prompt) => void;
}

export const PromptSuggestions = ({ onSelect }: PromptSuggestionsProps) => {
  const suggestions = [
    { trigger: "How do I reset my password?", response: "You can reset your password by visiting our password reset page.", createdAt: new Date() },
    { trigger: "What’s your return policy?", response: "Our return policy allows returns within 30 days with original packaging.", createdAt: new Date() },
    { trigger: "Where are you located?", response: "We’re located at 123 Tech Street, Silicon Valley, CA.", createdAt: new Date() },
  ];

  const handleSuggestionClick = useCallback((suggestion: Prompt) => {
    onSelect({ ...suggestion, id: crypto.randomUUID() });
  }, [onSelect]);

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          className="btn btn-xs btn-outline neo-brutalism hover:scale-105"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          {suggestion.trigger}
        </button>
      ))}
    </div>
  );
};