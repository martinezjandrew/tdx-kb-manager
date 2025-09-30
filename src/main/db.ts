import Database from 'better-sqlite3'
import { Article } from '../renderer/src/types/Article'

// database setup
const db = new Database('cache.sqlite')
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY,
    title TEXT,
    last_modified INTEGER
  )
`)

// crud functions

export interface ArticleRow {
  id: number
  title: string
  last_modified: number
  data: string
}

export function listArticles(): ArticleRow[] {
  return db.prepare<ArticleRow>('SELECT id, title, last_modified FROM articles').all()
}

export function getArticle(id: number): Article | null {
  const row = db.prepare<{ data: string }>('SELECT data FROM articles WHERE id = ?').get(id)
  return row ? (JSON.parse(row.data) as Article) : null
}

export function cacheArticle(article: Article): { success: true } {
  db.prepare(
    `
      INSERT INTO articles (id, title, last_modified, data)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        last_modified = excluded.last_modified,
        data = excluded.data
    `
  ).run(article.ID, article.Subject, Date.parse(article.ModifiedDate), JSON.stringify(article))
  return { success: true }
}

export default db
