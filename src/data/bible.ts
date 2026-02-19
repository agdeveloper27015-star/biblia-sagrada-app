import { books, getBookById } from './books'
import type { Book, Chapter, SearchResult, Verse } from '../types/bible'

interface BookData {
  abbrev: string
  name: string
  chapters: string[][]
}

let bibleDataPromise: Promise<BookData[]> | null = null
const chapterCache = new Map<string, Promise<Chapter | undefined>>()

const loadBibleData = async (): Promise<BookData[]> => {
  if (!bibleDataPromise) {
    bibleDataPromise = fetch('/data/bible_data.json')
      .then((r) => {
        if (!r.ok) throw new Error(`Falha ao carregar bible_data.json (${r.status})`)
        return r.json() as Promise<BookData[]>
      })
      .catch((err) => {
        bibleDataPromise = null
        throw err
      })
  }
  return bibleDataPromise
}

const buildChapter = (bookId: number, chapter: number, verses: string[]): Chapter => ({
  book: bookId,
  chapter,
  verses: verses.map((text, i) => ({ verse: i + 1, text })),
})

export const getChapter = async (bookId: number, chapter: number): Promise<Chapter | undefined> => {
  const book = getBookById(bookId)
  if (!book || chapter < 1 || chapter > book.chapters) return undefined

  const key = `${bookId}:${chapter}`
  const cached = chapterCache.get(key)
  if (cached) return cached

  const promise = fetch(`/data/bible/${bookId}/${chapter}.json`)
    .then(async (r) => {
      if (r.status === 404) return undefined
      if (!r.ok) throw new Error(`Falha ao carregar ${bookId}/${chapter} (${r.status})`)
      const verses = (await r.json()) as string[]
      if (!Array.isArray(verses)) return undefined
      return buildChapter(bookId, chapter, verses)
    })
    .catch(() => {
      chapterCache.delete(key)
      return undefined
    })

  chapterCache.set(key, promise)
  return promise
}

export const getVerseText = async (bookId: number, chapter: number, verse: number): Promise<string | undefined> => {
  const ch = await getChapter(bookId, chapter)
  return ch?.verses.find((v) => v.verse === verse)?.text
}

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const searchBible = async (query: string, limit = 50): Promise<SearchResult[]> => {
  const normalizedQuery = normalize(query.trim())
  if (!normalizedQuery) return []

  const allBooks = await loadBibleData()
  const results: SearchResult[] = []

  for (let bi = 0; bi < allBooks.length && results.length < limit; bi++) {
    const bookData = allBooks[bi]!
    const book = books[bi]!
    for (let ci = 0; ci < bookData.chapters.length && results.length < limit; ci++) {
      const chapterVerses = bookData.chapters[ci]!
      for (let vi = 0; vi < chapterVerses.length && results.length < limit; vi++) {
        if (normalize(chapterVerses[vi]!).includes(normalizedQuery)) {
          results.push({
            bookId: book.id,
            bookName: book.name,
            chapter: ci + 1,
            verse: vi + 1,
            text: chapterVerses[vi]!,
          })
        }
      }
    }
  }

  return results
}

export const getVerseOfTheDay = async (): Promise<{ book: Book; chapter: number; verse: Verse } | undefined> => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )

  // Versículos populares indexados pelo dia do ano
  const preselected = [
    { bookId: 43, ch: 3, v: 16 },
    { bookId: 19, ch: 23, v: 1 },
    { bookId: 20, ch: 3, v: 5 },
    { bookId: 45, ch: 8, v: 28 },
    { bookId: 50, ch: 4, v: 13 },
    { bookId: 23, ch: 41, v: 10 },
    { bookId: 24, ch: 29, v: 11 },
    { bookId: 19, ch: 46, v: 1 },
    { bookId: 58, ch: 11, v: 1 },
    { bookId: 19, ch: 119, v: 105 },
  ]

  const pick = preselected[dayOfYear % preselected.length]!
  const chapter = await getChapter(pick.bookId, pick.ch)
  const book = getBookById(pick.bookId)
  const verse = chapter?.verses.find((v) => v.verse === pick.v)

  if (!book || !verse) return undefined
  return { book, chapter: pick.ch, verse }
}

export { books, getBookById, getBookByName, getBooksByTestament } from './books'
