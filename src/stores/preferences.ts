/**
 * src/stores/preferences.ts — متجر التفضيلات العامة (اللغة، الثيم، الفرع الحالي).
 * منقول من Pinia إلى Zustand — بيتحفظ في localStorage تلقائيًا عشان
 * تبديل اللغة والثيم يفضل محفوظ بعد إغلاق التطبيق (معيار القبول رقم 4).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocaleCode, ThemeMode } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'
import { createPlainStorage } from '@/stores/storage'

interface PreferencesState {
  /** لغة الواجهة — الافتراضية English (en, LTR) */
  locale: LocaleCode
  /** وضع الثيم — الافتراضي Light ويدعم Dark و System */
  theme: ThemeMode
  /** الفرع الحالي المختار في شريط التنقل (يؤثر على فلتر المخازن) */
  currentBranchId: string
  setLocale: (next: LocaleCode) => void
  toggleLocale: () => LocaleCode
  setTheme: (next: ThemeMode) => void
  /** تدوير الثيم: Light → Dark → System → Light (سلوك ملف التصميم) */
  cycleTheme: () => ThemeMode
  setCurrentBranch: (branchId: string) => void
}

/** الشكل المحفوظ فعليًا في localStorage (بدون الدوال) */
type PersistedPreferences = Pick<PreferencesState, 'locale' | 'theme' | 'currentBranchId'>

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      locale: 'en',
      theme: 'light',
      currentBranchId: 'ALL',

      setLocale: next => set({ locale: next === 'ar' ? 'ar' : 'en' }),
      toggleLocale: () => {
        let result: LocaleCode = 'en'
        set(state => {
          result = state.locale === 'en' ? 'ar' : 'en'
          return { locale: result }
        })
        return result
      },
      setTheme: next =>
        set(state => ({
          theme: (['light', 'dark', 'system'] as ThemeMode[]).includes(next) ? next : 'light',
        })),
      cycleTheme: () => {
        const order: ThemeMode[] = ['light', 'dark', 'system']
        let result: ThemeMode = 'light'
        set(state => {
          result = order[(order.indexOf(state.theme) + 1) % order.length] ?? 'light'
          return { theme: result }
        })
        return result
      },
      setCurrentBranch: branchId => set({ currentBranchId: branchId }),
    }),
    {
      name: STORAGE_KEYS.preferences,
      storage: createPlainStorage<PersistedPreferences>(),
      partialize: state => ({
        locale: state.locale,
        theme: state.theme,
        currentBranchId: state.currentBranchId,
      }),
    },
  ),
)
