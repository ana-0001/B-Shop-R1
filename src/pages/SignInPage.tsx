/** src/pages/SignInPage.tsx — شاشة تسجيل الدخول بمعرّف موحد */
import { UserRoundCheck } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { SignInForm } from '@/components/auth/SignInForm'
import { AppLogo } from '@/components/shared/AppLogo'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function SignInPage() {
  const { t } = useI18n()
  useDocumentTitle('B-Shop — Sign In')

  return (
    <section className="erp-card bg-glass max-w-[28rem] w-full p-xl space-y-md shadow-xl">
      <header className="text-center space-y-xs">
        <div className="flex justify-center">
          <AppLogo size="lg" />
        </div>
        <h1 className="text-xl font-extrabold text-bg-f flex items-center justify-center gap-xs">
          <UserRoundCheck className="w-5 h-5 text-primary" />
          {t('signin.title')}
        </h1>
        <p className="text-xs text-muted-f">{t('signin.subtitle')}</p>
      </header>

      <SignInForm />
    </section>
  )
}
