import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, ChevronRight, Sun, Moon } from 'lucide-react'
import { getVerseOfTheDay, getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { useHighlights } from '../hooks/useHighlights'
import { useTheme } from '../context/ThemeContext'
import { getReadingProgress } from '../data/readingPlan'
import type { Book, Verse } from '../types/bible'

interface VerseOfTheDay { book: Book; chapter: number; verse: Verse }
interface LastRead { bookId: number; chapter: number; bookName: string }
interface HighlightWithText { id: string; book: number; chapter: number; verse: number; bookName: string; text: string; color: string }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).replace(/^\w/, (c) => c.toUpperCase())
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
}
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '0.6rem',
      fontWeight: 600,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '1rem',
    }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />
}

function HomePage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { highlights } = useHighlights()

  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null)
  const [isLoadingVerse, setIsLoadingVerse] = useState(true)
  const [lastRead, setLastRead] = useState<LastRead | null>(null)
  const [highlightTexts, setHighlightTexts] = useState<HighlightWithText[]>([])
  const [copied, setCopied] = useState(false)

  const readingProgress = getReadingProgress()

  useEffect(() => {
    let cancelled = false
    setIsLoadingVerse(true)
    getVerseOfTheDay().then((data) => {
      if (!cancelled && data) setVerseOfTheDay(data)
      if (!cancelled) setIsLoadingVerse(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('biblia_last_read')
      if (raw) setLastRead(JSON.parse(raw) as LastRead)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (highlights.length === 0) return
    let cancelled = false
    const recent = highlights.slice(0, 3)
    ;(async () => {
      const results: HighlightWithText[] = []
      for (const h of recent) {
        const book = getBookById(h.book)
        const ch = await getChapter(h.book, h.chapter)
        const verse = ch?.verses.find((v) => v.verse === h.verse_start)
        if (verse) {
          results.push({
            id: h.id, book: h.book, chapter: h.chapter,
            verse: h.verse_start, color: h.color,
            bookName: book?.name ?? '', text: verse.text,
          })
        }
      }
      if (!cancelled) setHighlightTexts(results)
    })()
    return () => { cancelled = true }
  }, [highlights])

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!verseOfTheDay) return
    const text = `"${verseOfTheDay.verse.text}" — ${verseOfTheDay.book.name} ${verseOfTheDay.chapter}:${verseOfTheDay.verse.verse}`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="min-h-dvh pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <motion.header
        className="px-6 pt-12 pb-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.75rem',
              fontWeight: 200,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>
              {getGreeting()}
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 300 }}>
              {getDateLabel()}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-opacity active:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark'
              ? <Sun size={17} strokeWidth={1.5} />
              : <Moon size={17} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Top nav */}
        <nav>
          <ul className="flex gap-6" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <li>
              <span style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}>
                Início
              </span>
            </li>
            <li>
              <Link to="/books" style={{ color: 'var(--text-muted)' }}>Leitura</Link>
            </li>
            <li>
              <Link to="/search" style={{ color: 'var(--text-muted)' }}>Pesquisa</Link>
            </li>
            <li>
              <Link to="/profile" style={{ color: 'var(--text-muted)' }}>Perfil</Link>
            </li>
          </ul>
        </nav>
      </motion.header>

      {/* ── Content ── */}
      <main className="px-6 pt-8">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* ── Inspiração Diária ── */}
          <motion.section variants={item} className="mb-10">
            <SectionLabel>Inspiração Diária</SectionLabel>
            <div
              className="cursor-pointer"
              onClick={() => verseOfTheDay && navigate(`/read/${verseOfTheDay.book.id}/${verseOfTheDay.chapter}`)}
            >
              {isLoadingVerse ? (
                <div className="space-y-3">
                  <div className="h-5 skeleton w-4/5" />
                  <div className="h-5 skeleton w-full" />
                  <div className="h-5 skeleton w-3/5" />
                </div>
              ) : verseOfTheDay ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <blockquote style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '1.35rem',
                      fontWeight: 400,
                      lineHeight: 1.35,
                      color: 'var(--text-primary)',
                      flex: 1,
                    }}>
                      &ldquo;{verseOfTheDay.verse.text}&rdquo;
                    </blockquote>
                    <button
                      onClick={handleShare}
                      className="shrink-0 mt-1 p-1 transition-opacity active:opacity-50"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Share2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <p style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginTop: '1rem',
                  }}>
                    {copied ? 'Copiado!' : `${verseOfTheDay.book.name} ${verseOfTheDay.chapter}:${verseOfTheDay.verse.verse}`}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Não foi possível carregar.</p>
              )}
            </div>
          </motion.section>

          {/* ── Leitura atual ── */}
          <motion.section variants={item} className="mb-8">
            {lastRead ? (
              <>
                <div className="flex justify-between items-end mb-2">
                  <button
                    onClick={() => navigate(`/read/${lastRead.bookId}/${lastRead.chapter}`)}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                  >
                    {lastRead.bookName} {lastRead.chapter}
                  </button>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    {readingProgress.percentage}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', backgroundColor: 'var(--text-primary)', borderRadius: '999px' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.2 }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                  <Link
                    to="/books"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Comece a ler
                  </Link>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    {readingProgress.percentage}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px' }} />
              </>
            )}
          </motion.section>

          <Divider />

          {/* ── Explorar ── */}
          <motion.section variants={item}>
            <SectionLabel>Explorar</SectionLabel>
            <ul style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {[
                { to: '/search', label: 'Busca', desc: 'Versículos e tópicos', icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { to: '/saved', label: 'Favoritos', desc: 'Seus versículos salvos', icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { to: '/saved?tab=notes', label: 'Notas', desc: 'Diário e pensamentos', icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { to: '/books', label: 'Planos', desc: 'Devocionais diários', icon: (
                  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
              ].map(({ to, label, desc, icon }) => (
                <li key={to} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <Link
                    to={to}
                    className="flex items-center py-4 active:opacity-60 transition-opacity group"
                  >
                    <span className="mr-5" style={{ color: 'var(--text-primary)' }}>
                      {icon}
                    </span>
                    <span className="flex flex-col flex-1">
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 300, color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {desc}
                      </span>
                    </span>
                    <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* ── Destaques recentes ── */}
          {highlightTexts.length > 0 && (
            <motion.section variants={item} className="mt-8">
              <Divider />
              <div className="flex items-center justify-between">
                <SectionLabel>Destaques recentes</SectionLabel>
                <Link to="/saved" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '1rem' }}>
                  Ver todos
                </Link>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {highlightTexts.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => navigate(`/read/${h.book}/${h.chapter}`)}
                    className="w-full text-left py-4 active:opacity-60 transition-opacity"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sage)', display: 'block', marginBottom: '0.25rem' }}>
                      {h.bookName} {h.chapter}:{h.verse}
                    </span>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-primary)', fontWeight: 300 }} className="line-clamp-2">
                      {h.text}
                    </p>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

        </motion.div>
      </main>
    </div>
  )
}

export default HomePage
