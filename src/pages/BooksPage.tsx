import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X, ChevronRight, ArrowLeft } from 'lucide-react'
import { books, getBooksByTestament } from '../data/books'

type Testament = 'old' | 'new'

function BooksPage() {
  const navigate = useNavigate()
  const [activeTestament, setActiveTestament] = useState<Testament>('old')
  const [searchQuery, setSearchQuery] = useState('')

  const oldBooks = useMemo(() => getBooksByTestament('old'), [])
  const newBooks = useMemo(() => getBooksByTestament('new'), [])

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return activeTestament === 'old' ? oldBooks : newBooks
    return books.filter(
      (b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q)
    )
  }, [searchQuery, activeTestament, oldBooks, newBooks])

  const handleBookClick = (bookId: number, chapters: number) => {
    if (chapters === 1) navigate(`/read/${bookId}/1`)
    else navigate(`/books/${bookId}`)
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 px-5 pt-10 pb-4">
          <button
            onClick={() => navigate('/')}
            className="p-1 -ml-1 transition-opacity active:opacity-50"
            style={{ color: 'var(--text-primary)' }}
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            fontWeight: 200,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            Livros
          </h1>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <Search size={15} strokeWidth={1.4} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar livro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)', fontWeight: 300 }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Testament tabs */}
        {!searchQuery && (
          <div className="flex px-5 gap-5">
            {(['old', 'new'] as Testament[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTestament(t)}
                className="pb-3 relative transition-colors"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: activeTestament === t ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {t === 'old' ? 'Antigo' : 'Novo'}
                {activeTestament === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Book list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5">
          {filteredBooks.map((book) => (
            <button
              key={book.id}
              onClick={() => handleBookClick(book.id, book.chapters)}
              className="w-full flex items-center py-4 active:opacity-50 transition-opacity"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span
                style={{
                  width: '2.5rem',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  paddingRight: '1rem',
                  flexShrink: 0,
                }}
              >
                {book.abbreviation}
              </span>
              <div className="flex-1 text-left">
                <p style={{ fontSize: '0.9375rem', fontWeight: 400, color: 'var(--text-primary)' }}>
                  {book.name}
                </p>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                {book.chapters} cap.
              </span>
              <ChevronRight size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BooksPage
