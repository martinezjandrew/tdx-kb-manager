import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Article } from '../renderer/src/types/Article'

// Custom APIs for renderer
const api = {
  fetchArticles: (body: any) => ipcRenderer.invoke('tdx:fetchArticles', body),
  listArticles: () => ipcRenderer.invoke('list-articles'),
  getArticle: (id: number) => ipcRenderer.invoke('get-article', id),
  cacheArticle: (article: Article) => ipcRenderer.invoke('cache-article', article),
  saveArticleToDB: (article: Article) => ipcRenderer.invoke('save-article-to-db', article),
  validateApiKey: () => ipcRenderer.invoke('validate-api-key')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('secureStore', {
      saveApiKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
      loadApiKey: () => ipcRenderer.invoke('load-api-key')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
