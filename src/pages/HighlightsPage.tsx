import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter, Trash2, BookOpen } from 'lucide-react'
import { useHighlights } from '../hooks/useHighlights'
import { getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { cn } from '../lib/cn'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { HighlightColor } from '../types/database'

type FilterColor = 'all' | HighlightColor

interface HighlightWithText {
  id: string
  book: number
  chapter: number
  verse_start: number
  verse_end: number
  color: HighlightColor
  bookName: string
  text: string
  created_at: string
}

const COLOR_MAP: Record<HighlightColor, { label: string; dot: string; dotStyle: React.CSSProperties; leftBar: string }> = {
  white: {
    label: 'Branco',
    dot: 'bg-white border border-gray-300',
    dotStyle: {},
    leftBar: 'rgba(200,200,200,0.6)',
  },
  gray: {
    label: 'Cinza',
    dot: 'bg-gray-400',
    dotStyle: {},
    leftBar: 'rgba(130,130,130,0.5)',
  },
  black: {
    label: 'Preto',
    dot: 'bg-gray-800',
    dotStyle: {},
    leftBar: 'rgba(45,52,54,0.5)',
  },
  blue: {
    label: 'Azul',
    dot: '',
    dotStyle: { background: 'linear-gradient(135deg, #7C6EF7 0%, #6C5CE7 100%)' },
    leftBar: 'rgba(108,92,231,0.6)',
  },
}

const FILTER_CHIPS: { value: FilterColor; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'white', label: 'Branco' },
  { value: 'gray', label: 'Cinza' },
  { value: 'black', label: 'Preto' },
  { value: 'blue', label: 'Azul' },
]

function HighlightsPage() {
  const navigate = useNavigate()
  const { highlights, removeHighlight, isLoading: isHighlightsLoading } = useHighlights()
  const [activeFilter, setActiveFilter] = useState<FilterColor>('all')
  const [highlightTexts, setHighlightTexts] = useState<HighlightWithText[]>([])
  const [isLoadingTexts, setIsLoadingTexts] = useState(true)

  useEffect(() => {
    if (isHighlightsLoading) return
    let cancelled = false
    setIsLoadingTexts(true)

    const loadTexts = async () => {
      const results: HighlightWithText[] = []
      for (const hl of highlights) {
        const book = getBookById(hl.book)
        const chapter = await getChapter(hl.book, hl.chapter)
        if (!chapter) continue
        const verses = chapter.verses.filter((v) => v.verse >= hl.verse_start && v.verse <= hl.verse_end)
        const text = verses.map((v) => v.text).join(' ')
        results.push({
          id: hl.id,
          book: hl.book,
          chapter: hl.chapter,
          verse_start: hl.verse_start,
          verse_end: hl.verse_end,
          color: hl.color,
          bookName: book?.name ?? 'Livro',
          text,
          created_at: hl.created_at,
        })
      }
      if (!cancelled) { setHighlightTexts(results); setIsLoadingTexts(false) }
    }

    loadTexts()
    return () => { cancelled = true }
  }, [highlights, isHighlightsLoading])

  const filteredHighlights = useMemo(() => {
    if (activeFilter === 'all') return highlightTexts
    return highlightTexts.filter((hl) => hl.color === activeFilter)
  }, [highlightTexts, activeFilter])

  const handleRemove = useCallback(
    async (highlightId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      await removeHighlight(highlightId)
    },
    [removeHighlight]
  )

  const handleNavigate = useCallback(
    (bookId: number, chapter: number) => { navigate(`/read/${bookId}/${chapter}`) },
    [navigate]
  )

  const formatVerseRange = (start: number, end: number) => (start === end ? `${start}` : `${start}-${end}`)

  const isLoading = isHighlightsLoading || isLoadingTexts

  return (
    <div className="min-h-dvh px-4 pt-5 pb-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        {highlights.length > 0 && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Highlighter size={11} />
            {highlights.length}
          </span>
        )}
      </motion.div>

      {/* Filter chips */}
      {highlights.length > 0 && (
        <motion.div
          className="flex gap-2 mb-5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.value
            return (
              <button
                key={chip.value}
                onClick={() => setActiveFilter(chip.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0'
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg-card)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      }
                    : {
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        boxShadow: 'var(--shadow-subtle)',
                        border: '1px solid var(--border-subtle)',
                      }
                }
              >
                {chip.value !== 'all' && (
                  <span
                    className={cn('w-2.5 h-2.5 rounded-full shrink-0', !COLOR_MAP[chip.value as HighlightColor].dotStyle?.background ? COLOR_MAP[chip.value as HighlightColor].dot : '')}
                    style={COLOR_MAP[chip.value as HighlightColor].dotStyle}
                  />
                )}
                {chip.label}
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && highlights.length === 0 && (
        <motion.div className="flex flex-col items-center justify-center pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            className="p-5 rounded-3xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(253,203,110,0.12) 0%, rgba(230,126,34,0.06) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Highlighter size={40} strokeWidth={1.2} style={{ color: '#e67e22', opacity: 0.6 }} />
          </div>
          <p className="text-base font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            Nenhum destaque
          </p>
          <p className="text-sm text-center max-w-[280px]" style={{ color: 'var(--text-muted)' }}>
            Selecione um versículo e escolha uma cor para destacar.
          </p>
        </motion.div>
      )}

      {/* No results for filter */}
      {!isLoading && highlights.length > 0 && filteredHighlights.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-12">
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Nenhum destaque com esta cor.
          </p>
        </div>
      )}

      {/* Highlights list */}
      {!isLoading && filteredHighlights.length > 0 && (
        <motion.div className="flex flex-col gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimatePresence>
            {filteredHighlights.map((hl, index) => {
              const colorInfo = COLOR_MAP[hl.color]
              return (
                <motion.button
                  key={hl.id}
                  onClick={() => handleNavigate(hl.book, hl.chapter)}
                  className="w-full text-left rounded-2xl p-4 active:scale-[0.98] transition-transform overflow-hidden relative"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${colorInfo.leftBar}`,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  layout
                >
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div
                      className={cn('w-3 h-3 rounded-full shrink-0 mt-1', !colorInfo.dotStyle?.background ? colorInfo.dot : '')}
                      style={colorInfo.dotStyle}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Reference */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <BookOpen size={11} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                          {hl.bookName} {hl.chapter}:{formatVerseRange(hl.verse_start, hl.verse_end)}
                        </span>
                      </div>

                      {/* Text */}
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {hl.text}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleRemove(hl.id, e)}
                      className="shrink-0 p-2 rounded-xl transition-colors active:scale-90"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default HighlightsPage
