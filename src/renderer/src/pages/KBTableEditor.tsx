import Versions from '../components/Versions'
import { useEffect, useState } from 'react'
import { Article } from '../types/Article'

function KBTable(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const data: Article[] = await window.api.fetchArticles({
          CategoryID: ''
        })
        setArticles(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) return <p>Loading articles...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div
      className="border border-gray-300 rounded"
      style={{
        height: '400px',
        maxHeight: '80vh',
        overflowY: 'scroll',
        overflowX: 'auto',
        display: 'block'
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subject</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.ID} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{article.ID}</td>
              <td className="px-4 py-2">{article.Subject}</td>
              <td className="px-4 py-2">{article.CategoryName}</td>
              <td className="px-4 py-2">{article.StatusName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KBTableEditor(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">KnowledgeBase Table Editor</h1>
      <KBTable />
      <Versions></Versions>
    </div>
  )
}

export default KBTableEditor
