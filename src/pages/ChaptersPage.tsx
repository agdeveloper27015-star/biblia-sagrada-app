import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getBookById } from '../data/books'

function ChaptersPage() {
  const { bookId: bookIdStr } = useParams<{ bookId: string }>()
  const navigate = useNavigate()

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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Livro não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-10" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Main content ── */}
      <main className="px-5 pt-5 space-y-6">

        {/* Back button + page title */}
        <div>
          <button
            onClick={() => navigate('/books')}
            className="flex items-center gap-1.5 mb-4 transition-opacity active:opacity-50"
            style={{ color: 'var(--text-muted)' }}
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
              color: 'var(--text-muted)',
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
            color: 'var(--text-muted)',
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
