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
      <main className={showNav ? 'pt-16 pb-20' : ''}>{children}</main>
      {showNav && <BottomNavigation />}
    </div>
  )
}
