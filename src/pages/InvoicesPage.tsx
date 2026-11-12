/** src/pages/InvoicesPage.tsx — مساحة عمل الفواتير:
 * تبويبات متعددة + Split View + تعليق (Hold) + حفظ وطباعة (محرك طباعة iframe) */
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useInvoicesStore, useActiveTab, useSecondaryTab } from '@/stores/invoices'
import type { InvoiceDraft } from '@/stores/invoices'
import { useAppState } from '@/stores/appState'
import { validateInvoiceDraft } from '@/schemas/invoice'
import type { Invoice } from '@/types'
import { InvoiceTabBar } from '@/components/invoices/InvoiceTabBar'
import { InvoiceEditorPane } from '@/components/invoices/InvoiceEditorPane'
import { InvoicePrintTemplate } from '@/components/invoices/InvoicePrintTemplate'
import { Skeleton } from '@/components/ui/Skeleton'
import { printElementById } from '@/utils/print'

export function InvoicesPage() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const [searchParams] = useSearchParams()
  const invoicesStore = useInvoicesStore()
  const { load } = useSystemMeta()
  const setHeldDialogOpen = useAppState(state => state.setHeldDialogOpen)

  const [isReady, setIsReady] = useState(false)

  /** آخر فاتورة مرحّلة — بتُعرض في قالب الطباعة المخفي ثم تُطبع */
  const [lastPosted, setLastPosted] = useState<Invoice | null>(null)

  const activeTab = useActiveTab()
  const secondaryTab = useSecondaryTab()

  const initWorkspace = useCallback(async (): Promise<void> => {
    await load()

    // ضمان وجود تبويب واحد على الأقل
    if (useInvoicesStore.getState().tabs.length === 0) {
      await invoicesStore.createTab()
    }

    // معالجة معاملات الرابط: فاتورة جديدة / تركيز تبويب / فتح المعلّقين
    const store = useInvoicesStore.getState()
    if (searchParams.get('new')) {
      await store.createTab()
    }
    const focusId = searchParams.get('focus')
    if (focusId && store.tabs.some(tab => tab.id === focusId)) {
      store.selectTab(focusId)
    }
    if (searchParams.get('held')) {
      setHeldDialogOpen(true)
    }

    setIsReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    void initWorkspace()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** تعليق الفاتورة الحالية */
  async function handleHold(draft: InvoiceDraft): Promise<void> {
    if (draft.items.length === 0) {
      toast.warning(t('notif.holdEmpty'))
      return
    }
    const ok = await invoicesStore.holdTab(draft.id)
    if (ok) toast.warning(t('notif.holdOk', { id: draft.id }))
  }

  /** ترحيل الفاتورة ثم طباعتها عبر محرك الطباعة */
  async function handleSave(draft: InvoiceDraft): Promise<void> {
    if (draft.items.length === 0) {
      toast.error(t('notif.saveEmpty'))
      return
    }
    if (!validateInvoiceDraft(draft)) {
      toast.error(t('notif.validationErrors'))
      return
    }

    // نسخة الطباعة قبل إزالة التبويب من مساحة العمل
    const printCopy = JSON.parse(JSON.stringify(draft)) as Invoice
    setLastPosted(printCopy)

    const ok = await invoicesStore.postTab(draft.id)
    if (!ok) return
    toast.success(t('notif.savePosted'))

    // انتظار رندر قالب الطباعة المخفي ثم الطباعة (بديل nextTick في Vue)
    window.setTimeout(() => {
      printElementById('bshop-invoice-print', draft.id)
    }, 150)
  }

  function handleClose(draft: InvoiceDraft): void {
    void invoicesStore.closeTab(draft.id)
  }

  return (
    <div className="flex flex-col gap-sm min-h-full">
      <InvoiceTabBar />

      {isReady && activeTab ? (
        <div
          className={
            invoicesStore.splitView
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-sm'
              : 'grid grid-cols-1 gap-sm'
          }
        >
          <InvoiceEditorPane
            key={activeTab.id}
            draft={activeTab}
            onHold={() => void handleHold(activeTab)}
            onSave={() => void handleSave(activeTab)}
            onClose={() => handleClose(activeTab)}
          />

          {invoicesStore.splitView && secondaryTab && (
            <InvoiceEditorPane
              key={secondaryTab.id}
              draft={secondaryTab}
              secondary
              onHold={() => void handleHold(secondaryTab)}
              onSave={() => void handleSave(secondaryTab)}
              onClose={() => handleClose(secondaryTab)}
            />
          )}
        </div>
      ) : (
        /* هيكل تحميل لحظة تجهيز مساحة العمل */
        <div className="erp-card bg-glass space-y-sm">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {/* قالب الطباعة المخفي */}
      {lastPosted && <InvoicePrintTemplate invoice={lastPosted} />}
    </div>
  )
}
