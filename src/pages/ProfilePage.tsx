import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Heart, StickyNote, Highlighter,
  Moon, Sun, LogOut, LogIn, ChevronRight,
  BookOpen, Download, Flame,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { useHighlights } from '../hooks/useHighlights'
import { getReadingProgress } from '../data/readingPlan'
import { AuthModal } from '../components/auth/AuthModal'
import { cn } from '../lib/cn'

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
}

function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { favorites } = useFavorites()
  const { notes } = useNotes()
  const { highlights } = useHighlights()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const readingProgress = getReadingProgress()

  const handleSignOut  = async () => { await signOut() }
  const handleExport   = () => {
    const data = { exportDate: new Date().toISOString(), app: 'Bíblia Sagrada ACF', favorites, notes, highlights }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `biblia-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const streakDays  = Math.max(1, Math.round(readingProgress.currentDay * 0.4))
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'L'
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? null

  // ── Shared icon box ──────────────────────────────────────────────
  const IconBox = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
    <div style={{ width: 32, height: 32, borderRadius: '0.625rem', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </div>
  )

  // ── Stat row ─────────────────────────────────────────────────────
  const StatRow = ({ bg, icon, label, value, border = true }: { bg: string; icon: React.ReactNode; label: string; value: React.ReactNode; border?: boolean }) => (
    <div className="flex items-center gap-3 py-3" style={border ? { borderBottom: '1px solid var(--border-subtle)' } : {}}>
      <IconBox bg={bg}>{icon}</IconBox>
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )

  return (
    <div className="min-h-dvh pb-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="px-5 pt-5 pb-6 flex flex-col gap-3.5"
      >

        {/* ── User card ── */}
        <motion.div variants={fadeUp}
          className="flex flex-col items-center rounded-2xl py-8 px-5 gap-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}
        >
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            border: '3px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user ? (
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {userInitial}
              </span>
            ) : (
              <User size={32} strokeWidth={1.3} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {/* Name */}
          <div>
            <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate max-w-[220px]">
              {user ? (displayName ?? user.email) : 'Conta local'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
              {user ? 'Leitor Dedicado' : 'Entre para sincronizar'}
            </p>
          </div>

          {/* CTA */}
          {user ? (
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-opacity active:opacity-50"
              style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <LogOut size={12} strokeWidth={1.8} />
              Sair da conta
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-opacity active:opacity-70"
              style={{ backgroundColor: 'var(--text-primary)', fontSize: '0.85rem', color: 'var(--bg-page)', fontWeight: 600 }}>
              <LogIn size={14} strokeWidth={2} />
              Entrar
            </button>
          )}
        </motion.div>

        {/* ── Stats grid ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">

          {/* Streak */}
          <div className="rounded-2xl p-5 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.75rem', backgroundColor: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} strokeWidth={1.8} style={{ color: '#F97316' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginTop: '0.25rem' }}>
              {streakDays}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Dias seguidos</p>
          </div>

          {/* Chapters */}
          <div className="rounded-2xl p-5 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--text-primary)', border: '1px solid transparent' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} strokeWidth={1.8} style={{ color: '#fff' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginTop: '0.25rem' }}>
              {highlights.length + favorites.length}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Itens salvos</p>
          </div>
        </motion.div>

        {/* ── Estatísticas ── */}
        <motion.div variants={fadeUp}
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Estatísticas
            </p>
            <Link to="/favorites" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', opacity: 0.6 }}>
              Ver todos
            </Link>
          </div>

          <StatRow bg="#FFF0F5" icon={<Heart size={14} strokeWidth={1.8} style={{ color: '#EC4899' }} />} label="Favoritos" value={favorites.length} />
          <StatRow bg="#F3E8FF" icon={<StickyNote size={14} strokeWidth={1.8} style={{ color: '#A855F7' }} />} label="Anotações" value={notes.length} />
          <StatRow bg="#FFF9EC" icon={<Highlighter size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} />} label="Destaques" value={highlights.length} />

          {/* Reading progress */}
          <div className="flex flex-col gap-2 pt-3">
            <div className="flex items-center gap-3">
              <IconBox bg="#EFF6FF">
                <BookOpen size={14} strokeWidth={1.8} style={{ color: '#3B82F6' }} />
              </IconBox>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Plano de Leitura</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{readingProgress.percentage}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 999, backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', marginLeft: 44 }}>
              <motion.div
                style={{ height: '100%', borderRadius: 999, backgroundColor: '#3B82F6' }}
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress.percentage}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 44 }}>
              Dia {readingProgress.currentDay} de {readingProgress.totalDays}
            </p>
          </div>
        </motion.div>

        {/* ── Configurações ── */}
        <motion.div variants={fadeUp}
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Configurações
          </p>

          <div className="flex flex-col">
            {/* Tema */}
            <button onClick={toggleTheme}
              className="w-full flex items-center justify-between py-3 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <IconBox bg={theme === 'dark' ? 'rgba(241,245,249,0.08)' : '#F1F5F9'}>
                  {theme === 'dark'
                    ? <Moon size={14} strokeWidth={1.8} style={{ color: 'var(--text-primary)' }} />
                    : <Sun  size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} />}
                </IconBox>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Tema escuro</span>
              </div>
              <div
                className={cn('w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors duration-300', theme === 'dark' ? 'justify-end' : 'justify-start')}
                style={{ backgroundColor: theme === 'dark' ? 'var(--text-primary)' : 'var(--border-medium)' }}>
                <motion.div className="w-[18px] h-[18px] rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                  layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </div>
            </button>

            {/* Anotações */}
            <Link to="/notes" className="w-full flex items-center justify-between py-3 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}>
              <div className="flex items-center gap-3">
                <IconBox bg="#F3E8FF"><StickyNote size={14} strokeWidth={1.8} style={{ color: '#A855F7' }} /></IconBox>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Minhas Anotações</span>
              </div>
              <ChevronRight size={15} strokeWidth={1.8} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </Link>

            {/* Destaques */}
            <Link to="/highlights" className="w-full flex items-center justify-between py-3 transition-opacity active:opacity-60"
              style={{ borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}>
              <div className="flex items-center gap-3">
                <IconBox bg="#FFF9EC"><Highlighter size={14} strokeWidth={1.8} style={{ color: '#F59E0B' }} /></IconBox>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Meus Destaques</span>
              </div>
              <ChevronRight size={15} strokeWidth={1.8} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </Link>

            {/* Exportar */}
            <button onClick={handleExport}
              disabled={favorites.length === 0 && notes.length === 0 && highlights.length === 0}
              className="w-full flex items-center justify-between py-3 transition-opacity active:opacity-60 disabled:opacity-30">
              <div className="flex items-center gap-3">
                <IconBox bg="#ECFDF5"><Download size={14} strokeWidth={1.8} style={{ color: '#10B981' }} /></IconBox>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Exportar Dados</span>
              </div>
              <ChevronRight size={15} strokeWidth={1.8} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </button>
          </div>
        </motion.div>

        {/* ── App info ── */}
        <motion.div variants={fadeUp}
          className="rounded-2xl px-5 py-2"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', opacity: 0.65 }}
        >
          {[
            { label: 'Aplicativo', value: 'Bíblia Sagrada' },
            { label: 'Versão',     value: '1.0.0' },
            { label: 'Tradução',   value: 'ACF' },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className="flex items-center justify-between py-2.5"
              style={i < arr.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : {}}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Sign out ── */}
        {user && (
          <motion.div variants={fadeUp}>
            <button onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-opacity active:opacity-70"
              style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#EF4444', fontSize: '0.9rem', fontWeight: 600 }}>
              <LogOut size={15} strokeWidth={1.8} />
              Sair da conta
            </button>
          </motion.div>
        )}

      </motion.div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default ProfilePage
