import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Loader2, Clock, ChevronRight } from 'lucide-react'
import { searchBible } from '../data/bible'
import { searchHistoryStorage } from '../lib/storage'
import type { SearchResult } from '../types/bible'

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedText  = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const startIndex = normalizedText.indexOf(normalizedQuery)
  if (startIndex === -1) return text
  const before = text.slice(0, startIndex)
  const match  = text.slice(startIndex, startIndex + query.length)
  const after  = text.slice(startIndex + query.length)
  return (
    <>
      {before}
      <mark
        className="rounded-sm"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', fontWeight: 600, padding: '0 2px' }}
      >
        {match}
      </mark>
      {after}
    </>
  )
}

function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [history, setHistory]     = useState<string[]>(() => searchHistoryStorage.getAll())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const doSearch = useCallback(async (searchQuery: string, saveToHistory = false) => {
    const trimmed = searchQuery.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults([]); setHasSearched(false); setIsSearching(false); return
    }
    setIsSearching(true); setHasSearched(true)
    try {
      const searchResults = await searchBible(trimmed)
      setResults(searchResults)
      if (saveToHistory) { searchHistoryStorage.add(trimmed); setHistory(searchHistoryStorage.getAll()) }
    } catch { setResults([]) }
    finally { setIsSearching(false) }
  }, [])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setResults([]); setHasSearched(false); setIsSearching(false); return }
    debounceRef.current = setTimeout(() => { doSearch(value, true) }, 400)
  }, [doSearch])

  const handleHistoryClick  = useCallback((q: string) => { setQuery(q); doSearch(q, false) }, [doSearch])
  const handleRemoveHistory = useCallback((q: string, e: React.MouseEvent) => {
    e.stopPropagation(); searchHistoryStorage.remove(q); setHistory(searchHistoryStorage.getAll())
  }, [])
  const handleClearHistory  = useCallback(() => { searchHistoryStorage.clear(); setHistory([]) }, [])
  const handleClear         = useCallback(() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus() }, [])
  const handleResultClick   = useCallback((result: SearchResult) => { navigate(`/read/${result.bookId}/${result.chapter}`) }, [navigate])

  const showHistory = !hasSearched && !isSearching && history.length > 0

  return (
    <div className="min-h-dvh pb-4 flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* Search input */}
      <div className="px-5 pt-4 pb-4 shrink-0">
        <div
          className="flex items-center gap-3 px-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1.25rem',
            paddingTop: '0.8125rem',
            paddingBottom: '0.8125rem',
          }}
        >
          <Search size={16} strokeWidth={1.6} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar na Bíblia..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 400, fontFamily: 'var(--font-sans)' }}
            autoComplete="off" autoCorrect="off" spellCheck={false}
          />
          {query && (
            <button
              onClick={handleClear}
              className="shrink-0 flex items-center justify-center transition-opacity active:opacity-50"
              style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}
            >
              <X size={11} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">

          {/* Loading */}
          {isSearching && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-24 gap-3">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Buscando...</p>
            </motion.div>
          )}

          {/* Results */}
          {!isSearching && hasSearched && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }} className="flex flex-col gap-2.5">

              {/* Count */}
              <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {results.length === 0
                  ? 'Nenhum resultado'
                  : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`}
              </p>

              {results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center pt-16 px-6"
                >
                  <div className="flex items-center justify-center rounded-3xl mb-5"
                    style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <Search size={22} strokeWidth={1.3} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, textAlign: 'center', lineHeight: 1.7, maxWidth: '16rem' }}>
                    Nenhum versículo encontrado para "{query}"
                  </p>
                </motion.div>
              ) : (
                results.map((result, index) => (
                  <motion.button
                    key={`${result.bookId}-${result.chapter}-${result.verse}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left active:scale-[0.98] transition-transform flex items-center gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.025 }}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '1.125rem',
                      padding: '1rem 1rem 1rem 1.125rem',
                    }}
                  >
                    {/* Accent bar */}
                    <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 9999, backgroundColor: 'var(--accent)', flexShrink: 0, opacity: 0.7, minHeight: '2rem' }} />

                    <div className="flex-1 min-w-0">
                      <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {result.bookName} {result.chapter}:{result.verse}
                      </span>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', fontWeight: 400 }} className="line-clamp-3">
                        {highlightMatch(result.text, query)}
                      </p>
                    </div>

                    <ChevronRight size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)', opacity: 0.4, flexShrink: 0 }} />
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {/* History */}
          {!isSearching && showHistory && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }} className="flex flex-col gap-2.5">

              <div className="flex items-center justify-between mb-1">
                <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Buscas Recentes
                </p>
                <button onClick={handleClearHistory} className="transition-opacity active:opacity-50"
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Limpar
                </button>
              </div>

              <AnimatePresence>
                {history.map((q, index) => (
                  <motion.div
                    key={q}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.04 }}
                    layout
                    className="flex items-center gap-3 active:scale-[0.98] transition-transform"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '1.125rem',
                      padding: '0.875rem 1rem',
                    }}
                  >
                    <div className="flex items-center justify-center rounded-xl shrink-0"
                      style={{ width: '2rem', height: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
                      <Clock size={13} strokeWidth={1.6} style={{ color: 'var(--text-muted)' }} />
                    </div>

                    <button className="flex-1 text-left transition-opacity active:opacity-70"
                      style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 400, fontFamily: 'var(--font-sans)' }}
                      onClick={() => handleHistoryClick(q)}>
                      {q}
                    </button>

                    <button onClick={(e) => handleRemoveHistory(q, e)}
                      className="shrink-0 flex items-center justify-center transition-opacity active:opacity-50"
                      style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}>
                      <X size={10} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state */}
          {!isSearching && !hasSearched && !showHistory && (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-24 px-8">
              <div className="flex items-center justify-center rounded-3xl mb-5"
                style={{ width: '4.5rem', height: '4.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <Search size={24} strokeWidth={1.3} style={{ color: 'var(--text-muted)', opacity: 0.55 }} />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, textAlign: 'center', lineHeight: 1.75, maxWidth: '17rem' }}>
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
