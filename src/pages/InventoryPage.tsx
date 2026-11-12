/** src/pages/InventoryPage.tsx — المخازن والأصناف: فلتر الفرع + بحث + جدول قابل للفرز */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Package, Boxes, Warehouse } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useOnDataRefresh } from '@/hooks/useAppData'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useAppState } from '@/stores/appState'
import { useInvoicesStore } from '@/stores/invoices'
import { usePreferencesStore } from '@/stores/preferences'
import { inventoryApi } from '@/services/api/endpoints'
import { formatNumber } from '@/utils/format'
import { localizedEntityName } from '@/types'
import type { InventoryRow } from '@/types'
import { LOW_STOCK_THRESHOLD } from '@/utils/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { SyncSkeleton } from '@/components/shared/SyncSkeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import type { DataColumn } from '@/components/shared/DataTable'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardTitle } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function InventoryPage() {
  const { t, locale } = useI18n()
  const loadMeta = useSystemMeta().load
  const meta = useAppState(state => state.meta)
  const currentBranchId = usePreferencesStore(state => state.currentBranchId)
  const setCurrentBranch = usePreferencesStore(state => state.setCurrentBranch)
  useDocumentTitle('B-Shop — Inventory')

  const [rows, setRows] = useState<InventoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchInventory = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await loadMeta()
      const tabs = useInvoicesStore.getState().tabs
      const branchId = usePreferencesStore.getState().currentBranchId
      setRows(await inventoryApi.list(tabs, branchId))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void fetchInventory()
  }, [fetchInventory])

  useOnDataRefresh(() => void fetchInventory())

  // إعادة الجلب عند تغيير الفرع المختار (زي watch في المشروع الأصلي)
  const lastBranchRef = useMemo(() => ({ current: currentBranchId }), [])
  useEffect(() => {
    if (lastBranchRef.current !== currentBranchId) {
      lastBranchRef.current = currentBranchId
      void fetchInventory()
    }
  }, [currentBranchId, fetchInventory, lastBranchRef])

  /** إجماليات ملخص المخازن */
  const summary = useMemo(
    () => ({
      skuCount: rows.length,
      billedUnits: rows.reduce((sum, row) => sum + row.unitsBilled, 0),
      branchesCount: currentBranchId === 'ALL' ? (meta?.branches.length ?? 0) : 1,
    }),
    [rows, currentBranchId, meta],
  )

  /** خيارات فلتر الفرع */
  const branchOptions = useMemo(
    () => [
      { value: 'ALL', label: t('wh.allBranches') },
      ...(meta?.branches ?? []).map(branch => ({
        value: branch.id,
        label: localizedEntityName(branch, locale),
      })),
    ],
    [meta, t, locale],
  )

  /** اسم فئة/مصنع من بيانات النظام مع fallback لرقم المعرّف */
  function categoryName(categoryId: string): string {
    const category = meta?.categories.find(entry => entry.id === categoryId)
    return category ? localizedEntityName(category, locale) : categoryId
  }

  function manufacturerName(manufacturerId: string): string {
    const manufacturer = meta?.manufacturers.find(entry => entry.id === manufacturerId)
    return manufacturer ? localizedEntityName(manufacturer, locale) : manufacturerId
  }

  /** أعمدة جدول الأصناف — قابلة للفرز مع تنسيق مالي وعربي حسب اللغة */
  const columns = useMemo<DataColumn<InventoryRow>[]>(
    () => [
      {
        id: 'barcode',
        accessor: row => row.barcode,
        header: t('inv.barcode'),
        cell: row => <span className="font-mono font-semibold">{row.barcode}</span>,
      },
      {
        id: 'name',
        accessor: row => (locale === 'ar' ? row.nameAr : row.name),
        header: t('inv.itemName'),
        cell: row => <span className="font-semibold">{locale === 'ar' && row.nameAr ? row.nameAr : row.name}</span>,
      },
      {
        id: 'category',
        accessor: row => categoryName(row.categoryId),
        header: t('inv.category'),
        cell: row => <span className="text-xs">{categoryName(row.categoryId)}</span>,
      },
      {
        id: 'manufacturer',
        accessor: row => manufacturerName(row.manufacturerId),
        header: t('inv.manufacturer'),
        cell: row => <span className="text-xs">{manufacturerName(row.manufacturerId)}</span>,
      },
      {
        id: 'stock',
        accessor: row => row.stock,
        header: t('wh.stockColumn'),
        cell: row => (
          <Badge variant={row.stock <= LOW_STOCK_THRESHOLD ? 'war' : 'ok'}>
            {row.stock <= LOW_STOCK_THRESHOLD ? t('wh.lowStock') : t('wh.inStock')}
          </Badge>
        ),
      },
      {
        id: 'unitsBilled',
        accessor: row => row.unitsBilled,
        header: t('tbl.unitsBilled'),
        cell: row => <span className="font-mono font-semibold">{formatNumber(row.unitsBilled, locale)}</span>,
      },
      {
        id: 'invoicesCount',
        accessor: row => row.invoicesCount,
        header: t('tbl.invoices'),
        cell: row => <span className="font-mono font-semibold">{formatNumber(row.invoicesCount, locale)}</span>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale, meta],
  )

  const statIcons: Record<string, LucideIcon> = {
    sku: Package,
    units: Boxes,
    branches: Warehouse,
  }

  return (
    <div>
      {isLoading && rows.length === 0 && <SyncSkeleton />}

      <section className="space-y-md" aria-labelledby="warehouseTitle">
        <PageHeader
          kicker={t('wh.kicker')}
          kickerClass="text-war"
          title={t('wh.title')}
          actions={
            <label className="flex items-center gap-xs text-xs font-bold text-bg-f">
              <Warehouse className="w-3.5 h-3.5 text-war" />
              <span>{t('tbl.branch')}:</span>
              <Select
                value={currentBranchId}
                options={branchOptions}
                className="!w-56"
                aria-label="Branch filter"
                onChange={event => setCurrentBranch(event.target.value)}
              />
            </label>
          }
        />

        {/* ملخص المخازن */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
          <StatCard title={t('wh.skuCount')} value={formatNumber(summary.skuCount, locale)} icon={statIcons.sku} iconClass="text-primary" />
          <StatCard title={t('wh.billedUnits')} value={formatNumber(summary.billedUnits, locale)} icon={statIcons.units} iconClass="text-ok" />
          <StatCard title={t('wh.activeBranches')} value={formatNumber(summary.branchesCount, locale)} icon={statIcons.branches} iconClass="text-secondary" />
        </div>

        {/* جدول الأصناف */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-md border-b border-border flex flex-wrap items-center justify-between gap-sm">
            <CardTitle>{t('wh.title')}</CardTitle>
            <div className="w-full sm:w-64">
              <Input
                type="search"
                value={searchQuery}
                placeholder={t('wh.searchPlaceholder')}
                aria-label="Inventory search"
                onChange={event => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
          <DataTable data={rows} columns={columns} globalFilter={searchQuery.trim()} />
        </Card>
      </section>
    </div>
  )
}
