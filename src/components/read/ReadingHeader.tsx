import { motion } from 'framer-motion'
import { ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react'

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
    <header
      className="sticky top-0 z-50 shrink-0"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 88%, transparent)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Progress bar — no topo */}
      <div className="h-[2px] w-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.8 }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        />
      </div>

      {/* Header content */}
      <div className="flex items-center justify-between px-2 py-2.5">

        {/* Left: Back */}
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity active:opacity-40"
          aria-label="Voltar"
        >
          <ArrowLeft size={19} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Center: Book + Chapter selector */}
        <button
          onClick={onBookSelect}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full transition-all active:opacity-50"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {bookName}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.9rem',
              fontWeight: 400,
              color: 'var(--text-muted)',
            }}
          >
            {chapter}
          </span>
          <ChevronDown size={12} strokeWidth={2.2} style={{ color: 'var(--text-muted)', marginLeft: 1 }} />
        </button>

        {/* Right: Settings */}
        <button
          onClick={onSettings}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity active:opacity-40"
          aria-label="Configurações de leitura"
        >
          <SlidersHorizontal size={17} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  )
}
