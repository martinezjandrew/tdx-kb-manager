import { Link } from 'react-router-dom'
import { useState } from 'react'
import Authenticate from './Authenticate'

function Header(): React.JSX.Element {
  const [viewAuth, setViewAuth] = useState(false)
  return (
    <header>
      <h1>TeamDynamix KnowledgeBase Manager</h1>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <button onClick={() => setViewAuth(true)}>Authenticate</button>
      {viewAuth && <Authenticate onClose={() => setViewAuth(false)} />}
    </header>
  )
}

export default Header
