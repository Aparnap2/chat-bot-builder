import { useState } from "react";
import toast from "react-hot-toast";
import { Prompt } from "~/types/types";

const PromptEditor = ({ prompts: initialPrompts, onSave }: { prompts: Prompt[]; onSave: (prompts: Prompt[]) => void }) => {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts || [{ id: crypto.randomUUID(), trigger: "", response: "", createdAt: new Date() }]);
  const [suggestions] = useState([
    { trigger: "greeting", response: "Hello! How can I help you today?" },
    { trigger: "farewell", response: "Goodbye! Have a great day!" },
  ]);

  const addPrompt = () => {
    setPrompts([...prompts, {
      id: crypto.randomUUID(), trigger: "", response: "", createdAt: new Date(),
      chatbotId: ""
    }]);
  };

  const removePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const handlePromptChange = (id: string, field: "trigger" | "response", value: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    if (prompts.some(p => !p.trigger.trim() || !p.response.trim())) {
      toast.error('All prompts require both trigger and response');
      return;
    }
    onSave(prompts);
    toast.success('Prompts saved successfully');
  };

  return (
    <div className="card bg-base-200 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">Prompt Engineering</h3>
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Trigger"
              value={prompt.trigger}
              onChange={(e) => handlePromptChange(prompt.id, "trigger", e.target.value)}
              className="input input-bordered flex-1"
            />
            <input
              type="text"
              placeholder="Response"
              value={prompt.response}
              onChange={(e) => handlePromptChange(prompt.id, "response", e.target.value)}
              className="input input-bordered flex-1"
            />
            <button 
              onClick={() => removePrompt(prompt.id)}
              className="btn btn-circle btn-error btn-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={addPrompt} className="btn btn-primary">
          Add Prompt
        </button>
        <button onClick={handleSave} className="btn btn-success">
          Save Prompts
        </button>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">Suggestions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="card bg-base-100 p-2 cursor-pointer neo-brutalism"
              onClick={() => setPrompts([...prompts, {
                ...suggestion, id: crypto.randomUUID(), createdAt: new Date(),
                chatbotId: ""
              }])}
            >
              <div className="font-medium">{suggestion.trigger}</div>
              <div className="text-sm opacity-75">{suggestion.response}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;