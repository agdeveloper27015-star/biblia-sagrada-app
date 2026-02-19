import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Heart,
  StickyNote,
  Highlighter,
  Moon,
  Sun,
  LogOut,
  LogIn,
  ChevronRight,
  BookOpen,
  Download,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { useHighlights } from '../hooks/useHighlights'
import { getReadingProgress } from '../data/readingPlan'
import { AuthModal } from '../components/auth/AuthModal'
import { cn } from '../lib/cn'

function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { favorites } = useFavorites()
  const { notes } = useNotes()
  const { highlights } = useHighlights()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const readingProgress = getReadingProgress()

  const handleSignOut = async () => { await signOut() }

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      app: 'Bíblia Sagrada ACF',
      favorites,
      notes,
      highlights,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biblia-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const stats = [
    { label: 'Favoritos', count: favorites.length, icon: Heart, link: '/favorites' },
    { label: 'Notas', count: notes.length, icon: StickyNote, link: '/notes' },
    { label: 'Destaques', count: highlights.length, icon: Highlighter, link: '/highlights' },
  ]

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-5 pt-10 pb-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          fontWeight: 200,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
        }}>
          Perfil
        </h1>
      </div>

      <div className="px-5 pb-24">
        {/* User info */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              <User size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1 min-w-0">
              {user ? (
                <>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 400 }} className="truncate">
                    {user.email}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 300, marginTop: '0.1rem' }}>
                    Conta sincronizada
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 400 }}>
                    Conta local
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 300, marginTop: '0.1rem' }}>
                    Entre para sincronizar seus dados
                  </p>
                </>
              )}
            </div>
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 transition-opacity active:opacity-50"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}
              >
                <LogOut size={13} strokeWidth={1.4} />
                Sair
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 transition-opacity active:opacity-50"
                style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}
              >
                <LogIn size={13} strokeWidth={1.4} />
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '0.875rem',
          }}>
            Estatísticas
          </p>
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ label, count, icon: Icon, link }) => (
              <Link
                key={label}
                to={link}
                className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-50"
              >
                <Icon size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 200, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {count}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.06em' }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Plano de leitura */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              <p style={{
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                Plano de Leitura
              </p>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 300 }}>
              {readingProgress.percentage}%
            </span>
          </div>
          {/* Thin 2px progress bar */}
          <div
            className="rounded-full overflow-hidden"
            style={{ height: '2px', backgroundColor: 'var(--border-subtle)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--text-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${readingProgress.percentage}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 300, marginTop: '0.5rem' }}>
            Dia {readingProgress.currentDay} de {readingProgress.totalDays}
          </p>
        </div>

        {/* Configurações */}
        <div className="pt-5">
          <p style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem',
          }}>
            Configurações
          </p>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-4 transition-opacity active:opacity-50"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              ) : (
                <Sun size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              )}
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 300 }}>
                Tema escuro
              </span>
            </div>
            {/* Minimal toggle */}
            <div
              className={cn('w-10 h-5 rounded-full flex items-center transition-colors duration-300 px-0.5', theme === 'dark' ? 'justify-end' : 'justify-start')}
              style={{ backgroundColor: theme === 'dark' ? 'var(--text-primary)' : 'var(--border-medium)' }}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          <Link
            to="/notes"
            className="w-full flex items-center justify-between py-4 transition-opacity active:opacity-50"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <StickyNote size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 300 }}>
                Minhas Anotações
              </span>
            </div>
            <ChevronRight size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <Link
            to="/highlights"
            className="w-full flex items-center justify-between py-4 transition-opacity active:opacity-50"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <Highlighter size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 300 }}>
                Meus Destaques
              </span>
            </div>
            <ChevronRight size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <button
            onClick={handleExport}
            disabled={favorites.length === 0 && notes.length === 0 && highlights.length === 0}
            className="w-full flex items-center justify-between py-4 transition-opacity active:opacity-50 disabled:opacity-30"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <Download size={16} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 300 }}>
                Exportar Dados
              </span>
            </div>
            <ChevronRight size={14} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* App info */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between py-2">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300 }}>Aplicativo</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Bíblia Sagrada</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300 }}>Versão</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300 }}>Tradução</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>ACF</span>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default ProfilePage
