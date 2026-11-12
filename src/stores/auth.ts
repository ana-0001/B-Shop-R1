/**
 * src/stores/auth.ts — متجر المصادقة (الجلسة، الشروط، الإعداد الأولي).
 * منقول من Pinia إلى Zustand — تسجيل الدخول بيمر على طبقة الـ API (Mock حاليًا).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, SessionUser } from '@/types'
import { isSuperBomba } from '@/utils/permissions'
import { authApi } from '@/services/api/endpoints'
import { nowUtcIso } from '@/utils/dates'
import { STORAGE_KEYS } from '@/utils/constants'
import { createPlainStorage } from '@/stores/storage'

export interface OperatorProfile {
  jobTitle: string
  avatarIcon: string
}

interface AuthState {
  /** المستخدم الحالي — null يعني زائر */
  user: SessionUser | null
  /** تاريخ قبول الشروط (UTC) — null يعني لسه ما قبلهمش */
  termsAcceptedAt: string | null
  /** هل اكتمل الإعداد الأولي (Onboarding)؟ */
  onboardingCompleted: boolean
  /** بيانات الملف الوظيفي من خطوة الإعداد الثانية */
  operatorProfile: OperatorProfile
  signIn: (identifier: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  acceptTerms: () => Promise<void>
  completeOnboarding: (profile: OperatorProfile) => Promise<void>
}

/** الشكل المحفوظ فعليًا في localStorage (بدون الدوال) */
type PersistedAuth = Pick<AuthState, 'user' | 'termsAcceptedAt' | 'onboardingCompleted' | 'operatorProfile'>

/** Getters المشتقة — بنفس أسماء getters متجر Pinia الأصلي */
export function useAuthComputed() {
  const user = useAuthStore(state => state.user)
  const termsAcceptedAt = useAuthStore(state => state.termsAcceptedAt)
  const onboardingCompleted = useAuthStore(state => state.onboardingCompleted)

  const isAuthenticated = !!user
  const isSuperBombaUser = isSuperBomba(user)
  const needsTerms = isAuthenticated && !termsAcceptedAt
  const needsOnboarding = isAuthenticated && !!termsAcceptedAt && !onboardingCompleted

  return { user, isAuthenticated, isSuperBombaUser, needsTerms, needsOnboarding }
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      termsAcceptedAt: null,
      onboardingCompleted: false,
      operatorProfile: { jobTitle: '', avatarIcon: 'user-cog' },

      /** تسجيل الدخول بالمعرّف الموحد — بيرمي ApiRequestError عند الفشل */
      signIn: async (identifier, password) => {
        const response = await authApi.signIn({ identifier, password })
        set(state => ({
          user: response.user,
          // حالة البوابات بتقرأ من استجابة الـ API (زي الباك إند الحقيقي)
          termsAcceptedAt: response.termsAccepted
            ? (response.termsAcceptedAt ?? nowUtcIso())
            : null,
          onboardingCompleted: response.onboardingCompleted,
          operatorProfile: response.operatorProfile ?? state.operatorProfile,
        }))
        return response
      },

      /** تسجيل الخروج وتصفير حالة الجلسة بالكامل */
      signOut: async () => {
        try {
          await authApi.signOut()
        } finally {
          set({
            user: null,
            termsAcceptedAt: null,
            onboardingCompleted: false,
            operatorProfile: { jobTitle: '', avatarIcon: 'user-cog' },
          })
        }
      },

      /** قبول الشروط والأحكام — بيتخزن على المستخدم في الـ API وبيسجل التوقيت UTC */
      acceptTerms: async () => {
        const { user, termsAcceptedAt } = useAuthStore.getState()
        if (user) {
          const res = await authApi.acceptTerms(user.id)
          set({ termsAcceptedAt: res.termsAcceptedAt })
        } else {
          set({ termsAcceptedAt: termsAcceptedAt ?? nowUtcIso() })
        }
      },

      /** حفظ بيانات الإعداد الأولي وإنهاء الـ Onboarding — بيتخزن على المستخدم في الـ API */
      completeOnboarding: async profile => {
        const { user } = useAuthStore.getState()
        if (user) {
          await authApi.completeOnboarding(user.id, profile)
        }
        set({ operatorProfile: profile, onboardingCompleted: true })
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createPlainStorage<PersistedAuth>(),
      partialize: state => ({
        user: state.user,
        termsAcceptedAt: state.termsAcceptedAt,
        onboardingCompleted: state.onboardingCompleted,
        operatorProfile: state.operatorProfile,
      }),
    },
  ),
)
