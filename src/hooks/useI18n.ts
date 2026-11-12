/**
 * src/hooks/useI18n.ts — خطاف الترجمة المركزي (بديل composable/useI18n في Nuxt).
 * بقرأ اللغة من متجر التفضيلات وبيوفر t() والاتجاه وتغيير اللغة.
 */
import { useCallback } from 'react'
import { usePreferencesStore } from '@/stores/preferences'
import { notifyInfo } from '@/hooks/useSonner'
import { translate, localeDir } from '@/i18n'
import type { LocaleCode } from '@/types'

export function useI18n() {
  const locale = usePreferencesStore(state => state.locale)
  const setLocaleStore = usePreferencesStore(state => state.setLocale)

  const dir = localeDir(locale)
  const isRTL = dir === 'rtl'

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string =>
      translate(locale, key, params),
    [locale],
  )

  /** تغيير اللغة مع حفظها في التفضيلات + إشعار اختياري */
  const setLocale = useCallback(
    (next: LocaleCode, notifyUser = false): void => {
      setLocaleStore(next)
      if (notifyUser) {
        notifyInfo(translate(next, next === 'ar' ? 'notif.langSetAr' : 'notif.langSetEn'))
      }
    },
    [setLocaleStore],
  )

  return { locale, dir, isRTL, t, setLocale }
}
