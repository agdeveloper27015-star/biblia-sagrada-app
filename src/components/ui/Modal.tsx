import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  fullscreen?: boolean
}

export function Modal({ isOpen, onClose, title, children, fullscreen = false }: ModalProps) {
  const dragY = useRef(0)
  const startY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? 0
    dragY.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
    dragY.current = dy
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`
      sheetRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    if (dragY.current > 80) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)'
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ touchAction: 'none' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => { e.stopPropagation(); e.preventDefault() }}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* Content */}
          <motion.div
            ref={sheetRef}
            className={
              fullscreen
                ? 'fixed inset-0 z-[201] flex flex-col'
                : 'fixed inset-x-0 bottom-0 z-[201] w-full max-w-lg mx-auto max-h-[85dvh] flex flex-col rounded-t-2xl'
            }
            style={{ backgroundColor: 'var(--bg-card)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            {!fullscreen && (
              <div
                className="flex justify-center pt-3 pb-1 cursor-grab"
                style={{ touchAction: 'none' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-medium)' }} />
              </div>
            )}

            {/* Header */}
            {(title || !fullscreen) && (
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <X size={20} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
