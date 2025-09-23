import Versions from '../components/Versions'
import { useNavigate } from 'react-router-dom'

function Home(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <>
      <div className="actions">
        <div className="action">
          <button onClick={() => navigate('kb-table-editor')}>Editor</button>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default Home
