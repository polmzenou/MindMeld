import { useRef, useState, useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import IdeaBoard from './components/IdeaBoard'
import AssistantBot from './components/AssistantBot'
import SessionManager from './components/SessionsManager'
import ThemeToggle from './components/ThemeToggle'
import { saveAs } from 'file-saver'
import { ThemeProvider } from './context/themeContext'
import Login from './components/Login'
import { AuthContext, AuthProvider } from './context/AuthContext'

function InnerApp() {
  const ideaBoardRef = useRef()
  const { user, supabase } = useContext(AuthContext)

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('mindmeld_sessions')
    return saved ? JSON.parse(saved) : []
  })

  const [activeSessionName, setActiveSessionName] = useState(null)

  const handleSaveSession = (ideas) => {
    const existing = sessions.find(s => s.name === activeSessionName && s.user === user.id)
    if (existing) {
      const confirmOverwrite = window.confirm('Une session avec ce nom existe. Voulez-vous la remplacer ?')
      if (!confirmOverwrite) return
      const updated = sessions.map(s =>
        s.name === activeSessionName && s.user === user.id ? { ...s, ideas } : s
      )
      setSessions(updated)
      localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
    } else {
      const name = prompt('Nom de la session :')
      if (!name) return
      const newSession = { id: Date.now(), name, ideas, user: user.id }
      const updated = [newSession, ...sessions].slice(0, 20)
      setSessions(updated)
      localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
      setActiveSessionName(name)
    }
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
    const updated = [
      { ...data, user: user.id },
      ...sessions
    ].slice(0, 20)
    setSessions(updated)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
  }

  const handleRenameSession = () => {
    if (!activeSessionName) return
    const newName = prompt('Nouveau nom de la session :', activeSessionName)
    if (!newName) return
    const updated = sessions.map(s =>
      s.name === activeSessionName && s.user === user.id ? { ...s, name: newName } : s
    )
    setSessions(updated)
    setActiveSessionName(newName)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
  }

  const handleClearActiveSession = () => {
    setActiveSessionName(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    if (!activeSessionName || !ideaBoardRef.current) return
    const currentIdeas = ideaBoardRef.current.getIdeas?.()
    if (!currentIdeas) return
    const updated = sessions.map(s =>
      s.name === activeSessionName && s.user === user.id ? { ...s, ideas: currentIdeas } : s
    )
    setSessions(updated)
    localStorage.setItem('mindmeld_sessions', JSON.stringify(updated))
  }, [ideaBoardRef.current?.getIdeas?.(), activeSessionName])

  const userSessions = sessions.filter(s => s.user === user.id)

  return (
    <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text transition-colors">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-zinc-700">
        <div>
          <h1 className="text-2xl font-bold">💡 MindMeld</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connecté en tant que : <strong>{user.email}</strong>
          </p>
          {activeSessionName && (
            <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-2 items-center">
              <span>Session active : <strong>{activeSessionName}</strong></span>
              <button onClick={handleRenameSession} className="text-blue-600 hover:underline">Renommer</button>
              <button onClick={handleClearActiveSession} className="text-red-600 hover:underline">Réinitialiser</button>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 rounded border border-red-400 bg-white dark:bg-zinc-800 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
          >
            Se déconnecter
          </button>
        </div>
      </div>
      <IdeaBoard ref={ideaBoardRef} onSaveSession={handleSaveSession} />
      <AssistantBot />
      <SessionManager
        sessions={userSessions}
        onLoad={handleLoadSession}
        onDelete={handleDeleteSession}
        onExport={handleExportSession}
        onImport={handleImportSession}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<RequireAuth><InnerApp /></RequireAuth>}
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default App