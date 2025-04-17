import IdeaBoard from './components/IdeaBoard'
import AssistantBot from './components/AssistantBot'
import { ThemeProvider } from './context/themeContext'
import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text transition-colors">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-zinc-700">
          <h1 className="text-2xl font-bold">💡 MindMeld</h1>
          <ThemeToggle />
        </div>
        <IdeaBoard />
        <AssistantBot />
      </div>
    </ThemeProvider>
  )
}

export default App
