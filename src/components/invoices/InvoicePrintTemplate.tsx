/**
 * src/components/invoices/InvoicePrintTemplate.tsx — قالب طباعة A4.
 * العنصر بره الشاشة (مش hidden) عشان محرك الطباعة يقدر يقرأ الستايلات المحسوبة.
 */
import { useI18n } from '@/hooks/useI18n'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency, formatNumber } from '@/utils/format'
import { formatDate } from '@/utils/dates'
import { invoiceCustomerName, localizedEntityName } from '@/types'
import type { Invoice } from '@/types'

export function InvoicePrintTemplate({ invoice }: { invoice: Invoice }) {
  const { t, locale } = useI18n()
  const { meta } = useSystemMeta()

  const amounts = computeInvoiceAmounts(invoice)

  const branch = meta?.branches.find(entry => entry.id === invoice.branchId)
  const branchName = branch ? localizedEntityName(branch, locale) : invoice.branchId

  return (
    <div id="bshop-invoice-print" className="print-anchor" aria-hidden="true">
      <main className="print-invoice">
        <header className="print-header">
          <div>
            <div className="print-brand">B-SHOP ERP</div>
            <div>{branchName}</div>
          </div>
          <div>
            <h1>{t(`enum.type.${invoice.type}`)}</h1>
            <div>#{invoice.id}</div>
          </div>
        </header>

        <section className="print-details">
          <div>
            <strong>{t('tbl.customer')}:</strong> {invoiceCustomerName(invoice, locale)}
          </div>
          <div>
            <strong>{t('nav.opDate')}</strong> {formatDate(invoice.postedAt ?? invoice.updatedAt, locale)}
          </div>
        </section>

        <table className="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('inv.barcode')}</th>
              <th>{t('inv.itemName')}</th>
              <th>{t('inv.qty')}</th>
              <th>{t('inv.unitPrice')}</th>
              <th>{t('inv.lineTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>{formatNumber(index + 1, locale)}</td>
                <td>{item.barcode}</td>
                <td className="print-item-name">
                  <strong>{locale === 'ar' && item.nameAr ? item.nameAr : item.name}</strong>
                </td>
                <td>{formatNumber(item.qty, locale)}</td>
                <td>{formatCurrency(item.unitPrice, locale)}</td>
                <td>{formatCurrency(item.total, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="print-summary">
          <div>
            <span>{t('inv.subtotal')}</span>
            <strong>{formatCurrency(amounts.gross, locale)}</strong>
          </div>
          <div>
            <span>{t('inv.discount')}</span>
            <strong>- {formatCurrency(invoice.discount, locale)}</strong>
          </div>
          <div>
            <span>{t('inv.tax')}</span>
            <strong>+ {formatCurrency(amounts.tax, locale)}</strong>
          </div>
          <div className="print-net">
            <span>{t('inv.netTotal')}</span>
            <strong>{formatCurrency(amounts.net, locale)}</strong>
          </div>
        </section>
      </main>
    </div>
  )
}
