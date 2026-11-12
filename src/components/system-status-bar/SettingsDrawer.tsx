/** src/components/system-status-bar/SettingsDrawer.tsx — درج الإعدادات الجانبي (PRD: Settings Drawer) */
import * as DrawerPrimitive from '@radix-ui/react-dialog'
import {
  Settings2,
  Sun,
  Moon,
  Monitor,
  Languages,
  MapPin,
  Building2,
  Info,
  Hash,
  BadgeCheck,
  Coins,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { LocaleCode, ThemeMode } from '@/types'
import { localizedEntityName } from '@/types'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { usePreferencesStore } from '@/stores/preferences'
import { useAppState } from '@/stores/appState'
import { APP_VERSION } from '@/utils/constants'
import { Select } from '@/components/ui/Select'

/** أوضاع الثيم الثلاثة */
const themeOptions: Array<{ value: ThemeMode; labelKey: string; icon: LucideIcon }> = [
  { value: 'light', labelKey: 'theme.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', icon: Moon },
  { value: 'system', labelKey: 'theme.system', icon: Monitor },
]

/** خيارات اللغة */
const languageOptions: Array<{ value: LocaleCode; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

export function SettingsDrawer() {
  const { t, locale, setLocale } = useI18n()
  const preferences = usePreferencesStore()
  const { meta } = useSystemMeta()
  const settingsOpen = useAppState(state => state.ssbSettingsOpen)
  const setSsbSettingsOpen = useAppState(state => state.setSsbSettingsOpen)

  /** خيارات الفرع — نفس مصدر شريط الأدوات */
  const branchOptions = [
    { value: 'ALL', label: t('wh.allBranches') },
    ...(meta?.branches ?? []).map(branch => ({
      value: branch.id,
      label: localizedEntityName(branch, locale),
    })),
  ]

  /** بيئة التشغيل للعرض */
  const envLabel = import.meta.env.DEV ? t('ssb.env.dev') : t('ssb.env.prod')

  return (
    <DrawerPrimitive.Root open={settingsOpen} onOpenChange={setSsbSettingsOpen}>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="erp-modal-overlay" />
        <DrawerPrimitive.Content
          className="ssb-drawer-content bg-glass"
          data-testid="ssb-drawer"
          style={{ fontFamily: 'inherit' }}
        >
          {/* ترويسة الدرج */}
          <div className="ssb-drawer-header">
            <DrawerPrimitive.Title className="ssb-drawer-title">
              <Settings2 aria-hidden="true" />
              <span>{t('ssb.settings.title')}</span>
            </DrawerPrimitive.Title>
            <button
              type="button"
              className="ssb-icon-btn"
              aria-label={t('common.close')}
              onClick={() => setSsbSettingsOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <DrawerPrimitive.Description className="sr-only">{t('ssb.settings.title')}</DrawerPrimitive.Description>

          {/* جسم الدرج */}
          <div className="ssb-drawer-body">
            {/* المظهر */}
            <section>
              <h3 className="ssb-drawer-section-title">{t('ssb.settings.appearance')}</h3>
              <div className="ssb-option-row" role="radiogroup" aria-label={t('ssb.settings.appearance')}>
                {themeOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      className="ssb-option-chip"
                      data-active={preferences.theme === option.value}
                      aria-checked={preferences.theme === option.value}
                      onClick={() => preferences.setTheme(option.value)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{t(option.labelKey)}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* اللغة */}
            <section>
              <h3 className="ssb-drawer-section-title">{t('ssb.settings.language')}</h3>
              <div className="ssb-option-row" role="radiogroup" aria-label={t('ssb.settings.language')}>
                {languageOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    className="ssb-option-chip"
                    data-active={locale === option.value}
                    aria-checked={locale === option.value}
                    onClick={() => setLocale(option.value)}
                  >
                    <Languages aria-hidden="true" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* الفرع الحالي */}
            <section>
              <h3 className="ssb-drawer-section-title">{t('ssb.settings.branch')}</h3>
              <div className="flex items-center gap-[0.5em]">
                <Building2 className="w-[0.875em] h-[0.875em] text-muted-f" aria-hidden="true" />
                <Select
                  value={preferences.currentBranchId}
                  options={branchOptions}
                  className="flex-1"
                  aria-label={t('ssb.settings.branch')}
                  onChange={event => preferences.setCurrentBranch(event.target.value)}
                />
              </div>
            </section>

            {/* المنطقة والتوقيت */}
            <section>
              <h3 className="ssb-drawer-section-title">{t('ssb.settings.region')}</h3>
              <div className="ssb-drawer-info-grid">
                <div className="ssb-drawer-info-row">
                  <span className="ssb-drawer-info-label">
                    <MapPin aria-hidden="true" />
                    <span>{t('ssb.settings.timezone')}</span>
                  </span>
                  <span className="ssb-drawer-info-value">Africa/Cairo</span>
                </div>
              </div>
              <p className="ssb-drawer-note mt-[0.5em]">{t('ssb.settings.timezoneNote')}</p>
            </section>

            {/* عن النسخة */}
            <section>
              <h3 className="ssb-drawer-section-title">{t('ssb.settings.about')}</h3>
              <div className="ssb-drawer-info-grid">
                <div className="ssb-drawer-info-row">
                  <span className="ssb-drawer-info-label">
                    <Hash aria-hidden="true" />
                    <span>{t('ssb.settings.version')}</span>
                  </span>
                  <span className="ssb-drawer-info-value">v{APP_VERSION}</span>
                </div>
                <div className="ssb-drawer-info-row">
                  <span className="ssb-drawer-info-label">
                    <BadgeCheck aria-hidden="true" />
                    <span>{t('ssb.settings.environment')}</span>
                  </span>
                  <span className="ssb-drawer-info-value">{envLabel}</span>
                </div>
                <div className="ssb-drawer-info-row">
                  <span className="ssb-drawer-info-label">
                    <Coins aria-hidden="true" />
                    <span>{t('ssb.settings.fiscal')}</span>
                  </span>
                  <span className="ssb-drawer-info-value">{t('splash.fiscalBuild')}</span>
                </div>
                <div className="ssb-drawer-info-row">
                  <span className="ssb-drawer-info-label">
                    <Info aria-hidden="true" />
                    <span>{t('app.subtitle')}</span>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* تذييل الدرج */}
          <footer className="ssb-drawer-footer">
            B-Shop ERP — v{APP_VERSION} · {envLabel}
          </footer>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}
