// src/components/Login.jsx
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { supabase, user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (user) {
      setRedirecting(true)
      setTimeout(() => navigate('/'), 1000)
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }

      if (result.error) {
        setError(result.error.message)
      }
    } catch (err) {
      setError('Erreur inconnue lors de l\'authentification')
    } finally {
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="text-center">
          <div className="loader"></div>
          <p className="text-lg">Redirection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-200 dark:border-zinc-700"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-light-accent dark:bg-dark-accent text-white font-semibold py-2 rounded hover:opacity-90"
        >
          {loading ? 'Chargement...' : isLogin ? 'Connexion' : 'Créer un compte'}
        </button>

        <p className="text-center text-sm mt-4">
          {isLogin ? 'Pas encore inscrit ?' : 'Déjà un compte ?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Créer un compte' : 'Connexion'}
          </button>
        </p>
      </form>
    </div>
  )
}

export default Login
