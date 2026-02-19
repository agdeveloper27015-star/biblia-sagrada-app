import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { favoritesStorage, type LocalFavorite } from '../lib/storage'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<LocalFavorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    if (user && supabase) {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFavorites(
        (data ?? []).map((f: { book: number; chapter: number; verse: number; created_at: string }) => ({
          book: f.book,
          chapter: f.chapter,
          verse: f.verse,
          created_at: f.created_at,
        }))
      )
    } else {
      setFavorites(favoritesStorage.getAll())
    }
    setIsLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addFavorite = useCallback(
    async (book: number, chapter: number, verse: number) => {
      const now = new Date().toISOString()
      // Optimistic update
      setFavorites((prev) => [{ book, chapter, verse, created_at: now }, ...prev])

      if (user && supabase) {
        await supabase.from('favorites').insert({ user_id: user.id, book, chapter, verse })
      } else {
        favoritesStorage.add(book, chapter, verse)
      }
    },
    [user]
  )

  const removeFavorite = useCallback(
    async (book: number, chapter: number, verse: number) => {
      // Optimistic update
      setFavorites((prev) =>
        prev.filter((f) => !(f.book === book && f.chapter === chapter && f.verse === verse))
      )

      if (user && supabase) {
        await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, book, chapter, verse })
      } else {
        favoritesStorage.remove(book, chapter, verse)
      }
    },
    [user]
  )

  const isFavorite = useCallback(
    (book: number, chapter: number, verse: number) =>
      favorites.some((f) => f.book === book && f.chapter === chapter && f.verse === verse),
    [favorites]
  )

  const toggleFavorite = useCallback(
    async (book: number, chapter: number, verse: number) => {
      if (isFavorite(book, chapter, verse)) {
        await removeFavorite(book, chapter, verse)
      } else {
        await addFavorite(book, chapter, verse)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, isLoading }
}
