import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Search, Bookmark, User } from 'lucide-react'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/books', icon: BookOpen, label: 'Ler' },
  { to: '/search', icon: Search, label: 'Buscar' },
  { to: '/saved', icon: Bookmark, label: 'Salvos' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--glass-nav)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 py-1">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.4}
                  style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
                />
                <span
                  className={cn('transition-colors duration-150')}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.55rem',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
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
