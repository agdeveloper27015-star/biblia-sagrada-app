import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, BookOpen, ArrowRight } from 'lucide-react'
import { getVerseOfTheDay, getChapter } from '../data/bible'
import { getBookById } from '../data/books'
import { useHighlights } from '../hooks/useHighlights'
import type { Book, Verse } from '../types/bible'

interface VerseOfTheDay { book: Book; chapter: number; verse: Verse }
interface LastRead { bookId: number; chapter: number; bookName: string }
interface HighlightWithText {
  id: string; book: number; chapter: number; verse: number
  bookName: string; text: string; color: string
}

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

function HomePage() {
  const navigate = useNavigate()
  const { highlights } = useHighlights()

  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null)
  const [isLoadingVerse, setIsLoadingVerse] = useState(true)
  const [lastRead, setLastRead]            = useState<LastRead | null>(null)
  const [highlightTexts, setHighlightTexts] = useState<HighlightWithText[]>([])
  const [copied, setCopied]                = useState(false)

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
    <div className="min-h-dvh pb-4" style={{ backgroundColor: 'var(--bg-page)' }}>
      <main className="px-5 pt-5">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

          {/* ── Versículo do Dia ── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3.5">
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.25rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.05,
              }}>
                Versículo<br />do Dia
              </h1>
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: '3.25rem', height: '3.25rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <BookOpen size={20} strokeWidth={1.4} style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>

            {/* Card versículo */}
            {isLoadingVerse ? (
              <div className="rounded-2xl skeleton" style={{ height: '7.5rem' }} />
            ) : verseOfTheDay ? (
              <button
                onClick={() => navigate(`/read/${verseOfTheDay.book.id}/${verseOfTheDay.chapter}`)}
                className="w-full text-left rounded-2xl p-5 transition-transform active:scale-[0.985]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                }}
              >
                {/* Referência */}
                <span style={{
                  fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--accent)',
                  display: 'block', marginBottom: '0.625rem',
                }}>
                  {verseOfTheDay.book.name} {verseOfTheDay.chapter}:{verseOfTheDay.verse.verse}
                </span>

                {/* Texto */}
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.0625rem',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  lineHeight: 1.7,
                }} className="line-clamp-3">
                  {verseOfTheDay.verse.text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3.5" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {copied ? '✓ Copiado' : 'Toque para ler o capítulo'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(e) }}
                    className="flex items-center justify-center rounded-full transition-all active:opacity-50"
                    style={{ width: '1.75rem', height: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <Share2 size={12} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </button>
            ) : null}
          </motion.div>

          {/* ── Grid: Último Lido + Anotações ── */}
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-2 gap-3">

              {/* Último lido */}
              <button
                onClick={() => lastRead ? navigate(`/read/${lastRead.bookId}/${lastRead.chapter}`) : navigate('/books')}
                className="flex flex-col justify-between rounded-2xl p-4 text-left transition-transform active:scale-[0.97]"
                style={{
                  height: '10rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  Último Lido
                </span>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.1rem', fontWeight: 500,
                    color: 'var(--text-primary)', lineHeight: 1.2, display: 'block',
                  }}>
                    {lastRead ? `${lastRead.bookName} ${lastRead.chapter}` : 'Gênesis 1'}
                  </span>
                  <div className="flex items-center gap-1 mt-2">
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {lastRead ? 'Continuar' : 'Começar'}
                    </span>
                    <ArrowRight size={11} strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
                  </div>
                </div>
              </button>

              {/* Minhas Anotações */}
              <Link
                to="/notes"
                className="relative flex flex-col justify-between rounded-2xl p-4 overflow-hidden transition-transform active:scale-[0.97]"
                style={{
                  height: '10rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Seta diagonal */}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                    <path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Ícone caderno */}
                <div style={{ marginTop: 'auto', marginBottom: '0.5rem' }}>
                  <svg width="30" height="30" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--text-primary)' }}>
                    <rect x="7" y="4" width="18" height="24" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <line x1="7" y1="4" x2="7" y2="28" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="7" cy="9"  r="1.5" fill="currentColor"/>
                    <circle cx="7" cy="14" r="1.5" fill="currentColor"/>
                    <circle cx="7" cy="19" r="1.5" fill="currentColor"/>
                    <circle cx="7" cy="24" r="1.5" fill="currentColor"/>
                    <line x1="12" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
                    <line x1="12" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
                    <line x1="12" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                </div>

                <h3 style={{
                  fontWeight: 700, fontSize: '0.72rem',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  color: 'var(--text-primary)', lineHeight: 1.35,
                }}>
                  Minhas<br />Anotações
                </h3>
              </Link>
            </div>
          </motion.div>

          {/* ── CTA Leitura ── */}
          <motion.div variants={fadeUp}>
            <Link
              to="/books"
              className="relative flex flex-col justify-between rounded-2xl overflow-hidden transition-transform active:scale-[0.985]"
              style={{ backgroundColor: 'var(--text-primary)', minHeight: '8.5rem', padding: '1.5rem' }}
            >
              {/* Brilho decorativo */}
              <div style={{
                position: 'absolute', right: '-3rem', top: '-3rem',
                width: '10rem', height: '10rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '9999px', filter: 'blur(32px)',
              }} />
              <div style={{
                position: 'absolute', left: '-1rem', bottom: '-2rem',
                width: '7rem', height: '7rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '9999px', filter: 'blur(20px)',
              }} />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <h3 style={{
                  fontSize: '1.25rem', fontWeight: 300,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--bg-page)', lineHeight: 1.25,
                }}>
                  Vamos ler<br />a Bíblia
                </h3>
                <div className="flex items-center justify-between mt-6">
                  <span style={{
                    fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600,
                  }}>
                    Começar leitura
                  </span>
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: '2.75rem', height: '2.75rem', backgroundColor: 'var(--bg-page)' }}
                  >
                    <ArrowRight size={16} strokeWidth={2} style={{ color: 'var(--text-primary)' }} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── Destaques recentes ── */}
          {highlightTexts.length > 0 && (
            <motion.div variants={fadeUp} className="pb-2">
              <div className="flex items-center justify-between mb-3">
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  Destaques Recentes
                </span>
                <Link to="/saved" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', opacity: 0.7 }}>
                  Ver todos
                </Link>
              </div>
              <div className="space-y-2.5">
                {highlightTexts.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => navigate(`/read/${h.book}/${h.chapter}`)}
                    className="w-full text-left rounded-2xl p-4 transition-transform active:scale-[0.98] flex items-center gap-3"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {/* Accent bar */}
                    <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 9999, backgroundColor: 'var(--accent)', flexShrink: 0, opacity: 0.7 }} />
                    <div className="min-w-0">
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        display: 'block', marginBottom: '0.3rem',
                      }}>
                        {h.bookName} {h.chapter}:{h.verse}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.9375rem', lineHeight: 1.6,
                        color: 'var(--text-primary)', fontWeight: 400,
                      }} className="line-clamp-2">
                        {h.text}
                      </p>
                    </div>
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
