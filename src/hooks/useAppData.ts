/**
 * src/hooks/useAppData.ts — إدارة دورة بيانات الـ Mock على مستوى التطبيق.
 * منقول حرفيًا من composable/useAppData —
 * - dataVersion: عدّاد بيزيد مع كل مزامنة/تصفير — الصفحات بتسمع عليه وتعيد جلب بياناتها.
 * - isSyncing: فلاجل شاشة الـ Skeleton أثناء محاكاة جلب البيانات.
 * - refreshMockData / resetMockDb: العمليات العامة من شريط الأدوات.
 */
import { useEffect } from 'react'
import { MOCK_LATENCY_MS } from '@/utils/constants'
import { emitBusEvent } from '@/utils/bus'
import { notifyInfo, notifySuccess } from '@/hooks/useSonner'
import { useAppState } from '@/stores/appState'
import { useInvoicesStore } from '@/stores/invoices'
import { resetMockDatabase } from '@/services/mock/db'
import { translate } from '@/i18n'
import type { LocaleCode } from '@/types'

/** الاستماع لتحديث البيانات (يُستخدم داخل الصفحات) — بديل onDataRefresh */
export function useOnDataRefresh(handler: () => void): void {
  const dataVersion = useAppState(state => state.dataVersion)
  useEffect(() => {
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion])
}

/** مزامنة الـ Mock API — بتعرض الـ Skeleton ثم تبث إشارة للصفحات */
export async function refreshMockData(): Promise<void> {
  const app = useAppState.getState()
  const locale = (await import('@/stores/preferences')).usePreferencesStore.getState().locale
  app.setSyncing(true)
  await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS + 200))
  useAppState.getState().setSyncing(false)
  useAppState.getState().setDataVersion(value => value + 1)
  emitBusEvent('bshop:sync')
  notifyInfo(translate(locale as LocaleCode, 'notif.synced'))
}

/**
 * تصفير قاعدة البيانات الافتراضية — بيمسح كل حاجة ويرجّع الـ Seed.
 * بيمسح كذلك تبويبات الفواتير المفتوحة عشان الأرقام تفضل متسقة.
 */
export async function resetMockDb(): Promise<void> {
  const app = useAppState.getState()
  const locale = (await import('@/stores/preferences')).usePreferencesStore.getState().locale
  app.setSyncing(true)
  resetMockDatabase()
  await useInvoicesStore.getState().clearAll()
  await new Promise(resolve => setTimeout(resolve, 200))
  useAppState.getState().setSyncing(false)
  useAppState.getState().setDataVersion(value => value + 1)
  emitBusEvent('bshop:db-reset')
  notifySuccess(translate(locale as LocaleCode, 'notif.resetDone'))
}

/** خطاف توافقي يرجع نفس واجهة الـ composable الأصلي */
export function useAppData() {
  const isSyncing = useAppState(state => state.isSyncing)
  return { isSyncing, refreshMockData, resetMockDb }
}
