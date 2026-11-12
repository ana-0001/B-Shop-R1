/** src/pages/AccountsPage.tsx — الحسابات المالية: ملخص الإيرادات/المشتريات/المرتجعات + دفتر الفواتير */
import { useCallback, useEffect, useState } from 'react'
import { Banknote, ShoppingCart, Repeat2, Archive } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useOnDataRefresh } from '@/hooks/useAppData'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { accountsApi } from '@/services/api/endpoints'
import { computeInvoiceAmounts } from '@/utils/invoice'
import { formatCurrency } from '@/utils/format'
import { invoiceCustomerName } from '@/types'
import type { AccountTotals, InvoiceStatus } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { SyncSkeleton } from '@/components/shared/SyncSkeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardTitle } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AccountsPage() {
  const { t, locale } = useI18n()
  const loadMeta = useSystemMeta().load
  useDocumentTitle('B-Shop — Accounting')

  const [totals, setTotals] = useState<AccountTotals | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTotals = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await loadMeta()
      const tabs = useInvoicesStore.getState().tabs
      setTotals(await accountsApi.totals(tabs))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void fetchTotals()
  }, [fetchTotals])

  useOnDataRefresh(() => void fetchTotals())

  function statusVariant(status: InvoiceStatus): 'primary' | 'ok' | 'war' {
    if (status === 'POSTED') return 'ok'
    if (status === 'HELD') return 'war'
    return 'primary'
  }

  return (
    <div>
      {isLoading && !totals && <SyncSkeleton />}

      {totals && (
        <section className="space-y-md" aria-labelledby="accountsTitle">
          <PageHeader
            kicker={t('acc.kicker')}
            kickerClass="text-ok"
            title={t('acc.title')}
            subtitle={t('acc.subtitle')}
          />

          {/* ملخص مالي */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-sm">
            <StatCard title={t('acc.salesTotal')} value={formatCurrency(totals.salesTotal, locale)} icon={Banknote} iconClass="text-ok" />
            <StatCard title={t('acc.purchaseTotal')} value={formatCurrency(totals.purchaseTotal, locale)} icon={ShoppingCart} iconClass="text-primary" />
            <StatCard title={t('acc.returnTotal')} value={formatCurrency(totals.returnTotal, locale)} icon={Repeat2} iconClass="text-war" />
            <StatCard title={t('util.heldInvoices')} value={totals.heldCount.toString()} icon={Archive} iconClass="text-secondary" />
          </div>

          {/* دفتر الفواتير المالي */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-md border-b border-border">
              <CardTitle>{t('acc.ledgerTitle')}</CardTitle>
            </div>

            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>{t('tbl.invoiceId')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.customer')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.type')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.subtotal')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.discount')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.tax')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.netAmount')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.status')}</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {totals.ledger.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState message={t('tbl.empty')} />
                    </TableCell>
                  </TableRow>
                )}
                {totals.ledger.map((invoice, invoiceIndex) => (
                  <TableRow key={`${invoice.id}-${invoiceIndex}`}>
                    <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
                    <TableCell className="font-semibold">{invoiceCustomerName(invoice, locale)}</TableCell>
                    <TableCell>{t(`enum.type.${invoice.type}`)}</TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(computeInvoiceAmounts(invoice).gross, locale)}
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-err">{formatCurrency(invoice.discount, locale)}</TableCell>
                    <TableCell className="font-mono font-semibold text-war">{formatCurrency(computeInvoiceAmounts(invoice).tax, locale)}</TableCell>
                    <TableCell className="font-mono font-semibold text-ok">{formatCurrency(computeInvoiceAmounts(invoice).net, locale)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(invoice.status)}>{t(`enum.status.${invoice.status}`)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}
    </div>
  )
}
