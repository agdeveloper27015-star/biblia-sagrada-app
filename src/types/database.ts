export interface Profile {
  id: string
  username: string | null
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  book: number
  chapter: number
  verse: number
  created_at: string
}

export interface Highlight {
  id: string
  user_id: string
  book: number
  chapter: number
  verse_start: number
  verse_end: number
  color: HighlightColor
  created_at: string
}

export type HighlightColor = 'white' | 'gray' | 'black' | 'blue'

export interface Note {
  id: string
  user_id: string
  book: number
  chapter: number
  verse: number
  content: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface UserReadingProgress {
  id: string
  user_id: string
  plan_id: string
  current_day: number
  completed_chapters: Record<string, boolean>
  started_at: string
  finished_at: string | null
}
