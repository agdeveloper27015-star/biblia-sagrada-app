import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Trash2, Clock, Library,
  StickyNote, Search, X, Calendar,
  ChevronRight, Plus, PenLine,
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

const NOTE_ACCENTS = [
  { dot: '#F97316' },
  { dot: '#A855F7' },
  { dot: '#10B981' },
  { dot: '#3B82F6' },
]

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }: { icon: typeof Heart; message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center pt-24 px-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="flex items-center justify-center rounded-3xl mb-5"
        style={{
          width: '4rem', height: '4rem',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Icon size={26} strokeWidth={1.3} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
      </div>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        fontWeight: 400,
        textAlign: 'center',
        lineHeight: 1.7,
        maxWidth: '18rem',
      }}>
        {message}
      </p>
    </motion.div>
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
        results.push({
          book: fav.book, chapter: fav.chapter, verse: fav.verse,
          text: verse?.text ?? '', bookName: book?.name ?? 'Livro',
          created_at: fav.created_at,
        })
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
  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  if (favorites.length === 0) return (
    <EmptyState icon={Heart} message="Toque em qualquer versículo durante a leitura para salvá-lo aqui" />
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tab pills */}
      <div className="flex gap-2 mb-2">
        {([
          { key: 'recent' as FavTab, label: 'Recentes', icon: Clock },
          { key: 'book' as FavTab, label: 'Por Livro', icon: Library },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 transition-all"
            style={{
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: activeTab === key ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === key ? 'var(--bg-page)' : 'var(--text-muted)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <Icon size={10} strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recent' ? (
          <motion.div key="recent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2.5">
            {favTexts.map((fav, i) => (
              <motion.div
                key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.04 }}
                layout
                className="flex items-center gap-3 active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '1.125rem',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem 1rem 1rem 1.125rem',
                }}
              >
                {/* Left accent bar */}
                <div style={{ width: 3, height: '2.5rem', borderRadius: 9999, backgroundColor: 'var(--accent)', flexShrink: 0, opacity: 0.7 }} />

                <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)}>
                  <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {fav.bookName} {fav.chapter}:{fav.verse}
                  </span>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 400 }} className="line-clamp-2">
                    {fav.text}
                  </p>
                </button>

                <button
                  onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)}
                  className="shrink-0 p-2 rounded-xl transition-all active:opacity-50 hover:bg-[var(--bg-secondary)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} strokeWidth={1.6} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="book" className="flex flex-col gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {groupedByBook.map((group) => (
              <div key={group.book.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {group.book.name}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {group.items.length}
                  </span>
                </div>
                {group.items.map((fav) => (
                  <div
                    key={`${fav.book}-${fav.chapter}-${fav.verse}`}
                    className="flex items-center gap-3 active:scale-[0.98] transition-transform"
                    style={{ backgroundColor: 'var(--bg-card)', borderRadius: '1.125rem', border: '1px solid var(--border-subtle)', padding: '1rem 1rem 1rem 1.125rem' }}
                  >
                    <div style={{ width: 3, height: '2.5rem', borderRadius: 9999, backgroundColor: 'var(--accent)', flexShrink: 0, opacity: 0.7 }} />
                    <button onClick={() => navigate(`/read/${fav.book}/${fav.chapter}`)} className="flex-1 min-w-0 text-left">
                      <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        Cap. {fav.chapter}:{fav.verse}
                      </span>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 400 }} className="line-clamp-2">
                        {fav.text}
                      </p>
                    </button>
                    <button onClick={(e) => handleRemove(fav.book, fav.chapter, fav.verse, e)} className="shrink-0 p-2 rounded-xl transition-all active:opacity-50" style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={14} strokeWidth={1.6} />
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

// ── Gaveta nova nota ──────────────────────────────────────────────
function NewNoteModal({ title, content, saving, onTitleChange, onContentChange, onSave, onClose }: {
  title: string; content: string; saving: boolean
  onTitleChange: (v: string) => void; onContentChange: (v: string) => void
  onSave: () => void; onClose: () => void
}) {
  const dragY = useRef(0)
  const startY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0]?.clientY ?? 0; dragY.current = 0 }
  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
    dragY.current = dy
    if (dy > 0 && sheetRef.current) { sheetRef.current.style.transform = `translateY(${dy}px)`; sheetRef.current.style.transition = 'none' }
  }
  const handleTouchEnd = () => {
    if (dragY.current > 80) { onClose() }
    else if (sheetRef.current) { sheetRef.current.style.transform = 'translateY(0)'; sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)' }
  }

  return createPortal(
    <AnimatePresence>
      <>
        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200]" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

        <motion.div key="sheet" ref={sheetRef}
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          className="fixed z-[201] rounded-3xl flex flex-col"
          style={{ left: '1rem', right: '1rem', bottom: 'calc(env(safe-area-inset-bottom) + 5rem)', backgroundColor: 'var(--bg-card)', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0" style={{ cursor: 'grab', touchAction: 'none' }}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div style={{ width: '2rem', height: '3px', borderRadius: 9999, backgroundColor: 'var(--border-medium)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <PenLine size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Nova anotação
              </p>
            </div>
            <button onClick={onClose}
              className="flex items-center justify-center rounded-full transition-opacity active:opacity-50"
              style={{ width: '1.875rem', height: '1.875rem', backgroundColor: 'var(--bg-secondary)' }}>
              <X size={13} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-2.5 px-5 pb-5">
            <input type="text" placeholder="Título (opcional)" value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full outline-none rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', border: '1px solid transparent' }} />
            <textarea placeholder="Escreva sua anotação..." value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={4} className="w-full outline-none rounded-2xl px-4 py-3 resize-none"
              style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', border: '1px solid transparent' }} />
            <button onClick={onSave} disabled={!content.trim() || saving}
              className="w-full py-3.5 rounded-2xl transition-all active:opacity-70"
              style={{ backgroundColor: content.trim() ? 'var(--accent)' : 'var(--bg-secondary)', color: content.trim() ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '0.02em' }}>
              {saving ? 'Salvando...' : 'Salvar anotação'}
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  )
}

// ── FAB nova nota ─────────────────────────────────────────────────
function NotesFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.15 }}
      className="fixed z-50 flex items-center gap-2.5 transition-transform active:scale-[0.94]"
      style={{
        right: '1.25rem',
        bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)',
        backgroundColor: 'var(--accent)',
        borderRadius: '9999px',
        paddingLeft: '1.125rem',
        paddingRight: '1.375rem',
        height: '3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}
    >
      <Plus size={17} strokeWidth={2.5} style={{ color: '#fff' }} />
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
        Nova nota
      </span>
    </motion.button>
  )
}

