import { ElectronAPI } from '@electron-toolkit/preload'
import { Article } from '@renderer/types/Article'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listArticles: () => Promise<{ id: number; title: string; last_modified: number }[]>
      getArticle: (id: number) => Promise<Article | null>
      cacheArticle: (article: Article) => Promise<{ success: boolean }>
      fetchArticles: (body: any) => Promise<Article[]>
      validateApiKey: () => Promise<boolean>
    }
    secureStore: {
      saveApiKey: (key: string) => Promive<void>
      loadApiKey: () => Promise<string | null>
    }
  }
}
