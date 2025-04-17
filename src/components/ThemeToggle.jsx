import { useContext } from 'react'
import { ThemeContext } from '../context/themeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button
      onClick={toggleTheme}
      className="text-sm px-3 py-1 rounded border border-gray-400 dark:border-gray-200 bg-white dark:bg-zinc-800 text-black dark:text-white"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle