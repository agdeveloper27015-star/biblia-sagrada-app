import { motion } from 'framer-motion'
import { ArrowLeft, Settings, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

interface ReadingHeaderProps {
  bookName: string
  chapter: number
  progress: number
  onBack: () => void
  onBookSelect: () => void
  onSettings: () => void
}

export function ReadingHeader({
  bookName,
  chapter,
  progress,
  onBack,
  onBookSelect,
  onSettings,
}: ReadingHeaderProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress))

  return (
    <header className="sticky top-0 z-50">
      {/* Progress bar */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: 'var(--color-secondary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </div>

      {/* Header content */}
      <div
        className={cn(
          'flex items-center justify-between px-2 py-2',
          'backdrop-blur-xl backdrop-saturate-150'
        )}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: Back button */}
        <button
          onClick={onBack}
          className="p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Center: Book name + chapter */}
        <button
          onClick={onBookSelect}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
            'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
          )}
        >
          <span
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {bookName} {chapter}
          </span>
          <ChevronDown
            size={16}
            style={{ color: 'var(--text-muted)' }}
          />
        </button>

        {/* Right: Settings */}
        <button
          onClick={onSettings}
          className="p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
          aria-label="Configurações de leitura"
        >
          <Settings size={22} style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>
    </header>
  )
}
