import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyEmail from './pages/auth/VerifyEmail'
import OTP from './pages/auth/OTP'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Success from './pages/auth/Success'
import ClientApp from './pages/client/ClientApp'
import AdminApp from './pages/admin/AdminApp'
import { RequireAuth, RequireRole } from './lib/guards'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Auth — public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/success" element={<Success />} />

      {/* Client SPA — needs a signed-in user (any role) */}
      <Route path="/app/*" element={<RequireAuth><ClientApp /></RequireAuth>} />

      {/* Admin SPA — needs a staff user */}
      <Route path="/admin/*" element={<RequireRole><AdminApp /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
