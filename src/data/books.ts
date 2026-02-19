import type { Book } from '../types/bible'

export const books: Book[] = [
  // Antigo Testamento
  { id: 1, name: 'Gênesis', abbreviation: 'Gn', chapters: 50, testament: 'old' },
  { id: 2, name: 'Êxodo', abbreviation: 'Êx', chapters: 40, testament: 'old' },
  { id: 3, name: 'Levítico', abbreviation: 'Lv', chapters: 27, testament: 'old' },
  { id: 4, name: 'Números', abbreviation: 'Nm', chapters: 36, testament: 'old' },
  { id: 5, name: 'Deuteronômio', abbreviation: 'Dt', chapters: 34, testament: 'old' },
  { id: 6, name: 'Josué', abbreviation: 'Js', chapters: 24, testament: 'old' },
  { id: 7, name: 'Juízes', abbreviation: 'Jz', chapters: 21, testament: 'old' },
  { id: 8, name: 'Rute', abbreviation: 'Rt', chapters: 4, testament: 'old' },
  { id: 9, name: '1 Samuel', abbreviation: '1Sm', chapters: 31, testament: 'old' },
  { id: 10, name: '2 Samuel', abbreviation: '2Sm', chapters: 24, testament: 'old' },
  { id: 11, name: '1 Reis', abbreviation: '1Rs', chapters: 22, testament: 'old' },
  { id: 12, name: '2 Reis', abbreviation: '2Rs', chapters: 25, testament: 'old' },
  { id: 13, name: '1 Crônicas', abbreviation: '1Cr', chapters: 29, testament: 'old' },
  { id: 14, name: '2 Crônicas', abbreviation: '2Cr', chapters: 36, testament: 'old' },
  { id: 15, name: 'Esdras', abbreviation: 'Ed', chapters: 10, testament: 'old' },
  { id: 16, name: 'Neemias', abbreviation: 'Ne', chapters: 13, testament: 'old' },
  { id: 17, name: 'Ester', abbreviation: 'Et', chapters: 10, testament: 'old' },
  { id: 18, name: 'Jó', abbreviation: 'Jó', chapters: 42, testament: 'old' },
  { id: 19, name: 'Salmos', abbreviation: 'Sl', chapters: 150, testament: 'old' },
  { id: 20, name: 'Provérbios', abbreviation: 'Pv', chapters: 31, testament: 'old' },
  { id: 21, name: 'Eclesiastes', abbreviation: 'Ec', chapters: 12, testament: 'old' },
  { id: 22, name: 'Cânticos', abbreviation: 'Ct', chapters: 8, testament: 'old' },
  { id: 23, name: 'Isaías', abbreviation: 'Is', chapters: 66, testament: 'old' },
  { id: 24, name: 'Jeremias', abbreviation: 'Jr', chapters: 52, testament: 'old' },
  { id: 25, name: 'Lamentações', abbreviation: 'Lm', chapters: 5, testament: 'old' },
  { id: 26, name: 'Ezequiel', abbreviation: 'Ez', chapters: 48, testament: 'old' },
  { id: 27, name: 'Daniel', abbreviation: 'Dn', chapters: 12, testament: 'old' },
  { id: 28, name: 'Oséias', abbreviation: 'Os', chapters: 14, testament: 'old' },
  { id: 29, name: 'Joel', abbreviation: 'Jl', chapters: 3, testament: 'old' },
  { id: 30, name: 'Amós', abbreviation: 'Am', chapters: 9, testament: 'old' },
  { id: 31, name: 'Obadias', abbreviation: 'Ob', chapters: 1, testament: 'old' },
  { id: 32, name: 'Jonas', abbreviation: 'Jn', chapters: 4, testament: 'old' },
  { id: 33, name: 'Miquéias', abbreviation: 'Mq', chapters: 7, testament: 'old' },
  { id: 34, name: 'Naum', abbreviation: 'Na', chapters: 3, testament: 'old' },
  { id: 35, name: 'Habacuque', abbreviation: 'Hc', chapters: 3, testament: 'old' },
  { id: 36, name: 'Sofonias', abbreviation: 'Sf', chapters: 3, testament: 'old' },
  { id: 37, name: 'Ageu', abbreviation: 'Ag', chapters: 2, testament: 'old' },
  { id: 38, name: 'Zacarias', abbreviation: 'Zc', chapters: 14, testament: 'old' },
  { id: 39, name: 'Malaquias', abbreviation: 'Ml', chapters: 4, testament: 'old' },
  // Novo Testamento
  { id: 40, name: 'Mateus', abbreviation: 'Mt', chapters: 28, testament: 'new' },
  { id: 41, name: 'Marcos', abbreviation: 'Mc', chapters: 16, testament: 'new' },
  { id: 42, name: 'Lucas', abbreviation: 'Lc', chapters: 24, testament: 'new' },
  { id: 43, name: 'João', abbreviation: 'Jo', chapters: 21, testament: 'new' },
  { id: 44, name: 'Atos', abbreviation: 'At', chapters: 28, testament: 'new' },
  { id: 45, name: 'Romanos', abbreviation: 'Rm', chapters: 16, testament: 'new' },
  { id: 46, name: '1 Coríntios', abbreviation: '1Co', chapters: 16, testament: 'new' },
  { id: 47, name: '2 Coríntios', abbreviation: '2Co', chapters: 13, testament: 'new' },
  { id: 48, name: 'Gálatas', abbreviation: 'Gl', chapters: 6, testament: 'new' },
  { id: 49, name: 'Efésios', abbreviation: 'Ef', chapters: 6, testament: 'new' },
  { id: 50, name: 'Filipenses', abbreviation: 'Fp', chapters: 4, testament: 'new' },
  { id: 51, name: 'Colossenses', abbreviation: 'Cl', chapters: 4, testament: 'new' },
  { id: 52, name: '1 Tessalonicenses', abbreviation: '1Ts', chapters: 5, testament: 'new' },
  { id: 53, name: '2 Tessalonicenses', abbreviation: '2Ts', chapters: 3, testament: 'new' },
  { id: 54, name: '1 Timóteo', abbreviation: '1Tm', chapters: 6, testament: 'new' },
  { id: 55, name: '2 Timóteo', abbreviation: '2Tm', chapters: 4, testament: 'new' },
  { id: 56, name: 'Tito', abbreviation: 'Tt', chapters: 3, testament: 'new' },
  { id: 57, name: 'Filemom', abbreviation: 'Fm', chapters: 1, testament: 'new' },
  { id: 58, name: 'Hebreus', abbreviation: 'Hb', chapters: 13, testament: 'new' },
  { id: 59, name: 'Tiago', abbreviation: 'Tg', chapters: 5, testament: 'new' },
  { id: 60, name: '1 Pedro', abbreviation: '1Pd', chapters: 5, testament: 'new' },
  { id: 61, name: '2 Pedro', abbreviation: '2Pd', chapters: 3, testament: 'new' },
  { id: 62, name: '1 João', abbreviation: '1Jo', chapters: 5, testament: 'new' },
  { id: 63, name: '2 João', abbreviation: '2Jo', chapters: 1, testament: 'new' },
  { id: 64, name: '3 João', abbreviation: '3Jo', chapters: 1, testament: 'new' },
  { id: 65, name: 'Judas', abbreviation: 'Jd', chapters: 1, testament: 'new' },
  { id: 66, name: 'Apocalipse', abbreviation: 'Ap', chapters: 22, testament: 'new' },
]

export const getBookById = (id: number): Book | undefined =>
  books.find((book) => book.id === id)

export const getBookByName = (name: string): Book | undefined => {
  const query = name.toLowerCase()
  return books.find(
    (book) =>
      book.name.toLowerCase().includes(query) ||
      book.abbreviation.toLowerCase().includes(query)
  )
}

export const getBooksByTestament = (testament: 'old' | 'new'): Book[] =>
  books.filter((book) => book.testament === testament)
