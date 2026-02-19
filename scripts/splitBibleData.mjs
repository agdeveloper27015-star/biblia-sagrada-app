import { promises as fs } from 'node:fs'
import path from 'node:path'

const sourceFile = path.join(process.cwd(), 'public/data/bible_data.json')
const outputRoot = path.join(process.cwd(), 'public/data/bible')

const rawSource = await fs.readFile(sourceFile, 'utf8')
const sanitizedSource = rawSource.replace(/^\uFEFF/, '')
const books = JSON.parse(sanitizedSource)

if (!Array.isArray(books)) {
  throw new Error('Invalid bible_data.json format: expected an array of books')
}

await fs.rm(outputRoot, { recursive: true, force: true })

let chapterCount = 0

for (const [bookIndex, book] of books.entries()) {
  const bookId = bookIndex + 1
  const chapters = book?.chapters

  if (!Array.isArray(chapters)) {
    throw new Error(`Invalid chapter list for book ${bookId}`)
  }

  const bookDir = path.join(outputRoot, String(bookId))
  await fs.mkdir(bookDir, { recursive: true })

  for (const [chapterIndex, verses] of chapters.entries()) {
    const chapter = chapterIndex + 1
    if (!Array.isArray(verses)) {
      throw new Error(`Invalid verses for book ${bookId}, chapter ${chapter}`)
    }

    const chapterFile = path.join(bookDir, `${chapter}.json`)
    await fs.writeFile(chapterFile, JSON.stringify(verses))
    chapterCount += 1
  }
}

console.log(`Generated ${chapterCount} chapter files in public/data/bible`)
