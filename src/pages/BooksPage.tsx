import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, X as Close } from 'lucide-react'
import { books } from '../data/books'
import type { Book } from '../types/bible'

// ── Categories in order ───────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Pentateuco',         ids: [1, 2, 3, 4, 5] },
  { label: 'Históricos',         ids: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { label: 'Poéticos',           ids: [18, 19, 20, 21, 22] },
  { label: 'Profetas Maiores',   ids: [23, 24, 25, 26, 27] },
  { label: 'Profetas Menores',   ids: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
  { label: 'Evangelhos',         ids: [40, 41, 42, 43] },
  { label: 'História',           ids: [44] },
  { label: 'Epístolas de Paulo', ids: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58] },
  { label: 'Epístolas Gerais',   ids: [59, 60, 61, 62, 63, 64, 65] },
  { label: 'Profecia',           ids: [66] },
]

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

  // Determine last-read from localStorage for the sticky bar
  const lastRead = useMemo(() => {
    try {
      const raw = localStorage.getItem('biblia_last_read')
      if (raw) return JSON.parse(raw) as { bookId: number; chapter: number; bookName: string }
    } catch { /* ignore */ }
    return null
  }, [])

  const isSearching = searchQuery.trim().length > 0

  // Search: flat list of matching books
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return books.filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Build category sections with book objects
  const categorySections = useMemo(() =>
    CATEGORIES.map((cat) => ({
      label: cat.label,
      books: cat.ids.map((id) => books.find((b) => b.id === id)!).filter(Boolean),
    })).filter((s) => s.books.length > 0),
  [])

  // ── Shared label style ────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  }

  // ── Render a book card ────────────────────────────────────────────────────
  const renderCard = (book: Book) => (
    <button
      key={book.id}
      onClick={() => handleBookClick(book)}
      className="text-left rounded-2xl p-4 flex flex-col justify-between transition-transform active:scale-[0.97]"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: '5rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          display: 'block',
        }}
      >
        {book.name}
      </span>
      <span style={{ ...labelStyle, marginTop: '0.5rem', display: 'block' }}>
        {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
      </span>
    </button>
  )

  return (
    <div className="min-h-dvh pb-10" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Main content ── */}
      <main className="px-5 pt-5 space-y-6">


        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-sm)',
            paddingTop: '0.875rem',
            paddingBottom: '0.875rem',
          }}
        >
          <Search size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar livro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 400,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="transition-opacity active:opacity-50"
            >
              <X size={15} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Content */}
        {isSearching ? (
          <div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((book) => renderCard(book))}
              </div>
            ) : (
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>
                Nenhum livro encontrado.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {categorySections.map((section) => (
              <div key={section.label}>
                <div className="flex items-center justify-between mb-3">
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                    }}
                  >
                    {section.label}
                  </h2>
                  <span style={{ ...labelStyle, alignSelf: 'flex-end', paddingBottom: '0.15rem' }}>
                    {section.books.length} {section.books.length === 1 ? 'livro' : 'livros'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {section.books.map((book) => renderCard(book))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── Sticky continue reading bar ── */}
      {lastRead && (
        <div
          className="fixed bottom-20 left-4 right-4 flex items-center justify-between rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(8px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Continuar Lendo
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {lastRead.bookName} {lastRead.chapter}
            </span>
          </div>
          <button
            onClick={() => navigate(`/read/${lastRead.bookId}/${lastRead.chapter}`)}
            className="flex items-center justify-center rounded-full transition-transform active:scale-[0.94]"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <ArrowRight size={16} strokeWidth={2} style={{ color: '#ffffff' }} />
          </button>
        </div>
      )}

      {/* ── Chapter bottom sheet ── */}
      <AnimatePresence>
        {selectedBook && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setSelectedBook(null)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-modal)',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div style={{ width: '2.5rem', height: '4px', borderRadius: '9999px', backgroundColor: 'var(--border-medium)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p style={{ ...labelStyle, marginBottom: '0.2rem' }}>Selecionar capítulo</p>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.375rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}>
                    {selectedBook.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="flex items-center justify-center rounded-full transition-opacity active:opacity-50"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <Close size={14} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Chapter grid — scrollable */}
              <div className="overflow-y-auto px-5 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleChapterClick(selectedBook.id, ch)}
                      className="flex items-center justify-center rounded-xl transition-transform active:scale-[0.92]"
                      style={{
                        height: '3rem',
                        backgroundColor: 'var(--bg-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default BooksPage
