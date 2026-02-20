import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/',        label: 'Início'   },
  { to: '/books',   label: 'Leitura'  },
  { to: '/search',  label: 'Pesquisa' },
  { to: '/profile', label: 'Perfil'   },
]

const pageTitles: Record<string, string> = {
  '/':        '',
  '/books':   'Leitura',
  '/search':  'Pesquisa',
  '/saved':   'Salvos',
  '/profile': 'Perfil',
  '/highlights': 'Destaques',
}

// function getGreeting() {
//   const h = new Date().getHours()
//   if (h < 12) return 'Bom dia'
//   if (h < 18) return 'Boa tarde'
//   return 'Boa noite'
// }

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase()
}

// ── Top bar ───────────────────────────────────────────────────────────────────
export function TopBar() {
  const { user } = useAuth()
  const location = useLocation()

  const isHome = location.pathname === '/'

  const displayName = user?.user_metadata?.full_name
    ?? user?.email
    ?? 'Visitante'

  const firstName = displayName.split(/[\s@]/)[0] ?? displayName

  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string)
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
    : user?.email
      ? getInitials(user.email)
      : 'VI'

  const pageTitle = pageTitles[location.pathname] ?? ''

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 35%, transparent)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">

        {isHome ? (
          /* Saudação na homepage */
          <p
            style={{
              fontFamily: '-apple-system, system-ui, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 300,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            A paz do Senhor,&nbsp;
            <span style={{ fontWeight: 600 }}>{firstName}</span>
          </p>
        ) : (
          /* Título da página nas demais */
          <p
            style={{
              fontFamily: '-apple-system, system-ui, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 200,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {pageTitle}
          </p>
        )}

        {/* Avatar circle */}
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: '2.25rem',
            height: '2.25rem',
            backgroundColor: '#6B8F8A',
            color: '#ffffff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {initials}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, var(--border-subtle) 15%, var(--border-subtle) 85%, transparent 100%)',
        }}
      />
    </header>
  )
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 35%, transparent)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, var(--border-subtle) 15%, var(--border-subtle) 85%, transparent 100%)',
        }}
      />

      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
          >
            {({ isActive }) => (
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? 800 : 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingBottom: '1px',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
