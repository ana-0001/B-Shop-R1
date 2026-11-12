/** src/components/invoices/InvoiceEditorPane.tsx — محرر فاتورة كامل (رأس + أصناف + عميل + بنود + معاينة + إجماليات) */
import { ListChecks, Warehouse } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { localizedEntityName } from '@/types'
import type { InvoiceType, PriceTier } from '@/types'
import type { InvoiceDraft } from '@/stores/invoices'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { ProductEntryCard } from '@/components/invoices/ProductEntryCard'
import { CustomerCard } from '@/components/invoices/CustomerCard'
import { InvoiceItemsTable } from '@/components/invoices/InvoiceItemsTable'
import { InvoiceSidePanel } from '@/components/invoices/InvoiceSidePanel'
import { InvoiceTotalsBar } from '@/components/invoices/InvoiceTotalsBar'

const INVOICE_TYPES: InvoiceType[] = ['SALE', 'PURCHASE', 'RETURN']

export interface InvoiceEditorPaneProps {
  draft: InvoiceDraft
  secondary?: boolean
  onHold: (draft: InvoiceDraft) => void
  onSave: (draft: InvoiceDraft) => void
  onClose: (draft: InvoiceDraft) => void
}

export function InvoiceEditorPane({ draft, secondary = false, onHold, onSave, onClose }: InvoiceEditorPaneProps) {
  const { t, locale } = useI18n()
  const patchTab = useInvoicesStore(state => state.patchTab)
  const setPriceTier = useInvoicesStore(state => state.setPriceTier)
  const addItem = useInvoicesStore(state => state.addItem)
  const { meta } = useSystemMeta()

  const branchOptions = (meta?.branches ?? []).map(branch => ({
    value: branch.id,
    label: localizedEntityName(branch, locale),
  }))

  function handleAddItem(item: { barcode: string; name: string; nameAr: string; qty: number; unitPrice: number; notes?: string }): void {
    addItem(draft.id, item)
  }

  return (
    <div className="bg-surface border border-border rounded p-sm flex flex-col gap-sm shadow-sm">
      {/* رأس المحرر: النوع والفرع */}
      <div className="bg-surface-alt p-xs rounded border border-border flex flex-wrap items-center justify-between gap-sm">
        <div className="flex items-center gap-xs flex-wrap">
          <Badge variant={secondary ? 'secondary' : 'primary'}>{draft.id}</Badge>
          <span className="font-bold text-bg-f text-xs ms-xs me-xs flex items-center gap-xs">
            <ListChecks className="w-3.5 h-3.5 text-primary" />
            {t('inv.typeLabel')}
          </span>
          {INVOICE_TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={`px-sm py-xs rounded text-xs font-bold border transition-all ${
                draft.type === type
                  ? 'bg-primary text-primary-f border-primary shadow-sm'
                  : 'bg-surface text-bg-f border-border hover:bg-hover'
              }`}
              aria-pressed={draft.type === type}
              onClick={() => patchTab(draft.id, { type })}
            >
              {t(`enum.type.${type}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-xs">
          <label
            htmlFor={`branchSelect-${draft.id}`}
            className="font-bold text-bg-f text-xs whitespace-nowrap flex items-center gap-xs"
          >
            <Warehouse className="w-3.5 h-3.5 text-war" />
            {t('inv.branchLabel')}
          </label>
          <Select
            id={`branchSelect-${draft.id}`}
            value={draft.branchId}
            options={branchOptions}
            className="font-bold text-primary !w-56 !py-xs text-xs"
            onChange={event => patchTab(draft.id, { branchId: event.target.value })}
          />
        </div>
      </div>

      {/* الأصناف + العميل */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-sm">
        <div className="lg:col-span-7">
          <ProductEntryCard
            draft={draft}
            onAdd={handleAddItem}
            onUpdateTier={(tier: PriceTier) => setPriceTier(draft.id, tier)}
          />
        </div>
        <div className="lg:col-span-3">
          <CustomerCard draft={draft} />
        </div>
      </div>

      {/* البنود + المعاينة */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-sm">
        <div className="lg:col-span-7">
          <InvoiceItemsTable draft={draft} />
        </div>
        <div className="lg:col-span-3">
          <InvoiceSidePanel draft={draft} />
        </div>
      </div>

      {/* الإجماليات والعمليات */}
      <InvoiceTotalsBar draft={draft} onHold={() => onHold(draft)} onSave={() => onSave(draft)} onClose={() => onClose(draft)} />
    </div>
  )
}
