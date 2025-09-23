// Using built-in fetch (Node.js 18+)
import { loadApiKey } from './secure-store'
import { Article } from '../renderer/src/types/Article'

const API_URL = 'https://support.stedwards.edu/TDWebApi/api/96/knowledgebase/search'

export async function fetchArticles(body: any): Promise<Article[]> {
  const keyBuffer = loadApiKey()
  if (!keyBuffer) throw new Error('API key not set!')

  const apiKey = keyBuffer.toString()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status}`)
  }

  return res.json() as Promise<Article[]>
}

// Additional API calls can go here (create, update, delete)
