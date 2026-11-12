/**
 * src/hooks/useThemeSync.ts — مزامنة الثيم (light/dark/system) واللغة (ltr/rtl) مع وسم html.
 * بديل منطق app.vue في المشروع الأصلي — system بيتحول لـ light/dark حسب نظام التشغيل.
 */
import { useEffect } from 'react'
import { usePreferencesStore } from '@/stores/preferences'
import { useAppState } from '@/stores/appState'

export function useThemeSync(): void {
  const theme = usePreferencesStore(state => state.theme)
  const locale = usePreferencesStore(state => state.locale)
  const setResolvedTheme = useAppState(state => state.setResolvedTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    /** الثيم المحسوم فعليًا (system بيتحول لـ light/dark حسب نظام التشغيل) */
    function resolveTheme(): void {
      const prefersDark = mediaQuery.matches
      const resolved: 'light' | 'dark' =
        theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
      useAppState.getState().setResolvedTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
    }

    mediaQuery.addEventListener('change', resolveTheme)
    resolveTheme()
    return () => mediaQuery.removeEventListener('change', resolveTheme)
  }, [theme, setResolvedTheme])

  // تطبيق اللغة والاتجاه على وسم html
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale === 'ar' ? 'ar-EG' : 'en')
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale])
}

/** اسم متوافق — بنفس الاستدعاء في App */
export function useTranslationSync(): void {
  useThemeSync()
}
