/**
 * src/layouts/DefaultLayout.tsx — شل النظام الرئيسي:
 * شريط التنقل + الإجراءات السريعة + البحث العام + الفرع + التاريخ + قائمة المستخدم
 * + شريط الحالة النظامي (SystemStatusBar) في الفوتر أسفل مساحة العمل.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChartPie,
  FileText,
  Coins,
  Warehouse,
  ChartColumn,
  FilePlus2,
  Archive,
  CloudDownload,
  Database,
  Bug,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { refreshMockData, resetMockDb } from '@/hooks/useAppData'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore } from '@/stores/invoices'
import { usePreferencesStore } from '@/stores/preferences'
import { useAppState } from '@/stores/appState'
import { invoicesApi } from '@/services/api/endpoints'
import { onBusEvent } from '@/utils/bus'
import { formatDate } from '@/utils/dates'
import { localizedEntityName } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { GlobalSearch } from '@/components/shared/GlobalSearch'
import { HeldInvoicesDialog } from '@/components/shared/HeldInvoicesDialog'
import { ResetDbDialog } from '@/components/shared/ResetDbDialog'
import { SyncSkeleton } from '@/components/shared/SyncSkeleton'
import { SystemStatusBar } from '@/components/system-status-bar/SystemStatusBar'

/** عناصر شريط التنقل الرئيسي */
const navItems: Array<{ to: string; labelKey: string; icon: LucideIcon }> = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: ChartPie },
  { to: '/invoices', labelKey: 'nav.invoices', icon: FileText },
  { to: '/accounts', labelKey: 'nav.accounts', icon: Coins },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Warehouse },
  { to: '/reports', labelKey: 'nav.reports', icon: ChartColumn },
]

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n()
  const { toast } = useSonner()
  const navigate = useNavigate()
  const location = useLocation()
  const { load } = useSystemMeta()
  const invoicesStore = useInvoicesStore()
  const preferences = usePreferencesStore()
  const appState = useAppState()

  const [heldCountLoaded, setHeldCountLoaded] = useState(false)

  function isActive(to: string): boolean {
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  /** عدد الفواتير المعلّقة لشارة شريط الأدوات — حالة مشتركة بين الـ layout وشريط التبويبات */
  async function refreshHeldCount(): Promise<void> {
    try {
      appState.setHeldCount((await invoicesApi.listHeld()).length)
    } catch {
      appState.setHeldCount(0)
    }
    setHeldCountLoaded(true)
  }

  useEffect(() => {
    void load().then(() => refreshHeldCount())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // تحديث الشارة مع كل مزامنة أو تصفير أو رجوع من شاشة الفواتير
  useEffect(() => {
    void refreshHeldCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    const offSync = onBusEvent('bshop:sync', () => void refreshHeldCount())
    const offReset = onBusEvent('bshop:db-reset', () => void refreshHeldCount())
    return () => {
      offSync()
      offReset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** إجراءات سريعة */
  function newInvoice(): void {
    navigate('/invoices?new=1')
  }

  function openHeldDialog(): void {
    appState.setHeldDialogOpen(true)
  }

  function openResetDialog(): void {
    appState.setResetDialogOpen(true)
  }

  /** محاكاة خطأ 500 لاختبار الـ Error Boundary (وضع التطوير فقط) */
  function simulateCrash(): void {
    appState.setFatalError({
      statusCode: 500,
      statusMessage: 'Simulated runtime exception for error-boundary testing.',
    })
  }

  /** خيارات الفرع في شريط الأدوات */
  const branchOptions = useMemo(
    () => [
      { value: 'ALL', label: t('wh.allBranches') },
      ...(appState.meta?.branches ?? []).map(branch => ({
        value: branch.id,
        label: localizedEntityName(branch, locale),
      })),
    ],
    [appState.meta, t, locale],
  )

  /** تاريخ العمليات الحالي من بيانات النظام */
  const operationDate = appState.meta ? formatDate(appState.meta.operationDate, locale) : ''

  // ===== اختصارات لوحة المفاتيح (نفس ملف التصميم) =====
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent): void {
      if (!event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'l') {
        event.preventDefault()
        setLocale(locale === 'en' ? 'ar' : 'en', true)
      }
      if (key === 't') {
        event.preventDefault()
        const next = preferences.cycleTheme()
        toast.info(t('notif.themeSet', { mode: next.toUpperCase() }))
      }
      if (key === 'n') {
        event.preventDefault()
        newInvoice()
      }
      if (key === 's') {
        event.preventDefault()
        void invoicesStore.toggleSplitView()
        navigate('/invoices')
      }
      if (key === 'h') {
        event.preventDefault()
        openHeldDialog()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, t, setLocale])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* شريط التنقل والإجراءات السريعة */}
      <nav
        className="bg-surface-alt border-b border-border px-md py-xs flex flex-wrap justify-between items-center gap-md"
        aria-label="Utility Navigation"
      >
        <div className="flex items-center gap-xs text-xs font-bold text-bg-f flex-wrap" role="tablist">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                role="tab"
                aria-selected={isActive(item.to)}
                className={`px-md py-xs rounded font-bold text-xs flex items-center gap-sm border transition-all ${
                  isActive(item.to)
                    ? 'bg-primary text-primary-f border-primary shadow-sm'
                    : 'bg-surface text-bg-f border-border hover:bg-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-sm flex-wrap">
          {/* إجراءات سريعة */}
          <div className="flex items-center gap-xs text-xs font-bold flex-wrap">
            <Button variant="ghost" size="sm" title="Shortcut: Alt+N" onClick={newInvoice}>
              <FilePlus2 className="w-3.5 h-3.5 text-primary" />
              <span className="hidden lg:inline">{t('util.newInvoice')}</span>
            </Button>
            <Button variant="ghost" size="sm" title="Held Invoices (Alt+H)" aria-haspopup="dialog" onClick={openHeldDialog}>
              <Archive className="w-3.5 h-3.5 text-war" />
              <span className="hidden lg:inline">{t('util.heldInvoices')}</span>
              <Badge variant="war">{heldCountLoaded ? appState.heldCount : 0}</Badge>
            </Button>
            <Button variant="ghost" size="sm" title="Sync Mock API" onClick={() => void refreshMockData()}>
              <CloudDownload className="w-3.5 h-3.5 text-accent" />
              <span className="hidden lg:inline">{t('util.syncApi')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={openResetDialog}>
              <Database className="w-3.5 h-3.5 text-ok" />
              <span className="hidden lg:inline">{t('util.resetDb')}</span>
            </Button>
            {import.meta.env.DEV && (
              <Button variant="ghost" size="sm" className="text-err" onClick={simulateCrash}>
                <Bug className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t('util.test500')}</span>
              </Button>
            )}
          </div>

          {/* البحث العام */}
          <div className="flex items-center gap-sm flex-1 min-w-[12rem] max-w-[26rem]">
            <GlobalSearch />
          </div>

          {/* الفرع الحالي + تاريخ العمليات */}
          <div className="flex items-center gap-xs text-xs font-bold text-bg-f">
            <Select
              value={preferences.currentBranchId}
              options={branchOptions}
              className="!w-48"
              aria-label="Current branch"
              onChange={event => preferences.setCurrentBranch(event.target.value)}
            />
            {operationDate && (
              <span className="hidden xl:flex items-center gap-xs border border-border rounded px-sm py-1 bg-surface">
                {t('nav.opDate')}
                <strong className="font-mono">{operationDate}</strong>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* محتوى الصفحة مع غلاف الـ Skeleton أثناء المزامنة */}
      {appState.isSyncing ? (
        <SyncSkeleton />
      ) : (
        <main className="erp-section space-y-md">{children}</main>
      )}

      {/* شريط الحالة النظامي (PRD) — فوتر مساحة العمل */}
      <SystemStatusBar />

      <HeldInvoicesDialog />
      <ResetDbDialog />
    </div>
  )
}
