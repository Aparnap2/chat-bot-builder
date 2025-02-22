// app/components/PromptEditor.tsx
import { useState } from "react";
import toast from "react-hot-toast";

const PromptEditor = () => {
  const [prompts, setPrompts] = useState([{ trigger: "", response: "" }]);
  const [suggestions] = useState([
    { trigger: "greeting", response: "Hello! How can I help you today?" },
    { trigger: "farewell", response: "Goodbye! Have a great day!" }
  ]);

  const addPrompt = () => {
    setPrompts([...prompts, { trigger: "", response: "" }]);
  };

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handlePromptSave = () => {
    if (prompts.some(p => !p.trigger.trim() || !p.response.trim())) {
      toast.error('All prompts require both trigger and response');
      return;
    }
    toast.success('Prompts saved successfully');
  };

  return (
    <div className="card bg-base-200 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">Prompt Engineering</h3>
      
      <div className="grid gap-4">
        {prompts.map((prompt, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Trigger"
              value={prompt.trigger}
              onChange={(e) => setPrompts(
                prompts.map((p, i) => 
                  i === index ? { ...p, trigger: e.target.value } : p
                )
              )}
              className="input input-bordered flex-1"
            />
            <input
              type="text"
              placeholder="Response"
              value={prompt.response}
              onChange={(e) => setPrompts(
                prompts.map((p, i) => 
                  i === index ? { ...p, response: e.target.value } : p
                )
              )}
              className="input input-bordered flex-1"
            />
            <button 
              onClick={() => removePrompt(index)}
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
        <button onClick={handlePromptSave} className="btn btn-success">
          Save Prompts
        </button>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">Suggestions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="card bg-base-100 p-2 cursor-pointer"
              onClick={() => setPrompts([...prompts, suggestion])}
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