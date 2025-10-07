import Versions from '../../components/Versions'
import React, { useEffect, useState, useMemo } from 'react'
import { Article } from '../types/Article'
import { ArticleRow } from '@renderer/types/ArticleRow'
import KBTableSelectedActionMenu from './KBTableSelectedActionMenu'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'

type KBTableProps = {
  articles: Article[]
  onSelectionChange?: (selectedIds: number[]) => void
}

function KBTable({ articles, onSelectionChange }: KBTableProps): React.JSX.Element {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [menuVisible, setMenuVisible] = useState(false)

  const selectedArticles = useMemo(() =>
    articles.filter(
      (article) => Object.keys(rowSelection).includes(article.ID.toString()),
      [articles, rowSelection]
    )
  )
  const columns = useMemo<MRT_ColumnDef<Article>[]>(
    () => [
      { accessorKey: 'ID', header: 'ID', enableHiding: false },
      { accessorKey: 'CategoryName', header: 'Category' },
      { accessorKey: 'Subject', header: 'Subject' },
      { accessorKey: 'Summary', header: 'Summary' },
      { accessorKey: 'Status', header: 'Status' },
      { accessorKey: 'IsPublished', header: 'IsPublished' },
      { accessorKey: 'IsPublic', header: 'IsPublic' },
      { accessorKey: 'Tags', header: 'Tags' },
      { accessorKey: 'CreatedDate', header: 'Created Date' },
      { accessorKey: 'ModifiedDate', header: 'Modified Date' }
    ],
    []
  )

  return (
    <div 
      className="h-[80vh] min-h-[400px] overflow-auto"
      style={{ 
        width: 'calc(100vw - 40px)', 
        marginLeft: '20px', 
        marginRight: '20px' 
      }}
    >
      <MaterialReactTable
        columns={columns}
        data={articles}
        getRowId={(row) => row.ID.toString()}
        enableColumnOrdering
        enableRowSelection
        enableColumnFilters
        enableSorting
        enablePagination
        muiTableContainerProps={{
          sx: {
            width: '100%',
            overflowX: 'auto'
          }
        }}
        state={{ rowSelection }}
        onRowSelectionChange={(updater) => {
          const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
          setRowSelection(newSelection)

          const selectedIds = Object.keys(newSelection)
            .filter((key) => newSelection[key])
            .map(Number)
          onSelectionChange?.(selectedIds)
        }}
        renderTopToolbarCustomActions={() => (
          <div className="flex items-center gap-3">
            {Object.keys(rowSelection).length > 0 && (
              <>
                <span className="text-gray-600">{Object.keys(rowSelection).length} selected</span>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => setMenuVisible(true)}
                >
                  Open action menu
                </button>
              </>
            )}
          </div>
        )}
        initialState={{
          density: 'compact',
          pagination: { pageIndex: 0, pageSize: 20 }
        }}
      />
      {menuVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setMenuVisible(false)}
        >
          <div
            className="relative bg-white p-6 rounded-lg shadow-xl w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMenuVisible(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <KBTableSelectedActionMenu
              articles={selectedArticles}
              onClose={() => setMenuVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
function KBTableEditor(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 ml-5">KnowledgeBase Table Editor</h1>

      <KBTable articles={articles} />
    </div>
  )
}

export default KBTableEditor
