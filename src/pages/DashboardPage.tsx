/** src/pages/DashboardPage.tsx — لوحة التحكم التنفيذية (بطاقات + شارت أسبوعي + توزيع + آخر الفواتير) */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, FileText, Boxes, Users, Pause, Plus } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useOnDataRefresh } from '@/hooks/useAppData'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { useAppState } from '@/stores/appState'
import { dashboardApi } from '@/services/api/endpoints'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { DashboardSummary } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { SyncSkeleton } from '@/components/shared/SyncSkeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeeklyRevenueChart } from '@/components/dashboard/WeeklyRevenueChart'
import { InvoiceTypeDonut } from '@/components/dashboard/InvoiceTypeDonut'
import { RecentInvoicesTable } from '@/components/dashboard/RecentInvoicesTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function DashboardPage() {
  const { t, locale } = useI18n()
  const loadMeta = useSystemMeta().load
  const navigate = useNavigate()
  const setHeldDialogOpen = useAppState(state => state.setHeldDialogOpen)
  useDocumentTitle('B-Shop — Dashboard')

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      // ضمان تحميل بيانات النظام (الفروع) قبل ملخص لوحة التحكم
      await loadMeta()
      const tabs = useInvoicesStore.getState().tabs
      setSummary(await dashboardApi.summary(tabs, locale))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  // إعادة الجلب مع كل مزامنة (زي onDataRefresh في المشروع الأصلي)
  useOnDataRefresh(() => void fetchSummary())

  function createInvoice(): void {
    navigate('/invoices?new=1')
  }

  return (
    <div>
      {isLoading && !summary && <SyncSkeleton />}

      {summary && (
        <section className="space-y-md" aria-labelledby="dashboardTitle">
          <PageHeader
            kicker={t('dash.kicker')}
            kickerClass="text-primary"
            title={t('dash.title')}
            subtitle={t('dash.subtitle')}
            actions={
              <>
                <Button size="md" onClick={() => setHeldDialogOpen(true)}>
                  <Pause className="w-3.5 h-3.5 text-war" />
                  <span>{t('util.heldInvoices')}</span>
                  <Badge variant="war">{summary.heldCount}</Badge>
                </Button>
                <Button variant="primary" size="md" onClick={createInvoice}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('dash.createBtn')}</span>
                </Button>
              </>
            }
          />

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-sm">
            <StatCard
              title={t('dash.card1Title')}
              value={formatCurrency(summary.totalNet, locale)}
              sub={t('dash.card1Sub')}
              icon={Banknote}
              iconClass="text-primary"
            />
            <StatCard
              title={t('dash.card2Title')}
              value={formatNumber(summary.invoiceCount, locale)}
              sub={`${formatNumber(summary.openCount, locale)} ${t('enum.status.OPEN')} · ${formatNumber(summary.postedCount, locale)} ${t('enum.status.POSTED')}`}
              icon={FileText}
              iconClass="text-accent"
            />
            <StatCard
              title={t('dash.card3Title')}
              value={formatNumber(summary.itemUnits, locale)}
              sub={t('dash.card3Sub')}
              icon={Boxes}
              iconClass="text-ok"
            />
            <StatCard
              title={t('dash.card4Title')}
              value={formatNumber(summary.customerCount, locale)}
              sub={t('dash.card4Sub')}
              icon={Users}
              iconClass="text-war"
            />
          </div>

          {/* الشارت الأسبوعي + دائرة التوزيع */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-sm">
            <Card className="xl:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>{t('dash.chartTitle')}</CardTitle>
                  <CardDescription>{t('dash.chartSub')}</CardDescription>
                </div>
                <Badge variant="primary">{t('dash.last7Days')}</Badge>
              </CardHeader>
              <WeeklyRevenueChart series={summary.weekSeries} />
            </Card>

            <Card>
              <CardTitle>{t('dash.donutTitle')}</CardTitle>
              <CardDescription>{t('dash.donutSub')}</CardDescription>
              <InvoiceTypeDonut distribution={summary.typeDistribution} totalCount={summary.invoiceCount} />
            </Card>
          </div>

          {/* آخر الفواتير */}
          <RecentInvoicesTable invoices={summary.recentInvoices} />
        </section>
      )}
    </div>
  )
}
