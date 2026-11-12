/** src/components/system-status-bar/elements/SsbTabsChip.tsx — رقاقة التبويبات المفتوحة */
import { Layers } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'

export function SsbTabsChip() {
  const { t } = useI18n()
  const tabsCount = useInvoicesStore(state => state.tabs.length)

  return (
    <span className="ssb-chip ssb-tabs-chip" title={t('ssb.tabs')} data-testid="ssb-tabs">
      <Layers aria-hidden="true" />
      <span className="ssb-chip-label">{t('ssb.tabs')}</span>
      <strong className="ssb-chip-value ssb-tabs-count">{tabsCount}</strong>
    </span>
  )
}
