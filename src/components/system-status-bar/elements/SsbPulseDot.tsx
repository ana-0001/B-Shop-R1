/** src/components/system-status-bar/elements/SsbPulseDot.tsx — نقطة النبضة الحية (PRD: System Health Pulse) */
import type { SsbHealthStatus } from '@/components/system-status-bar/types'

export interface SsbPulseDotProps {
  status: SsbHealthStatus
  label?: string
}

export function SsbPulseDot({ status, label }: SsbPulseDotProps) {
  return (
    <span className="ssb-pulse" role="status" aria-live="polite" data-status={status}>
      <span className="ssb-pulse-dot" aria-hidden="true" />
      {label && <span className="ssb-pulse-label">{label}</span>}
    </span>
  )
}
