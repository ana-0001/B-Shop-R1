/** src/components/dashboard/RecentInvoicesTable.tsx — جدول آخر الفواتير مع فلتر البحث العام */
import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, PenLine } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency, formatNumber } from '@/utils/format'
import { invoiceCustomerName, localizedEntityName } from '@/types'
import type { Invoice, InvoiceStatus, InvoiceType } from '@/types'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'

export interface RecentInvoicesTableProps {
  invoices: Invoice[]
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { meta } = useSystemMeta()
  const selectTab = useInvoicesStore(state => state.selectTab)

  /** فلتر البحث العام (q من شريط الأدوات) على رقم الفاتورة/العميل/الأصناف */
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices
    return invoices.filter(
      invoice =>
        invoice.id.toLowerCase().includes(searchQuery)
        || invoiceCustomerName(invoice, locale).toLowerCase().includes(searchQuery)
        || invoice.items.some(
          item => item.name.toLowerCase().includes(searchQuery) || item.barcode.includes(searchQuery),
        ),
    )
  }, [invoices, searchQuery, locale])

  function branchName(branchId: string): string {
    const branch = meta?.branches.find(entry => entry.id === branchId)
    return branch ? localizedEntityName(branch, locale) : branchId
  }

  function statusVariant(status: InvoiceStatus): 'primary' | 'ok' | 'war' {
    if (status === 'POSTED') return 'ok'
    if (status === 'HELD') return 'war'
    return 'primary'
  }

  function typeVariant(type: InvoiceType): 'primary' | 'accent' | 'secondary' {
    if (type === 'PURCHASE') return 'accent'
    if (type === 'RETURN') return 'secondary'
    return 'primary'
  }

  /** فتح المسودة المفتوحة في مساحة الفواتير */
  function openInvoice(invoice: Invoice): void {
    if (invoice.status !== 'OPEN') return
    selectTab(invoice.id)
    navigate(`/invoices?focus=${invoice.id}`)
  }

  return (
    <article className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
      <header className="flex items-center justify-between p-md border-b border-border gap-sm flex-wrap">
        <div>
          <h2 className="font-extrabold text-bg-f">{t('dash.recentTitle')}</h2>
          <p className="text-xs text-muted-f mt-xs">{t('dash.recentSub')}</p>
        </div>
        <Link to="/invoices" className="text-primary text-xs font-bold hover:underline flex items-center gap-xs">
          <span>{t('dash.openWorkspace')}</span>
          <ArrowRight className="w-3.5 h-3.5 icon-directional" />
        </Link>
      </header>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('tbl.invoiceId')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.customer')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.type')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.branch')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.itemsCount')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.netAmount')}</TableHeaderCell>
            <TableHeaderCell>{t('tbl.status')}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredInvoices.length === 0 && (
            <TableRow>
              <TableCell className="text-center" colSpan={7}>
                <EmptyState message={t('tbl.empty')} />
              </TableCell>
            </TableRow>
          )}
          {filteredInvoices.slice(0, 8).map((invoice, invoiceIndex) => (
            <TableRow
              key={`${invoice.id}-${invoiceIndex}`}
              clickable={invoice.status === 'OPEN'}
              onClick={() => openInvoice(invoice)}
            >
              <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
              <TableCell className="font-semibold">{invoiceCustomerName(invoice, locale)}</TableCell>
              <TableCell>
                <Badge variant={typeVariant(invoice.type)}>{t(`enum.type.${invoice.type}`)}</Badge>
              </TableCell>
              <TableCell className="text-xs">{branchName(invoice.branchId)}</TableCell>
              <TableCell className="font-mono font-semibold">{formatNumber(invoice.items.length, locale)}</TableCell>
              <TableCell className="font-mono font-semibold">
                {formatCurrency(computeInvoiceAmounts(invoice).net, locale)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(invoice.status)}>
                  {invoice.status === 'POSTED' ? <Check className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
                  {t(`enum.status.${invoice.status}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  )
}
