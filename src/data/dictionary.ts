import { bookIdToDictionaryFolder } from './bookMapping'
import type { DictionaryChapter, DictionaryEntry } from '../types/bible'

const dictionaryCache = new Map<string, Promise<DictionaryChapter | null>>()

export const getDictionaryForChapter = async (
  bookId: number,
  chapter: number
): Promise<DictionaryChapter | null> => {
  const folderName = bookIdToDictionaryFolder[bookId]
  if (!folderName) return null

  const key = `${bookId}:${chapter}`
  const cached = dictionaryCache.get(key)
  if (cached) return cached

  const promise = fetch(`/data/dictionary/${folderName}/${chapter}.json`)
    .then((r) => (r.ok ? (r.json() as Promise<DictionaryChapter>) : null))
    .catch(() => {
      dictionaryCache.delete(key)
      return null
    })

  dictionaryCache.set(key, promise)
  return promise
}

export const getWordEntries = async (
  bookId: number,
  chapter: number,
  verse: number
): Promise<DictionaryEntry[]> => {
  const data = await getDictionaryForChapter(bookId, chapter)
  if (!data) return []

  const folderName = bookIdToDictionaryFolder[bookId]
  if (!folderName) return []

  const prefix = `${folderName}_${chapter}_${verse}_`

  return Object.entries(data)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value)
}
