import Versions from '../../components/Versions'
import { useEffect, useState } from 'react'
import { Article } from '../types/Article'
import { ArticleRow } from '@renderer/types/ArticleRow'
import KBTableSelectedActionMenu from './KBTableSelectedActionMenu'

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
        height: '800px',
        maxHeight: '100vh',
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
      <div className="">
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
  const [menuVisible, setMenuVisible] = useState<boolean>(false)

  useEffect(() => {
    const fetchFromDb = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        // metadata
        const rows: ArticleRow[] = await window.api.listArticles()

        // get full data
        const fullArticles: Article[] = await Promise.all(
          rows.map((row) => window.api.getArticle(row.id))
        )

        setArticles(fullArticles.filter((a): a is Article => a !== null))
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unkown error')
      } finally {
        setLoading(false)
      }
    }

    fetchFromDb()
  }, [])

  if (loading) return <p>Loading articles...</p>
  if (error) return <p>Error: {error}</p>

  function Actions(): React.JSX.Element {
    const selectedArticles = articles.filter((article) => selectedIds.has(article.ID))

    return (
      <>
        {' '}
        <div className="text-sm text-gray-300 cursor-pointer" onClick={() => setMenuVisible(true)}>
          {selectedIds.size} rows selected • Open action menu
        </div>
        {menuVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <button onClick={() => setMenuVisible(false)}>CLOSE</button>
            <div onClick={(e) => e.stopPropagation()}>
              <KBTableSelectedActionMenu articles={selectedArticles} />
            </div>
          </div>
        )}
      </>
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

  const toggleAll = (checked: boolean): void => {
    if (checked) {
      setSelectedIds(new Set(articles.map((a) => a.ID)))
    } else {
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="p-4 w-3/4">
      <h1 className="text-2xl font-bold mb-4">KnowledgeBase Table Editor</h1>
      <Actions />
      <KBTable
        articles={articles}
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />
      <Versions></Versions>
    </div>
  )
}

export default KBTableEditor
