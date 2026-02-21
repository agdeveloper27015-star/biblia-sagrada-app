import type { ReactNode } from 'react'
import { TopBar } from './BottomNavigation'
import { BottomNavigation } from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {showNav && <TopBar />}
      {/* pt-16 = espaço para o top bar, pb-16 = espaço para o bottom nav */}
      <main
        className={showNav ? 'pb-16' : ''}
        style={showNav ? { paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)' } : {}}
      >{children}</main>
      {showNav && <BottomNavigation />}
    </div>
  )
}
