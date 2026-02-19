import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, BookOpen, Clock, Library } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { cn } from '../lib/cn'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { Book } from '../types/bible'

type FilterTab = 'recent' | 'book'

interface FavoriteWithText {
  book: number
  chapter: number
  verse: number
  text: string
  bookName: string
  created_at: string
}

function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, removeFavorite, isLoading: isFavoritesLoading } = useFavorites()
  const [activeTab, setActiveTab] = useState<FilterTab>('recent')
  const [favoriteTexts, setFavoriteTexts] = useState<FavoriteWithText[]>([])
  const [isLoadingTexts, setIsLoadingTexts] = useState(true)

  useEffect(() => {
    if (isFavoritesLoading) return
    let cancelled = false
    setIsLoadingTexts(true)
    const loadTexts = async () => {
      const results: FavoriteWithText[] = []
      for (const fav of favorites) {
        const book = getBookById(fav.book)
        const chapter = await getChapter(fav.book, fav.chapter)
        const verse = chapter?.verses.find((v) => v.verse === fav.verse)
        results.push({
          book: fav.book,
          chapter: fav.chapter,
          verse: fav.verse,
          text: verse?.text ?? '',
          bookName: book?.name ?? 'Livro',
          created_at: fav.created_at,
        })
      }
      if (!cancelled) { setFavoriteTexts(results); setIsLoadingTexts(false) }
    }
    loadTexts()
    return () => { cancelled = true }
  }, [favorites, isFavoritesLoading])

  const groupedByBook = useMemo(() => {
    const groups = new Map<number, { book: Book; items: FavoriteWithText[] }>()
    for (const fav of favoriteTexts) {
      const book = getBookById(fav.book)
      if (!book) continue
      if (!groups.has(fav.book)) groups.set(fav.book, { book, items: [] })
      groups.get(fav.book)!.items.push(fav)
    }
    return Array.from(groups.values()).sort((a, b) => a.book.id - b.book.id)
  }, [favoriteTexts])

  const handleRemove = useCallback(
    async (book: number, chapter: number, verse: number, e: React.MouseEvent) => {
      e.stopPropagation()
      await removeFavorite(book, chapter, verse)
    },
    [removeFavorite]
  )

  const handleNavigate = useCallback(
    (bookId: number, chapter: number) => { navigate(`/read/${bookId}/${chapter}`) },
    [navigate]
  )

  const isLoading = isFavoritesLoading || isLoadingTexts

  return (
    <div className="min-h-dvh px-4 pt-5 pb-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[1.4rem] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Favoritos
          </h1>
          {favorites.length > 0 && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', color: 'white', boxShadow: '0 2px 8px rgba(232,67,147,0.35)' }}
            >
              <Heart size={11} fill="currentColor" />
              {favorites.length}
            </span>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      {favorites.length > 0 && (
        <motion.div
          className="flex rounded-2xl p-1 mb-4"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {(['recent', 'book'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200')}
              style={
                activeTab === tab
                  ? {
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-card)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }
                  : { color: 'var(--text-muted)' }
              }
            >
              {tab === 'recent' ? <Clock size={15} /> : <Library size={15} />}
              {tab === 'recent' ? 'Recentes' : 'Por Livro'}
            </button>
          ))}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && favorites.length === 0 && (
        <motion.div className="flex flex-col items-center justify-center pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            className="p-5 rounded-3xl mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(232,67,147,0.08) 0%, rgba(232,67,147,0.04) 100%)', border: '1px solid var(--border-subtle)' }}
          >
            <Heart size={40} strokeWidth={1.2} style={{ color: '#e84393', opacity: 0.5 }} />
          </div>
          <p className="text-base font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            Nenhum favorito ainda
          </p>
          <p className="text-sm text-center max-w-[280px]" style={{ color: 'var(--text-muted)' }}>
            Toque no coração ao ler para salvar versículos.
          </p>
        </motion.div>
      )}

      {/* Recent */}
      {!isLoading && favorites.length > 0 && activeTab === 'recent' && (
        <motion.div className="flex flex-col gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimatePresence>
            {favoriteTexts.map((fav, index) => (
              <motion.button
                key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                onClick={() => handleNavigate(fav.book, fav.chapter)}
                className="w-full text-left card p-4 active:scale-[0.98] transition-transform"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                layout
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <BookOpen size={11} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {fav.bookName} {fav.chapter}:{fav.verse}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {fav.text}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                    className="shrink-0 p-2 rounded-xl transition-colors active:scale-90"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* By Book */}
      {!isLoading && favorites.length > 0 && activeTab === 'book' && (
        <motion.div className="flex flex-col gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {groupedByBook.map((group) => (
            <div key={group.book.id}>
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {group.book.name}
                </span>
                <span
                  className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {group.items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((fav) => (
                  <button
                    key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                    onClick={() => handleNavigate(fav.book, fav.chapter)}
                    className="w-full text-left card p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Capítulo {fav.chapter}:{fav.verse}
                        </span>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                          {fav.text}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                        className="shrink-0 p-2 rounded-xl transition-colors active:scale-90"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default FavoritesPage
