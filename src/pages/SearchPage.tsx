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
        style={{ backgroundColor: 'var(--sage-light)', color: 'var(--text-primary)', fontWeight: 600 }}
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
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-5 pt-10 pb-4 shrink-0"
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
          Buscar
        </h1>

        {/* Search input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={15} strokeWidth={1.4} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar na Bíblia..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 300 }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button onClick={handleClear} className="shrink-0 transition-opacity active:opacity-50">
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {isSearching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
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
            >
              <p className="px-5 pt-4 pb-3" style={{
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                {results.length === 0
                  ? 'Nenhum resultado'
                  : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
              </p>

              <div className="px-5">
                {results.map((result, index) => (
                  <motion.button
                    key={`${result.bookId}-${result.chapter}-${result.verse}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left py-4 transition-opacity active:opacity-50"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
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
                      {result.bookName} {result.chapter}:{result.verse}
                    </span>
                    <p style={{
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
                ))}
              </div>
            </motion.div>
          )}

          {/* Histórico */}
          {!isSearching && showHistory && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <p style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  Buscas recentes
                </p>
                <button
                  onClick={handleClearHistory}
                  className="transition-opacity active:opacity-50"
                  style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}
                >
                  Limpar
                </button>
              </div>

              <div className="px-5">
                <AnimatePresence>
                  {history.map((q, index) => (
                    <motion.div
                      key={q}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.04 }}
                      layout
                      className="flex items-center gap-3 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <Clock size={13} strokeWidth={1.4} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <button
                        className="flex-1 text-left transition-opacity active:opacity-50"
                        style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 300 }}
                        onClick={() => handleHistoryClick(q)}
                      >
                        {q}
                      </button>
                      <button
                        onClick={(e) => handleRemoveHistory(q, e)}
                        className="shrink-0 transition-opacity active:opacity-50"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!isSearching && !hasSearched && !showHistory && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-20 px-8"
            >
              <Search size={32} strokeWidth={1.2} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, textAlign: 'center' }}>
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
