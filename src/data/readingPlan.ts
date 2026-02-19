import type { ReadingPlanData, ReadingDay } from '../types/bible'

let planPromise: Promise<ReadingPlanData> | null = null

const loadPlan = async (): Promise<ReadingPlanData> => {
  if (!planPromise) {
    planPromise = fetch('/data/bibleInOneYear.json')
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao carregar plano de leitura')
        return r.json() as Promise<ReadingPlanData>
      })
      .catch((err) => {
        planPromise = null
        throw err
      })
  }
  return planPromise
}

export const getReadingPlan = async (): Promise<ReadingPlanData> => loadPlan()

export const getReadingForDay = async (day: number): Promise<ReadingDay | undefined> => {
  const plan = await loadPlan()
  return plan.days.find((d) => d.day === day)
}

export const getTodayReading = async (): Promise<ReadingDay | undefined> => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime()
  const currentDay = Math.floor((Date.now() - startOfYear) / 86400000)
  return getReadingForDay(currentDay)
}

export const getReadingProgress = (): { currentDay: number; totalDays: number; percentage: number } => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime()
  const currentDay = Math.floor((Date.now() - startOfYear) / 86400000)
  return {
    currentDay,
    totalDays: 365,
    percentage: Math.round((currentDay / 365) * 100),
  }
}
