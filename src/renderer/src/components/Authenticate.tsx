import { useState } from 'react'

type AuthenticateProps = {
  onClose: () => void
}
function Authenticate({ onClose }: AuthenticateProps): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async (key: string): Promise<void> => {
    setError(null)
    setLoading(true)

    try {
      await window.secureStore.saveApiKey(key)

      const isValid: boolean = await window.api.validateApiKey()
      if (!isValid) {
        setError('Authentication failed - invalid API key')
        setLoading(false)
        return
      }

      await window.api.fetchArticles({
        CategoryID: '',
        ReturnCount: null
      })

      onClose()
    } catch (err: unknown) {
      setError('An error occured during authentication')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative p-20 bg-gray-800 rounded-lg">
        <h1>Authentication!</h1>
        <p>1. Go to this page...</p>
        <p>2. Enter the api</p>
        <input
          id="api=key"
          type="password"
          placeholder="Enter the api key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />{' '}
        {error && <p className="text-red-500">{error}</p>}
        <button onClick={() => handleSave(apiKey)}>
          {loading ? 'Authenticating...' : 'Submit'}
        </button>
        <button onClick={onClose} className="absolute top-2 right-2">
          X
        </button>
      </div>
    </div>
  )
}

export default Authenticate
