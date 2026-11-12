/**
 * src/routes.tsx — جدول المسارات الكامل للتطبيق.
 * نفس مسارات المشروع الأصلي بالظبط:
 * / (Splash) · /auth/sign-in · /terms · /onboarding · /dashboard · /invoices
 * · /accounts · /inventory · /reports · * (404)
 */
import { Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { RouteGuard } from '@/layouts/RouteGuard'
import { SplashPage } from '@/pages/SplashPage'
import { SignInPage } from '@/pages/SignInPage'
import { TermsPage } from '@/pages/TermsPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      {/* شاشات ما قبل الدخول — شل المصادقة */}
      <Route path="/" element={<AuthLayout><SplashPage /></AuthLayout>} />
      <Route path="/auth/sign-in" element={<AuthLayout><RouteGuard><SignInPage /></RouteGuard></AuthLayout>} />
      <Route path="/terms" element={<AuthLayout><RouteGuard><TermsPage /></RouteGuard></AuthLayout>} />
      <Route path="/onboarding" element={<AuthLayout><RouteGuard><OnboardingPage /></RouteGuard></AuthLayout>} />

      {/* شاشات النظام الرئيسية — شل مساحة العمل */}
      <Route path="/dashboard" element={<DefaultLayout><RouteGuard><DashboardPage /></RouteGuard></DefaultLayout>} />
      <Route path="/invoices" element={<DefaultLayout><RouteGuard><InvoicesPage /></RouteGuard></DefaultLayout>} />
      <Route path="/accounts" element={<DefaultLayout><RouteGuard><AccountsPage /></RouteGuard></DefaultLayout>} />
      <Route path="/inventory" element={<DefaultLayout><RouteGuard><InventoryPage /></RouteGuard></DefaultLayout>} />
      <Route path="/reports" element={<DefaultLayout><RouteGuard><ReportsPage /></RouteGuard></DefaultLayout>} />

      {/* التقاط كل المسارات غير الموجودة (404) */}
      <Route path="*" element={<AuthLayout><NotFoundPage /></AuthLayout>} />
    </Routes>
  )
}
