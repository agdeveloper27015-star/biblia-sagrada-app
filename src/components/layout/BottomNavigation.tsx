import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Search, Bookmark, User } from 'lucide-react'

const navItems = [
  { to: '/',       icon: Home,     label: 'Início' },
  { to: '/books',  icon: BookOpen, label: 'Ler'    },
  { to: '/search', icon: Search,   label: 'Buscar'  },
  { to: '/saved',  icon: Bookmark, label: 'Salvos'  },
  { to: '/profile',icon: User,     label: 'Perfil'  },
]

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-1 pt-2 pb-safe" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 py-1">
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: isActive ? 'var(--bg-card)' : 'var(--text-muted)' }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.55rem',
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'color 0.15s',
                  }}
                >
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
