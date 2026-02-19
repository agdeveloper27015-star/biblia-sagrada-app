import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  Flame,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { useHighlights } from '../hooks/useHighlights'
import { getReadingProgress } from '../data/readingPlan'
import { AuthModal } from '../components/auth/AuthModal'
import { cn } from '../lib/cn'

// ── Top Nav ──────────────────────────────────────────────────────
function TopNav() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: isActive(path) ? 700 : 500,
    color: isActive(path) ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: isActive(path) ? '2px solid var(--accent)' : '2px solid transparent',
    paddingBottom: '2px',
    textDecoration: 'none',
    transition: 'color 0.15s',
  })

  return (
    <nav
      className="flex items-center justify-between px-5 py-3 shrink-0"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div style={{ color: 'var(--text-primary)' }}>
        <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
          <path
            d="M1 8.5C5.5 8.5 7.5 4.5 9 1.5C10.5 -1.5 14 1 16 5C18 9 20 12.5 24 12.5C28 12.5 31 10 31 10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/" style={navLinkStyle('/')}>Início</Link>
        <Link to="/books" style={navLinkStyle('/books')}>Bíblia</Link>
        <Link to="/profile" style={navLinkStyle('/profile')}>Config.</Link>
      </div>

      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>U</span>
      </button>
    </nav>
  )
}

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

  // Derive a streak from reading progress as proxy
  const streakDays = Math.max(1, Math.round(readingProgress.currentDay * 0.4))

  const userInitial = user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'L'

  return (
    <div
      className="min-h-dvh pb-28 overflow-y-auto flex flex-col"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <TopNav />

      <div className="px-5 pt-4 pb-6 flex flex-col gap-4">

        {/* ── Page title ── */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: '0.25rem',
          }}
        >
          Configurações
        </h1>

        {/* ── User card ── */}
        <div
          className="card flex flex-col items-center py-7 px-5 gap-3"
          style={{ textAlign: 'center' }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '4px solid #FFFFFF',
              boxShadow: '0 4px 16px rgba(23,25,28,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {user ? (
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {userInitial}
              </span>
            ) : (
              <User size={40} strokeWidth={1.4} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {/* Name / email */}
          <div>
            {user ? (
              <>
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  className="truncate max-w-[220px]"
                >
                  {user.email}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
                  Leitor Dedicado
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Conta local
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
                  Entre para sincronizar
                </p>
              </>
            )}
          </div>

          {/* Sign in / out inline */}
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 transition-opacity active:opacity-50"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <LogOut size={13} strokeWidth={1.6} />
              Sair da conta
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.8rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
            >
              <LogIn size={14} strokeWidth={1.8} />
              Entrar
            </button>
          )}
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: streak (light) */}
          <div
            className="card p-5 flex flex-col gap-2"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '0.75rem',
                backgroundColor: '#FFF4E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={18} strokeWidth={1.8} style={{ color: '#F97316' }} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1,
                marginTop: '0.25rem',
              }}
            >
              {streakDays}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Dias seguidos
            </p>
          </div>

          {/* Card 2: chapters read (dark) */}
          <div
            className="card-dark p-5 flex flex-col gap-2"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={18} strokeWidth={1.8} style={{ color: '#FFFFFF' }} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1,
                marginTop: '0.25rem',
              }}
            >
              {highlights.length + favorites.length}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              Capítulos lidos
            </p>
          </div>
        </div>

        {/* ── Estatísticas card ── */}
        <div className="card p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Estatísticas
            </p>
            <Link
              to="/favorites"
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              VER TODOS
            </Link>
          </div>

          {/* Stat rows */}
          <div className="flex flex-col gap-3.5">
            {/* Favorites */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '0.625rem',
                  backgroundColor: '#FFF0F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Heart size={14} strokeWidth={1.8} style={{ color: '#EC4899' }} />
              </div>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Favoritos
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {favorites.length}
              </span>
            </div>

            {/* Notes */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '0.625rem',
                  backgroundColor: '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <StickyNote size={14} strokeWidth={1.8} style={{ color: '#A855F7' }} />
              </div>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Anotações
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {notes.length}
              </span>
            </div>

            {/* Highlights */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '0.625rem',
                  backgroundColor: '#FFF9EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Highlighter size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} />
              </div>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Destaques
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {highlights.length}
              </span>
            </div>

            {/* Reading progress */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '0.625rem',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={14} strokeWidth={1.8} style={{ color: '#3B82F6' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Plano de Leitura
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {readingProgress.percentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: '4px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden',
                  marginLeft: '44px',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    backgroundColor: '#3B82F6',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${readingProgress.percentage}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  marginLeft: '44px',
                }}
              >
                Dia {readingProgress.currentDay} de {readingProgress.totalDays}
              </p>
            </div>
          </div>
        </div>

        {/* ── Configurações card ── */}
        <div className="card p-5">
          <p
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
            }}
          >
            Configurações
          </p>

          <div className="flex flex-col gap-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-3.5 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '0.625rem',
                    backgroundColor: theme === 'dark' ? 'rgba(241,245,249,0.08)' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {theme === 'dark' ? (
                    <Moon size={14} strokeWidth={1.8} style={{ color: 'var(--text-primary)' }} />
                  ) : (
                    <Sun size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} />
                  )}
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Tema escuro
                </span>
              </div>
              {/* Toggle switch */}
              <div
                className={cn(
                  'w-11 h-6 rounded-full flex items-center transition-colors duration-300 px-0.5',
                  theme === 'dark' ? 'justify-end' : 'justify-start'
                )}
                style={{
                  backgroundColor: theme === 'dark' ? 'var(--text-primary)' : 'var(--border-medium)',
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>

            {/* Notes link */}
            <Link
              to="/notes"
              className="w-full flex items-center justify-between py-3.5 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '0.625rem',
                    backgroundColor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <StickyNote size={14} strokeWidth={1.8} style={{ color: '#A855F7' }} />
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Minhas Anotações
                </span>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
            </Link>

            {/* Highlights link */}
            <Link
              to="/highlights"
              className="w-full flex items-center justify-between py-3.5 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '0.625rem',
                    backgroundColor: '#FFF9EC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Highlighter size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} />
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Meus Destaques
                </span>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
            </Link>

            {/* Export data */}
            <button
              onClick={handleExport}
              disabled={favorites.length === 0 && notes.length === 0 && highlights.length === 0}
              className="w-full flex items-center justify-between py-3.5 transition-opacity active:opacity-60 disabled:opacity-30"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '0.625rem',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Download size={14} strokeWidth={1.8} style={{ color: '#10B981' }} />
                </div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Exportar Dados
                </span>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* ── App info ── */}
        <div
          className="card px-5 py-4"
          style={{ opacity: 0.7 }}
        >
          {[
            { label: 'Aplicativo', value: 'Bíblia Sagrada' },
            { label: 'Versão', value: '1.0.0' },
            { label: 'Tradução', value: 'ACF' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="flex items-center justify-between py-2"
              style={i < arr.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : {}}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Log out button ── */}
        {user && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-4 transition-opacity active:opacity-70"
            style={{
              borderRadius: '1.25rem',
              backgroundColor: 'rgba(239,68,68,0.07)',
              color: '#EF4444',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Sair da conta
          </button>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default ProfilePage
