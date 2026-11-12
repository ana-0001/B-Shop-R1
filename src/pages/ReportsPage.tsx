/** src/pages/ReportsPage.tsx — التقارير التحليلية حسب نوع الفاتورة (بيع/شراء/مرتجع) */
import { useCallback, useEffect, useState } from 'react'
import { RotateCcw, FileText, Banknote, Receipt } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useOnDataRefresh } from '@/hooks/useAppData'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { reportsApi } from '@/services/api/endpoints'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { ReportSummary, InvoiceType } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { SyncSkeleton } from '@/components/shared/SyncSkeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function ReportsPage() {
  const { t, locale } = useI18n()
  const loadMeta = useSystemMeta().load
  useDocumentTitle('B-Shop — Reports')

  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await loadMeta()
      const tabs = useInvoicesStore.getState().tabs
      setSummary(await reportsApi.summary(tabs))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  useOnDataRefresh(() => void fetchSummary())

  /** نسبة كل نوع من إجمالي الفواتير لأشرطة التوزيع */
  function typeShare(invoiceCount: number): number {
    if (!summary || summary.invoiceCount === 0) return 0
    return Math.max(4, Math.round((invoiceCount / summary.invoiceCount) * 100))
  }

  function barClass(type: InvoiceType): string {
    if (type === 'SALE') return 'bg-primary'
    if (type === 'PURCHASE') return 'bg-ok'
    return 'bg-war'
  }

  return (
    <div>
      {isLoading && !summary && <SyncSkeleton />}

      {summary && (
        <section className="space-y-md" aria-labelledby="reportsTitle">
          <PageHeader
            kicker={t('rep.kicker')}
            kickerClass="text-secondary"
            title={t('rep.title')}
            actions={
              <Button size="md" onClick={() => void fetchSummary()}>
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span>{t('rep.refresh')}</span>
              </Button>
            }
          />

          {/* البطاقات الرئيسية */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
            <StatCard title={t('dash.card2Title')} value={formatNumber(summary.invoiceCount, locale)} icon={FileText} iconClass="text-primary" />
            <StatCard title={t('dash.card1Title')} value={formatCurrency(summary.totalNet, locale)} icon={Banknote} iconClass="text-ok" />
            <StatCard title={t('rep.avgTicket')} value={formatCurrency(summary.averageTicket, locale)} icon={Receipt} iconClass="text-secondary" />
          </div>

          {/* توزيع الأنواع + الملخص التشغيلي */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-sm">
            <Card>
              <CardTitle className="!mb-md">{t('rep.byType')}</CardTitle>
              <div className="space-y-md">
                {summary.rows.map(row => (
                  <div key={row.type}>
                    <div className="flex justify-between text-xs font-bold mb-xs">
                      <span>{t(`enum.type.${row.type}`)}</span>
                      <span className="font-mono">{formatNumber(row.invoices, locale)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-alt overflow-hidden">
                      <div
                        className={`${barClass(row.type)} h-full rounded-full transition-all`}
                        style={{ inlineSize: `${typeShare(row.invoices)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle className="!mb-md">{t('rep.opSummary')}</CardTitle>
              <div className="space-y-sm text-sm">
                <div className="flex justify-between border-b border-border pb-sm">
                  <span className="text-muted-f">{t('rep.totalUnits')}</span>
                  <strong className="font-mono">{formatNumber(summary.totalUnits, locale)}</strong>
                </div>
                <div className="flex justify-between border-b border-border pb-sm">
                  <span className="text-muted-f">{t('rep.totalDiscounts')}</span>
                  <strong className="font-mono text-err">{formatCurrency(summary.totalDiscounts, locale)}</strong>
                </div>
                <div className="flex justify-between border-b border-border pb-sm">
                  <span className="text-muted-f">{t('rep.postedInvoices')}</span>
                  <strong className="font-mono text-ok">{formatNumber(summary.postedCount, locale)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-f">{t('rep.heldRow')}</span>
                  <strong className="font-mono text-war">{formatNumber(summary.heldCount, locale)}</strong>
                </div>
              </div>
            </Card>
          </div>

          {/* جدول الأنواع */}
          <Card className="!p-0 overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>{t('tbl.type')}</TableHeaderCell>
                  <TableHeaderCell>{t('dash.card2Title')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.itemsCount')}</TableHeaderCell>
                  <TableHeaderCell>{t('tbl.netAmount')}</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {summary.rows.map(row => (
                  <TableRow key={row.type}>
                    <TableCell className="font-bold">{t(`enum.type.${row.type}`)}</TableCell>
                    <TableCell className="font-mono font-semibold">{formatNumber(row.invoices, locale)}</TableCell>
                    <TableCell className="font-mono font-semibold">{formatNumber(row.items, locale)}</TableCell>
                    <TableCell className="font-mono font-semibold text-ok">{formatCurrency(row.netTotal, locale)}</TableCell>
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