// ── Notas ─────────────────────────────────────────────────────────
function NotesTab() {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreateNote = async () => {
    if (!newContent.trim()) return
    setSaving(true)
    await addNote(1, 1, 1, newContent.trim(), newTitle.trim() || undefined)
    setNewTitle(''); setNewContent(''); setSaving(false); setShowNewNote(false)
  }

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

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  if (notes.length === 0) return (
    <>
      <EmptyState icon={StickyNote} message="Suas reflexões e anotações pessoais aparecerão aqui" />
      {/* FAB sempre visível */}
      <NotesFAB onClick={() => setShowNewNote(true)} />
      {showNewNote && (
        <NewNoteModal title={newTitle} content={newContent} saving={saving}
          onTitleChange={setNewTitle} onContentChange={setNewContent}
          onSave={handleCreateNote} onClose={() => setShowNewNote(false)} />
      )}
    </>
  )

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 mb-1"
        style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.875rem', border: '1px solid var(--border-subtle)' }}>
        <Search size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar nas anotações..."
          autoComplete="off" className="flex-1 bg-transparent outline-none"
          style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 400, fontFamily: 'var(--font-sans)' }} />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="flex items-center justify-center transition-opacity active:opacity-50"
            style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}>
            <X size={10} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {filteredNotes.length === 0 && searchQuery ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>
          Nenhuma anotação para "{searchQuery}"
        </p>
      ) : (
        <AnimatePresence>
          {filteredNotes.map((note, i) => {
            const book = getBookById(note.book)
            const accent = NOTE_ACCENTS[i % NOTE_ACCENTS.length]!
            return (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.04 }}
                layout
                onClick={() => setEditingNoteId(note.id)}
                className="w-full text-left active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '1.25rem',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.125rem',
                  marginBottom: '0.625rem',
                  display: 'block',
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: accent.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {book?.name} {note.chapter}:{note.verse}
                    </span>
                  </div>
                  <span className="flex items-center gap-1" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    <Calendar size={9} strokeWidth={1.5} />
                    {formatDate(note.updated_at || note.created_at)}
                  </span>
                </div>

                {/* Title */}
                {note.title && (
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.3 }} className="line-clamp-1">
                    {note.title}
                  </p>
                )}

                {/* Content */}
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-muted)', fontWeight: 400 }} className="line-clamp-2">
                  {note.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-end mt-3">
                  <ChevronRight size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      )}

      {/* FAB */}
      <NotesFAB onClick={() => setShowNewNote(true)} />

      {showNewNote && (
        <NewNoteModal title={newTitle} content={newContent} saving={saving}
          onTitleChange={setNewTitle} onContentChange={setNewContent}
          onSave={handleCreateNote} onClose={() => setShowNewNote(false)} />
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

  const tabs: { key: MainTab; label: string; count: number }[] = [
    { key: 'favorites', label: 'Favoritos', count: favorites.length },
    { key: 'notes',     label: 'Notas',     count: notes.length     },
  ]

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="px-5 pt-4 pb-0 shrink-0">

        {/* Tabs */}
        <div className="flex gap-0 mt-2 relative">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="relative pb-3 mr-7 transition-colors"
              style={{
                fontSize: '0.75rem',
                fontWeight: activeTab === key ? 700 : 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center rounded-full"
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    width: '1.1rem',
                    height: '1.1rem',
                    backgroundColor: activeTab === key ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: activeTab === key ? '#fff' : 'var(--text-muted)',
                    verticalAlign: 'middle',
                  }}
                >
                  {count}
                </span>
              )}
              {/* Animated underline */}
              {activeTab === key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 2, backgroundColor: 'var(--text-primary)', borderRadius: 9999 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
          {/* Full width baseline */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'favorites' ? <FavoritesTab /> : <NotesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SavedPage
