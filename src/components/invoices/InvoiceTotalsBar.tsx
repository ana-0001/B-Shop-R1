/** src/components/invoices/InvoiceTotalsBar.tsx — شريط الإجماليات (خصم + ضريبة + صافي) وأزرار التعليق/الترحيل */
import { Pause, Save, X } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency } from '@/utils/format'
import type { InvoiceDraft } from '@/stores/invoices'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface InvoiceTotalsBarProps {
  draft: InvoiceDraft
  onHold: () => void
  onSave: () => void
  onClose: () => void
}

export function InvoiceTotalsBar({ draft, onHold, onSave, onClose }: InvoiceTotalsBarProps) {
  const { t, locale } = useI18n()
  const patchTab = useInvoicesStore(state => state.patchTab)

  const amounts = computeInvoiceAmounts(draft)

  return (
    <div className="bg-surface-alt p-sm rounded border border-border grid grid-cols-1 lg:grid-cols-12 gap-sm items-center">
      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-sm">
        <div>
          <label className="block font-bold text-bg-f text-xs mb-xs">{t('inv.subtotal')}:</label>
          <Input
            value={formatCurrency(amounts.gross, locale)}
            type="text"
            readOnly
            className="!h-8 text-center font-bold font-mono bg-surface-alt !text-xs"
            aria-label="Subtotal"
          />
        </div>
        <div>
          <label className="block font-bold text-bg-f text-xs mb-xs">{t('inv.discount')}:</label>
          <Input
            value={draft.discount}
            type="number"
            min={0}
            className="!h-8 text-center font-bold font-mono text-err"
            aria-label="Discount amount"
            onChange={event =>
              patchTab(draft.id, { discount: Math.max(0, Number(event.target.value) || 0) })
            }
          />
        </div>
        <div>
          <label className="block font-bold text-bg-f text-xs mb-xs">{t('inv.tax')}:</label>
          <Input
            value={draft.taxRate}
            type="number"
            min={0}
            max={100}
            className="!h-8 text-center font-bold font-mono text-war"
            aria-label="VAT rate"
            onChange={event =>
              patchTab(draft.id, {
                taxRate: Math.min(100, Math.max(0, Number(event.target.value) || 0)),
              })
            }
          />
        </div>
        <div>
          <label className="block font-bold text-bg-f text-xs mb-xs">{t('inv.netTotal')}:</label>
          <Input
            value={formatCurrency(amounts.net, locale)}
            type="text"
            readOnly
            className="!h-8 text-center font-bold font-mono text-ok !text-xs"
            aria-label="Net total"
          />
        </div>
      </div>

      <div className="lg:col-span-4 flex items-end gap-xs justify-end">
        <div className="flex-1">
          <Button variant="warning" size="md" className="h-8 w-full py-sm text-xs font-bold" onClick={onHold}>
            <Pause className="w-3.5 h-3.5" />
            {t('inv.holdBtn')}
          </Button>
        </div>
        <div className="flex-1">
          <Button variant="success" size="md" className="h-8 w-full py-sm text-xs font-bold shadow-sm" onClick={onSave}>
            <Save className="w-3.5 h-3.5" />
            {t('inv.savePrintBtn')}
          </Button>
        </div>
        <div>
          <Button variant="danger" size="md" className="h-8 py-sm px-md text-xs font-bold" aria-label="Close tab" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
