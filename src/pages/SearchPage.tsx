import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Loader2, Clock } from 'lucide-react'
import { searchBible } from '../data/bible'
import { searchHistoryStorage } from '../lib/storage'
import type { SearchResult } from '../types/bible'

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const startIndex = normalizedText.indexOf(normalizedQuery)
  if (startIndex === -1) return text
  const before = text.slice(0, startIndex)
  const match = text.slice(startIndex, startIndex + query.length)
  const after = text.slice(startIndex + query.length)
  return (
    <>
      {before}
      <mark
        className="rounded-sm"
        style={{ backgroundColor: 'rgba(23,25,28,0.12)', color: 'var(--text-primary)', fontWeight: 600 }}
      >
        {match}
      </mark>
      {after}
    </>
  )
}

function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [history, setHistory] = useState<string[]>(() => searchHistoryStorage.getAll())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const doSearch = useCallback(async (searchQuery: string, saveToHistory = false) => {
    const trimmed = searchQuery.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    setHasSearched(true)
    try {
      const searchResults = await searchBible(trimmed)
      setResults(searchResults)
      if (saveToHistory) {
        searchHistoryStorage.add(trimmed)
        setHistory(searchHistoryStorage.getAll())
      }
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!value.trim()) {
        setResults([])
        setHasSearched(false)
        setIsSearching(false)
        return
      }
      debounceRef.current = setTimeout(() => { doSearch(value, true) }, 400)
    },
    [doSearch]
  )

  const handleHistoryClick = useCallback(
    (q: string) => {
      setQuery(q)
      doSearch(q, false)
    },
    [doSearch]
  )

  const handleRemoveHistory = useCallback((q: string, e: React.MouseEvent) => {
    e.stopPropagation()
    searchHistoryStorage.remove(q)
    setHistory(searchHistoryStorage.getAll())
  }, [])

  const handleClearHistory = useCallback(() => {
    searchHistoryStorage.clear()
    setHistory([])
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    inputRef.current?.focus()
  }, [])

  const handleResultClick = useCallback(
    (result: SearchResult) => { navigate(`/read/${result.bookId}/${result.chapter}`) },
    [navigate]
  )

  const showHistory = !hasSearched && !isSearching && history.length > 0

  return (
    <div
      className="min-h-dvh pb-10 flex flex-col"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >

      {/* Page title + search input */}
      <div className="px-5 pt-5 pb-5 shrink-0">

        {/* Search input card */}
        <div
          className="input-card flex items-center gap-3 px-4 py-3.5"
          style={{ borderRadius: '1.25rem' }}
        >
          <Search
            size={17}
            strokeWidth={1.8}
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar na Bíblia..."
            className="flex-1 bg-transparent outline-none"
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              fontFamily: 'var(--font-sans)',
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={handleClear}
              className="shrink-0 transition-opacity active:opacity-50 flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {isSearching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: 'var(--text-muted)' }}
              />
            </motion.div>
          )}

          {/* Results */}
          {!isSearching && hasSearched && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {/* Result count label */}
              <p
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.25rem',
                }}
              >
                {results.length === 0
                  ? 'Nenhum resultado'
                  : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
              </p>

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-12 px-4">
                  <Search
                    size={40}
                    strokeWidth={1.2}
                    style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}
                  />
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                      textAlign: 'center',
                      lineHeight: 1.6,
                    }}
                  >
                    Nenhum versículo encontrado para &ldquo;{query}&rdquo;
                  </p>
                </div>
              ) : (
                results.map((result, index) => (
                  <motion.button
                    key={`${result.bookId}-${result.chapter}-${result.verse}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left active:scale-[0.97] transition-transform"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '1.25rem',
                      boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
                      padding: '1rem 1.125rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {result.bookName} {result.chapter}:{result.verse}
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: 'var(--text-primary)',
                        fontWeight: 400,
                      }}
                      className="line-clamp-3"
                    >
                      {highlightMatch(result.text, query)}
                    </p>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {/* History */}
          {!isSearching && showHistory && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {/* History header */}
              <div className="flex items-center justify-between mb-1">
                <p
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  Buscas Recentes
                </p>
                <button
                  onClick={handleClearHistory}
                  className="transition-opacity active:opacity-50"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Limpar
                </button>
              </div>

              <AnimatePresence>
                {history.map((q, index) => (
                  <motion.div
                    key={q}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.04 }}
                    layout
                    className="flex items-center gap-3 active:scale-[0.97] transition-transform"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '1.25rem',
                      boxShadow: '0 2px 8px rgba(23,25,28,0.06)',
                      padding: '0.875rem 1.125rem',
                    }}
                  >
                    <Clock
                      size={15}
                      strokeWidth={1.6}
                      style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                    />
                    <button
                      className="flex-1 text-left transition-opacity active:opacity-70"
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        fontWeight: 400,
                        fontFamily: 'var(--font-sans)',
                      }}
                      onClick={() => handleHistoryClick(q)}
                    >
                      {q}
                    </button>
                    <button
                      onClick={(e) => handleRemoveHistory(q, e)}
                      className="shrink-0 transition-opacity active:opacity-50 flex items-center justify-center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    >
                      <X size={11} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state */}
          {!isSearching && !hasSearched && !showHistory && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-24 px-8"
            >
              <Search
                size={48}
                strokeWidth={1.2}
                style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', opacity: 0.4 }}
              />
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  textAlign: 'center',
                  lineHeight: 1.7,
                }}
              >
                Digite uma palavra ou frase para buscar em toda a Bíblia
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SearchPage
