import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'
import { books } from '../../data/books'
import type { Book } from '../../types/bible'

interface ChapterPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (bookId: number, chapter: number) => void
  currentBookId: number
  currentChapter: number
}

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

export function ChapterPicker({
  isOpen,
  onClose,
  onSelect,
  currentBookId,
  currentChapter,
}: ChapterPickerProps) {
  const navigate = useNavigate()
  const book     = books.find((b) => b.id === currentBookId) ?? books[0]!
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1)

  // drag-to-close
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragY    = useRef(0)
  const startY   = useRef(0)

  // scroll até capítulo ativo
  const activeRef = useRef<HTMLButtonElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? 0
    dragY.current  = 0
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
    dragY.current = dy
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform  = `translateY(${dy}px)`
      sheetRef.current.style.transition = 'none'
    }
  }
  const handleTouchEnd = () => {
    if (dragY.current > 80) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform  = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)'
    }
  }

  // scroll ao abrir
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => {
      activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 200)
    return () => clearTimeout(t)
  }, [isOpen])

  // bloqueia scroll do body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleChapterClick = (ch: number) => {
    onClose()
    // pequeno delay para a animação de fechar começar antes do navigate
    setTimeout(() => onSelect(currentBookId, ch), 80)
  }

  const handleTrocarLivro = () => {
    onClose()
    setTimeout(() => navigate('/books'), 80)
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', touchAction: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => { e.stopPropagation(); e.preventDefault() }}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-[201] flex flex-col"
            style={{
              maxHeight: '75dvh',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '1.5rem 1.5rem 0 0',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab"
              style={{ touchAction: 'none' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: 'var(--border-medium)' }} />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div>
                <p style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.2rem',
                }}>
                  {getCategoryLabel(book)}
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}>
                  {book.name}
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Trocar livro */}
                <button
                  onClick={handleTrocarLivro}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-opacity active:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <BookOpen size={13} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Trocar livro
                  </span>
                </button>

                {/* Fechar */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full transition-opacity active:opacity-50"
                  style={{ width: 32, height: 32, backgroundColor: 'var(--bg-secondary)' }}
                >
                  <X size={15} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>

            {/* Grade de capítulos */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {chapters.map((ch) => {
                  const isActive = ch === currentChapter
                  return (
                    <button
                      key={ch}
                      ref={isActive ? activeRef : undefined}
                      onClick={() => handleChapterClick(ch)}
                      className="aspect-square flex items-center justify-center rounded-2xl transition-all active:scale-90"
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 700 : 400,
                        border: `1px solid ${isActive ? 'transparent' : 'var(--border-subtle)'}`,
                        boxShadow: isActive ? '0 4px 12px rgba(255,140,66,0.4)' : 'none',
                      }}
                    >
                      {ch}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
