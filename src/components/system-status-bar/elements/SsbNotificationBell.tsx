/** src/components/system-status-bar/elements/SsbNotificationBell.tsx — جرس الإشعارات مع Popover (PRD: Notification Popover) */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  Bell,
  PauseCircle,
  PackageX,
  RefreshCw,
  Database,
  Inbox,
  X,
  CheckCheck,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SsbNotification } from '@/components/system-status-bar/types'
import { useI18n } from '@/hooks/useI18n'
import { useNotificationCenter } from '@/components/system-status-bar/composables/useNotificationCenter'

/** أيقونة ولون كل نوع إشعار */
const kindMeta: Record<SsbNotification['kind'], { icon: LucideIcon }> = {
  held: { icon: PauseCircle },
  stock: { icon: PackageX },
  sync: { icon: RefreshCw },
  system: { icon: Database },
}

export function SsbNotificationBell() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, clearAll } = useNotificationCenter()
  const [isOpen, setIsOpen] = useState(false)

  /** فتح الـ Popover بيعلّم كل الإشعارات كمقروءة (سلوك مركز الإشعارات المعتاد) */
  useEffect(() => {
    if (isOpen && unreadCount > 0) markAllAsRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  /** عرض زمني نسبي مبسّط ("منذ 3 دقائق") بدون اعتماديات إضافية */
  function timeAgo(iso: string): string {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
    if (seconds < 60) return t('ssb.notif.time.now')
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return t('ssb.notif.time.minutes', { count: minutes })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('ssb.notif.time.hours', { count: hours })
    return t('ssb.notif.time.days', { count: Math.floor(hours / 24) })
  }

  /** اسم صنف إشعار المخزون حسب لغة الواجهة */
  function stockName(notification: SsbNotification): string {
    return locale === 'ar'
      ? String(notification.params?.nameAr ?? notification.params?.name ?? '')
      : String(notification.params?.name ?? '')
  }

  /** سلوك النقر على الإشعار — تنقل للمسار المرتبط إن وجد */
  function handleNotificationClick(notification: SsbNotification): void {
    markAsRead(notification.id)
    if (notification.to) {
      setIsOpen(false)
      navigate(notification.to)
    }
  }

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="ssb-icon-btn"
          aria-label={`${t('ssb.aria.notifications')} (${unreadCount})`}
          title={t('ssb.aria.notifications')}
          data-testid="ssb-bell"
        >
          <Bell aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="ssb-count-badge" data-testid="ssb-bell-count">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content className="ssb-pop-content ssb-notif-content" side="top" sideOffset={8} align="end">
          {/* ترويسة مركز الإشعارات */}
          <div className="ssb-notif-head">
            <span className="ssb-notif-head-title">{t('ssb.notif.title')}</span>
            <div className="ssb-notif-actions">
              <button type="button" className="ssb-notif-action-btn" title={t('ssb.notif.markAll')} onClick={markAllAsRead}>
                <CheckCheck aria-hidden="true" />
              </button>
              <button type="button" className="ssb-notif-action-btn" title={t('ssb.notif.clearAll')} onClick={clearAll}>
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* القائمة أو حالة الفراغ */}
          {notifications.length > 0 ? (
            <div className="ssb-notif-list" role="list">
              {notifications.map(notification => {
                const Icon = kindMeta[notification.kind].icon
                return (
                  <button
                    key={notification.id}
                    type="button"
                    role="listitem"
                    className="ssb-notif-item"
                    data-read={notification.read}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!notification.read && <span className="ssb-notif-unread-dot" aria-hidden="true" />}
                    <span className="ssb-notif-item-icon" data-kind={notification.kind} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="ssb-notif-item-main">
                      <span className="ssb-notif-item-title">{t(notification.titleKey)}</span>
                      <span className="ssb-notif-item-body">
                        {t(
                          notification.bodyKey,
                          notification.kind === 'stock'
                            ? { ...notification.params, name: stockName(notification) }
                            : notification.params,
                        )}
                      </span>
                      <span className="ssb-notif-item-time">{timeAgo(notification.createdAt)}</span>
                    </span>
                    <span
                      className="ssb-notif-item-dismiss"
                      role="button"
                      aria-label={t('common.delete')}
                      title={t('common.delete')}
                      onClick={event => {
                        event.stopPropagation()
                        dismiss(notification.id)
                      }}
                    >
                      <X aria-hidden="true" />
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="ssb-notif-empty">
              <Inbox aria-hidden="true" />
              <span>{t('ssb.notif.empty')}</span>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
