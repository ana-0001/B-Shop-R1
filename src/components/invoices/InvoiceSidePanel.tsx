/** src/components/invoices/InvoiceSidePanel.tsx — اللوحة الجانبية: معاينة حرارية أو ملاحظات الفاتورة */
import { useState } from 'react'
import { Receipt, StickyNote, Plus, X, ChevronRight } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency } from '@/utils/format'
import { localizedEntityName } from '@/types'
import type { InvoiceDraft } from '@/stores/invoices'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface InvoiceSidePanelProps {
  draft: InvoiceDraft
}

export function InvoiceSidePanel({ draft }: InvoiceSidePanelProps) {
  const { t, locale } = useI18n()
  const patchTab = useInvoicesStore(state => state.patchTab)
  const addNote = useInvoicesStore(state => state.addNote)
  const removeNote = useInvoicesStore(state => state.removeNote)
  const { meta } = useSystemMeta()
  const [memoValue, setMemoValue] = useState('')

  const amounts = computeInvoiceAmounts(draft)

  const branch = meta?.branches.find(entry => entry.id === draft.branchId)
  const branchName = branch ? localizedEntityName(branch, locale) : draft.branchId

  function handleAddMemo(): void {
    addNote(draft.id, memoValue)
    setMemoValue('')
  }

  return (
    <div className="bg-bg p-sm rounded border border-border flex flex-col justify-between gap-xs">
      {/* تبويبات المعاينة / الملاحظات */}
      <div className="flex items-center gap-xs border-b border-border pb-xs mb-xs text-xs font-bold">
        <button
          type="button"
          className={`px-sm py-xs rounded flex items-center gap-xs ${draft.sideTab !== 'notes' ? 'bg-accent text-accent-f shadow-sm' : 'bg-surface-alt text-muted-f'}`}
          onClick={() => patchTab(draft.id, { sideTab: 'preview' })}
        >
          <Receipt className="w-3.5 h-3.5" />
          {t('inv.previewTab')}
        </button>
        <button
          type="button"
          className={`px-sm py-xs rounded flex items-center gap-xs ${draft.sideTab === 'notes' ? 'bg-accent text-accent-f shadow-sm' : 'bg-surface-alt text-muted-f'}`}
          onClick={() => patchTab(draft.id, { sideTab: 'notes' })}
        >
          <StickyNote className="w-3.5 h-3.5" />
          {t('inv.notesTab')} ({draft.notes.length})
        </button>
      </div>

      {/* المعاينة الحرارية */}
      {draft.sideTab !== 'notes' && (
        <div className="flex-1">
          <div className="invoice-preview-paper rounded p-sm text-xs overflow-y-auto max-h-[11.875em] font-mono leading-tight border border-border">
            <div className="text-center font-bold border-b border-dashed border-border pb-xs mb-xs">
              <div className="text-sm font-extrabold">B-SHOP ERP</div>
              <div className="text-xs text-muted-f">{branchName}</div>
              <div>*** {t(`enum.type.${draft.type}`)} ***</div>
            </div>

            <div className="border-b border-dashed border-border pb-xs mb-xs space-y-xs text-xs">
              <div>
                #{draft.id} | {locale === 'ar' && draft.customerNameAr ? draft.customerNameAr : draft.customerName}
              </div>
            </div>

            <div className="space-y-xs font-bold pt-xs">
              <div className="flex justify-between">
                <span>{t('inv.subtotal')}:</span>
                <span>{formatCurrency(amounts.gross, locale)}</span>
              </div>
              <div className="flex justify-between text-err">
                <span>{t('inv.discount')}:</span>
                <span>-{formatCurrency(draft.discount, locale)}</span>
              </div>
              <div className="flex justify-between text-war">
                <span>{t('inv.tax')}:</span>
                <span>+{formatCurrency(amounts.tax, locale)}</span>
              </div>
              <div className="flex justify-between text-ok text-xs border-t border-border pt-xs mt-xs">
                <span>{t('inv.netTotal')}:</span>
                <span>{formatCurrency(amounts.net, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ملاحظات الفاتورة */}
      {draft.sideTab === 'notes' && (
        <div className="flex-1 flex flex-col justify-between space-y-sm">
          <div className="space-y-xs">
            <label className="block font-bold text-muted-f text-xs">{t('inv.addMemo')}</label>
            <div className="flex gap-xs">
              <Input
                value={memoValue}
                type="text"
                placeholder={t('inv.memoPlaceholder')}
                className="flex-1 text-xs"
                aria-label="Invoice memo"
                onKeyDown={event => event.key === 'Enter' && handleAddMemo()}
                onChange={event => setMemoValue(event.target.value)}
              />
              <Button variant="primary" size="sm" aria-label="Add Note" onClick={handleAddMemo}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="max-h-[8.75em] overflow-y-auto space-y-xs border border-border rounded p-xs bg-surface-alt">
            {draft.notes.map((note, index) => (
              <div
                key={`${note}-${index}`}
                className="bg-surface text-bg-f p-xs rounded border border-border text-xs flex justify-between items-center gap-xs"
              >
                <span className="flex items-center gap-xs">
                  <ChevronRight className="w-3 h-3 text-accent icon-directional" />
                  {note}
                </span>
                <button
                  type="button"
                  className="text-err"
                  aria-label="Delete note"
                  onClick={() => removeNote(draft.id, index)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
