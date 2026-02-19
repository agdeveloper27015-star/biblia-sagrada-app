import { useState, useCallback, type FormEvent } from 'react'
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { Modal } from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthTab = 'login' | 'signup'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setError(null)
    setIsSubmitting(false)
  }, [])

  const handleTabChange = useCallback(
    (tab: AuthTab) => {
      setActiveTab(tab)
      resetForm()
    },
    [resetForm]
  )

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)

      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      if (!trimmedEmail || !trimmedPassword) {
        setError('Preencha todos os campos.')
        return
      }

      if (trimmedPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      setIsSubmitting(true)

      try {
        const result =
          activeTab === 'login'
            ? await signIn(trimmedEmail, trimmedPassword)
            : await signUp(trimmedEmail, trimmedPassword)

        if (result.error) {
          setError(result.error)
        } else {
          resetForm()
          onClose()
        }
      } catch {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, activeTab, signIn, signUp, resetForm, onClose]
  )

  const handleContinueWithoutAccount = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conta">
      <div className="px-5 py-4">
        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <button
            onClick={() => handleTabChange('login')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
            )}
            style={{
              backgroundColor:
                activeTab === 'login' ? 'var(--bg-card)' : 'transparent',
              color:
                activeTab === 'login'
                  ? 'var(--color-secondary)'
                  : 'var(--text-muted)',
              boxShadow:
                activeTab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <LogIn size={16} />
            Entrar
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
            )}
            style={{
              backgroundColor:
                activeTab === 'signup' ? 'var(--bg-card)' : 'transparent',
              color:
                activeTab === 'signup'
                  ? 'var(--color-secondary)'
                  : 'var(--text-muted)',
              boxShadow:
                activeTab === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <UserPlus size={16} />
            Criar conta
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 bg-red-500/10"
          >
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-muted)' }}
              htmlFor="auth-email"
            >
              E-mail
            </label>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors',
                'focus-within:border-[var(--color-secondary)]'
              )}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                id="auth-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={cn(
                  'flex-1 bg-transparent text-sm outline-none',
                  'placeholder:text-[var(--text-muted)]'
                )}
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-muted)' }}
              htmlFor="auth-password"
            >
              Senha
            </label>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors',
                'focus-within:border-[var(--color-secondary)]'
              )}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <Lock size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                id="auth-password"
                type="password"
                placeholder={
                  activeTab === 'signup'
                    ? 'Mínimo 6 caracteres'
                    : 'Sua senha'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  activeTab === 'login' ? 'current-password' : 'new-password'
                }
                className={cn(
                  'flex-1 bg-transparent text-sm outline-none',
                  'placeholder:text-[var(--text-muted)]'
                )}
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-semibold transition-all',
              isSubmitting
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:opacity-90 active:scale-[0.98]'
            )}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: '#fff',
            }}
          >
            {isSubmitting
              ? 'Aguarde...'
              : activeTab === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--border-subtle)' }}
          />
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            ou
          </span>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--border-subtle)' }}
          />
        </div>

        {/* Continue without account */}
        <button
          onClick={handleContinueWithoutAccount}
          className={cn(
            'w-full py-2.5 rounded-xl text-sm font-medium transition-colors',
            'hover:bg-[var(--bg-secondary)]'
          )}
          style={{ color: 'var(--text-muted)' }}
        >
          Continuar sem conta
        </button>
      </div>
    </Modal>
  )
}
