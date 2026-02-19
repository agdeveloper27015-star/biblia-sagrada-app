import type { ReactNode } from 'react'
import { BottomNavigation } from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <main className={showNav ? 'pb-24' : ''}>{children}</main>
      {showNav && <BottomNavigation />}
    </div>
  )
}
