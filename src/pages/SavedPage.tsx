import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Trash2, Clock, Library,
  StickyNote, Search, X, Calendar,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { NoteEditor } from '../components/notes/NoteEditor'
import type { Book } from '../types/bible'

type MainTab = 'favorites' | 'notes'
type FavTab = 'recent' | 'book'

interface FavoriteWithText {
  book: number; chapter: number; verse: number
  text: string; bookName: string; created_at: string
}

// ── Favoritos ────────────────────────────────────────────────────
function FavoritesTab() {
  const navigate = useNavigate()
  const { favorites, removeFavorite, isLoading: isFavLoading } = useFavorites()
  const [activeTab, setActiveTab] = useState<FavTab>('recent')
  const [favTexts, setFavTexts] = useState<FavoriteWithText[]>([])
  const [isLoadingTexts, setIsLoadingTexts] = useState(true)

  useEffect(() => {
    if (isFavLoading) return
    let cancelled = false
    setIsLoadingTexts(true)
    ;(async () => {
      const results: FavoriteWithText[] = []
      for (const fav of favorites) {
        const book = getBookById(fav.book)
        const ch = await getChapter(fav.book, fav.chapter)
        const verse = ch?.verses.find((v) => v.verse === fav.verse)
        results.push({ book: fav.book, chapter: fav.chapter, verse: fav.verse,
          text: verse?.text ?? '', bookName: book?.name ?? 'Livro', created_at: fav.created_at })
      }
      if (!cancelled) { setFavTexts(results); setIsLoadingTexts(false) }
    })()
    return () => { cancelled = true }
  }, [favorites, isFavLoading])

  const groupedByBook = useMemo(() => {
    const groups = new Map<number, { book: Book; items: FavoriteWithText[] }>()
    for (const fav of favTexts) {
      const book = getBookById(fav.book)
      if (!book) continue
      if (!groups.has(fav.book)) groups.set(fav.book, { book, items: [] })
      groups.get(fav.book)!.items.push(fav)
    }
    return Array.from(groups.values()).sort((a, b) => a.book.id - b.book.id)
  }, [favTexts])

  const handleRemove = useCallback(async (book: number, chapter: number, verse: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await removeFavorite(book, chapter, verse)
  }, [removeFavorite])

  const isLoading = isFavLoading || isLoadingTexts

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  if (favorites.length === 0) return (
    <motion.div className="flex flex-col items-center justify-center pt-16 px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Heart size={32} strokeWidth={1.2} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, textAlign: 'center' }}>
        Toque em um versículo durante a leitura para salvar nos favoritos
      </p>
    </motion.div>
  )

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-5 mb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {([
          { key: 'recent' as FavTab, label: 'Recentes', icon: Clock },
          { key: 'book' as FavTab, label: 'Por Livro', icon: Library },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 pb-3 relative transition-colors"
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            <Icon size={11} strokeWidth={1.5} />
            {label}
            {activeTab === key && (
              <motion.div
                layoutId="fav-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ backgroundColor: 'var(--text-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recent' ? (
          <motion.div key="recent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {favTexts.map((fav, i) => (
              <motion.div
                key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -40 }} transition={{ delay: i * 0.03 }} layout
                className="flex items-start gap-3 py-4"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <button
                  className="flex-1 min-w-0 text-left transition-opacity active:opacity-50"
                  onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)}
                >
                  <span style={{
                    display: 'block',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--sage)',
                    marginBottom: '0.35rem',
                  }}>
                    {fav.bookName} {fav.chapter}:{fav.verse}
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.65,
                    color: 'var(--text-primary)',
                    fontWeight: 400,
                  }} className="line-clamp-2">
                    {fav.text}
                  </p>
                </button>
                <button
                  onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                  className="shrink-0 p-1 transition-opacity active:opacity-50 mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} strokeWidth={1.4} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="book" className="flex flex-col gap-6 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {groupedByBook.map((group) => (
              <div key={group.book.id}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}>
                    {group.book.name}
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                  }}>
                    · {group.items.length}
                  </span>
                </div>
                {group.items.map((fav) => (
                  <div
                    key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                    className="flex items-start gap-3 py-3.5"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <button
                      onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)}
                      className="flex-1 min-w-0 text-left transition-opacity active:opacity-50"
                    >
                      <span style={{
                        display: 'block',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--sage)',
                        marginBottom: '0.25rem',
                      }}>
                        Cap. {fav.chapter}:{fav.verse}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: 'var(--text-primary)',
                        fontWeight: 400,
                      }} className="line-clamp-2">
                        {fav.text}
                      </p>
                    </button>
                    <button
                      onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                      className="shrink-0 p-1 transition-opacity active:opacity-50 mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} strokeWidth={1.4} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Notas ─────────────────────────────────────────────────────────
