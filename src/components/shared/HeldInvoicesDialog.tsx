/** src/components/shared/HeldInvoicesDialog.tsx — نافذة الفواتير المعلّقة (استرجاع / حذف) */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useInvoicesStore } from '@/stores/invoices'
import { useAppState } from '@/stores/appState'
import { invoicesApi } from '@/services/api/endpoints'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency } from '@/utils/format'
import { formatDateTime } from '@/utils/dates'
import { invoiceCustomerName } from '@/types'
import type { Invoice } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'

export function HeldInvoicesDialog() {
  const { t, locale } = useI18n()
  const { toast } = useSonner()
  const navigate = useNavigate()
  const restoreHeld = useInvoicesStore(state => state.restoreHeld)
  const open = useAppState(state => state.heldDialogOpen)
  const setOpen = useAppState(state => state.setHeldDialogOpen)

  const [heldInvoices, setHeldInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function loadHeld(): Promise<void> {
    setIsLoading(true)
    try {
      setHeldInvoices(await invoicesApi.listHeld())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadHeld()
  }, [open])

  /** استرجاع فاتورة لمساحة العمل والانتقال لشاشة الفواتير */
  async function restoreInvoice(invoice: Invoice): Promise<void> {
    const ok = await restoreHeld(invoice.id)
    if (ok) {
      toast.success(t('notif.restoreOk', { id: invoice.id }))
      setOpen(false)
      navigate('/invoices')
    }
  }

  /** حذف فاتورة معلّقة نهائيًا */
  async function deleteInvoice(invoice: Invoice): Promise<void> {
    await invoicesApi.deleteHeld(invoice.id)
    await loadHeld()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[36rem]" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-xs">
            <Archive className="w-5 h-5 text-war" />
            <DialogTitle>{t('util.heldInvoices')}</DialogTitle>
            {heldInvoices.length > 0 && <Badge variant="war">{heldInvoices.length}</Badge>}
          </div>
          <DialogClose
            className="erp-btn text-xs py-xs px-sm relative z-10"
            aria-label="Close dialog"
          >
            ✕ Esc
          </DialogClose>
        </DialogHeader>

        <div className="max-h-56 overflow-y-auto space-y-xs">
          {!isLoading && heldInvoices.length === 0 && <EmptyState message={t('held.empty')} />}

          {heldInvoices.map((invoice, invoiceIndex) => (
            <div
              key={`${invoice.id}-${invoiceIndex}`}
              className="p-sm rounded border border-border bg-surface-alt flex flex-wrap items-center justify-between gap-sm text-xs"
            >
              <div>
                <div className="font-extrabold text-bg-f">
                  {invoice.id} — <span className="text-primary">{invoiceCustomerName(invoice, locale)}</span>
                </div>
                <div className="text-muted-f mt-0.5 flex items-center gap-xs flex-wrap">
                  <span>{t(`enum.type.${invoice.type}`)}</span>
                  <span>·</span>
                  <span>{t('held.itemsCount', { count: invoice.items.length })}</span>
                  <span>·</span>
                  <strong className="font-mono text-ok">{formatCurrency(computeInvoiceAmounts(invoice).net, locale)}</strong>
                  <span>·</span>
                  <span>{t('held.heldAt', { time: formatDateTime(invoice.heldAt ?? invoice.updatedAt, locale) })}</span>
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <Button variant="primary" size="sm" onClick={() => restoreInvoice(invoice)}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('common.restore')}</span>
                </Button>
                <Button variant="danger" size="sm" aria-label="Delete held invoice" onClick={() => deleteInvoice(invoice)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="primary" size="sm">{t('common.close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
