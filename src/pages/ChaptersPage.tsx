import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { getBookById } from '../data/books'
import { useTheme } from '../context/ThemeContext'

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

function ChaptersPage() {
  const { bookId: bookIdStr } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const bookId = bookIdStr ? parseInt(bookIdStr, 10) : 1
  const book = useMemo(() => getBookById(bookId), [bookId])

  const chapters = useMemo(
    () => Array.from({ length: book?.chapters ?? 0 }, (_, i) => i + 1),
    [book]
  )

  if (!book) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Livro não encontrado.</p>
      </div>
    )
  }

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

        {/* Back button + page title */}
        <div>
          <button
            onClick={() => navigate('/books')}
            className="flex items-center gap-1.5 mb-4 transition-opacity active:opacity-50"
            style={{ color: '#9CA3AF' }}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
              }}
            >
              Livros
            </span>
          </button>

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
            {book.name}
          </h1>
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#9CA3AF',
              fontWeight: 400,
              marginTop: '0.4rem',
            }}
          >
            {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
          </p>
        </div>

        {/* Section label */}
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9CA3AF',
            display: 'block',
          }}
        >
          Selecione o capítulo
        </span>

        {/* Chapter grid */}
        <div className="grid grid-cols-5 gap-3">
          {chapters.map((chapter) => (
            <button
              key={chapter}
              onClick={() => navigate(`/read/${bookId}/${chapter}`)}
              className="aspect-square flex items-center justify-center rounded-2xl transition-transform active:scale-[0.94]"
              style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {chapter}
              </span>
            </button>
          ))}
        </div>

      </main>
    </div>
  )
}

export default ChaptersPage
