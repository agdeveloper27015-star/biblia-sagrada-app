import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Search, Trash2, X, Calendar, BookOpen } from 'lucide-react'
import { useNotes } from '../hooks/useNotes'
import { getBookById } from '../data/books'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { NoteEditor } from '../components/notes/NoteEditor'

function NotesPage() {
  const { notes, updateNote, deleteNote, isLoading } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const editingNote = useMemo(() => {
    if (!editingNoteId) return null
    return notes.find((n) => n.id === editingNoteId) ?? null
  }, [editingNoteId, notes])

  const editingBook = useMemo(() => {
    if (!editingNote) return null
    return getBookById(editingNote.book)
  }, [editingNote])

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter(
      (note) =>
        note.content.toLowerCase().includes(query) ||
        (note.title && note.title.toLowerCase().includes(query))
    )
  }, [notes, searchQuery])

  const handleEditNote = useCallback((noteId: string) => { setEditingNoteId(noteId) }, [])

  const handleSaveNote = useCallback(
    async (content: string, title?: string) => {
      if (!editingNoteId) return
      await updateNote(editingNoteId, content, title)
      setEditingNoteId(null)
    },
    [editingNoteId, updateNote]
  )

  const handleDeleteNoteFromEditor = useCallback(async () => {
    if (!editingNoteId) return
    await deleteNote(editingNoteId)
    setEditingNoteId(null)
  }, [editingNoteId, deleteNote])

  const handleDeleteDirect = useCallback(
    async (noteId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      await deleteNote(noteId)
    },
    [deleteNote]
  )

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

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
          <h1
            className="text-[1.4rem] font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Minhas Anotações
          </h1>
          {notes.length > 0 && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <StickyNote size={11} />
              {notes.length}
            </span>
          )}
        </div>
      </motion.div>

      {/* Search bar */}
      {notes.length > 0 && (
        <motion.div
          className="flex items-center rounded-2xl px-4 py-3.5 mb-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Search size={17} className="shrink-0 mr-3" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas anotações..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="shrink-0 ml-2 p-1.5 rounded-full"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <X size={13} style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notes.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="p-5 rounded-3xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(108,92,231,0.04) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <StickyNote size={40} strokeWidth={1.2} style={{ color: 'var(--color-secondary)', opacity: 0.5 }} />
          </div>
          <p className="text-base font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            Nenhuma anotação
          </p>
          <p className="text-sm text-center max-w-[280px]" style={{ color: 'var(--text-muted)' }}>
            Clique em um versículo durante a leitura para adicionar.
          </p>
        </motion.div>
      )}

      {/* No search results */}
      {!isLoading && notes.length > 0 && filteredNotes.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center pt-12">
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Nenhuma anotação encontrada para &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {/* Notes list */}
      {!isLoading && filteredNotes.length > 0 && (
        <motion.div
          className="flex flex-col gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {filteredNotes.map((note, index) => {
              const book = getBookById(note.book)
              return (
                <motion.button
                  key={note.id}
                  onClick={() => handleEditNote(note.id)}
                  className="w-full text-left card p-4 active:scale-[0.98] transition-transform"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  layout
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Reference */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="p-1.5 rounded-lg"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <BookOpen size={11} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                          {book?.name ?? 'Livro'} {note.chapter}:{note.verse}
                        </span>
                      </div>

                      {/* Title */}
                      {note.title && (
                        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {note.title}
                        </h3>
                      )}

                      {/* Content */}
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {note.content}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[0.65rem]" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(note.updated_at || note.created_at)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDirect(note.id, e)}
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

      {/* Note Editor Modal */}
      <NoteEditor
        isOpen={editingNoteId != null}
        onClose={() => setEditingNoteId(null)}
        bookId={editingNote?.book ?? 1}
        chapter={editingNote?.chapter ?? 1}
        verse={editingNote?.verse ?? 1}
        bookName={editingBook?.name ?? 'Livro'}
        existingNote={
          editingNote
            ? { id: editingNote.id, content: editingNote.content, title: editingNote.title }
            : undefined
        }
        onSave={handleSaveNote}
        onDelete={editingNote ? handleDeleteNoteFromEditor : undefined}
      />
    </div>
  )
}

export default NotesPage
