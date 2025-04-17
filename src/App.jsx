import { useRef, useState } from 'react'
import IdeaBoard from './components/IdeaBoard'
import AssistantBot from './components/AssistantBot'
import SessionManager from './components/SessionsManager'
import { ThemeProvider } from './context/themeContext'
import ThemeToggle from './components/ThemeToggle'
import { saveAs } from 'file-saver'

function App() {
  const ideaBoardRef = useRef()

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('mindmeld_sessions')
    return saved ? JSON.parse(saved) : []
  })

  const [activeSessionName, setActiveSessionName] = useState(null)

  const handleSaveSession = (ideas) => {
    const name = prompt('Nom de la session :')
    if (!name) return
    const newSession = { id: Date.now(), name, ideas }
    const updated = [newSession, ...sessions].slice(0, 20)
    setSessions(updated)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
    setActiveSessionName(name)
  }

  const handleLoadSession = (session) => {
    if (ideaBoardRef.current) {
      ideaBoardRef.current.setIdeas(session.ideas)
      setActiveSessionName(session.name)
    }
  }

  const handleDeleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
    if (sessions.find(s => s.id === id)?.name === activeSessionName) {
      setActiveSessionName(null)
    }
  }

  const handleExportSession = (session) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' })
    saveAs(blob, `${session.name}.json`)
  }

  const handleImportSession = (data) => {
    if (!data.id || !data.name || !Array.isArray(data.ideas)) {
      alert('Fichier JSON invalide.')
      return
    }
    const updated = [data, ...sessions].slice(0, 20)
    setSessions(updated)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
  }

  const handleRenameSession = () => {
    if (!activeSessionName) return
    const newName = prompt('Nouveau nom de la session :', activeSessionName)
    if (!newName) return
    const updated = sessions.map(s =>
      s.name === activeSessionName ? { ...s, name: newName } : s
    )
    setSessions(updated)
    setActiveSessionName(newName)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
  }

  const handleClearActiveSession = () => {
    setActiveSessionName(null)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text transition-colors">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-zinc-700">
          <div>
            <h1 className="text-2xl font-bold">💡 MindMeld</h1>
            {activeSessionName && (
              <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-2 items-center">
                <span>Session active : <strong>{activeSessionName}</strong></span>
                <button onClick={handleRenameSession} className="text-blue-600 hover:underline">Renommer</button>
                <button onClick={handleClearActiveSession} className="text-red-600 hover:underline">Réinitialiser</button>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
        <IdeaBoard ref={ideaBoardRef} onSaveSession={handleSaveSession} />
        <AssistantBot />
        <SessionManager
          sessions={sessions}
          onLoad={handleLoadSession}
          onDelete={handleDeleteSession}
          onExport={handleExportSession}
          onImport={handleImportSession}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
