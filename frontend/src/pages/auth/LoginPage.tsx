import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-op-sidebar-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-op-primary rounded flex items-center justify-center">
            <span className="text-white text-base font-bold leading-none">P</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">Vibexio</p>
            <p className="text-op-sidebar-text/50 text-[10px] mt-0.5">Project Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded border border-op-border shadow-op-md">
          <div className="px-6 py-4 border-b border-op-border bg-op-panel-header rounded-t">
            <h2 className="text-xs font-semibold text-op-text uppercase tracking-wide">
              Sign in to your account
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
