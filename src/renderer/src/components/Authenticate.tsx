import { useState } from 'react'

type AuthenticateProps = {
  onClose: () => void
}
function Authenticate({ onClose }: AuthenticateProps): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')

  const handleSave = async (key: string): Promise<void> => {
    console.log('SAVING API KEY!!!')
    await window.secureStore.saveApiKey(key)
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
        />
        <button onClick={() => handleSave(apiKey)}>Submit</button>
        <button onClick={onClose} className="absolute top-2 right-2">
          X
        </button>
      </div>
    </div>
  )
}

export default Authenticate
