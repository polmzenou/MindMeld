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

  const [focusMode, setFocusMode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [focusDuration, setFocusDuration] = useState(15 * 60)
  const [ideasDuringFocus, setIdeasDuringFocus] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('mindmeld_model')
    if (saved && MODELS.find(m => m.value === saved)) {
      setSelectedModel(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('mindmeld_model', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    if (!focusMode || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next === 0) {
          if ("vibrate" in navigator) navigator.vibrate(200)
          const audio = new Audio("https://www.myinstants.com/media/sounds/notification.mp3")
          audio.play().catch(() => {})
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [focusMode, timeLeft])

  const toggleFocusMode = () => {
    if (!focusMode) {
      setTimeLeft(focusDuration)
      setIdeasDuringFocus(0)
      setFocusMode(true)
    } else {
      setFocusMode(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const addIdea = (text = newIdea) => {
    if (text.trim() === '') return
    setIdeas([...ideas, { id: Date.now(), text }])
    if (focusMode) setIdeasDuringFocus(prev => prev + 1)
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
    <div className="p-4 text-light-text dark:text-dark-text">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          ⏱️ Mode Focus : {focusMode ? formatTime(timeLeft) : 'inactif'}
          {focusMode && timeLeft === 0 && (
            <span className="ml-2 text-red-600 font-bold">🛎️ Temps écoulé !</span>
          )}
          {focusMode && (
            <div className="text-xs text-gray-500">💡 Idées générées : {ideasDuringFocus}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="p-1 border rounded text-sm bg-white dark:bg-zinc-800 dark:text-white dark:border-gray-700"
            value={focusDuration}
            onChange={(e) => setFocusDuration(parseInt(e.target.value))}
            disabled={focusMode}
          >
            <option value={5 * 60}>5 min</option>
            <option value={15 * 60}>15 min</option>
            <option value={25 * 60}>25 min</option>
          </select>
          <button
            onClick={toggleFocusMode}
            className={`px-3 py-1 rounded text-white ${focusMode ? 'bg-red-600' : 'bg-light-accent dark:bg-dark-accent'}`}
          >
            {focusMode ? 'Arrêter le focus' : 'Démarrer'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Ajoute une idée..."
          className="flex-1 p-2 border rounded bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
        />
        <button
          onClick={() => addIdea()}
          className="bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
        <button
          onClick={handleSuggestion}
          className={`px-4 py-2 rounded text-white ${loading || focusMode ? 'bg-gray-500' : 'bg-green-600'}`}
          disabled={loading || focusMode}
        >
          {loading ? 'Chargement...' : '💡 Suggestion IA'}
        </button>
        <select
          className="p-2 border rounded bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
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

      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
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
            <li key={item.id} className="bg-white dark:bg-zinc-800 shadow p-3 rounded flex justify-between items-center text-black dark:text-white">
              <span className="text-sm">{item.text}</span>
              <button
                onClick={() => setNewIdea(item.text)}
                className="text-xs bg-light-accent dark:bg-dark-accent text-white px-2 py-1 rounded ml-2"
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
          className="bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded"
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