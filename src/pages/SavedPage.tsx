import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Trash2, Clock, Library,
  StickyNote, Search, X, Calendar,
  ChevronRight, Plus,
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

// Note accent colors cycling by index
const NOTE_ACCENTS = [
  { bg: '#FFF4E5', dot: '#F97316' },   // orange
  { bg: '#F3E8FF', dot: '#A855F7' },   // purple
  { bg: '#ECFDF5', dot: '#10B981' },   // green
  { bg: '#EFF6FF', dot: '#3B82F6' },   // blue
]

// ── Top Nav ──────────────────────────────────────────────────────
function TopNav() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: isActive(path) ? 700 : 500,
    color: isActive(path) ? 'var(--text-primary)' : '#9CA3AF',
    borderBottom: isActive(path) ? '2px solid var(--text-primary)' : '2px solid transparent',
    paddingBottom: '2px',
    textDecoration: 'none',
    transition: 'color 0.15s',
  })

  return (
    <nav
      className="flex items-center justify-between px-5 py-3 shrink-0"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div style={{ color: 'var(--text-primary)' }}>
        <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
          <path
            d="M1 8.5C5.5 8.5 7.5 4.5 9 1.5C10.5 -1.5 14 1 16 5C18 9 20 12.5 24 12.5C28 12.5 31 10 31 10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/" style={navLinkStyle('/')}>Início</Link>
        <Link to="/books" style={navLinkStyle('/books')}>Bíblia</Link>
        <Link to="/profile" style={navLinkStyle('/profile')}>Config.</Link>
      </div>

      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>U</span>
      </button>
    </nav>
  )
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
    <motion.div
      className="flex flex-col items-center justify-center pt-20 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Heart
        size={44}
        strokeWidth={1.2}
        style={{ color: '#9CA3AF', opacity: 0.4, marginBottom: '1.25rem' }}
      />
      <p style={{ fontSize: '0.9375rem', color: '#9CA3AF', fontWeight: 400, textAlign: 'center', lineHeight: 1.65 }}>
        Toque em um versículo durante a leitura para salvar nos favoritos
      </p>
    </motion.div>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tab pills */}
      <div className="flex gap-2 mb-1">
        {([
          { key: 'recent' as FavTab, label: 'Recentes', icon: Clock },
          { key: 'book' as FavTab, label: 'Por Livro', icon: Library },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={{
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: activeTab === key ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === key ? '#FFFFFF' : '#9CA3AF',
              boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
            }}
          >
            <Icon size={10} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recent' ? (
          <motion.div
            key="recent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {favTexts.map((fav, i) => (
              <motion.div
                key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="flex items-start gap-3 active:scale-[0.97] transition-transform"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
                  padding: '1.125rem',
                }}
              >
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#9CA3AF',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {fav.bookName} {fav.chapter}:{fav.verse}
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.65,
                      color: 'var(--text-primary)',
                      fontWeight: 400,
                    }}
                    className="line-clamp-2"
                  >
                    {fav.text}
                  </p>
                </button>
                <button
                  onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                  className="shrink-0 p-1.5 transition-opacity active:opacity-50 mt-0.5"
                  style={{ color: '#9CA3AF' }}
                >
                  <Trash2 size={15} strokeWidth={1.6} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="book"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {groupedByBook.map((group) => (
              <div key={group.book.id} className="flex flex-col gap-2">
                {/* Book label */}
                <div className="flex items-center gap-2 px-1">
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#9CA3AF',
                    }}
                  >
                    {group.book.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: '#9CA3AF',
                      fontWeight: 400,
                    }}
                  >
                    · {group.items.length}
                  </span>
                </div>

                {group.items.map((fav) => (
                  <div
                    key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                    className="flex items-start gap-3 active:scale-[0.97] transition-transform"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '1.25rem',
                      boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
                      padding: '1.125rem',
                    }}
                  >
                    <button
                      onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: '#9CA3AF',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Cap. {fav.chapter}:{fav.verse}
                      </span>
                      <p
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '0.9375rem',
                          lineHeight: 1.65,
                          color: 'var(--text-primary)',
                          fontWeight: 400,
                        }}
                        className="line-clamp-2"
                      >
                        {fav.text}
                      </p>
                    </button>
                    <button
                      onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                      className="shrink-0 p-1.5 transition-opacity active:opacity-50 mt-0.5"
                      style={{ color: '#9CA3AF' }}
                    >
                      <Trash2 size={15} strokeWidth={1.6} />
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
    <motion.div
      className="flex flex-col items-center justify-center pt-20 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <StickyNote
        size={44}
        strokeWidth={1.2}
        style={{ color: '#9CA3AF', opacity: 0.4, marginBottom: '1.25rem' }}
      />
      <p style={{ fontSize: '0.9375rem', color: '#9CA3AF', fontWeight: 400, textAlign: 'center', lineHeight: 1.65 }}>
        Clique em um versículo durante a leitura para adicionar anotações
      </p>
    </motion.div>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Search input card */}
      <div
        className="input-card flex items-center gap-3 px-4 py-3 mb-1"
        style={{ borderRadius: '0.875rem' }}
      >
        <Search size={15} strokeWidth={1.8} style={{ color: '#9CA3AF', flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar nas anotações..."
          autoComplete="off"
          className="flex-1 bg-transparent outline-none"
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            fontWeight: 400,
            fontFamily: 'var(--font-sans)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="transition-opacity active:opacity-50 flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <X size={11} style={{ color: '#9CA3AF' }} />
          </button>
        )}
      </div>

      {filteredNotes.length === 0 && searchQuery ? (
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 400, textAlign: 'center', paddingTop: '2rem' }}>
          Nenhuma anotação para &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <AnimatePresence>
          {filteredNotes.map((note, i) => {
            const book = getBookById(note.book)
            const accent = NOTE_ACCENTS[i % NOTE_ACCENTS.length]!
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="active:scale-[0.97] transition-transform"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
                  padding: '1.125rem',
                  marginBottom: '0.75rem',
                }}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setEditingNoteId(note.id)}
                >
                  {/* Header row: reference + date */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#9CA3AF',
                      }}
                    >
                      {book?.name} {note.chapter}:{note.verse}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 400 }}
                    >
                      <Calendar size={9} strokeWidth={1.5} />
                      {formatDate(note.updated_at || note.created_at)}
                    </span>
                  </div>

                  {/* Colored dot */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: accent.dot,
                        flexShrink: 0,
                      }}
                    />
                    {note.title && (
                      <p
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                        className="line-clamp-1"
                      >
                        {note.title}
                      </p>
                    )}
                  </div>

                  {/* Content preview */}
                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: '#9CA3AF',
                      fontWeight: 400,
                    }}
                    className="line-clamp-2"
                  >
                    {note.content}
                  </p>
                </button>

                {/* Footer: arrow */}
                <div className="flex items-center justify-end mt-2">
                  <ChevronRight size={15} strokeWidth={1.8} style={{ color: '#9CA3AF' }} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
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

  const pageTitle = activeTab === 'favorites' ? 'Favoritos' : 'Suas Notas'
  const itemCount = activeTab === 'favorites' ? favorites.length : notes.length

  return (
    <div
      className="min-h-dvh pb-28 flex flex-col"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <TopNav />

      {/* Page header */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginBottom: '0.35rem',
              }}
            >
              {pageTitle}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 400 }}>
              {itemCount === 0
                ? 'Nenhum item salvo'
                : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
            </p>
          </div>

          {/* FAB: add note */}
          <Link
            to="/notes/new"
            className="btn-fab shrink-0 mt-2"
            aria-label="Adicionar anotação"
          >
            <Plus size={22} strokeWidth={2} />
          </Link>
        </div>

        {/* Main tabs */}
        <div className="flex gap-6 mt-5">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="relative pb-3 transition-colors"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === key ? 'var(--text-primary)' : '#9CA3AF',
                borderBottom: activeTab === key
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="ml-1.5"
                  style={{
                    fontSize: '0.6rem',
                    color: activeTab === key ? 'var(--text-primary)' : '#9CA3AF',
                    fontWeight: 500,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-4">
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
  )
}

export default SavedPage
