import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, X, BookOpen } from 'lucide-react'
import { cn } from '../../lib/cn'
import { books, getBooksByTestament } from '../../data/books'
import type { Book } from '../../types/bible'

interface BookSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (bookId: number, chapter: number) => void
  currentBookId?: number
}

type Testament = 'old' | 'new'

export function BookSelector({ isOpen, onClose, onSelect, currentBookId }: BookSelectorProps) {
  const [activeTestament, setActiveTestament] = useState<Testament>('old')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const chapterGridRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedBook(null)
      // Determine which testament the current book belongs to
      if (currentBookId) {
        const currentBook = books.find((b) => b.id === currentBookId)
        if (currentBook) {
          setActiveTestament(currentBook.testament)
        }
      }
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, currentBookId])

  const oldTestamentBooks = useMemo(() => getBooksByTestament('old'), [])
  const newTestamentBooks = useMemo(() => getBooksByTestament('new'), [])

  const filteredBooks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return activeTestament === 'old' ? oldTestamentBooks : newTestamentBooks
    }
    return books.filter(
      (book) =>
        book.name.toLowerCase().includes(query) ||
        book.abbreviation.toLowerCase().includes(query)
    )
  }, [searchQuery, activeTestament, oldTestamentBooks, newTestamentBooks])

  const handleBookClick = useCallback((book: Book) => {
    if (book.chapters === 1) {
      onSelect(book.id, 1)
      onClose()
      return
    }
    setSelectedBook(book)
  }, [onSelect, onClose])

  const handleChapterClick = useCallback(
    (chapter: number) => {
      if (selectedBook) {
        onSelect(selectedBook.id, chapter)
        onClose()
      }
    },
    [selectedBook, onSelect, onClose]
  )

  const handleBack = useCallback(() => {
    setSelectedBook(null)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedBook(null)
    setSearchQuery('')
    onClose()
  }, [onClose])

  const chapterNumbers = useMemo(() => {
    if (!selectedBook) return []
    return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)
  }, [selectedBook])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {selectedBook ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
                aria-label="Voltar"
              >
                <ArrowLeft size={22} style={{ color: 'var(--text-primary)' }} />
              </button>
            ) : (
              <BookOpen size={22} style={{ color: 'var(--color-secondary)' }} />
            )}

            <h2
              className="text-lg font-semibold flex-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedBook ? selectedBook.name : 'Selecionar livro'}
            </h2>

            <button
              onClick={handleClose}
              className="p-2 -mr-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
              aria-label="Fechar"
            >
              <X size={22} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedBook ? (
              /* Chapter Grid */
              <motion.div
                key="chapters"
                className="flex-1 overflow-y-auto"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                ref={chapterGridRef}
              >
                <div className="px-4 py-3">
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Selecione o capítulo
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {chapterNumbers.map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => handleChapterClick(chapter)}
                        className={cn(
                          'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150',
                          'hover:scale-105 active:scale-95'
                        )}
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Book List */
              <motion.div
                key="books"
                className="flex-1 flex flex-col overflow-hidden"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
              >
                {/* Search Bar */}
                <div className="px-4 pt-3 pb-2 shrink-0">
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <Search size={18} style={{ color: 'var(--text-muted)' }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar livro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                      style={{ color: 'var(--text-primary)' }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-0.5 rounded-full hover:bg-[var(--bg-tertiary)]"
                      >
                        <X size={16} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Testament Tabs */}
                {!searchQuery && (
                  <div
                    className="flex px-4 gap-1 shrink-0 border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <button
                      onClick={() => setActiveTestament('old')}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative'
                      )}
                      style={{
                        color:
                          activeTestament === 'old'
                            ? 'var(--color-secondary)'
                            : 'var(--text-muted)',
                      }}
                    >
                      Antigo Testamento
                      {activeTestament === 'old' && (
                        <motion.div
                          layoutId="testament-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTestament('new')}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative'
                      )}
                      style={{
                        color:
                          activeTestament === 'new'
                            ? 'var(--color-secondary)'
                            : 'var(--text-muted)',
                      }}
                    >
                      Novo Testamento
                      {activeTestament === 'new' && (
                        <motion.div
                          layoutId="testament-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        />
                      )}
                    </button>
                  </div>
                )}

                {/* Book List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredBooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Search
                        size={40}
                        style={{ color: 'var(--text-muted)' }}
                        className="mb-3"
                      />
                      <p
                        className="text-sm text-center"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Nenhum livro encontrado para &ldquo;{searchQuery}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      {filteredBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => handleBookClick(book)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors',
                            'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]',
                            currentBookId === book.id && 'bg-[var(--bg-secondary)]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0'
                              )}
                              style={{
                                backgroundColor:
                                  currentBookId === book.id
                                    ? 'var(--color-secondary)'
                                    : 'var(--bg-tertiary)',
                                color:
                                  currentBookId === book.id
                                    ? '#fff'
                                    : 'var(--text-secondary)',
                              }}
                            >
                              {book.abbreviation}
                            </span>
                            <div className="text-left">
                              <p
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {book.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {book.chapters}{' '}
                                {book.chapters === 1 ? 'capítulo' : 'capítulos'}
                              </p>
                            </div>
                          </div>
                          <ArrowLeft
                            size={16}
                            className="rotate-180"
                            style={{ color: 'var(--text-muted)' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
