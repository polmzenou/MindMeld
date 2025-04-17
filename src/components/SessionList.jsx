// src/components/SessionList.jsx
import { useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getUserSessions, createSession, deleteSession } from '../services/supabaseSession'

function SessionList() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshSessions()
  }, [])

  const refreshSessions = () => {
    setLoading(true)
    getUserSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleAdd = async () => {
    const name = prompt('Nom de la session :')
    if (!name) return
    await createSession(name, { ideas: [] })
    refreshSessions()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette session ?')) return
    await deleteSession(id)
    refreshSessions()
  }

  const handleImport = (session) => {
    if (!window.confirm(`Charger la session "${session.name}" ?`)) return
    const ideas = session.data.ideas || []
    if (ideaBoardRef.current?.setIdeas) {
      ideaBoardRef.current.setIdeas(ideas)
    }
    setActiveSessionName(session.name)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">📦 Sessions Supabase</h2>
      <button
        onClick={handleAdd}
        className="mb-4 bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded"
      >
        ➕ Nouvelle session
      </button>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-2 rounded shadow">
            <span className="truncate">{s.name}</span>
            <div className="flex gap-2">
              <button onClick={() => handleImport(s)} className="text-blue-600">📥</button>
              <button onClick={() => handleDelete(s.id)} className="text-red-500">🗑</button>
            </div>
          </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SessionList