import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { notesStorage, type LocalNote } from '../lib/storage'

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    if (user && supabase) {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setNotes(
        (data ?? []).map((n: LocalNote & { user_id: string }) => ({
          id: n.id,
          book: n.book,
          chapter: n.chapter,
          verse: n.verse,
          content: n.content,
          title: n.title,
          created_at: n.created_at,
          updated_at: n.updated_at,
        }))
      )
    } else {
      setNotes(notesStorage.getAll())
    }
    setIsLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addNote = useCallback(
    async (book: number, chapter: number, verse: number, content: string, title?: string) => {
      if (user && supabase) {
        const { data } = await supabase
          .from('notes')
          .insert({ user_id: user.id, book, chapter, verse, content, title: title ?? null })
          .select()
          .single()
        if (data) {
          setNotes((prev) => [data as LocalNote, ...prev])
        }
      } else {
        const note = notesStorage.add(book, chapter, verse, content, title)
        setNotes((prev) => [note, ...prev])
      }
    },
    [user]
  )

  const updateNote = useCallback(
    async (id: string, content: string, title?: string) => {
      const now = new Date().toISOString()
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, content, title: title ?? n.title, updated_at: now } : n
        )
      )

      if (user && supabase) {
        await supabase
          .from('notes')
          .update({ content, title: title ?? null, updated_at: now })
          .eq('id', id)
      } else {
        notesStorage.update(id, content, title)
      }
    },
    [user]
  )

  const deleteNote = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotes((prev) => prev.filter((n) => n.id !== id))

      if (user && supabase) {
        await supabase.from('notes').delete().eq('id', id)
      } else {
        notesStorage.remove(id)
      }
    },
    [user]
  )

  const getNotesForVerse = useCallback(
    (book: number, chapter: number, verse: number) =>
      notes.filter((n) => n.book === book && n.chapter === chapter && n.verse === verse),
    [notes]
  )

  return { notes, addNote, updateNote, deleteNote, getNotesForVerse, isLoading }
}
