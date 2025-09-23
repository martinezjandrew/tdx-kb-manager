import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    secureStore: {
      saveApiKey: (key: string) => Promive<void>

      loadApiKey: () => Promise<string | null>
    }
  }
}
