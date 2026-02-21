import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { books } from '../../data/books'
import type { Book } from '../../types/bible'

interface BookSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (bookId: number, chapter: number) => void
  currentBookId?: number
  currentChapter?: number
}

// ── Accent color (Biblely-style orange) ──────────────────────────────────────
const ACCENT = '#FF8C42'

// ── Category label helper ─────────────────────────────────────────────────────
function getCategoryLabel(book: Book): string {
  const id = book.id
  if (book.testament === 'old') {
    if (id <= 5)  return 'Pentateuco'
    if (id <= 17) return 'Históricos'
    if (id <= 22) return 'Poéticos'
    return 'Proféticos'
  }
  if (id <= 43) return 'Evangelhos'
  if (id === 44) return 'História'
  if (id <= 58) return 'Epístolas'
  if (id <= 65) return 'Epístolas Gerais'
  return 'Profecia'
}

export function BookSelector({
  isOpen,
  onClose,
  onSelect,
  currentBookId,
  currentChapter,
}: BookSelectorProps) {
  const [selectedBookId, setSelectedBookId] = useState<number>(currentBookId ?? 1)

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? books[0]!,
    [selectedBookId],
  )

  const chapterNumbers = useMemo(
    () => Array.from({ length: selectedBook.chapters }, (_, i) => i + 1),
    [selectedBook],
  )

  // Refs for scrolling into view
  const bookListRef = useRef<HTMLDivElement>(null)
  const chapterGridRef = useRef<HTMLDivElement>(null)
  const activeBookRef = useRef<HTMLButtonElement>(null)
  const activeChapterRef = useRef<HTMLButtonElement>(null)

  // Drag-to-close refs
  const dragY = useRef(0)
  const startY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? 0
    dragY.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
    dragY.current = dy
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`
      sheetRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    if (dragY.current > 80) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)'
    }
  }

  // Reset selected book when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedBookId(currentBookId ?? 1)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, currentBookId])

  // Scroll active book into view on open or when book changes
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => {
      activeBookRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
  }, [isOpen, selectedBookId])

  // Scroll active chapter into view when book changes
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => {
      chapterGridRef.current?.scrollTo({ top: 0, behavior: 'instant' })
      if (selectedBookId === currentBookId) {
        activeChapterRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }, 80)
    return () => clearTimeout(t)
  }, [isOpen, selectedBookId, currentBookId])

  const handleBookClick = useCallback((book: Book) => {
    if (book.chapters === 1) {
      onSelect(book.id, 1)
      onClose()
      return
    }
    setSelectedBookId(book.id)
  }, [onSelect, onClose])

  const handleChapterClick = useCallback(
    (chapter: number) => {
      onSelect(selectedBook.id, chapter)
      onClose()
    },
    [selectedBook, onSelect, onClose],
  )

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', touchAction: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => { e.stopPropagation(); e.preventDefault() }}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* Drawer panel */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-[201] flex flex-col"
            style={{
              height: '82dvh',
              backgroundColor: '#1C1C1E',
              borderRadius: '1.5rem 1.5rem 0 0',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* ── Handle + Header ─────────────────────────────── */}
            <div className="shrink-0 px-5 pt-3 pb-4">
              {/* Drag handle */}
              <div
                className="flex justify-center pb-3 cursor-grab"
                style={{ touchAction: 'none' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="mx-auto rounded-full" style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              </div>

              {/* Current selection indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Active book pill */}
                  <span
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: ACCENT, color: '#fff', fontSize: '0.8125rem' }}
                  >
                    {selectedBook.abbreviation}
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.75rem' }}>
                      {selectedBook.name}
                    </span>
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full transition-opacity active:opacity-50"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <X size={16} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </button>
              </div>
            </div>

            {/* ── Split Panel ──────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

              {/* Left: Book abbreviation list */}
              <div
                ref={bookListRef}
                className="overflow-y-auto shrink-0"
                style={{
                  width: 68,
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {books.map((book) => {
                  const isActive = book.id === selectedBookId

                  return (
                    <button
                      key={book.id}
                      ref={isActive ? activeBookRef : undefined}
                      onClick={() => handleBookClick(book)}
                      className="w-full flex flex-col items-center justify-center py-2.5 transition-colors"
                      style={{
                        backgroundColor: isActive ? `${ACCENT}22` : 'transparent',
                        borderLeft: isActive ? `3px solid ${ACCENT}` : '3px solid transparent',
                        minHeight: 48,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? ACCENT : 'rgba(255,255,255,0.45)',
                          lineHeight: 1.2,
                          letterSpacing: '0.03em',
                          textAlign: 'center',
                          maxWidth: 56,
                          wordBreak: 'break-all',
                        }}
                      >
                        {book.abbreviation}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Right: Chapter grid */}
              <div
                ref={chapterGridRef}
                className="flex-1 overflow-y-auto px-4 pt-3 pb-8"
              >
                {/* Book name heading */}
                <div className="mb-4">
                  <p
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.3)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {getCategoryLabel(selectedBook)}
                  </p>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      lineHeight: 1.1,
                    }}
                  >
                    {selectedBook.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.35)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {selectedBook.chapters} {selectedBook.chapters === 1 ? 'capítulo' : 'capítulos'}
                  </p>
                </div>

                {/* Chapter grid */}
                <div
                  className="grid gap-2.5"
                  style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
                >
                  {chapterNumbers.map((chapter) => {
                    const isCurrent =
                      selectedBook.id === currentBookId && chapter === currentChapter

                    return (
                      <button
                        key={chapter}
                        ref={isCurrent ? activeChapterRef : undefined}
                        onClick={() => handleChapterClick(chapter)}
                        className="aspect-square flex items-center justify-center rounded-2xl transition-transform active:scale-90"
                        style={{
                          backgroundColor: isCurrent ? ACCENT : 'rgba(255,255,255,0.08)',
                          color: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          fontSize: '0.875rem',
                          fontWeight: isCurrent ? 700 : 400,
                          boxShadow: isCurrent ? `0 4px 12px ${ACCENT}55` : 'none',
                        }}
                      >
                        {String(chapter).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
