import { AlignJustify, List } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Modal } from '../ui/Modal'
import type { ReadingSettings as ReadingSettingsType } from '../../lib/storage'

interface ReadingSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: ReadingSettingsType
  onSettingsChange: (settings: ReadingSettingsType) => void
}

type FontSize = 'small' | 'medium' | 'large'

const FONT_SIZES: Record<FontSize, { fontSize: number; lineHeight: number; maxWidth: number }> = {
  small:  { fontSize: 0.9,  lineHeight: 1.85, maxWidth: 72 },
  medium: { fontSize: 1.05, lineHeight: 1.9,  maxWidth: 68 },
  large:  { fontSize: 1.22, lineHeight: 1.95, maxWidth: 64 },
}

function detectSize(fontSize: number): FontSize {
  if (fontSize <= 0.95) return 'small'
  if (fontSize <= 1.12) return 'medium'
  return 'large'
}

// ── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.58rem',
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  )
}

export function ReadingSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: ReadingSettingsProps) {
  const currentSize = detectSize(settings.fontSize)

  const applySize = (size: FontSize) => {
    onSettingsChange({ ...settings, ...FONT_SIZES[size] })
  }

  const applyLayout = (layout: 'verse' | 'paragraph') => {
    onSettingsChange({ ...settings, layout })
  }

  const FONT_OPTIONS = [
    { key: 'small'  as FontSize, label: 'Aa', desc: 'Compacto', size: '1.05rem' },
    { key: 'medium' as FontSize, label: 'Aa', desc: 'Padrão',   size: '1.25rem' },
    { key: 'large'  as FontSize, label: 'Aa', desc: 'Grande',   size: '1.5rem'  },
  ]

  const LAYOUT_OPTIONS = [
    {
      key:  'verse' as const,
      icon: <List size={17} strokeWidth={1.8} />,
      label: 'Por versículo',
      desc:  'Cada versículo em linha',
    },
    {
      key:  'paragraph' as const,
      icon: <AlignJustify size={17} strokeWidth={1.8} />,
      label: 'Parágrafo',
      desc:  'Texto corrido, fluído',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leitura">
      <div className="px-5 pt-2 pb-6 flex flex-col gap-6">

        {/* ── Tamanho da fonte ── */}
        <div>
          <SectionLabel>Tamanho da fonte</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map(({ key, label, desc, size }) => {
              const active = currentSize === key
              return (
                <button
                  key={key}
                  onClick={() => applySize(key)}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all duration-200"
                  style={{
                    backgroundColor: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 600,
                      lineHeight: 1,
                      fontSize: size,
                      color: active ? 'var(--bg-card)' : 'var(--text-primary)',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      color: active ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)',
                    }}
                  >
                    {desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Layout de exibição ── */}
        <div>
          <SectionLabel>Formato</SectionLabel>
          <div className="flex flex-col gap-2">
            {LAYOUT_OPTIONS.map(({ key, icon, label, desc }) => {
              const active = settings.layout === key
              return (
                <button
                  key={key}
                  onClick={() => applyLayout(key)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200',
                  )}
                  style={{
                    backgroundColor: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                    textAlign: 'left',
                  }}
                >
                  {/* Icon */}
                  <span style={{ color: active ? 'var(--bg-card)' : 'var(--text-muted)', flexShrink: 0 }}>
                    {icon}
                  </span>
                  {/* Labels */}
                  <span className="flex flex-col gap-0.5">
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: active ? 'var(--bg-card)' : 'var(--text-primary)',
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      color: active ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)',
                      fontWeight: 400,
                    }}>
                      {desc}
                    </span>
                  </span>
                  {/* Active dot */}
                  {active && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.45)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </Modal>
  )
}
