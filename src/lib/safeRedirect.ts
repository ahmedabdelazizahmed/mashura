// Only allow same-origin absolute paths ("/app", "/app?view=account") as redirect targets.
// Anything else (full URLs, protocol-relative "//evil.com", backslashes, control chars) falls back.
export function safePath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  let p = raw
  try { p = decodeURIComponent(raw) } catch { return fallback }
  if (!p.startsWith('/') || p.startsWith('//') || p.includes('\\') || /[\u0000-\u001f]/.test(p)) return fallback
  if (p.length > 300) return fallback
  return p
}

export const googleAuthEnabled = () => import.meta.env.VITE_GOOGLE_AUTH === 'true'

const PENDING_KEY = 'mashura-pending-email'
export const setPendingEmail = (e: string) => { try { sessionStorage.setItem(PENDING_KEY, e) } catch { /* ignore */ } }
export const getPendingEmail = (): string => { try { return sessionStorage.getItem(PENDING_KEY) ?? '' } catch { return '' } }

// Arabic messages for Supabase Auth errors.
export function authError(e: unknown): string {
  const msg = String((e as { message?: string })?.message ?? e ?? '').toLowerCase()
  if (msg.includes('invalid login')) return 'الإيميل أو كلمة السر غلط.'
  if (msg.includes('email not confirmed')) return 'لازم تأكّد إيميلك الأول — شوف رسالة التأكيد في بريدك.'
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'الإيميل ده مسجّل قبل كده — سجّل دخول بدل ما تسجّل جديد.'
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('at least') || msg.includes('should contain'))) return 'كلمة السر ضعيفة — استخدم ٨ خانات على الأقل بحروف كبيرة وصغيرة وأرقام.'
  if (msg.includes('same password')) return 'كلمة السر الجديدة لازم تختلف عن القديمة.'
  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('seconds')) return 'محاولات كتير في وقت قصير. استنى شوية وجرّب تاني.'
  if (msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'))) return 'الكود أو اللينك غلط أو انتهت صلاحيته.'
  if (msg.includes('fetch') || msg.includes('network')) return 'مشكلة في الاتصال. تأكد من الإنترنت وجرّب تاني.'
  if (msg.includes('invalid email') || msg.includes('unable to validate email')) return 'الإيميل مش مكتوب صح.'
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) return 'التسجيل مقفول حاليًا.'
  return 'حصلت مشكلة. جرّب تاني بعد شوية.'
}
