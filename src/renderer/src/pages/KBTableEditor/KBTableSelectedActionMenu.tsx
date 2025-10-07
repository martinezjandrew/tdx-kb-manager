import { Article } from '@renderer/types/Article'
import { useState, useMemo } from 'react'

type KBTableSelectedActionMenuProps = {
  articles: Article[]
  onClose: () => void
}

function KBTableSelectedActionMenu({
  articles,
  onClose
}: KBTableSelectedActionMenuProps): React.JSX.Element {
  const [displayedArticles, setDisplayedArticles] = useState(articles)
  const [newTagInput, setNewTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const removeArticle = (id: string): void => {
    setDisplayedArticles((prev) => prev.filter((article) => article.ID !== id))
  }

  const removeTagFromAll = (tagToRemove: string): void => {
    setDisplayedArticles((prev) =>
      prev.map((article) => ({
        ...article,
        Tags: article.Tags?.filter((tag) => tag !== tagToRemove) || []
      }))
    )
  }

  const addTagToAll = (): void => {
    const trimmedTag = newTagInput.trim()
    if (!trimmedTag) return

    setDisplayedArticles((prev) =>
      prev.map((article) => ({
        ...article,
        Tags: [...(article.Tags || []), trimmedTag]
      }))
    )
    setNewTagInput('')
  }

  const resetChanges = (): void => {
    setDisplayedArticles(articles)
    setNewTagInput('')
  }

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true)
    try {
      // Update all articles in parallel
      await Promise.all(
        displayedArticles.map((article) =>
          window.electron.ipcRenderer.invoke('update-article', article.ID, article)
        )
      )
      onClose()
    } catch (error) {
      console.error('Failed to update articles:', error)
      // Optionally show error toast/message
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get union (all unique tags) and intersection (only shared tags)
  const { unionTags, intersectionTags } = useMemo(() => {
    if (displayedArticles.length === 0) {
      return { unionTags: new Set<string>(), intersectionTags: new Set<string>() }
    }

    // Union: all unique tags across all articles
    const union = new Set<string>()
    displayedArticles.forEach((article) => {
      article.Tags?.forEach((tag) => union.add(tag))
    })

    // Intersection: tags that appear in ALL articles
    const intersection = new Set<string>(displayedArticles[0].Tags || [])
    displayedArticles.slice(1).forEach((article) => {
      const articleTags = new Set(article.Tags || [])
      intersection.forEach((tag) => {
        if (!articleTags.has(tag)) {
          intersection.delete(tag)
        }
      })
    })

    return { unionTags: union, intersectionTags: intersection }
  }, [displayedArticles])

  return (
    <div className="bg-blue-950 p-6 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-white text-lg font-semibold mb-3">Selected Articles</h2>
      <div className="overflow-x-auto mb-6">
        <ul className="flex gap-2 pb-2">
          {displayedArticles.map((article: Article) => (
            <li
              key={article.ID}
              className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <span>{article.Subject}</span>
              <button
                onClick={() => removeArticle(article.ID)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-white text-lg font-semibold mb-2">Actions</h2>
      <div className="bg-blue-900 p-4 rounded-lg mb-4">
        <h3 className="text-white text-md font-medium mb-3">Tag Editor</h3>

        <div className="mb-3">
          <p className="text-blue-200 text-sm mb-2">All Tags (Union)</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(unionTags).map((tag) => (
              <div
                key={tag}
                className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTagFromAll(tag)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  −
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-blue-200 text-sm mb-2">Add New Tag</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter tag name..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTagToAll()}
              className="bg-blue-800 text-white px-3 py-2 rounded-lg flex-1 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTagToAll}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={resetChanges}
          disabled={isSubmitting}
          className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default KBTableSelectedActionMenu
