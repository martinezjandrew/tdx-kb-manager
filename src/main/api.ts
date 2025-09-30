import { Article } from '../renderer/src/types/Article'
import { loadApiKey } from './secure-store'
import db, { ArticleRow } from './db'

const API_URL = 'https://support.stedwards.edu/TDWebApi/api/'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchArticles(body: any): Promise<Article[]> {
  const keyBuffer = loadApiKey()
  if (!keyBuffer) throw new Error('API key not set!')

  const apiKey = keyBuffer.toString()
  const endpoint = API_URL + '/96/knowledgebase/search'

  const res = await fetch(endpoint, {
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

  const articles = (await res.json()) as Article[]
  const articlesFull: Article[] = []

  for (const articleMeta of articles) {
    const detailEndpoint = `${API_URL}/96/knowledgebase/${articleMeta.ID}`

    try {
      const detailRes = await fetch(detailEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      })
      if (!detailRes.ok) {
        console.warn(`Failed to fetch article ${articleMeta.ID}: ${detailRes.status}`)
      } else {
        const article = (await detailRes.json()) as Article
        articlesFull.push(article)
      }
    } catch (err) {
      console.error(`Error fetching article ${articleMeta.ID}:`, err)
    }

    await delay(1000)
  }

  saveArticlesToDB(articlesFull)

  return articles
}

// save/update article in db
export function saveArticleToDB(article: Article): void {
  db.prepare(
    `
    INSERT INTO articles (id, title, last_modified, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      last_modified = excluded.last_modified,
      data = excluded.data
  `
  ).run(article.ID, article.Subject, article.ModifiedDate, JSON.stringify(article))
}

// bulk save articles
export function saveArticlesToDB(articles: Article[]): void {
  const insert = db.prepare(`
    INSERT INTO articles (id, title, last_modified, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      last_modified = excluded.last_modified,
      data = excluded.data
  `)

  const insertMany = db.transaction((items: Article[]) => {
    for (const a of items) {
      insert.run(a.ID, a.Subject, a.ModifiedDate, JSON.stringify(a))
    }
  })

  insertMany(articles)
}
//
// search cached articles
export function getArticlesFromDB(): Article[] {
  const rows = db
    .prepare(`SELECT id, title, last_modified, data FROM articles ORDER BY last_modified DESC`)
    .all()

  return rows.map((row: ArticleRow) => ({
    ...JSON.parse(row.data),
    ID: row.id,
    Subject: row.title,
    ModifiedDate: row.last_modified
  }))
}

// validate api key
export async function validateApiKey(): Promise<boolean> {
  const keyBuffer = loadApiKey()
  if (!keyBuffer) return false

  const apiKey = keyBuffer.toString()
  const endpoint = API_URL + 'auth/getuser'

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    })

    return res.ok
  } catch (err) {
    console.error('validateApikey error:', err)
    return false
  }
}
