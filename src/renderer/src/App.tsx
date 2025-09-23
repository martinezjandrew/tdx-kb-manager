import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import KBTableEditor from './pages/KBTableEditor'
import Header from './components/Header'

export default function App(): React.JSX.Element {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kb-table-editor" element={<KBTableEditor />} />
      </Routes>
    </Router>
  )
}
