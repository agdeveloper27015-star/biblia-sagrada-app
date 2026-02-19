import type { SupabaseClient } from '@supabase/supabase-js'
import { favoritesStorage, notesStorage, highlightsStorage } from './storage'

const migrationKey = (userId: string) => `biblia_migrated_${userId}`

export async function migrateLocalDataToSupabase(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  if (localStorage.getItem(migrationKey(userId))) return

  const localFavs = favoritesStorage.getAll()
  const localNotes = notesStorage.getAll()
  const localHighlights = highlightsStorage.getAll()

  const hasLocalData = localFavs.length > 0 || localNotes.length > 0 || localHighlights.length > 0
  if (!hasLocalData) {
    localStorage.setItem(migrationKey(userId), '1')
    return
  }

  // Verificar se usuário já tem dados remotos para não sobrescrever
  const [{ count: favCount }, { count: noteCount }, { count: hlCount }] = await Promise.all([
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('highlights').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  if (localFavs.length > 0 && (favCount ?? 0) === 0) {
    await supabase.from('favorites').insert(
      localFavs.map((f) => ({ user_id: userId, book: f.book, chapter: f.chapter, verse: f.verse }))
    )
  }

  if (localNotes.length > 0 && (noteCount ?? 0) === 0) {
    await supabase.from('notes').insert(
      localNotes.map((n) => ({
        user_id: userId,
        book: n.book,
        chapter: n.chapter,
        verse: n.verse,
        content: n.content,
        title: n.title,
      }))
    )
  }

  if (localHighlights.length > 0 && (hlCount ?? 0) === 0) {
    await supabase.from('highlights').insert(
      localHighlights.map((h) => ({
        user_id: userId,
        book: h.book,
        chapter: h.chapter,
        verse_start: h.verse_start,
        verse_end: h.verse_end,
        color: h.color,
      }))
    )
  }

  localStorage.setItem(migrationKey(userId), '1')
}
