/** src/components/invoices/InvoiceTabBar.tsx — شريط تبويبات الفواتير (فتح/غلق/تقسيم/تعليق) */
import { X, FileText, Pause, Columns2, Plus } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore, useActiveTab } from '@/stores/invoices'
import { useAppState } from '@/stores/appState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function InvoiceTabBar() {
  const { t } = useI18n()
  const tabs = useInvoicesStore(state => state.tabs)
  const splitView = useInvoicesStore(state => state.splitView)
  const secondaryTabId = useInvoicesStore(state => state.secondaryTabId)
  const selectTab = useInvoicesStore(state => state.selectTab)
  const closeTab = useInvoicesStore(state => state.closeTab)
  const toggleSplitView = useInvoicesStore(state => state.toggleSplitView)
  const createTab = useInvoicesStore(state => state.createTab)
  const activeTab = useActiveTab()
  const heldDialogOpen = useAppState(state => state.heldDialogOpen)
  const setHeldDialogOpen = useAppState(state => state.setHeldDialogOpen)
  const heldCount = useAppState(state => state.heldCount)

  return (
    <div className="bg-bg border-b border-border p-xs flex items-center justify-between overflow-x-auto select-none gap-sm">
      {/* التبويبات المفتوحة */}
      <div className="flex items-center gap-xs overflow-x-auto" role="tablist" aria-label="Open Invoice Tabs">
        {tabs.map((tab, tabIndex) => {
          const isActive = tab.id === activeTab?.id
          const isSecondary = tab.id === secondaryTabId && splitView
          return (
            <button
              key={`${tab.id}-${tabIndex}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`flex items-center gap-xs px-md py-xs rounded-t font-bold text-xs border-t-2 transition-all ${
                isActive
                  ? 'bg-surface text-primary border-primary shadow-sm'
                  : isSecondary
                    ? 'bg-surface-alt text-secondary border-secondary'
                    : 'bg-bg text-muted-f border-transparent hover:bg-hover'
              }`}
              onClick={() => selectTab(tab.id)}
            >
              <span className="flex items-center gap-xs">
                <FileText className={`w-3 h-3 ${isActive ? 'text-primary' : 'text-muted-f'}`} />
                {tab.id}
                <span className="text-muted-f font-normal">({t(`enum.type.${tab.type}`)})</span>
              </span>
              <span
                role="button"
                tabIndex={0}
                className="text-muted-f hover:text-err px-xs rounded text-xs"
                aria-label={`Close ${tab.id}`}
                onClick={event => {
                  event.stopPropagation()
                  void closeTab(tab.id)
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.stopPropagation()
                    void closeTab(tab.id)
                  }
                }}
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          )
        })}
      </div>

      {/* أدوات مساحة العمل */}
      <div className="flex items-center gap-xs ps-md border-s border-border">
        <Button variant="ghost" size="sm" onClick={() => setHeldDialogOpen(!heldDialogOpen)}>
          <Pause className="w-3.5 h-3.5 text-war" />
          <span className="hidden md:inline">{t('inv.holdBtn')}</span>
          <Badge variant="war">{heldCount}</Badge>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void toggleSplitView()}>
          <Columns2 className="w-3.5 h-3.5 text-accent" />
          <span className="hidden md:inline">{t('inv.splitBtn')}</span>
        </Button>
        <Button variant="primary" size="sm" onClick={() => void createTab()}>
          <Plus className="w-3.5 h-3.5" />
          <span>{t('util.newInvoice')}</span>
        </Button>
      </div>
    </div>
  )
}
