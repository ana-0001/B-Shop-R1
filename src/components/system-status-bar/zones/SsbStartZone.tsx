/** src/components/system-status-bar/zones/SsbStartZone.tsx — منطقة البداية (PRD: START ZONE) */
import { useI18n } from '@/hooks/useI18n'
import { useSystemStatus } from '@/components/system-status-bar/composables/useSystemStatus'
import { SsbPulseDot } from '@/components/system-status-bar/elements/SsbPulseDot'
import { SsbVersionBadge } from '@/components/system-status-bar/elements/SsbVersionBadge'
import { SsbEnvTag } from '@/components/system-status-bar/elements/SsbEnvTag'
import { SsbUserChip } from '@/components/system-status-bar/elements/SsbUserChip'
import { SsbTabsChip } from '@/components/system-status-bar/elements/SsbTabsChip'

export function SsbStartZone() {
  const { t } = useI18n()
  const { status, statusLabelKey } = useSystemStatus()

  return (
    <div className="ssb-zone ssb-zone-start" data-testid="ssb-start-zone">
      <SsbPulseDot status={status} label={t(statusLabelKey)} />
      <SsbVersionBadge />
      <SsbEnvTag />
      <span className="ssb-separator" aria-hidden="true" />
      <SsbUserChip />
      <SsbTabsChip />
    </div>
  )
}
