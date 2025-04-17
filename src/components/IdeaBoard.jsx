import { useEffect, useState } from 'react'
import IdeaCard from './IdeaCard'
import { getSuggestions } from '../services/openrouter'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const MODELS = [
  { label: "Mistral Small 3.1 24B", value: "mistralai/mistral-small-3.1-24b-instruct:free" },
  { label: "Mistral Small 3", value: "mistralai/mistral-small-24b-instruct-2501:free" },
  { label: "Mistral Nemo", value: "mistralai/mistral-nemo:free" },
  { label: "Mistral 7B Instruct", value: "mistralai/mistral-7b-instruct:free" },
  { label: "Zephyr 7B (HuggingFace)", value: "huggingfaceh4/zephyr-7b-beta:free" },
]

function IdeaBoard() {
  const [ideas, setIdeas] = useState([])
  const [newIdea, setNewIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value)
  const [lastResponseTime, setLastResponseTime] = useState(null)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('mindmeld_history')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const saved = localStorage.getItem('mindmeld_model')
    if (saved && MODELS.find(m => m.value === saved)) {
      setSelectedModel(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('mindmeld_model', selectedModel)
  }, [selectedModel])

  const addIdea = (text = newIdea) => {
    if (text.trim() === '') return
    setIdeas([...ideas, { id: Date.now(), text }])
    setNewIdea('')
  }

  const saveToHistory = (text) => {
    const newHistory = [{ id: Date.now(), text }, ...history].slice(0, 50)
    setHistory(newHistory)
    localStorage.setItem('mindmeld_history', JSON.stringify(newHistory))
  }

  const handleSuggestion = async () => {
    if (loading) return
    setLoading(true)
    const start = performance.now()

    try {
      const response = await getSuggestions(ideas, selectedModel)
      const end = performance.now()
      setLastResponseTime(Math.round(end - start))

      const suggestions = response
        .split('\n')
        .filter(line => line.trim())
        .map(text => text.replace(/^[-•\d.]+\s*/, ''))

      suggestions.forEach(s => {
        addIdea(s)
        saveToHistory(s)
      })
    } catch (error) {
      alert(error.message || 'Erreur lors de la récupération des suggestions IA')
    } finally {
      setLoading(false)
    }
  }

  const exportToMarkdown = () => {
    const date = new Date().toLocaleString()
    const modelLabel = MODELS.find(m => m.value === selectedModel)?.label || 'Modèle inconnu'

    let md = `# 🧠 Session MindMeld\n\n`
    md += `**Date :** ${date}\n`
    md += `**Modèle IA :** ${modelLabel}\n`
    if (lastResponseTime) md += `**Temps de réponse IA :** ${lastResponseTime} ms\n`
    md += `\n---\n\n## 💡 Idées générées\n\n`

    ideas.forEach((idea, index) => {
      md += `- ${idea.text}\n`
    })

    md += `\n---\n\n*Généré avec MindMeld – propulsé par OpenRouter.ai 🚀*`

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `mindmeld-${Date.now()}.md`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const date = new Date().toLocaleString()
    const modelLabel = MODELS.find(m => m.value === selectedModel)?.label || 'Modèle inconnu'

    doc.setFontSize(16)
    doc.text('🧠 MindMeld – Résumé de session', 14, 20)
    doc.setFontSize(12)
    doc.text(`Date : ${date}`, 14, 30)
    doc.text(`Modèle IA : ${modelLabel}`, 14, 37)
    if (lastResponseTime) {
      doc.text(`Temps de réponse IA : ${lastResponseTime} ms`, 14, 44)
    }
    doc.setFontSize(14)
    doc.text('💡 Idées générées :', 14, 55)

    const rows = ideas.map((idea, index) => [index + 1, idea.text])

    doc.autoTable({
      startY: 60,
      head: [['#', 'Idée']],
      body: rows,
      styles: { fontSize: 10 },
    })

    doc.save(`mindmeld-${Date.now()}.pdf`)
  }

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
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-500' : 'bg-green-600'}`}
          disabled={loading}
        >
          {loading ? 'Chargement...' : '💡 Suggestion IA'}
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

      <div className="text-sm text-gray-600 mb-4">
        🎯 Modèle utilisé : <strong>{MODELS.find(m => m.value === selectedModel)?.label}</strong>
        {lastResponseTime !== null && (
          <span> — ⏱️ Réponse en {lastResponseTime} ms</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">🕓 Historique des suggestions IA</h2>
        {history.length === 0 && (
          <p className="text-sm text-gray-500">Aucune suggestion enregistrée pour l’instant.</p>
        )}
        <ul className="space-y-2 mt-2">
          {history.map((item) => (
            <li key={item.id} className="bg-white shadow p-3 rounded flex justify-between items-center">
              <span className="text-sm">{item.text}</span>
              <button
                onClick={() => setNewIdea(item.text)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded ml-2"
              >
                📥 Réutiliser
              </button>
            </li>
          ))}
        </ul>
        {history.length > 0 && (
          <button
            onClick={() => {
              setHistory([])
              localStorage.removeItem('mindmeld_history')
            }}
            className="mt-4 text-sm text-red-600 underline"
          >
            🗑️ Vider l'historique
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-8">
        <button
          onClick={exportToMarkdown}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          📤 Export Markdown
        </button>
        <button
          onClick={exportToPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          📄 Export PDF
        </button>
      </div>
    </div>
  )
}

export default IdeaBoard
