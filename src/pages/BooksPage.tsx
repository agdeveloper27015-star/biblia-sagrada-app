import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { books } from '../data/books'
import type { Book } from '../types/bible'

// ── Categories ────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Pentateuco',         tag: 'AT', ids: [1, 2, 3, 4, 5] },
  { label: 'Históricos',         tag: 'AT', ids: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { label: 'Poéticos',           tag: 'AT', ids: [18, 19, 20, 21, 22] },
  { label: 'Profetas Maiores',   tag: 'AT', ids: [23, 24, 25, 26, 27] },
  { label: 'Profetas Menores',   tag: 'AT', ids: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
  { label: 'Evangelhos',         tag: 'NT', ids: [40, 41, 42, 43] },
  { label: 'História',           tag: 'NT', ids: [44] },
  { label: 'Epístolas de Paulo', tag: 'NT', ids: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58] },
  { label: 'Epístolas Gerais',   tag: 'NT', ids: [59, 60, 61, 62, 63, 64, 65] },
  { label: 'Profecia',           tag: 'NT', ids: [66] },
]

// ── Chapter sheet with drag-to-close ─────────────────────────────
function ChapterSheet({ book, onClose, onSelect }: {
  book: Book; onClose: () => void; onSelect: (ch: number) => void
}) {
  const dragY = useRef(0)
  const startY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0]?.clientY ?? 0; dragY.current = 0 }
  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
    dragY.current = dy
    if (dy > 0 && sheetRef.current) { sheetRef.current.style.transform = `translateY(${dy}px)`; sheetRef.current.style.transition = 'none' }
  }
  const handleTouchEnd = () => {
    if (dragY.current > 80) { onClose() }
    else if (sheetRef.current) { sheetRef.current.style.transform = 'translateY(0)'; sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)' }
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1)

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200]"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        key="sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl flex flex-col"
        style={{ backgroundColor: 'var(--bg-card)', maxHeight: '75vh', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <div style={{ width: '2rem', height: '3px', borderRadius: 9999, backgroundColor: 'var(--border-medium)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Selecionar capítulo
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
              {book.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-opacity active:opacity-50"
            style={{ width: '2rem', height: '2rem', backgroundColor: 'var(--bg-secondary)' }}
          >
            <X size={14} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '0 1.25rem' }} />

        {/* Chapter grid */}
        <div className="overflow-y-auto px-5 py-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {chapters.map((ch) => (
              <button
                key={ch}
                onClick={() => onSelect(ch)}
                className="flex items-center justify-center rounded-2xl transition-all active:scale-[0.90]"
                style={{
                  height: '3rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  )
}

// ── Book card ─────────────────────────────────────────────────────
function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-4 flex flex-col justify-between transition-all active:scale-[0.97]"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        minHeight: '5.25rem',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.25,
        display: 'block',
      }}>
        {book.name}
      </span>
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginTop: '0.5rem',
        display: 'block',
      }}>
        {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
      </span>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────
function BooksPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const handleChapterClick = (bookId: number, chapter: number) => {
    setSelectedBook(null)
    navigate(`/read/${bookId}/${chapter}`)
  }

  const handleBookClick = (book: Book) => {
    if (book.chapters === 1) {
      navigate(`/read/${book.id}/1`)
    } else {
      setSelectedBook(book)
    }
  }

  const lastRead = useMemo(() => {
    try {
      const raw = localStorage.getItem('biblia_last_read')
      if (raw) return JSON.parse(raw) as { bookId: number; chapter: number; bookName: string }
    } catch { /* ignore */ }
    return null
  }, [])

  const isSearching = searchQuery.trim().length > 0

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return books.filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const categorySections = useMemo(() =>
    CATEGORIES.map((cat) => ({
      label: cat.label,
      tag: cat.tag,
      books: cat.ids.map((id) => books.find((b) => b.id === id)!).filter(Boolean),
    })).filter((s) => s.books.length > 0),
  [])

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-page)' }}>
      <main className="px-5 pt-5 space-y-6">

        {/* ── Search ── */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            paddingTop: '0.8125rem',
            paddingBottom: '0.8125rem',
          }}
        >
          <Search size={15} strokeWidth={1.6} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar livro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '0.9375rem', fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="transition-opacity active:opacity-50">
              <X size={14} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.map((book) => (
                    <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2.5rem' }}>
                  Nenhum livro encontrado
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="pb-36 space-y-10">
              {categorySections.map((section, si) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.04 }}
                >
                  {/* Section header */}
                  <div className="flex items-baseline justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                      }}>
                        {section.label}
                      </h2>
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        color: 'var(--bg-page)',
                        backgroundColor: 'var(--text-muted)',
                        borderRadius: '999px',
                        padding: '0.15rem 0.5rem',
                        opacity: 0.5,
                      }}>
                        {section.tag}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}>
                      {section.books.length} {section.books.length === 1 ? 'livro' : 'livros'}
                    </span>
                  </div>

                  {/* Books grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {section.books.map((book) => (
                      <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Continue reading bar ── */}
      <AnimatePresence>
        {lastRead && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed left-4 right-4 flex items-center justify-between rounded-2xl px-4 py-3.5"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(16px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Continuar lendo
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {lastRead.bookName} {lastRead.chapter}
              </span>
            </div>
            <button
              onClick={() => navigate(`/read/${lastRead.bookId}/${lastRead.chapter}`)}
              className="flex items-center gap-2 rounded-full px-4 transition-transform active:scale-[0.94]"
              style={{ height: '2.25rem', backgroundColor: 'var(--accent)', flexShrink: 0 }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Ir</span>
              <ArrowRight size={13} strokeWidth={2.5} style={{ color: '#fff' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chapter sheet ── */}
      <AnimatePresence>
        {selectedBook && (
          <ChapterSheet
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onSelect={(ch) => handleChapterClick(selectedBook.id, ch)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default BooksPage
