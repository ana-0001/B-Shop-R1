/** src/components/shared/AppTitleBar.tsx — شريط العنوان العلوي الموحد (العلامة + أفاتار المستخدم بعد الدخول + النافذة) */
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { AppLogo } from '@/components/shared/AppLogo'
import { UserMenu } from '@/components/shared/UserMenu'
import { WindowControls } from '@/components/shared/WindowControls'
import { useAuthComputed } from '@/stores/auth'

export function AppTitleBar() {
  const { t } = useI18n()
  const { user } = useAuthComputed()

  return (
    <header className="titlebar bg-bg text-bg-f flex justify-between items-center px-md border-b border-border gap-sm">
      <Link to="/" className="flex items-center gap-sm font-extrabold text-sm" aria-label="B-Shop Home">
        <AppLogo size="sm" />
        <span className="bg-primary text-primary-f px-sm py-0.5 rounded text-xs tracking-wider">B-SHOP</span>
        <span className="hidden md:inline text-muted-f font-semibold text-xs">{t('app.subtitle')}</span>
      </Link>

      <div className="titlebar-controls flex items-center gap-xs">
        {/* أفاتار المستخدم بدل زرّي اللغة والثيم — بيظهر بعد تسجيل الدخول فقط */}
        {user && <UserMenu />}
        <WindowControls />
      </div>
    </header>
  )
}
