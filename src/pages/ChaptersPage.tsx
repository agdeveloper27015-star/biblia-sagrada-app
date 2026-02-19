import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Livro não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-10 pb-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => navigate('/books')}
          className="p-1 -ml-1 transition-opacity active:opacity-50"
          style={{ color: 'var(--text-primary)' }}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: 'var(--text-primary)',
          }}>
            {book.name}
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.1rem', letterSpacing: '0.08em' }}>
            {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
          </p>
        </div>
      </div>

      {/* Chapter grid */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-5 pt-5 pb-3" style={{
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Selecione o capítulo
        </p>
        <div className="px-5 pb-8 grid grid-cols-6 gap-2.5">
          {chapters.map((chapter) => (
            <motion.button
              key={chapter}
              onClick={() => navigate(`/read/${bookId}/${chapter}`)}
              whileTap={{ scale: 0.93 }}
              className="aspect-square flex items-center justify-center rounded-lg transition-colors active:opacity-60"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: '1px solid var(--border-subtle)',
              }}
            >
              {chapter}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChaptersPage
