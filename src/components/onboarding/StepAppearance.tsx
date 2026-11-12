/** src/components/onboarding/StepAppearance.tsx — الخطوة 3: الثيم واللغة */
import { Sun, Moon, Monitor } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { usePreferencesStore } from '@/stores/preferences'
import { useSonner } from '@/hooks/useSonner'

const themeOptions = [
  { key: 'light', icon: Sun },
  { key: 'dark', icon: Moon },
  { key: 'system', icon: Monitor },
] as const

export function StepAppearance() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const preferences = usePreferencesStore()

  function pickTheme(mode: 'light' | 'dark' | 'system'): void {
    preferences.setTheme(mode)
    toast.info(t('notif.themeSet', { mode: mode.toUpperCase() }))
  }

  function pickLocale(locale: 'en' | 'ar'): void {
    preferences.setLocale(locale)
    toast.info(t(locale === 'ar' ? 'notif.langSetAr' : 'notif.langSetEn'))
  }

  return (
    <div className="space-y-md">
      <h2 className="text-lg font-extrabold text-bg-f">{t('onboard.step3Title')}</h2>

      <div>
        <span className="block text-xs font-bold text-bg-f mb-xs">{t('onboard.themeLabel')}</span>
        <div className="grid grid-cols-3 gap-sm">
          {themeOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.key}
                type="button"
                className={`p-sm rounded border text-xs font-bold flex flex-col items-center gap-xs transition-all ${
                  preferences.theme === option.key
                    ? 'bg-primary text-primary-f border-primary shadow-sm'
                    : 'bg-surface-alt text-bg-f border-border hover:bg-hover'
                }`}
                aria-pressed={preferences.theme === option.key}
                onClick={() => pickTheme(option.key)}
              >
                <Icon className="w-5 h-5" />
                <span>{t(`theme.${option.key}`)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <span className="block text-xs font-bold text-bg-f mb-xs">{t('onboard.languageLabel')}</span>
        <div className="grid grid-cols-2 gap-sm">
          {(['en', 'ar'] as const).map(locale => (
            <button
              key={locale}
              type="button"
              className={`p-sm rounded border text-xs font-bold transition-all ${
                preferences.locale === locale
                  ? 'bg-primary text-primary-f border-primary shadow-sm'
                  : 'bg-surface-alt text-bg-f border-border hover:bg-hover'
              }`}
              aria-pressed={preferences.locale === locale}
              onClick={() => pickLocale(locale)}
            >
              {locale === 'en' ? t('onboard.langEn') : t('onboard.langAr')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
