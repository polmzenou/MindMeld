import axios from 'axios'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  throw new Error("❌ Aucune clé OpenRouter détectée.")
}

const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'MindMeld App',
  },
})

const chatCompatibleModels = [
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "mistralai/mistral-nemo:free",
  "mistralai/mistral-7b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free"
]


export const getSuggestions = async (ideas = [], model = 'mistralai/mistral-7b-instruct') => {
  const prompt = `Voici des idées actuelles :\n${ideas.map(i => `- ${i.text}`).join('\n')}\n\nPropose 3 idées complémentaires ou originales en lien avec celles-ci.`

  const isChat = chatCompatibleModels.includes(model)
  const endpoint = isChat ? '/chat/completions' : '/completions'
  const data = isChat
    ? {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      }
    : {
        model,
        prompt,
        max_tokens: 300,
        temperature: 0.8,
      }

  try {
    const res = await openrouter.post(endpoint, data)

    console.log('✅ Réponse OpenRouter :', res.data)

    return isChat
      ? res.data.choices[0].message.content
      : res.data.choices[0].text
  } catch (error) {
    console.error('❌ Erreur OpenRouter brute :', error)

    const status = error.response?.status
    if (status === 400) {
      throw new Error("📭 Requête invalide : ce modèle ne supporte pas ce format.")
    } else if (status === 401) {
      throw new Error("🔐 Clé API invalide.")
    } else if (status === 402) {
      throw new Error("💳 Modèle payant. Essaie un modèle gratuit.")
    } else {
      throw new Error("❌ Une erreur est survenue avec OpenRouter.")
    }
  }
}
