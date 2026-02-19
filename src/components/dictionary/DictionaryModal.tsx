import { useState, useEffect, useCallback } from 'react'
import { BookText, Hash, ExternalLink } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { getWordEntries } from '../../data/dictionary'
import type { DictionaryEntry } from '../../types/bible'

interface DictionaryModalProps {
  isOpen: boolean
  onClose: () => void
  bookId: number
  chapter: number
  verse: number
  bookName: string
}

export function DictionaryModal({
  isOpen,
  onClose,
  bookId,
  chapter,
  verse,
  bookName,
}: DictionaryModalProps) {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getWordEntries(bookId, chapter, verse)
      setEntries(data)
    } catch {
      setError('Erro ao carregar os dados do dicionário.')
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }, [bookId, chapter, verse])

  useEffect(() => {
    if (isOpen) {
      loadEntries()
    } else {
      setEntries([])
      setError(null)
    }
  }, [isOpen, loadEntries])

  const title = `${bookName} ${chapter}:${verse}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="px-5 py-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p
              className="text-sm mt-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Carregando análise...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p
              className="text-sm text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <BookText
              size={40}
              style={{ color: 'var(--text-muted)' }}
              className="mb-3"
            />
            <p
              className="text-sm text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              Nenhuma análise disponível para este versículo
            </p>
          </div>
        )}

        {/* Entries */}
        {!isLoading && !error && entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <DictionaryCard key={`${entry.strong}-${index}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

interface DictionaryCardProps {
  entry: DictionaryEntry
}

function DictionaryCard({ entry }: DictionaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {entry.palavra_pt}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="text-sm"
                style={{ color: 'var(--color-secondary)' }}
              >
                {entry.palavra_original}
              </span>
              {entry.transliteracao && (
                <span
                  className="text-sm italic"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {entry.transliteracao}
                </span>
              )}
            </div>
          </div>

          {/* Strong's badge */}
          {entry.strong && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono shrink-0'
              )}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              <Hash size={10} />
              {entry.strong}
            </span>
          )}
        </div>

        {/* Brief - always visible */}
        {entry.significado_raiz && (
          <p
            className="text-sm mt-2 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {entry.significado_raiz}
          </p>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="px-4 pb-4 space-y-4 border-t pt-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* Significado raiz */}
          {entry.significado_raiz && (
            <DictionarySection title="Significado raiz">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.significado_raiz}
              </p>
            </DictionarySection>
          )}

          {/* No contexto */}
          {entry.significado_contextual && (
            <DictionarySection title="No contexto">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.significado_contextual}
              </p>
            </DictionarySection>
          )}

          {/* Explicação detalhada */}
          {entry.explicacao_detalhada && (
            <DictionarySection title="Explicação detalhada">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.explicacao_detalhada}
              </p>
            </DictionarySection>
          )}

          {/* Por que esta palavra */}
          {entry.por_que_esta_palavra && (
            <DictionarySection title="Por que esta palavra">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.por_que_esta_palavra}
              </p>
            </DictionarySection>
          )}

          {/* Conexão teológica */}
          {entry.conexao_teologica && (
            <DictionarySection title="Conexão teológica">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.conexao_teologica}
              </p>
            </DictionarySection>
          )}

          {/* Referências */}
          {entry.referencias_relacionadas && entry.referencias_relacionadas.length > 0 && (
            <DictionarySection title="Referências">
              <div className="flex flex-wrap gap-2">
                {entry.referencias_relacionadas.map((ref, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
                      'cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]'
                    )}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--color-secondary)',
                    }}
                  >
                    <ExternalLink size={10} />
                    {ref}
                  </span>
                ))}
              </div>
            </DictionarySection>
          )}
        </div>
      )}
    </div>
  )
}

interface DictionarySectionProps {
  title: string
  children: React.ReactNode
}

function DictionarySection({ title, children }: DictionarySectionProps) {
  return (
    <div>
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--color-secondary)' }}
      >
        {title}
      </h4>
      {children}
    </div>
  )
}
