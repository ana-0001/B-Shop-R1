/**
 * src/components/system-status-bar/composables/useSystemStatus.ts — مؤشر صحة النظام.
 * منقول حرفيًا — بيشتق الحالة من دورة حياة الـ Mock API:
 * - online: كل حاجة تمام (الوضع الافتراضي لمحرك الـ Mock).
 * - degraded: عملية مزامنة بيانات شغالة حاليًا (isSyncing).
 * - offline: محجوز لفشل الاتصال بعد ترحيل الباك إند.
 */
import { useEffect, useMemo } from 'react'
import type { SsbHealthStatus } from '@/components/system-status-bar/types'
import { onBusEvent } from '@/utils/bus'
import { useAppData } from '@/hooks/useAppData'
import { useAppState } from '@/stores/appState'

export function useSystemStatus() {
  const { isSyncing } = useAppData()
  const setLastSyncAt = useAppState(state => state.setLastSyncAt)

  // تحديث ختم آخر مزامنة مع حدثي المزامنة والتصفير
  useEffect(() => {
    const offSync = onBusEvent('bshop:sync', () => setLastSyncAt(new Date().toISOString()))
    const offReset = onBusEvent('bshop:db-reset', () => setLastSyncAt(new Date().toISOString()))
    return () => {
      offSync()
      offReset()
    }
  }, [setLastSyncAt])

  /** حالة الصحة المشتقة — degraded أثناء المزامنة، و online في الحالة المستقرة */
  const status = (isSyncing ? 'degraded' : 'online') as SsbHealthStatus

  /** مفتاح الترجمة لنص الحالة المجاور للنبضة */
  const statusLabelKey = useMemo<string>(() => {
    switch (status) {
      case 'degraded':
        return 'ssb.health.degraded'
      case 'offline':
        return 'ssb.health.offline'
      default:
        return 'ssb.health.online'
    }
  }, [status])

  return { status, statusLabelKey }
}
