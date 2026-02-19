import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Modal } from '../ui/Modal'

interface NoteEditorProps {
  isOpen: boolean
  onClose: () => void
  bookId: number
  chapter: number
  verse: number
  bookName: string
  existingNote?: { id: string; content: string; title: string | null }
  onSave: (content: string, title?: string) => void
  onDelete?: () => void
}

export function NoteEditor({
  isOpen,
  onClose,
  bookId: _bookId,
  chapter,
  verse,
  bookName,
  existingNote,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(existingNote?.title ?? '')
      setContent(existingNote?.content ?? '')
      setShowDeleteConfirm(false)
      // Auto-focus textarea after animation
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isOpen, existingNote])

  const handleSave = useCallback(() => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return
    const trimmedTitle = title.trim() || undefined
    onSave(trimmedContent, trimmedTitle)
    onClose()
  }, [content, title, onSave, onClose])

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete?.()
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }, [showDeleteConfirm, onDelete, onClose])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  const isEditing = !!existingNote
  const canSave = content.trim().length > 0
  const modalTitle = isEditing
    ? `Editar nota - ${bookName} ${chapter}:${verse}`
    : `Nova nota - ${bookName} ${chapter}:${verse}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Title input */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-muted)' }}
            htmlFor="note-title"
          >
            Título (opcional)
          </label>
          <input
            id="note-title"
            type="text"
            placeholder="Adicione um título..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors',
              'border focus:border-[var(--color-secondary)]',
              'placeholder:text-[var(--text-muted)]'
            )}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Content textarea */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-muted)' }}
            htmlFor="note-content"
          >
            Anotação
          </label>
          <textarea
            id="note-content"
            ref={textareaRef}
            placeholder="Escreva sua anotação..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={cn(
              'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none',
              'border focus:border-[var(--color-secondary)]',
              'placeholder:text-[var(--text-muted)]'
            )}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {/* Delete button (only when editing) */}
          {isEditing && onDelete && (
            <div className="flex items-center gap-2">
              {showDeleteConfirm ? (
                <>
                  <button
                    onClick={handleDelete}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    )}
                  >
                    Confirmar exclusão
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      'hover:bg-[var(--bg-secondary)]'
                    )}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDelete}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    'hover:bg-red-500/10 text-red-500'
                  )}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Cancel button */}
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              'hover:bg-[var(--bg-secondary)]'
            )}
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancelar
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              canSave
                ? 'hover:opacity-90 active:scale-95'
                : 'opacity-40 cursor-not-allowed'
            )}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: '#fff',
            }}
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}
