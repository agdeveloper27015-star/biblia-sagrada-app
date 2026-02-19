const KEYS = {
  favorites: 'biblia_favorites',
  notes: 'biblia_notes',
  highlights: 'biblia_highlights',
  readingProgress: 'biblia_reading_progress',
  readingSettings: 'biblia_reading_settings',
  searchHistory: 'biblia_search_history',
} as const

const MAX_SEARCH_HISTORY = 10

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Favoritos ---

export interface LocalFavorite {
  book: number
  chapter: number
  verse: number
  created_at: string
}

export const favoritesStorage = {
  getAll(): LocalFavorite[] {
    return get<LocalFavorite[]>(KEYS.favorites, [])
  },

  add(book: number, chapter: number, verse: number): void {
    const favs = this.getAll()
    if (!this.isFavorite(book, chapter, verse)) {
      favs.unshift({ book, chapter, verse, created_at: new Date().toISOString() })
      set(KEYS.favorites, favs)
    }
  },

  remove(book: number, chapter: number, verse: number): void {
    const favs = this.getAll().filter(
      (f) => !(f.book === book && f.chapter === chapter && f.verse === verse)
    )
    set(KEYS.favorites, favs)
  },

  isFavorite(book: number, chapter: number, verse: number): boolean {
    return this.getAll().some(
      (f) => f.book === book && f.chapter === chapter && f.verse === verse
    )
  },
}

// --- Notas ---

export interface LocalNote {
  id: string
  book: number
  chapter: number
  verse: number
  content: string
  title: string | null
  created_at: string
  updated_at: string
}

export const notesStorage = {
  getAll(): LocalNote[] {
    return get<LocalNote[]>(KEYS.notes, [])
  },

  add(book: number, chapter: number, verse: number, content: string, title?: string): LocalNote {
    const notes = this.getAll()
    const note: LocalNote = {
      id: crypto.randomUUID(),
      book,
      chapter,
      verse,
      content,
      title: title ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    notes.unshift(note)
    set(KEYS.notes, notes)
    return note
  },

  update(id: string, content: string, title?: string): void {
    const notes = this.getAll().map((n) =>
      n.id === id
        ? { ...n, content, title: title ?? n.title, updated_at: new Date().toISOString() }
        : n
    )
    set(KEYS.notes, notes)
  },

  remove(id: string): void {
    set(KEYS.notes, this.getAll().filter((n) => n.id !== id))
  },

  getForVerse(book: number, chapter: number, verse: number): LocalNote[] {
    return this.getAll().filter(
      (n) => n.book === book && n.chapter === chapter && n.verse === verse
    )
  },
}

// --- Highlights ---

export interface LocalHighlight {
  id: string
  book: number
  chapter: number
  verse_start: number
  verse_end: number
  color: 'white' | 'gray' | 'black' | 'blue'
  created_at: string
}

export const highlightsStorage = {
  getAll(): LocalHighlight[] {
    return get<LocalHighlight[]>(KEYS.highlights, [])
  },

  add(
    book: number,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    color: LocalHighlight['color']
  ): LocalHighlight {
    const highlights = this.getAll()
    // Remover highlight existente no mesmo range
    const filtered = highlights.filter(
      (h) =>
        !(h.book === book && h.chapter === chapter && h.verse_start === verseStart && h.verse_end === verseEnd)
    )
    const highlight: LocalHighlight = {
      id: crypto.randomUUID(),
      book,
      chapter,
      verse_start: verseStart,
      verse_end: verseEnd,
      color,
      created_at: new Date().toISOString(),
    }
    filtered.unshift(highlight)
    set(KEYS.highlights, filtered)
    return highlight
  },

  remove(id: string): void {
    set(KEYS.highlights, this.getAll().filter((h) => h.id !== id))
  },

  getForChapter(book: number, chapter: number): LocalHighlight[] {
    return this.getAll().filter((h) => h.book === book && h.chapter === chapter)
  },
}

// --- Histórico de Busca ---

export const searchHistoryStorage = {
  getAll(): string[] {
    return get<string[]>(KEYS.searchHistory, [])
  },

  add(query: string): void {
    const trimmed = query.trim()
    if (!trimmed) return
    const history = this.getAll().filter((q) => q !== trimmed)
    history.unshift(trimmed)
    set(KEYS.searchHistory, history.slice(0, MAX_SEARCH_HISTORY))
  },

  remove(query: string): void {
    set(KEYS.searchHistory, this.getAll().filter((q) => q !== query))
  },

  clear(): void {
    set(KEYS.searchHistory, [])
  },
}

// --- Progresso de Leitura ---

export interface LocalReadingProgress {
  plan_id: string
  current_day: number
  completed_chapters: Record<string, boolean>
  started_at: string
  finished_at: string | null
}

export const readingProgressStorage = {
  get(planId: string): LocalReadingProgress | null {
    const all = get<Record<string, LocalReadingProgress>>(KEYS.readingProgress, {})
    return all[planId] ?? null
  },

  save(progress: LocalReadingProgress): void {
    const all = get<Record<string, LocalReadingProgress>>(KEYS.readingProgress, {})
    all[progress.plan_id] = progress
    set(KEYS.readingProgress, all)
  },
}

// --- Configurações de Leitura ---

export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  maxWidth: number
  layout: 'verse' | 'paragraph'
}

const defaultSettings: ReadingSettings = {
  fontSize: 1.05,
  lineHeight: 1.85,
  maxWidth: 68,
  layout: 'paragraph',
}

export const readingSettingsStorage = {
  get(): ReadingSettings {
    return get<ReadingSettings>(KEYS.readingSettings, defaultSettings)
  },

  save(settings: ReadingSettings): void {
    set(KEYS.readingSettings, settings)
  },
}
