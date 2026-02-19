import { useCallback, useMemo } from 'react'
import { cn } from '../../lib/cn'
import type { Verse } from '../../types/bible'

// Livros poéticos: Jó(18), Salmos(19), Provérbios(20), Eclesiastes(21), Cânticos(22), Lamentações(25)
const POETIC_BOOKS = new Set([18, 19, 20, 21, 22, 25])

// Detecta fim de pensamento completo (ponto, exclamação, interrogação)
function isEndOfThought(text: string): boolean {
  return /[.!?]['"]?\s*$/.test(text.trim())
}

// Detecta "Selá" (pausa litúrgica nos Salmos)
function hasSela(text: string): boolean {
  return /\bSel[aá]\b/i.test(text)
}

// Extrai introdução + fala quando há "E disse X: <fala>"
function parseSpeech(text: string): { intro: string; speech: string } | null {
  const idx = text.indexOf(':')
  if (idx > 3 && idx < text.length - 5) {
    const intro = text.slice(0, idx + 1)
    const speech = text.slice(idx + 1).trim()
    if (speech.length > 4) return { intro, speech }
  }
  return null
}

// Agrupa versículos em parágrafos por pontuação
function groupIntoParagraphs(verses: Verse[]): Verse[][] {
  const groups: Verse[][] = []
  let current: Verse[] = []
  for (const verse of verses) {
    current.push(verse)
    if (isEndOfThought(verse.text)) {
      groups.push(current)
      current = []
    }
  }
  if (current.length > 0) groups.push(current)
  return groups
}

// Agrupa em estrofes para livros poéticos (por Selá ou blocos de 4)
function groupIntoStanzas(verses: Verse[]): Verse[][] {
  const stanzas: Verse[][] = []
  let stanza: Verse[] = []
  for (const verse of verses) {
    stanza.push(verse)
    if (hasSela(verse.text) || stanza.length >= 4) {
      stanzas.push(stanza)
      stanza = []
    }
  }
  if (stanza.length > 0) stanzas.push(stanza)
  return stanzas
}

interface ScriptureViewProps {
  verses: Verse[]
  layout: 'verse' | 'paragraph'
  bookId: number
  chapter: number
  onVerseClick: (verse: number) => void
  favorites: Set<number>
  highlightMap: Map<number, string>
  notedVerses: Set<number>
}

function VerseNum({ n, first }: { n: number; first?: boolean }) {
  return (
    <sup className={cn('scripture-versenum', first && 'scripture-versenum-first')}>
      {n}
    </sup>
  )
}

function VerseText({ text }: { text: string }) {
  const speech = parseSpeech(text)
  if (speech) {
    return (
      <>
        <span className="scripture-narrator">{speech.intro}</span>
        {' '}
        <em className="scripture-speech">{speech.speech}</em>
      </>
    )
  }
  return <>{text}</>
}

export function ScriptureView({
  verses,
  layout,
  bookId,
  chapter,
  onVerseClick,
  favorites,
  highlightMap,
  notedVerses,
}: ScriptureViewProps) {
  const isPoetic = POETIC_BOOKS.has(bookId)

  const getMarkers = useCallback(
    (n: number) => {
      const cls: string[] = []
      const color = highlightMap.get(n)
      if (color) cls.push(`highlight-${color}`)
      if (favorites.has(n)) cls.push('verse-favorited')
      if (notedVerses.has(n)) cls.push('verse-has-note')
      return cls.join(' ')
    },
    [highlightMap, favorites, notedVerses]
  )

  const verseProps = useCallback(
    (verse: Verse, extra?: string) => ({
      className: cn('scripture-inline-verse', getMarkers(verse.verse), extra),
      onClick: () => onVerseClick(verse.verse),
      role: 'button' as const,
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onVerseClick(verse.verse)
        }
      },
    }),
    [getMarkers, onVerseClick]
  )

  // ── POÉTICO ──────────────────────────────────────────────────
  if (isPoetic) {
    const stanzas = groupIntoStanzas(verses)
    return (
      <div className="scripture-smart" data-book={bookId} data-chapter={chapter}>
        {stanzas.map((stanza, si) => (
          <div key={si} className="scripture-stanza">
            {stanza.map((verse, vi) => {
              const clean = verse.text.replace(/\s*Sel[aá]\s*/i, '').trim()
              const sela = hasSela(verse.text)
              return (
                <span
                  key={verse.verse}
                  {...verseProps(verse, vi % 2 === 1 ? 'scripture-poetic-indented' : undefined)}
                  style={{ display: 'block', padding: '0.18em 0', borderRadius: '0.3rem' }}
                >
                  <VerseNum n={verse.verse} />
                  <VerseText text={clean} />
                  {sela && <span className="scripture-sela">Selá</span>}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // ── PARÁGRAFO CONTÍNUO (layout=paragraph) ────────────────────
  if (layout === 'paragraph') {
    const paragraphs = groupIntoParagraphs(verses)
    return (
      <div className="scripture-smart" data-book={bookId} data-chapter={chapter}>
        {paragraphs.map((group, pi) => (
          <p key={pi} className="scripture-smart-paragraph">
            {group.map((verse, vi) => (
              <span key={verse.verse} {...verseProps(verse)}>
                <VerseNum n={verse.verse} first={pi === 0 && vi === 0} />
                <VerseText text={verse.text} />{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
    )
  }

  // ── VERSÍCULO A VERSÍCULO (layout=verse) — padrão ─────────────
  // Versículos agrupados visualmente: espaço extra quando termina o pensamento
  const paragraphs = useMemo(() => groupIntoParagraphs(verses), [verses])

  return (
    <div className="scripture-smart" data-book={bookId} data-chapter={chapter}>
      {paragraphs.map((group, pi) => (
        <div key={pi} className={cn('scripture-block', pi > 0 && 'scripture-block-sep')}>
          {group.map((verse) => (
            <span
              key={verse.verse}
              {...verseProps(verse)}
              style={{ display: 'block', padding: '0.15em 0', borderRadius: '0.3rem' }}
            >
              <VerseNum n={verse.verse} />
              <VerseText text={verse.text} />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