function NotesTab() {
  const { notes, updateNote, deleteNote, isLoading } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const editingNote = useMemo(() => notes.find((n) => n.id === editingNoteId) ?? null, [editingNoteId, notes])

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter((n) => n.content.toLowerCase().includes(q) || (n.title?.toLowerCase().includes(q) ?? false))
  }, [notes, searchQuery])

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }
    catch { return '' }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  if (notes.length === 0) return (
    <motion.div className="flex flex-col items-center justify-center pt-16 px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <StickyNote size={32} strokeWidth={1.2} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, textAlign: 'center' }}>
        Clique em um versículo durante a leitura para adicionar anotações
      </p>
    </motion.div>
  )

  return (
    <div>
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        <Search size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar nas anotações..."
          autoComplete="off"
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 300 }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="transition-opacity active:opacity-50">
            <X size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {filteredNotes.length === 0 && searchQuery ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, textAlign: 'center', paddingTop: '2rem' }}>
          Nenhuma anotação para &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <div>
          <AnimatePresence>
            {filteredNotes.map((note, i) => {
              const book = getBookById(note.book)
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -40 }} transition={{ delay: i * 0.03 }} layout
                  className="flex items-start gap-3 py-4"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <button
                    className="flex-1 min-w-0 text-left transition-opacity active:opacity-50"
                    onClick={() => setEditingNoteId(note.id)}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--sage)',
                      }}>
                        {book?.name} {note.chapter}:{note.verse}
                      </span>
                      <span className="flex items-center gap-1" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        <Calendar size={9} />
                        {formatDate(note.updated_at || note.created_at)}
                      </span>
                    </div>
                    {note.title && (
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.2rem' }} className="line-clamp-1">
                        {note.title}
                      </p>
                    )}
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 300 }} className="line-clamp-2">
                      {note.content}
                    </p>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                    className="shrink-0 p-1 transition-opacity active:opacity-50 mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} strokeWidth={1.4} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <NoteEditor
        isOpen={editingNoteId != null}
        onClose={() => setEditingNoteId(null)}
        bookId={editingNote?.book ?? 1}
        chapter={editingNote?.chapter ?? 1}
        verse={editingNote?.verse ?? 1}
        bookName={getBookById(editingNote?.book ?? 1)?.name ?? ''}
        existingNote={editingNote ? { id: editingNote.id, content: editingNote.content, title: editingNote.title } : undefined}
        onSave={async (content, title) => { if (editingNoteId) { await updateNote(editingNoteId, content, title); setEditingNoteId(null) } }}
        onDelete={editingNote ? async () => { await deleteNote(editingNote.id); setEditingNoteId(null) } : undefined}
      />
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
function SavedPage() {
  const location = useLocation()
  const { favorites } = useFavorites()
  const { notes } = useNotes()
  const [activeTab, setActiveTab] = useState<MainTab>(() =>
    location.pathname === '/notes' ? 'notes' : 'favorites'
  )

  useEffect(() => {
    setActiveTab(location.pathname === '/notes' ? 'notes' : 'favorites')
  }, [location.pathname])

  const tabs: { key: MainTab; label: string; icon: typeof Heart; count: number }[] = [
    { key: 'favorites', label: 'Favoritos', icon: Heart, count: favorites.length },
    { key: 'notes', label: 'Notas', icon: StickyNote, count: notes.length },
  ]

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-5 pt-10 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          fontWeight: 200,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          marginBottom: '0.875rem',
        }}>
          Salvos
        </h1>

        {/* Main tabs */}
        <div className="flex gap-5">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 pb-3 relative transition-colors"
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon size={11} strokeWidth={1.5} />
              {label}
              {count > 0 && (
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {count}
                </span>
              )}
              {activeTab === key && (
                <motion.div
                  layoutId="saved-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'favorites' ? <FavoritesTab /> : <NotesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SavedPage
