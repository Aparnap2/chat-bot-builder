// PromptEditor.tsx
import { useState } from "react";
import toast from "react-hot-toast";

const PromptEditor = () => {
  const [prompts, setPrompts] = useState([{ trigger: "", response: "" }]);

  const addPrompt = () => {
    setPrompts([...prompts, { trigger: "", response: "" }]);
  };

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };
  // Added input validation and save feedback
const handlePromptSave = () => {
  if (prompts.some(p => !p.trigger.trim() || !p.response.trim())) {
    toast.error('All prompts require both trigger and response');
    return;
  }
  // Save logic here
  toast.success('Prompts saved successfully');
};

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Prompt Engineering</h3>
      {prompts.map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Trigger"
            value={_.trigger}
            onChange={(e) =>
              setPrompts(
                prompts.map((p, i) => (i === index ? { ...p, trigger: e.target.value } : p))
              )
            }
            className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
          />
          <input
            type="text"
            placeholder="Response"
            value={_.response}
            onChange={(e) =>
              setPrompts(
                prompts.map((p, i) => (i === index ? { ...p, response: e.target.value } : p))
              )
            }
            className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
          />
          <button onClick={() => removePrompt(index)} className="text-red-500 hover:text-red-400">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addPrompt} className="text-primary hover:text-primary/80">
        Add Prompt
      </button>
    </div>
  );
};

export default PromptEditor;