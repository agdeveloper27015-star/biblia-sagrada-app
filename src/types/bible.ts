export interface Book {
  id: number
  name: string
  abbreviation: string
  chapters: number
  testament: 'old' | 'new'
}

export interface Verse {
  verse: number
  text: string
}

export interface Chapter {
  book: number
  chapter: number
  verses: Verse[]
}

export interface DictionaryEntry {
  palavra_pt: string
  palavra_original: string
  transliteracao: string
  strong: string
  significado_raiz: string
  significado_contextual: string
  explicacao_detalhada: string
  por_que_esta_palavra: string
  conexao_teologica: string
  referencias_relacionadas: string[]
}

export interface DictionaryChapter {
  [key: string]: DictionaryEntry
}

export interface SearchResult {
  bookId: number
  bookName: string
  chapter: number
  verse: number
  text: string
  score?: number
}

export interface ReadingDay {
  day: number
  chapters: {
    bookAbbrev: string
    bookName: string
    chapter: number
  }[]
}

export interface ReadingPlanData {
  id: string
  title: string
  description: string
  totalDays: number
  days: ReadingDay[]
}
