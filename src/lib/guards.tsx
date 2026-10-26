import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

// Full-page loading spinner shown while the initial session restore is running.
function AuthLoading() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-page)', color: 'var(--text-muted)', fontSize: 'var(--size-body-sm)',
    }}>
      جاري التحميل...
    </div>
  )
}

/**
 * Wrap any route that requires a signed-in user.
 * Anonymous visitors are redirected to /login with `?redirect=<current>` so we can
 * bounce them back to where they wanted after signing in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoading />
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return <>{children}</>
}

/**
 * Wrap any route that requires the user to be part of staff (or admin specifically).
 * Non-staff visitors get bounced to the client app.
 */
export function RequireRole({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { isAuthenticated, isStaff, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoading />
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?role=admin&redirect=${redirect}`} replace />
  }
  const allowed = admin ? isAdmin : isStaff
  if (!allowed) return <Navigate to="/app" replace />
  return <>{children}</>
}
