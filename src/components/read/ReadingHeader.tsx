import { motion } from 'framer-motion'
import { ArrowLeft, Settings, ChevronDown } from 'lucide-react'

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
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Header content */}
      <div className="flex items-center justify-between px-3 py-2">

        {/* Left: Back button */}
        <button
          onClick={onBack}
          className="p-2 rounded-full transition-opacity active:opacity-50"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} strokeWidth={1.75} style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Center: Book name + chapter */}
        <button
          onClick={onBookSelect}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-opacity active:opacity-60"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {bookName} {chapter}
          </span>
          <ChevronDown size={14} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Right: Settings */}
        <button
          onClick={onSettings}
          className="p-2 rounded-full transition-opacity active:opacity-50"
          aria-label="Configurações de leitura"
        >
          <Settings size={20} strokeWidth={1.75} style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {/* Barra de progresso */}
      <div
        className="h-[2px] w-full"
        style={{ backgroundColor: 'transparent' }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.7 }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </div>

      {/* Divider com degrade nas bordas */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, var(--border-subtle) 15%, var(--border-subtle) 85%, transparent 100%)',
        }}
      />
    </header>
  )
}
