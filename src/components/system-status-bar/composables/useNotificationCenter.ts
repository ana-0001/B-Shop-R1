/**
 * src/components/system-status-bar/composables/useNotificationCenter.ts — مركز إشعارات مساحة العمل.
 * منقول حرفيًا — نظام Mock كامل مشتق من حالة التطبيق الحالية (بدون backend):
 * - فواتير معلّقة (Held) من طبقة الـ API + فتح نافذة الاسترجاع عند النقر.
 * - تنبيهات المخزون المنخفض من صفوف الـ inventory مقارنة بعتبة النظام.
 * - أحداث المزامنة / التصفير من ناقل الأحداث (bshop:sync / bshop:db-reset).
 * الإشعارات جلسية (appState) — لما نيجي للـ backend الحقيقي هتبقى مكانها endpoint إشعارات.
 */
import { useEffect } from 'react'
import type { SsbNotification } from '@/components/system-status-bar/types'
import { onBusEvent } from '@/utils/bus'
import { nowUtcIso } from '@/utils/dates'
import { invoicesApi, inventoryApi } from '@/services/api/endpoints'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { useAppState } from '@/stores/appState'

let notificationSeq = 0

/** بناء إشعار جديد بختم زمني حالي */
function buildNotification(
  kind: SsbNotification['kind'],
  titleKey: string,
  bodyKey: string,
  params?: Record<string, string | number>,
  to?: string,
): SsbNotification {
  notificationSeq += 1
  return {
    id: `ssb-notif-${notificationSeq}`,
    kind,
    titleKey,
    bodyKey,
    params,
    createdAt: nowUtcIso(),
    read: false,
    to,
  }
}

/** إضافة إشعار في مقدمة القائمة مع سقف أقصى (أحدث 30 إشعار) */
function push(notification: SsbNotification): void {
  useAppState.getState().setNotifications(items => [notification, ...items].slice(0, 30))
}

/**
 * توليد الإشعارات المشتقة من بيانات النظام (المعلّق + المخزون المنخفض).
 * بتستبدل إشعارات النوعين 'held' و 'stock' القديمة بقيم محدثة بدل التراكم.
 */
async function refreshDerived(): Promise<void> {
  try {
    // فواتير معلّقة من طبقة الـ API
    const held = await invoicesApi.listHeld()
    const heldNotifications = held.map(invoice =>
      buildNotification('held', 'ssb.notif.kind.held', 'ssb.notif.body.held', { id: invoice.id, count: invoice.items.length }, '/invoices'),
    )

    // تنبيهات المخزون المنخفض من صفوف الـ inventory (كل الفروع)
    const stockNotifications: SsbNotification[] = []
    const meta = useAppState.getState().meta
    if (meta) {
      const openDrafts = useInvoicesStore.getState().tabs
      const rows = await inventoryApi.list(openDrafts)
      const threshold = meta.lowStockThreshold
      for (const row of rows) {
        if (row.stock <= threshold) {
          stockNotifications.push(
            buildNotification('stock', 'ssb.notif.kind.stock', 'ssb.notif.body.stock', { name: row.name, nameAr: row.nameAr, qty: row.stock, threshold }, '/inventory'),
          )
        }
      }
    }

    // استبدال إشعارات held/stock القديمة والإبقاء على أحداث الجلسة (sync/system)
    useAppState.getState().setNotifications(items => {
      const sessionEvents = items.filter(item => item.kind === 'sync' || item.kind === 'system')
      return [...sessionEvents, ...heldNotifications, ...stockNotifications].slice(0, 30)
    })
  } catch {
    // فشل اشتقاق الإشعارات (قبل تحميل البيانات مثلًا) — نتجاهله بهدوء
  }
}

export function useNotificationCenter() {
  const notifications = useAppState(state => state.ssbNotifications)
  const setNotifications = useAppState(state => state.setNotifications)
  const unreadCount = notifications.filter(item => !item.read).length

  /** تهيئة الإشعارات المشتقة عند أول إدخال + أحداث الجلسة */
  useEffect(() => {
    refreshDerived()

    const offSync = onBusEvent('bshop:sync', () => {
      push(buildNotification('sync', 'ssb.notif.kind.sync', 'ssb.notif.body.sync'))
      refreshDerived()
    })
    const offReset = onBusEvent('bshop:db-reset', () => {
      push(buildNotification('system', 'ssb.notif.kind.reset', 'ssb.notif.body.reset'))
      refreshDerived()
    })
    return () => {
      offSync()
      offReset()
    }
  }, [])

  /** تعليم إشعار واحد كمقروء */
  function markAsRead(id: string): void {
    setNotifications(items => items.map(item => (item.id === id ? { ...item, read: true } : item)))
  }

  /** تعليم الكل كمقروء */
  function markAllAsRead(): void {
    setNotifications(items => items.map(item => ({ ...item, read: true })))
  }

  /** حذف إشعار واحد */
  function dismiss(id: string): void {
    setNotifications(items => items.filter(item => item.id !== id))
  }

  /** تفريغ كل الإشعارات */
  function clearAll(): void {
    setNotifications(() => [])
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
  }
}
