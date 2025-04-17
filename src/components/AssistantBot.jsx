import { useState } from 'react'
import { askAssistant } from '../services/openrouter'

const speak = (text, muted) => {
  if (muted) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  speechSynthesis.speak(utterance)
}

function AssistantBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mindmeld_assistant_history')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)

  const toggleBot = () => setIsOpen(!isOpen)
  const toggleMute = () => setMuted(!muted)

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem('mindmeld_assistant_history')
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const response = await askAssistant(newMessages)
      const updated = [...newMessages, { role: 'assistant', content: response }]
      setMessages(updated)
      localStorage.setItem('mindmeld_assistant_history', JSON.stringify(updated))
      speak(response, muted)
    } catch (error) {
      const errorMsg = [...newMessages, { role: 'assistant', content: '❌ Erreur IA.' }]
      setMessages(errorMsg)
      localStorage.setItem('mindmeld_assistant_history', JSON.stringify(errorMsg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white shadow-lg rounded-lg flex flex-col border border-gray-300">
          <div className="p-3 border-b font-semibold flex justify-between items-center">
            🤖 Assistant IA
            <div className="flex gap-2 items-center">
              <button
                onClick={toggleMute}
                className="text-sm text-gray-500 hover:text-black"
                title={muted ? "Son désactivé" : "Son activé"}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-black"
                title="Vider la conversation"
              >
                🗑️
              </button>
              <button onClick={toggleBot} className="text-sm text-red-500">✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[90%] ${
                  msg.role === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start mr-auto'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">L’IA répond...</div>}
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pose une question..."
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              disabled={loading}
            >
              Envoyer
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleBot}
          className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700"
        >
          🤖 Assistant
        </button>
      )}
    </div>
  )
}

export default AssistantBot