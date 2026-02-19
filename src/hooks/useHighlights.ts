import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { highlightsStorage, type LocalHighlight } from '../lib/storage'
import type { HighlightColor } from '../types/database'

export function useHighlights() {
  const { user } = useAuth()
  const [highlights, setHighlights] = useState<LocalHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    if (user && supabase) {
      const { data } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setHighlights(
        (data ?? []).map((h: LocalHighlight & { user_id: string }) => ({
          id: h.id,
          book: h.book,
          chapter: h.chapter,
          verse_start: h.verse_start,
          verse_end: h.verse_end,
          color: h.color,
          created_at: h.created_at,
        }))
      )
    } else {
      setHighlights(highlightsStorage.getAll())
    }
    setIsLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addHighlight = useCallback(
    async (book: number, chapter: number, verseStart: number, verseEnd: number, color: HighlightColor) => {
      if (user && supabase) {
        // Remove existing optimistically
        setHighlights((prev) =>
          prev.filter(
            (h) => !(h.book === book && h.chapter === chapter && h.verse_start === verseStart && h.verse_end === verseEnd)
          )
        )
        await supabase
          .from('highlights')
          .delete()
          .match({ user_id: user.id, book, chapter, verse_start: verseStart, verse_end: verseEnd })
        const { data } = await supabase
          .from('highlights')
          .insert({ user_id: user.id, book, chapter, verse_start: verseStart, verse_end: verseEnd, color })
          .select()
          .single()
        if (data) {
          setHighlights((prev) => [data as LocalHighlight, ...prev])
        }
      } else {
        const h = highlightsStorage.add(book, chapter, verseStart, verseEnd, color)
        setHighlights((prev) => [
          h,
          ...prev.filter(
            (existing) =>
              !(existing.book === book && existing.chapter === chapter && existing.verse_start === verseStart && existing.verse_end === verseEnd)
          ),
        ])
      }
    },
    [user]
  )

  const removeHighlight = useCallback(
    async (id: string) => {
      // Optimistic update
      setHighlights((prev) => prev.filter((h) => h.id !== id))

      if (user && supabase) {
        await supabase.from('highlights').delete().eq('id', id)
      } else {
        highlightsStorage.remove(id)
      }
    },
    [user]
  )

  const getHighlightsForChapter = useCallback(
    (book: number, chapter: number) =>
      highlights.filter((h) => h.book === book && h.chapter === chapter),
    [highlights]
  )

  const getHighlightForVerse = useCallback(
    (book: number, chapter: number, verse: number) =>
      highlights.find(
        (h) => h.book === book && h.chapter === chapter && h.verse_start <= verse && h.verse_end >= verse
      ),
    [highlights]
  )

  return { highlights, addHighlight, removeHighlight, getHighlightsForChapter, getHighlightForVerse, isLoading }
}
