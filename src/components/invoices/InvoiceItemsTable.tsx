/** src/components/invoices/InvoiceItemsTable.tsx — جدول بنود الفاتورة (كمية قابلة للتعديل + حذف) */
import { Trash2 } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { InvoiceDraft } from '@/stores/invoices'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/shared/EmptyState'

export interface InvoiceItemsTableProps {
  draft: InvoiceDraft
}

export function InvoiceItemsTable({ draft }: InvoiceItemsTableProps) {
  const { t, locale } = useI18n()
  const updateItemQty = useInvoicesStore(state => state.updateItemQty)
  const removeItem = useInvoicesStore(state => state.removeItem)

  function onQtyChange(itemId: string, value: string): void {
    updateItemQty(draft.id, itemId, Number(value))
  }

  return (
    <div className="bg-surface rounded border border-border overflow-auto min-h-[12.5em] max-h-[16.875em]">
      <Table className="!text-xs border-collapse">
        <TableHead className="sticky top-0 z-above">
          <tr>
            <TableHeaderCell className="!text-center !w-8 border-b border-border">#</TableHeaderCell>
            <TableHeaderCell className="!text-center !w-24 border-b border-border">{t('inv.barcode')}</TableHeaderCell>
            <TableHeaderCell className="border-b border-border">{t('inv.itemName')}</TableHeaderCell>
            <TableHeaderCell className="!text-center !w-16 border-b border-border">{t('inv.qty')}</TableHeaderCell>
            <TableHeaderCell className="!text-center !w-24 border-b border-border">{t('inv.unitPrice')}</TableHeaderCell>
            <TableHeaderCell className="!text-center !w-28 border-b border-border">{t('inv.lineTotal')}</TableHeaderCell>
            <TableHeaderCell className="!text-center !w-10 border-b border-border" aria-label="Actions" />
          </tr>
        </TableHead>
        <TableBody>
          {draft.items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-md text-center text-muted-f font-bold">
                <EmptyState message={t('inv.emptyItems')} />
              </td>
            </tr>
          )}
          {draft.items.map((item, index) => (
            <tr key={item.id} className="hover:bg-hover font-semibold">
              <TableCell className="p-xs !text-center text-muted-f font-mono border-b border-border">
                {formatNumber(index + 1, locale)}
              </TableCell>
              <TableCell className="p-xs !text-center font-mono border-b border-border">{item.barcode}</TableCell>
              <TableCell className="p-xs border-b border-border">
                <div className="font-bold text-primary">
                  {locale === 'ar' && item.nameAr ? item.nameAr : item.name}
                </div>
                {item.notes && <div className="text-xs text-muted-f font-normal">{item.notes}</div>}
              </TableCell>
              <TableCell className="p-xs !text-center border-b border-border">
                <input
                  type="number"
                  min={1}
                  defaultValue={item.qty}
                  key={`${item.id}-${item.qty}`}
                  className="w-14 text-center border border-border rounded font-bold font-mono bg-surface"
                  aria-label="Item quantity"
                  onChange={event => onQtyChange(item.id, event.target.value)}
                />
              </TableCell>
              <TableCell className="p-xs !text-end font-bold font-mono text-ok border-b border-border">
                {formatCurrency(item.unitPrice, locale)}
              </TableCell>
              <TableCell className="p-xs !text-end font-bold font-mono text-primary border-b border-border">
                {formatCurrency(item.total, locale)}
              </TableCell>
              <TableCell className="p-xs !text-center border-b border-border">
                <button
                  type="button"
                  className="text-err hover:opacity-80 px-xs"
                  aria-label="Remove item"
                  onClick={() => removeItem(draft.id, item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
