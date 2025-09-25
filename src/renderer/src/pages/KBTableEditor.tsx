import Versions from '../components/Versions'
import { useEffect, useState } from 'react'
import { Article } from '../types/Article'

type Column = {
  id: keyof Article
  label: string
}

const availableColumns: Column[] = [
  { id: 'CategoryName', label: 'Category Name' },
  { id: 'Subject', label: 'Subject' },
  { id: 'Summary', label: 'Summary' },
  { id: 'Status', label: 'Status' },
  { id: 'IsPublished', label: 'Is Published' },
  { id: 'IsPublic', label: 'Is Public' },
  { id: 'Tags', label: 'Tags' },
  { id: 'CreatedDate', label: 'Created Date' },
  { id: 'ModifiedDate', label: 'Modified Date' }
]

type KBTableProps = {
  articles: Article[]
  selectedIds: Set<number>
  onToggleRow: (id: number) => void
  onToggleAll: (checked: boolean) => void
}

function KBTable({
  articles,
  selectedIds,
  onToggleRow,
  onToggleAll
}: KBTableProps): React.JSX.Element {
  const [visibleCols, setVisibleCols] = useState<string[]>(availableColumns.map((c) => c.id))

  const toggleColumn = (id: string): void => {
    setVisibleCols((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

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
      <div className="flex gap-2 flext-wrap">
        {availableColumns.map((col) => (
          <button
            key={col.id}
            onClick={() => toggleColumn(col.id)}
            className={`x-3 py-1 rounded border ${
              visibleCols.includes(col.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {col.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border divide-y divide-gray-200">
          <thead className="bg-gray-600 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  onChange={(e) => onToggleAll(e.target.checked)}
                  checked={selectedIds.size === articles.length && articles.length > 0}
                />
              </th>
              {availableColumns
                .filter((col) => visibleCols.includes(col.id))
                .map((col) => (
                  <th key={col.id} className="border border-gray-300 px-4 py-2">
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.ID} className="hover:bg-gray-50 hover:text-black transition-colors">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(article.ID)}
                    onChange={() => onToggleRow(article.ID)}
                  />
                </td>
                {availableColumns
                  .filter((col) => visibleCols.includes(col.id))
                  .map((col) => (
                    <td key={col.id} className="border border-gray-300 px-4 py-2">
                      {String(article[col.id as keyof typeof article])}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KBTableEditor(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchArticles = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const data: Article[] = await window.api.fetchArticles({
          CategoryID: '',
          ReturnCount: null
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

  function Actions(): React.JSX.Element {
    const [menuVisible, setMenuVisible] = useState<boolean>(false)
    return (
      <div
        className="text-sm text-gray-300 cursor-pointer"
        onClick={() => setMenuVisible(!menuVisible)}
      >
        {selectedIds.size} rows selected • Open action menu
        {menuVisible && (
          <ul>
            {[...selectedIds].map((id) => {
              const article = articles.find((a) => a.ID === id)
              return <li key={id}>{article ? article.Subject : `Unknown (${id}`}</li>
            })}
          </ul>
        )}
      </div>
    )
  }

  const toggleRow = (id: number): void => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const toggleAll = (checked: boolean, articles: Article[]): void => {
    if (checked) {
      setSelectedIds(new Set(articles.map((a) => a.ID)))
    } else {
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">KnowledgeBase Table Editor</h1>
      <Actions />
      <KBTable
        articles={articles}
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onToggleAll={(checked) => toggleAll(checked, articles)}
      />
      <Versions></Versions>
    </div>
  )
}

export default KBTableEditor
