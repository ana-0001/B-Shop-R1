/**
 * src/layouts/RouteGuard.tsx — حماية المسارات العامة (Route Guard).
 * بديل auth.global.ts middleware — نفس ترتيب الفحوصات:
 *  1) صانع النظام (المستوى 900): بيتسمح له فورًا في فحوصات الصلاحيات (ALLOW_ALL).
 *  2) غير المسجل: ممنوع الشاشات المحمية وصفحات القمع → /auth/sign-in.
 *  3) المسجل بدون شروط مقبولة → /terms (إلزامي لكل المستخدمين).
 *  4) المسجل بدون إعداد أولي → /onboarding (إلزامي لكل المستخدمين).
 *  5) اللي خلص كل حاجة: صفحات الدخول والقمع بتحوّله للوحة التحكم.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthComputed } from '@/stores/auth'
import { PROTECTED_ROUTES, ROUTE_NAMES } from '@/utils/constants'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const auth = useAuthComputed()

  const isProtected = PROTECTED_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(`${route}/`),
  )
  const isSignInPage = location.pathname === ROUTE_NAMES.signIn
  const isFunnelPage = location.pathname === ROUTE_NAMES.terms || location.pathname === ROUTE_NAMES.onboarding

  // (2) زائر — حماية الشاشات المحمية وصفحات القمع
  if (!auth.isAuthenticated) {
    if (isProtected || isFunnelPage) {
      return <Navigate to={ROUTE_NAMES.signIn} replace />
    }
    return <>{children}</>
  }

  // (3) مسجل دخول — منع رجوعه لصفحة تسجيل الدخول وتوجيهه حسب بواباته
  if (isSignInPage) {
    if (auth.needsTerms) return <Navigate to={ROUTE_NAMES.terms} replace />
    if (auth.needsOnboarding) return <Navigate to={ROUTE_NAMES.onboarding} replace />
    return <Navigate to={ROUTE_NAMES.dashboard} replace />
  }

  // (4) بوابات الشروط والإعداد — إلزامية قبل الوصول للوحة التحكم
  if (isProtected) {
    if (auth.needsTerms) return <Navigate to={ROUTE_NAMES.terms} replace />
    if (auth.needsOnboarding) return <Navigate to={ROUTE_NAMES.onboarding} replace />
  }

  // اللي خلص القمع ومحاول يرجع لصفحاته تاني — بيتوجه للشغل مباشرة
  if (isFunnelPage && !auth.needsTerms && !auth.needsOnboarding) {
    return <Navigate to={ROUTE_NAMES.dashboard} replace />
  }

  // (5) صانع النظام: ALLOW_ALL — بيتجاوز أي فحص صلاحيات إضافي
  return <>{children}</>
}
