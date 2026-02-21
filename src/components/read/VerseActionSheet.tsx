import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Heart,
  HeartOff,
  Highlighter,
  StickyNote,
  Share2,
  X,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { HighlightColor } from '../../types/database'

interface VerseActionSheetProps {
  isOpen: boolean
  onClose: () => void
  verse: number
  bookId: number
  chapter: number
  bookName: string
  isFavorited: boolean
  hasHighlight: boolean
  currentHighlightColor?: string
  onDictionary: () => void
  onToggleFavorite: () => void
  onHighlight: (color: HighlightColor) => void
  onRemoveHighlight: () => void
  onNote: () => void
}

const highlightColors: { color: HighlightColor; label: string; bg: string; border: string }[] = [
  { color: 'white', label: 'Branco', bg: 'bg-white', border: 'border-gray-300' },
  { color: 'gray', label: 'Cinza', bg: 'bg-gray-400', border: 'border-gray-500' },
  { color: 'black', label: 'Preto', bg: 'bg-gray-800', border: 'border-gray-900' },
  { color: 'blue', label: 'Azul', bg: 'bg-blue-500', border: 'border-blue-600' },
]

export function VerseActionSheet({
  isOpen,
  onClose,
  verse,
  bookId: _bookId,
  chapter,
  bookName,
  isFavorited,
  hasHighlight,
  currentHighlightColor,
  onDictionary,
  onToggleFavorite,
  onHighlight,
  onRemoveHighlight,
  onNote,
}: VerseActionSheetProps) {
  const [showHighlightColors, setShowHighlightColors] = useState(false)

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

  const handleClose = useCallback(() => {
    setShowHighlightColors(false)
    onClose()
  }, [onClose])

  const handleHighlightToggle = useCallback(() => {
    setShowHighlightColors((prev) => !prev)
  }, [])

  const handleColorSelect = useCallback(
    (color: HighlightColor) => {
      onHighlight(color)
      setShowHighlightColors(false)
      handleClose()
    },
    [onHighlight, handleClose]
  )

  const handleRemoveHighlight = useCallback(() => {
    onRemoveHighlight()
    setShowHighlightColors(false)
    handleClose()
  }, [onRemoveHighlight, handleClose])

  const handleShare = useCallback(async () => {
    const text = `${bookName} ${chapter}:${verse}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
    handleClose()
  }, [bookName, chapter, verse, handleClose])

  const handleDictionary = useCallback(() => {
    onDictionary()
    handleClose()
  }, [onDictionary, handleClose])

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite()
    handleClose()
  }, [onToggleFavorite, handleClose])

  const handleNote = useCallback(() => {
    onNote()
    handleClose()
  }, [onNote, handleClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{ touchAction: 'none' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => { e.stopPropagation(); e.preventDefault() }}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-[201] w-full max-w-lg mx-auto rounded-t-2xl pb-safe"
            style={{ backgroundColor: 'var(--bg-card)' }}
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
              className="flex justify-center pt-3 pb-1 cursor-grab"
              style={{ touchAction: 'none' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-medium)' }} />
            </div>

            {/* Verse reference */}
            <div
              className="flex items-center justify-between px-5 pb-3 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {bookName} {chapter}:{verse}
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
                aria-label="Fechar"
              >
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 space-y-1">
              {/* Dictionary */}
              <button
                onClick={handleDictionary}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                  'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                )}
              >
                <BookOpen size={20} style={{ color: 'var(--color-secondary)' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Dicionário
                </span>
              </button>

              {/* Favorite */}
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                  'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                )}
              >
                {isFavorited ? (
                  <HeartOff size={20} style={{ color: 'var(--text-secondary)' }} />
                ) : (
                  <Heart size={20} style={{ color: '#ef4444' }} />
                )}
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isFavorited ? 'Desfavoritar' : 'Favoritar'}
                </span>
              </button>

              {/* Highlight */}
              <div>
                <button
                  onClick={handleHighlightToggle}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                    'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]',
                    showHighlightColors && 'bg-[var(--bg-secondary)]'
                  )}
                >
                  <Highlighter size={20} style={{ color: 'var(--color-secondary)' }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Destacar
                  </span>
                </button>

                {/* Highlight color picker */}
                <AnimatePresence>
                  {showHighlightColors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-12 py-3">
                        {highlightColors.map((item) => (
                          <button
                            key={item.color}
                            onClick={() => handleColorSelect(item.color)}
                            className={cn(
                              'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                              item.bg,
                              item.border,
                              currentHighlightColor === item.color &&
                                'ring-2 ring-offset-2 ring-[var(--color-secondary)]'
                            )}
                            aria-label={item.label}
                            title={item.label}
                          />
                        ))}

                        {/* Remove highlight */}
                        {hasHighlight && (
                          <button
                            onClick={handleRemoveHighlight}
                            className={cn(
                              'ml-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                              'hover:bg-[var(--bg-tertiary)]'
                            )}
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Note */}
              <button
                onClick={handleNote}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                  'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                )}
              >
                <StickyNote size={20} style={{ color: 'var(--color-secondary)' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Anotar
                </span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                  'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                )}
              >
                <Share2 size={20} style={{ color: 'var(--color-secondary)' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Compartilhar
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
