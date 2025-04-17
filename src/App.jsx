import IdeaBoard from './components/IdeaBoard'
import AssistantBot from './components/AssistantBot'


function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">🧠 MindMeld</h1>
      <IdeaBoard />
      <AssistantBot />
    </div>
  )
}

export default App