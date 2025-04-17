import { useState } from 'react'

function SessionManager({ sessions, onLoad, onDelete, onExport, onImport }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        onImport(data)
        setIsOpen(false)
      } catch (e) {
        alert("Fichier invalide.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-4 rounded shadow-xl w-80 border border-gray-300 dark:border-zinc-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">📂 Sessions</h2>
            <button onClick={() => setIsOpen(false)} className="text-red-500">✕</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sessions.length === 0 && (
              <p className="text-sm text-gray-500">Aucune session sauvegardée.</p>
            )}
            {sessions.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center text-sm bg-light-card dark:bg-dark-card p-2 rounded">
                <span className="truncate mr-2">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => onLoad(s)} className="text-green-600">▶</button>
                  <button onClick={() => onExport(s)} className="text-blue-600">⬇</button>
                  <button onClick={() => onDelete(s.id)} className="text-red-600">🗑</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">📥 Importer JSON</label>
            <input type="file" accept="application/json" onChange={handleFileImport} className="w-full text-sm" />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded-full shadow-lg hover:opacity-90"
        >
          📂 Sessions
        </button>
      )}
    </div>
  )
}

export default SessionManager