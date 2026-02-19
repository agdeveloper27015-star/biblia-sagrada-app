import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X, ChevronDown, ArrowRight } from 'lucide-react'
import { books, getBooksByTestament } from '../data/books'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import type { Book } from '../types/bible'

type Testament = 'old' | 'new'

// ── Wave Logo ────────────────────────────────────────────────────────────────
function WaveLogo() {
  return (
    <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
      <path
        d="M1 8.5C5.5 8.5 7.5 4.5 9 1.5C10.5 -1.5 14 1 16 5C18 9 20 12.5 24 12.5C28 12.5 31 10 31 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}

// ── Category label derived from book id ──────────────────────────────────────
function getCategoryLabel(book: Book): string {
  const id = book.id
  if (book.testament === 'old') {
    if (id <= 5)  return 'Pentateuco'
    if (id <= 17) return 'Históricos'
    if (id <= 22) return 'Poéticos'
    if (id <= 39) return 'Proféticos'
  } else {
    if (id <= 43) return 'Evangelhos'
    if (id === 44) return 'História'
    if (id <= 58) return 'Epístolas'
    if (id <= 65) return 'Epístolas Gerais'
    if (id === 66) return 'Profecia'
  }
  return ''
}

// ── Initial visible count ─────────────────────────────────────────────────────
const INITIAL_COUNT = 8

function BooksPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [activeTestament, setActiveTestament] = useState<Testament>('old')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllOld, setShowAllOld] = useState(false)
  const [showAllNew, setShowAllNew] = useState(false)

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

  // Determine last-read from localStorage for the sticky bar
  const lastRead = useMemo(() => {
    try {
      const raw = localStorage.getItem('biblia_last_read')
      if (raw) return JSON.parse(raw) as { bookId: number; chapter: number; bookName: string }
    } catch { /* ignore */ }
    return null
  }, [])

  // Which books to show (search overrides testament logic)
  const isSearching = searchQuery.trim().length > 0
  const displayOld = isSearching ? filteredBooks.filter((b) => b.testament === 'old') : oldBooks
  const displayNew = isSearching ? filteredBooks.filter((b) => b.testament === 'new') : newBooks

  const visibleOld = showAllOld ? displayOld : displayOld.slice(0, INITIAL_COUNT)
  const visibleNew = showAllNew ? displayNew : displayNew.slice(0, INITIAL_COUNT)

  // ── Shared label style ────────────────────────────────────────────────────
  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#9CA3AF',
  }

  // ── Render a book card ────────────────────────────────────────────────────
  const renderCard = (book: Book, isActive = false) => (
    <button
      key={book.id}
      onClick={() => handleBookClick(book.id, book.chapters)}
      className="text-left rounded-2xl p-5 flex flex-col justify-between transition-transform active:scale-[0.97]"
      style={{
        backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: '6rem',
      }}
    >
      <span
        style={{
          ...sectionLabelStyle,
          color: isActive ? 'rgba(255,255,255,0.5)' : '#9CA3AF',
        }}
      >
        {getCategoryLabel(book)}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.125rem',
          fontWeight: 500,
          color: isActive ? '#ffffff' : 'var(--text-primary)',
          lineHeight: 1.2,
          marginTop: '0.75rem',
          display: 'block',
        }}
      >
        {book.name}
      </span>
    </button>
  )

  // ── Render a testament section ────────────────────────────────────────────
  const renderSection = (
    title: string,
    bookList: Book[],
    visible: Book[],
    showAll: boolean,
    onToggle: () => void,
  ) => (
    <div>
      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
        <span style={{ ...sectionLabelStyle, alignSelf: 'flex-end', paddingBottom: '0.2rem' }}>
          {bookList.length} livros
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {visible.map((book) => renderCard(book))}
      </div>

      {/* Ver todos button */}
      {!showAll && bookList.length > INITIAL_COUNT && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 transition-opacity active:opacity-50"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            Ver todos
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-dvh pb-28" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Top Nav ── */}
      <header className="flex items-center justify-between px-5 pt-10 pb-5">
        {/* Wave logo */}
        <div style={{ color: 'var(--text-primary)' }}>
          <WaveLogo />
        </div>

        {/* Nav links */}
        <nav className="flex gap-5">
          {[
            { label: 'Início',  to: '/'        },
            { label: 'Bíblia',  to: '/books'   },
            { label: 'Config.', to: '/profile' },
          ].map(({ label, to }) => {
            const isActive = to === '/books'
            return (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : '#9CA3AF',
                  borderBottom: isActive ? '2px solid var(--text-primary)' : 'none',
                  paddingBottom: isActive ? '2px' : '0',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle avatar */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-full border transition-colors"
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          {theme === 'dark'
            ? <Sun size={15} strokeWidth={1.5} />
            : <Moon size={15} strokeWidth={1.5} />}
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="px-5 space-y-6">

        {/* Page title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          Livros
        </h1>

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
          <Search size={16} strokeWidth={1.5} style={{ color: '#9CA3AF', flexShrink: 0 }} />
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
              <X size={15} strokeWidth={2} style={{ color: '#9CA3AF' }} />
            </button>
          )}
        </div>

        {/* Testament tabs (hidden while searching) */}
        {!isSearching && (
          <div className="flex gap-5">
            {(['old', 'new'] as Testament[]).map((t) => {
              const isActive = activeTestament === t
              return (
                <button
                  key={t}
                  onClick={() => setActiveTestament(t)}
                  className="pb-2 relative transition-colors"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--text-primary)' : '#9CA3AF',
                  }}
                >
                  {t === 'old' ? 'Antigo Testamento' : 'Novo Testamento'}
                  {isActive && (
                    <motion.div
                      layoutId="testament-tab-indicator"
                      className="absolute bottom-0 left-0 right-0"
                      style={{ height: '2px', backgroundColor: 'var(--text-primary)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Book sections */}
        {isSearching ? (
          // Search results: show both testaments if matches exist
          <div className="space-y-8">
            {displayOld.length > 0 && renderSection(
              'Antigo Testamento',
              displayOld,
              displayOld,
              true,
              () => {},
            )}
            {displayNew.length > 0 && renderSection(
              'Novo Testamento',
              displayNew,
              displayNew,
              true,
              () => {},
            )}
            {displayOld.length === 0 && displayNew.length === 0 && (
              <p style={{ fontSize: '0.9375rem', color: '#9CA3AF', textAlign: 'center', paddingTop: '2rem' }}>
                Nenhum livro encontrado.
              </p>
            )}
          </div>
        ) : activeTestament === 'old' ? (
          renderSection(
            'Antigo Testamento',
            oldBooks,
            visibleOld,
            showAllOld,
            () => setShowAllOld(true),
          )
        ) : (
          renderSection(
            'Novo Testamento',
            newBooks,
            visibleNew,
            showAllNew,
            () => setShowAllNew(true),
          )
        )}

      </main>

      {/* ── Sticky continue reading bar ── */}
      {lastRead && (
        <div
          className="fixed bottom-20 left-4 right-4 flex items-center justify-between rounded-2xl p-4"
          style={{
            backgroundColor: 'rgba(208,224,229,0.3)',
            border: '1px solid rgba(208,224,229,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
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
              backgroundColor: 'var(--text-primary)',
              flexShrink: 0,
            }}
          >
            <ArrowRight size={16} strokeWidth={2} style={{ color: '#ffffff' }} />
          </button>
        </div>
      )}

    </div>
  )
}

export default BooksPage
