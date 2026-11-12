/** src/components/system-status-bar/SystemStatusBar.tsx — شريط الحالة النظامي الموحد (Main Entry).
 * التنفيذ الكامل لـ PRD بنسخة React المكافئة — كموقع في الفوتر:
 * - START: صحة النظام (نبضة) + شارة الإصدار + وسم البيئة.
 * - END: ساعة 12h مع Tooltip (24h القاهرة + ميلادي + هجري أم القرى)
 *   + إشعارات Popover + إعدادات Drawer. */
import '@/components/system-status-bar/status-bar.css'
import { SsbStartZone } from '@/components/system-status-bar/zones/SsbStartZone'
import { SsbEndZone } from '@/components/system-status-bar/zones/SsbEndZone'
import { SettingsDrawer } from '@/components/system-status-bar/SettingsDrawer'
import { useSystemStatus } from '@/components/system-status-bar/composables/useSystemStatus'

export function SystemStatusBar() {
  /** حالة الصحة على جذر الشريط (للتنسيق الشرطي لألوان النبضة) */
  const { status } = useSystemStatus()

  return (
    <footer className="ssb" data-health={status} role="contentinfo" aria-label="System Status Bar" data-testid="system-status-bar">
      {/* [START ZONE]: صحة النظام + الإصدار + البيئة */}
      <SsbStartZone />

      {/* [END ZONE]: الساعة + الإشعارات + الإعدادات */}
      <SsbEndZone />

      {/* درج الإعدادات الجانبي */}
      <SettingsDrawer />
    </footer>
  )
}
