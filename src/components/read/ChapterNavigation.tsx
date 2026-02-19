import { useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { books } from '../../data/books'

interface ChapterNavigationProps {
  bookId: number
  chapter: number
  totalChapters: number
  onNavigate: (bookId: number, chapter: number) => void
}

export function ChapterNavigation({
  bookId,
  chapter,
  totalChapters,
  onNavigate,
}: ChapterNavigationProps) {
  const prevTarget = useMemo(() => {
    if (chapter > 1) {
      return { bookId, chapter: chapter - 1 }
    }
    // Find previous book
    const currentIndex = books.findIndex((b) => b.id === bookId)
    if (currentIndex <= 0) {
      return null // First chapter of first book
    }
    const prevBook = books[currentIndex - 1]
    if (!prevBook) return null
    return { bookId: prevBook.id, chapter: prevBook.chapters }
  }, [bookId, chapter])

  const nextTarget = useMemo(() => {
    if (chapter < totalChapters) {
      return { bookId, chapter: chapter + 1 }
    }
    // Find next book
    const currentIndex = books.findIndex((b) => b.id === bookId)
    if (currentIndex >= books.length - 1) {
      return null // Last chapter of last book
    }
    const nextBook = books[currentIndex + 1]
    if (!nextBook) return null
    return { bookId: nextBook.id, chapter: 1 }
  }, [bookId, chapter, totalChapters])

  const prevLabel = useMemo(() => {
    if (!prevTarget) return null
    if (prevTarget.bookId === bookId) {
      return `Capítulo ${prevTarget.chapter}`
    }
    const prevBook = books.find((b) => b.id === prevTarget.bookId)
    return prevBook ? `${prevBook.name} ${prevTarget.chapter}` : null
  }, [prevTarget, bookId])

  const nextLabel = useMemo(() => {
    if (!nextTarget) return null
    if (nextTarget.bookId === bookId) {
      return `Capítulo ${nextTarget.chapter}`
    }
    const nextBook = books.find((b) => b.id === nextTarget.bookId)
    return nextBook ? `${nextBook.name} ${nextTarget.chapter}` : null
  }, [nextTarget, bookId])

  const handlePrev = useCallback(() => {
    if (prevTarget) {
      onNavigate(prevTarget.bookId, prevTarget.chapter)
    }
  }, [prevTarget, onNavigate])

  const handleNext = useCallback(() => {
    if (nextTarget) {
      onNavigate(nextTarget.bookId, nextTarget.chapter)
    }
  }, [nextTarget, onNavigate])

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-6 border-t"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Previous */}
      {prevTarget ? (
        <button
          onClick={handlePrev}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-left flex-1 min-w-0',
            'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
          )}
        >
          <ChevronLeft
            size={18}
            className="shrink-0"
            style={{ color: 'var(--color-secondary)' }}
          />
          <div className="min-w-0">
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Anterior
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {prevLabel}
            </p>
          </div>
        </button>
      ) : (
        <div className="flex-1" />
      )}

      {/* Next */}
      {nextTarget ? (
        <button
          onClick={handleNext}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-right flex-1 min-w-0',
            'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
          )}
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Próximo
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {nextLabel}
            </p>
          </div>
          <ChevronRight
            size={18}
            className="shrink-0"
            style={{ color: 'var(--color-secondary)' }}
          />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}
