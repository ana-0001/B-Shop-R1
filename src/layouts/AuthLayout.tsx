/** src/layouts/AuthLayout.tsx — شل صفحات ما قبل الدخول (Splash / تسجيل الدخول / الشروط / الإعداد) */
import { SystemStatusBar } from '@/components/system-status-bar/SystemStatusBar'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center p-md bg-surface-alt overflow-y-auto">
        {children}
      </main>

      {/* شريط الحالة النظامي (PRD) — ظاهر في كل الشاشات بقرار صاحب المشروع */}
      <SystemStatusBar />
    </div>
  )
}
