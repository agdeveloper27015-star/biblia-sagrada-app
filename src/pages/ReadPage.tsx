import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { useFavorites } from '../hooks/useFavorites'
import { useHighlights } from '../hooks/useHighlights'
import { useNotes } from '../hooks/useNotes'
import { readingSettingsStorage, type ReadingSettings } from '../lib/storage'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { BookSelector } from '../components/read/BookSelector'
import { ReadingHeader } from '../components/read/ReadingHeader'
import { ScriptureView } from '../components/read/ScriptureView'
import { VerseActionSheet } from '../components/read/VerseActionSheet'
import { ReadingSettings as ReadingSettingsPanel } from '../components/read/ReadingSettings'
import { DictionaryModal } from '../components/dictionary/DictionaryModal'
import { NoteEditor } from '../components/notes/NoteEditor'
import type { Book, Chapter } from '../types/bible'
import type { HighlightColor } from '../types/database'

interface LoadedChapter {
  key: string
  bookId: number
  chapterNum: number
  data: Chapter
  book: Book
}

function makeKey(bookId: number, chapter: number) {
  return `${bookId}:${chapter}`
}

function ReadPage() {
  const params = useParams<{ bookId?: string; chapter?: string }>()
  const navigate = useNavigate()

  const initialBookId = params.bookId ? parseInt(params.bookId, 10) : 1
  const initialChapter = params.chapter ? parseInt(params.chapter, 10) : 1

  // ── State ──────────────────────────────────────────────────────
  const [loadedChapters, setLoadedChapters] = useState<LoadedChapter[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const [currentKey, setCurrentKey] = useState(makeKey(initialBookId, initialChapter))

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedCtx, setSelectedCtx] = useState({ bookId: initialBookId, chapter: initialChapter })
  const [showBookSelector, setShowBookSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDictionary, setShowDictionary] = useState(false)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [dictionaryCtx, setDictionaryCtx] = useState({ bookId: initialBookId, chapter: initialChapter, verse: 1 })
  const [noteCtx, setNoteCtx] = useState({ bookId: initialBookId, chapter: initialChapter, verse: 1 })
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>(() => readingSettingsStorage.get())
  const [scrollProgress, setScrollProgress] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const chapterHeaderRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const loadedKeys = useRef<Set<string>>(new Set())

  // ── Hooks ──────────────────────────────────────────────────────
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { addHighlight, removeHighlight, getHighlightsForChapter, getHighlightForVerse } = useHighlights()
  const { notes, addNote, updateNote, deleteNote, getNotesForVerse } = useNotes()

  // ── Load single chapter ────────────────────────────────────────
  const loadChapter = useCallback(async (bookId: number, chapterNum: number): Promise<LoadedChapter | null> => {
    const key = makeKey(bookId, chapterNum)
    if (loadedKeys.current.has(key)) return null
    const book = getBookById(bookId)
    if (!book || chapterNum < 1 || chapterNum > book.chapters) return null
    const data = await getChapter(bookId, chapterNum)
    if (!data) return null
    loadedKeys.current.add(key)
    return { key, bookId, chapterNum, data, book }
  }, [])

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    loadedKeys.current.clear()
    chapterHeaderRefs.current.clear()
    setLoadedChapters([])
    setIsLoadingInitial(true)
    setCurrentKey(makeKey(initialBookId, initialChapter))

    loadChapter(initialBookId, initialChapter).then((ch) => {
      if (ch) setLoadedChapters([ch])
      setIsLoadingInitial(false)
    })

    containerRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [initialBookId, initialChapter, loadChapter])

  // ── Load next chapter ──────────────────────────────────────────
  const loadNextChapter = useCallback(async () => {
    if (isLoadingNext) return
    const last = loadedChapters[loadedChapters.length - 1]
    if (!last) return

    let nextBookId = last.bookId
    let nextChapter = last.chapterNum + 1
    if (nextChapter > last.book.chapters) {
      nextBookId = last.bookId + 1
      nextChapter = 1
    }
    if (nextBookId > 66 || !getBookById(nextBookId)) return

    setIsLoadingNext(true)
    const ch = await loadChapter(nextBookId, nextChapter)
    if (ch) setLoadedChapters((prev) => [...prev, ch])
    setIsLoadingNext(false)
  }, [isLoadingNext, loadedChapters, loadChapter])

  // ── Sentinel observer (auto-load next) ────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadNextChapter() },
      { rootMargin: '600px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadNextChapter])

  // ── Scroll: progress + current chapter detection ───────────────
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const maxScroll = scrollHeight - clientHeight
    if (maxScroll > 0) setScrollProgress(Math.min(scrollTop / maxScroll, 1))

    // Detect which chapter header has crossed 25% of viewport
    const threshold = scrollTop + clientHeight * 0.25
    let bestKey = ''
    chapterHeaderRefs.current.forEach((headerEl, key) => {
      const headerTop = headerEl.offsetTop
      if (headerTop <= threshold) bestKey = key
    })
    if (bestKey && bestKey !== currentKey) {
      setCurrentKey(bestKey)
      const [bId, chNum] = bestKey.split(':').map(Number) as [number, number]
      window.history.replaceState(null, '', `/read/${bId}/${chNum}`)
      const bookName = getBookById(bId)?.name ?? ''
      try { localStorage.setItem('biblia_last_read', JSON.stringify({ bookId: bId, chapter: chNum, bookName })) } catch { /* ignore */ }
    }
  }, [currentKey])

  // ── Navigate to chapter (hard reset) ──────────────────────────
  const navigateToChapter = useCallback(
    (bookId: number, chapterNum: number) => {
      navigate(`/read/${bookId}/${chapterNum}`, { replace: true })
    },
    [navigate]
  )

  // ── Verse actions ──────────────────────────────────────────────
  const handleVerseClick = useCallback((verse: number, bookId: number, chapter: number) => {
    setSelectedVerse(verse)
    setSelectedCtx({ bookId, chapter })
  }, [])

  const handleToggleFavorite = useCallback(() => {
    if (selectedVerse == null) return
    toggleFavorite(selectedCtx.bookId, selectedCtx.chapter, selectedVerse)
  }, [selectedVerse, selectedCtx, toggleFavorite])

  const handleHighlight = useCallback((color: HighlightColor) => {
    if (selectedVerse == null) return
    addHighlight(selectedCtx.bookId, selectedCtx.chapter, selectedVerse, selectedVerse, color)
    setSelectedVerse(null)
  }, [selectedVerse, selectedCtx, addHighlight])

  const handleRemoveHighlight = useCallback(() => {
    if (selectedVerse == null) return
    const ex = getHighlightForVerse(selectedCtx.bookId, selectedCtx.chapter, selectedVerse)
    if (ex) removeHighlight(ex.id)
    setSelectedVerse(null)
  }, [selectedVerse, selectedCtx, getHighlightForVerse, removeHighlight])

  const handleOpenNote = useCallback(() => {
    if (selectedVerse == null) return
    setNoteCtx({ ...selectedCtx, verse: selectedVerse })
    setShowNoteEditor(true)
    setSelectedVerse(null)
  }, [selectedVerse, selectedCtx])

  const handleOpenDictionary = useCallback(() => {
    if (selectedVerse == null) return
    setDictionaryCtx({ ...selectedCtx, verse: selectedVerse })
    setShowDictionary(true)
    setSelectedVerse(null)
  }, [selectedVerse, selectedCtx])

  const existingNote = useMemo(() => {
    const ns = getNotesForVerse(noteCtx.bookId, noteCtx.chapter, noteCtx.verse)
    const n = ns[0]
    if (!n) return undefined
    return { id: n.id, content: n.content, title: n.title }
  }, [noteCtx, getNotesForVerse, notes])

  const handleSaveNote = useCallback(async (content: string, title?: string) => {
    if (existingNote) await updateNote(existingNote.id, content, title)
    else await addNote(noteCtx.bookId, noteCtx.chapter, noteCtx.verse, content, title)
    setShowNoteEditor(false)
  }, [existingNote, noteCtx, addNote, updateNote])

  const handleDeleteNote = useCallback(async () => {
    if (!existingNote) return
    await deleteNote(existingNote.id)
    setShowNoteEditor(false)
  }, [existingNote, deleteNote])

  const handleSettingsChange = useCallback((s: ReadingSettings) => {
    setReadingSettings(s)
    readingSettingsStorage.save(s)
  }, [])

  // ── Header info from currentKey ────────────────────────────────
  const [currentBookId, currentChapterNum] = currentKey.split(':').map(Number) as [number, number]
  const currentBook = useMemo(() => getBookById(currentBookId), [currentBookId])

  const isSelectedFavorited = selectedVerse != null
    ? isFavorite(selectedCtx.bookId, selectedCtx.chapter, selectedVerse)
    : false
  const selectedHighlight = selectedVerse != null
    ? getHighlightForVerse(selectedCtx.bookId, selectedCtx.chapter, selectedVerse)
    : undefined

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundColor: 'var(--bg-primary)',
        ['--reader-font-size' as string]: `${readingSettings.fontSize}rem`,
        ['--reader-line-height' as string]: `${readingSettings.lineHeight}`,
        ['--reader-max-width' as string]: `${readingSettings.maxWidth}ch`,
      }}
    >
      <ReadingHeader
        bookName={currentBook?.name ?? ''}
        chapter={currentChapterNum}
        progress={scrollProgress}
        onBack={() => navigate(`/books/${currentBookId}`)}
        onBookSelect={() => setShowBookSelector(true)}
        onSettings={() => setShowSettings(true)}
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-y-contain"
        onScroll={handleScroll}
      >
        {isLoadingInitial ? (
          <div className="flex items-center justify-center min-h-[60dvh]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {loadedChapters.map((ch, idx) => {
              // Build per-chapter derived data
              const favSet = new Set<number>()
              favorites.forEach((f) => {
                if (f.book === ch.bookId && f.chapter === ch.chapterNum) favSet.add(f.verse)
              })
              const hlMap = new Map<number, string>()
              getHighlightsForChapter(ch.bookId, ch.chapterNum).forEach((h) => {
                for (let v = h.verse_start; v <= h.verse_end; v++) hlMap.set(v, h.color)
              })
              const notedSet = new Set<number>()
              notes.forEach((n) => {
                if (n.book === ch.bookId && n.chapter === ch.chapterNum) notedSet.add(n.verse)
              })

              return (
                <div key={ch.key}>
                  {/* Divisor entre capítulos */}
                  {idx > 0 && (
                    <div className="flex items-center gap-3 px-8 pt-8 pb-2">
                      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
                      <span
                        className="text-[0.62rem] font-bold uppercase tracking-[0.18em]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {ch.book.name} {ch.chapterNum}
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
                    </div>
                  )}

                  {/* Chapter header (sentinel para IntersectionObserver) */}
                  <div
                    ref={(el) => {
                      if (el) chapterHeaderRefs.current.set(ch.key, el)
                      else chapterHeaderRefs.current.delete(ch.key)
                    }}
                    className="text-center pt-8 pb-5"
                  >
                    {idx === 0 && (
                      <h2
                        className="text-base font-semibold mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {ch.book.name}
                      </h2>
                    )}
                    <span
                      className="text-[3.5rem] font-bold leading-none"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {ch.chapterNum}
                    </span>
                  </div>

                  {/* Scripture */}
                  <div
                    className="mx-auto px-5 pb-10"
                    style={{ maxWidth: 'var(--reader-max-width)' }}
                  >
                    <ScriptureView
                      verses={ch.data.verses}
                      layout={readingSettings.layout}
                      bookId={ch.bookId}
                      chapter={ch.chapterNum}
                      favorites={favSet}
                      highlightMap={hlMap}
                      notedVerses={notedSet}
                      onVerseClick={(v) => handleVerseClick(v, ch.bookId, ch.chapterNum)}
                    />
                  </div>
                </div>
              )
            })}

            {/* Sentinel + loading next */}
            <div ref={sentinelRef} className="flex justify-center py-8">
              {isLoadingNext && <LoadingSpinner size="sm" />}
            </div>
          </>
        )}
      </div>

      {/* ── Overlays ── */}
      <VerseActionSheet
        isOpen={selectedVerse != null}
        onClose={() => setSelectedVerse(null)}
        verse={selectedVerse ?? 0}
        bookId={selectedCtx.bookId}
        chapter={selectedCtx.chapter}
        bookName={getBookById(selectedCtx.bookId)?.name ?? ''}
        isFavorited={isSelectedFavorited}
        hasHighlight={!!selectedHighlight}
        currentHighlightColor={selectedHighlight?.color}
        onDictionary={handleOpenDictionary}
        onToggleFavorite={handleToggleFavorite}
        onHighlight={handleHighlight}
        onRemoveHighlight={handleRemoveHighlight}
        onNote={handleOpenNote}
      />

      <BookSelector
        isOpen={showBookSelector}
        onClose={() => setShowBookSelector(false)}
        onSelect={(bookId, chapter) => { setShowBookSelector(false); navigateToChapter(bookId, chapter) }}
        currentBookId={currentBookId}
        currentChapter={currentChapterNum}
      />

      <ReadingSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={readingSettings}
        onSettingsChange={handleSettingsChange}
      />

      <DictionaryModal
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
        bookId={dictionaryCtx.bookId}
        chapter={dictionaryCtx.chapter}
        verse={dictionaryCtx.verse}
        bookName={getBookById(dictionaryCtx.bookId)?.name ?? ''}
      />

      <NoteEditor
        isOpen={showNoteEditor}
        onClose={() => setShowNoteEditor(false)}
        bookId={noteCtx.bookId}
        chapter={noteCtx.chapter}
        verse={noteCtx.verse}
        bookName={getBookById(noteCtx.bookId)?.name ?? ''}
        existingNote={existingNote}
        onSave={handleSaveNote}
        onDelete={existingNote ? handleDeleteNote : undefined}
      />
    </div>
  )
}

export default ReadPage
