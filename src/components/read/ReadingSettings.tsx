import { Type } from 'lucide-react'
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
  small:  { fontSize: 0.9,  lineHeight: 1.75, maxWidth: 72 },
  medium: { fontSize: 1.05, lineHeight: 1.85, maxWidth: 68 },
  large:  { fontSize: 1.22, lineHeight: 1.9,  maxWidth: 64 },
}

function detectSize(fontSize: number): FontSize {
  if (fontSize <= 0.95) return 'small'
  if (fontSize <= 1.12) return 'medium'
  return 'large'
}

export function ReadingSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: ReadingSettingsProps) {
  const current = detectSize(settings.fontSize)

  const applySize = (size: FontSize) => {
    onSettingsChange({ ...settings, ...FONT_SIZES[size] })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações de leitura">
      <div className="px-5 py-5">
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <Type size={17} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Tamanho da fonte
          </span>
        </div>

        {/* 3 size options */}
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { key: 'small',  label: 'Pequeno', preview: 'A',   size: '0.85rem' },
              { key: 'medium', label: 'Médio',   preview: 'A',   size: '1rem'    },
              { key: 'large',  label: 'Grande',  preview: 'A',   size: '1.2rem'  },
            ] as const
          ).map(({ key, label, preview, size }) => {
            const active = current === key
            return (
              <button
                key={key}
                onClick={() => applySize(key)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all duration-200'
                )}
                style={{
                  backgroundColor: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  borderColor: active ? 'var(--text-primary)' : 'var(--border-subtle)',
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                }}
              >
                <span
                  className="font-serif font-bold leading-none"
                  style={{
                    fontSize: size,
                    color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
                  }}
                >
                  {preview}
                </span>
                <span
                  className="text-[0.68rem] font-medium"
                  style={{
                    color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-center mt-5" style={{ color: 'var(--text-muted)' }}>
          As alterações são aplicadas em tempo real
        </p>
      </div>
    </Modal>
  )
}
