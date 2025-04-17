import { useState } from "react";
import IdeaCard from "./IdeaCard";
import { getSuggestions } from "../services/openrouter";

const MODELS = [
  {
    label: "Mistral Small 3.1 24B",
    value: "mistralai/mistral-small-3.1-24b-instruct:free",
  },
  {
    label: "Mistral Small 3",
    value: "mistralai/mistral-small-24b-instruct-2501:free",
  },
  { label: "Mistral Nemo", value: "mistralai/mistral-nemo:free" },
  { label: "Mistral 7B Instruct", value: "mistralai/mistral-7b-instruct:free" },
  {
    label: "Zephyr 7B (HuggingFace)",
    value: "huggingfaceh4/zephyr-7b-beta:free",
  },
];

function IdeaBoard() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);

  const addIdea = (text = newIdea) => {
    if (text.trim() === "") return;
    setIdeas([...ideas, { id: Date.now(), text }]);
    setNewIdea("");
  };

  const handleSuggestion = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getSuggestions(ideas, selectedModel);
      const suggestions = response
        .split("\n")
        .filter((line) => line.trim())
        .map((text) => text.replace(/^[-•\d.]+\s*/, ""));

      suggestions.forEach((s) => addIdea(s));
    } catch (error) {
      alert(
        error.message || "Erreur lors de la récupération des suggestions IA"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Ajoute une idée..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => addIdea()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
        <button
          onClick={handleSuggestion}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-green-600"
          }`}
          disabled={loading}
        >
          {loading ? "Chargement..." : "💡 Suggestion IA"}
        </button>
        <select
          className="p-2 border rounded"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

export default IdeaBoard;
