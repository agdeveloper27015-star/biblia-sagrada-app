import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, BookOpen, Moon, Sun } from 'lucide-react'
import { getVerseOfTheDay, getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { useHighlights } from '../hooks/useHighlights'
import { useTheme } from '../context/ThemeContext'
import { getReadingProgress } from '../data/readingPlan'
import type { Book, Verse } from '../types/bible'

interface VerseOfTheDay { book: Book; chapter: number; verse: Verse }
interface LastRead { bookId: number; chapter: number; bookName: string }
interface HighlightWithText {
  id: string; book: number; chapter: number; verse: number
  bookName: string; text: string; color: string
}

// wave logo SVG inline
function WaveLogo() {
  return (
    <svg width="32" height="14" viewBox="0 0 32 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 8.5C5.5 8.5 7.5 4.5 9 1.5C10.5 -1.5 14 1 16 5C18 9 20 12.5 24 12.5C28 12.5 31 10 31 10"
        stroke="currentColor" strokeLinecap="round" strokeWidth="2"
      />
    </svg>
  )
}

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

function HomePage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { highlights } = useHighlights()

  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null)
  const [isLoadingVerse, setIsLoadingVerse]   = useState(true)
  const [lastRead, setLastRead]               = useState<LastRead | null>(null)
  const [highlightTexts, setHighlightTexts]   = useState<HighlightWithText[]>([])
  const [copied, setCopied]                   = useState(false)

  const readingProgress = getReadingProgress()

  useEffect(() => {
    let cancelled = false
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
    const recent = highlights.slice(0, 2)
    ;(async () => {
      const results: HighlightWithText[] = []
      for (const h of recent) {
        const book  = getBookById(h.book)
        const ch    = await getChapter(h.book, h.chapter)
        const verse = ch?.verses.find((v) => v.verse === h.verse_start)
        if (verse) results.push({ id: h.id, book: h.book, chapter: h.chapter, verse: h.verse_start, color: h.color, bookName: book?.name ?? '', text: verse.text })
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
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }
  }

  return (
    <div className="min-h-dvh pb-28" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* ── Top Nav ── */}
      <header className="flex items-center justify-between px-5 pt-10 pb-5">
        {/* Wave logo */}
        <div style={{ color: 'var(--text-primary)' }}>
          <WaveLogo />
        </div>

        {/* Nav links */}
        <nav className="flex gap-5">
          {[
            { label: 'Início',   to: '/'       },
            { label: 'Bíblia',   to: '/books'  },
            { label: 'Config.',  to: '/profile' },
          ].map(({ label, to }) => {
            const isActive = to === '/'
            return (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--accent)' : 'none',
                  paddingBottom: isActive ? '2px' : '0',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Avatar / theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-full border transition-colors"
          style={{
            width: '2.25rem', height: '2.25rem',
            borderColor: 'var(--border-medium)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          {theme === 'dark'
            ? <Sun size={15} strokeWidth={1.5} />
            : <Moon size={15} strokeWidth={1.5} />}
        </button>
      </header>

      {/* ── Main ── */}
      <main className="px-5 space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

          {/* ── Hero: "Bible" title + tagline ── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3.75rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                Bíblia
              </h1>
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: '3.5rem', height: '3.5rem',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <BookOpen size={22} style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
              </div>
            </div>
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid rgba(255,140,66,0.2)' }}
            >
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                Nós vamos te ajudar a aprofundar seu entendimento da Palavra de Deus todos os dias.
              </p>
            </div>
          </motion.div>

          {/* ── Versículo do dia ── */}
          <motion.div variants={fadeUp}>
            <div className="py-4">
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: '1rem',
              }}>
                Versículo do Dia
              </h2>

              {/* Cards horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Último lido */}
                <div
                  className="shrink-0 flex flex-col justify-between rounded-2xl p-4"
                  style={{ width: '16rem', height: '8rem', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex justify-between items-start">
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Último Lido
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {lastRead ? (
                    <button onClick={() => navigate(`/read/${lastRead.bookId}/${lastRead.chapter}`)} className="text-left">
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        {lastRead.bookName} {lastRead.chapter}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Continuar leitura</p>
                    </button>
                  ) : (
                    <Link to="/books">
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        Gênesis 1:1
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Comece a ler</p>
                    </Link>
                  )}
                </div>

                {/* Versículo do dia */}
                {isLoadingVerse ? (
                  <div className="shrink-0 rounded-2xl skeleton" style={{ width: '16rem', height: '8rem' }} />
                ) : verseOfTheDay ? (
                  <div
                    className="shrink-0 flex flex-col justify-between rounded-2xl p-4 cursor-pointer"
                    style={{ width: '16rem', height: '8rem', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
                    onClick={() => navigate(`/read/${verseOfTheDay.book.id}/${verseOfTheDay.chapter}`)}
                  >
                    <div className="flex justify-between items-start">
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Favorito
                      </span>
                      <button onClick={handleShare} className="transition-opacity active:opacity-50">
                        <Share2 size={13} stroke="var(--text-muted)" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        {verseOfTheDay.book.name} {verseOfTheDay.chapter}:{verseOfTheDay.verse.verse}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }} className="line-clamp-1">
                        {copied ? 'Copiado!' : verseOfTheDay.verse.text}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* ── Stats grid ── */}
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-2 gap-4">
              {/* Progresso */}
              <div
                className="flex flex-col justify-between rounded-2xl p-5"
                style={{ height: '10rem', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  Plano de<br />leitura
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {readingProgress.percentage}%
                </span>
              </div>

              {/* Destaques / CTA */}
              <Link
                to="/saved"
                className="relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden"
                style={{ height: '10rem', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="absolute top-4 right-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-primary)' }}>
                    <path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex gap-1 mt-auto">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
                  <div className="w-2 h-2 rounded-full border" style={{ borderColor: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', lineHeight: 1.3, marginTop: '0.5rem' }}>
                  Meus<br />Destaques
                </h3>
              </Link>
            </div>
          </motion.div>

          {/* ── Dark CTA card ── */}
          <motion.div variants={fadeUp}>
            <Link
              to="/books"
              className="relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden"
              style={{ backgroundColor: 'var(--accent)', minHeight: '9rem' }}
            >
              {/* Decorative blur */}
              <div style={{ position: 'absolute', right: '-2.5rem', top: '-2.5rem', width: '8rem', height: '8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', filter: 'blur(24px)' }} />
              <div className="relative z-10">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '2.5rem', lineHeight: 1.3 }}>
                  Vamos ler<br />a Bíblia
                </h3>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Começar leitura
                  </span>
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: '3rem', height: '3rem', backgroundColor: '#ffffff' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg-page)" strokeWidth="2">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── Destaques recentes ── */}
          {highlightTexts.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Destaques Recentes
                </span>
                <Link to="/saved" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Ver todos
                </Link>
              </div>
              <div className="space-y-3">
                {highlightTexts.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => navigate(`/read/${h.book}/${h.chapter}`)}
                    className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      {h.bookName} {h.chapter}:{h.verse}
                    </span>
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--text-primary)', fontWeight: 400 }} className="line-clamp-2">
                      {h.text}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  )
}

export default HomePage
