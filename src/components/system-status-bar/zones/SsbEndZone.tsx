/** src/components/system-status-bar/zones/SsbEndZone.tsx — منطقة النهاية (PRD: END ZONE) */
import { useI18n } from '@/hooks/useI18n'
import { SsbLiveClock } from '@/components/system-status-bar/elements/SsbLiveClock'
import { SsbNotificationBell } from '@/components/system-status-bar/elements/SsbNotificationBell'
import { SsbSettingsTrigger } from '@/components/system-status-bar/elements/SsbSettingsTrigger'

export function SsbEndZone() {
  const { t } = useI18n()

  return (
    <div className="ssb-zone ssb-zone-end" data-testid="ssb-end-zone">
      <SsbLiveClock />
      <span className="ssb-separator" aria-hidden="true" />
      <span className="ssb-fiscal-tag" data-testid="ssb-fiscal">{t('splash.fiscalBuild')}</span>
      <span className="ssb-separator" aria-hidden="true" />
      <SsbNotificationBell />
      <SsbSettingsTrigger />
    </div>
  )
}
