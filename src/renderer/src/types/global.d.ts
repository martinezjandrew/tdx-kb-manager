import { Article } from './Article'

declare global {
  interface Window {
    api: {
      fetchArticles: (body: any) => Promise<Article[]>
      // Add more methods here if needed
    }
    secureStore: {
      saveApiKey: (key: string) => Promive<void>
      loadApiKey: () => Promise<string | null>
    }
    electron: typeof import('@electron-toolkit/preload').electronAPI
  }
}
