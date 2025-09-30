import { Article } from './Article'
import { ArticleRow } from './ArticleRow'

declare global {
  interface Window {
    api: {
      fetchArticles: (body: any) => Promise<Article[]>
      listArticles: () => Promise<ArticleRow[]>
      getArticle: (id: number) => Promise<Article>
      cacheArticle: (article: Article) => Promise<void>
      validateApiKey: () => Promise<boolean>
    }
    secureStore: {
      saveApiKey: (key: string) => Promive<void>
      loadApiKey: () => Promise<string | null>
    }
    electron: typeof import('@electron-toolkit/preload').electronAPI
  }
}
