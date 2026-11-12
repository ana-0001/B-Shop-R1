/**
 * src/stores/invoices.ts — متجر مساحة عمل الفواتير (التبويبات، التعليق، الترحيل).
 * منقول من Pinia إلى Zustand بنفس العمليات بالظبط:
 * - كل تبويب = مسودة فاتورة مفتوحة (status OPEN) بتتحفظ محليًا لتصمد بعد التحديث.
 * - عمليات التعليق (Hold) والترحيل (Post) والاسترجاع بتتم عبر طبقة الـ API (Mock).
 * - الحسابات المالية (الإجماليات والضريبة 14%) بتتم عبر computeInvoiceAmounts الموحدة.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice, InvoiceItem, InvoiceType, PriceTier } from '@/types'
import { computeLineTotal, generateItemId } from '@/utils/invoice'
import { invoicesApi } from '@/services/api/endpoints'
import { nowUtcIso } from '@/utils/dates'
import { DEFAULT_TAX_RATE, STORAGE_KEYS } from '@/utils/constants'
import { createPlainStorage } from '@/stores/storage'

/** حقول واجهة إضافية على المسودة (مش بتترحل للباك إند) */
export interface InvoiceDraft extends Invoice {
  customerTab?: 'phones' | 'addresses'
  sideTab?: 'preview' | 'notes'
}

interface InvoicesState {
  /** تبويبات الفواتير المفتوحة */
  tabs: InvoiceDraft[]
  /** معرّف التبويب النشط */
  activeTabId: string | null
  /** وضع تقسيم الشاشة (Split View) */
  splitView: boolean
  /** معرّف التبويب الثانوي في وضع التقسيم */
  secondaryTabId: string | null
  createTab: (type?: InvoiceType, branchId?: string) => Promise<InvoiceDraft>
  selectTab: (id: string) => void
  closeTab: (id: string) => Promise<void>
  toggleSplitView: () => Promise<void>
  patchTab: (id: string, patch: Partial<InvoiceDraft>) => void
  setPriceTier: (id: string, tier: PriceTier) => void
  addItem: (id: string, item: Omit<InvoiceItem, 'id' | 'total'>) => void
  updateItemQty: (id: string, itemId: string, qty: number) => void
  removeItem: (id: string, itemId: string) => void
  addNote: (id: string, note: string) => void
  removeNote: (id: string, index: number) => void
  addContact: (id: string, value: string) => void
  removeContact: (id: string, index: number) => void
  holdTab: (id: string) => Promise<boolean>
  postTab: (id: string) => Promise<boolean>
  restoreHeld: (id: string) => Promise<boolean>
  clearAll: () => Promise<void>
}

/** الشكل المحفوظ فعليًا في localStorage (بدون الدوال) */
type PersistedInvoices = Pick<InvoicesState, 'tabs' | 'activeTabId' | 'secondaryTabId' | 'splitView'>

/* ===== Getters المشتقة — بنفس أسماء getters متجر Pinia الأصلي ===== */
export function useActiveTab(): InvoiceDraft | null {
  const tabs = useInvoicesStore(state => state.tabs)
  const activeTabId = useInvoicesStore(state => state.activeTabId)
  return tabs.find(tab => tab.id === activeTabId) ?? tabs[0] ?? null
}

export function useSecondaryTab(): InvoiceDraft | null {
  const tabs = useInvoicesStore(state => state.tabs)
  const secondaryTabId = useInvoicesStore(state => state.secondaryTabId)
  return tabs.find(tab => tab.id === secondaryTabId) ?? null
}

export function findTab(id: string): InvoiceDraft | undefined {
  return useInvoicesStore.getState().tabs.find(tab => tab.id === id)
}

function applyRemovedTab(state: InvoicesState, id: string): Partial<InvoicesState> {
  const tabs = state.tabs.filter(tab => tab.id !== id)
  const activeTabId = state.activeTabId === id ? (tabs[0]?.id ?? null) : state.activeTabId
  let secondaryTabId = state.secondaryTabId
  if (secondaryTabId === id) secondaryTabId = null
  return { tabs, activeTabId, secondaryTabId }
}

export const useInvoicesStore = create<InvoicesState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      splitView: false,
      secondaryTabId: null,

      /** إنشاء تبويب فاتورة جديد برقم متسلسل من الـ API */
      createTab: async (type: InvoiceType = 'SALE', branchId = 'BR-MAIN') => {
        const id = await invoicesApi.nextInvoiceId()
        const timestamp = nowUtcIso()
        const draft: InvoiceDraft = {
          id,
          type,
          status: 'OPEN',
          branchId,
          customerName: 'Walk-in Customer',
          customerNameAr: 'عميل نقدي',
          customerPhones: ['01000000000'],
          customerAddresses: [],
          priceTier: 1,
          items: [],
          discount: 0,
          taxRate: DEFAULT_TAX_RATE,
          notes: [],
          customerTab: 'phones',
          sideTab: 'preview',
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set(state => ({ tabs: [...state.tabs, draft], activeTabId: id }))
        return draft
      },

      selectTab: id => {
        const state = get()
        if (state.splitView && id !== state.activeTabId) {
          set({ secondaryTabId: id })
        } else {
          set({ activeTabId: id })
        }
      },

      /** غلق تبويب — لو آخر تبويب بيتعمله استبدال بمسودة جديدة (سلوك ملف التصميم) */
      closeTab: async id => {
        const state = get()
        if (state.tabs.length <= 1) {
          const fresh = await get().createTab('SALE')
          set({ activeTabId: fresh.id })
          return
        }
        set(applyRemovedTab(state, id))
      },

      /** تشغيل/إيقاف تقسيم الشاشة — لو مفيش تبويب تاني بيتعمله إنشاء تلقائي */
      toggleSplitView: async () => {
        const state = get()
        if (!state.splitView && state.tabs.length < 2) {
          await get().createTab('SALE')
        }
        const current = get()
        const splitView = !current.splitView
        const secondaryTabId = splitView
          ? (current.tabs.find(tab => tab.id !== current.activeTabId)?.id ?? current.tabs[0]?.id ?? null)
          : null
        set({ splitView, secondaryTabId })
      },

      patchTab: (id, patch) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id ? { ...tab, ...patch, updatedAt: nowUtcIso() } : tab,
          ),
        }))
      },

      setPriceTier: (id, tier) => {
        get().patchTab(id, { priceTier: tier })
      },

      addItem: (id, item) => {
        set(state => ({
          tabs: state.tabs.map(tab => {
            if (tab.id !== id) return tab
            return {
              ...tab,
              items: [
                ...tab.items,
                {
                  ...item,
                  id: generateItemId(),
                  total: computeLineTotal(item.qty, item.unitPrice),
                },
              ],
              updatedAt: nowUtcIso(),
            }
          }),
        }))
      },

      updateItemQty: (id, itemId, qty) => {
        set(state => ({
          tabs: state.tabs.map(tab => {
            if (tab.id !== id) return tab
            return {
              ...tab,
              items: tab.items.map(entry => {
                if (entry.id !== itemId) return entry
                const nextQty = Math.max(1, Number(qty) || 1)
                return { ...entry, qty: nextQty, total: computeLineTotal(nextQty, entry.unitPrice) }
              }),
              updatedAt: nowUtcIso(),
            }
          }),
        }))
      },

      removeItem: (id, itemId) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id
              ? { ...tab, items: tab.items.filter(entry => entry.id !== itemId), updatedAt: nowUtcIso() }
              : tab,
          ),
        }))
      },

      addNote: (id, note) => {
        if (!note.trim()) return
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id
              ? { ...tab, notes: [...tab.notes, note.trim()], updatedAt: nowUtcIso() }
              : tab,
          ),
        }))
      },

      removeNote: (id, index) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id
              ? { ...tab, notes: tab.notes.filter((_, i) => i !== index), updatedAt: nowUtcIso() }
              : tab,
          ),
        }))
      },

      addContact: (id, value) => {
        if (!value.trim()) return
        set(state => ({
          tabs: state.tabs.map(tab => {
            if (tab.id !== id) return tab
            if (tab.customerTab === 'addresses') {
              return { ...tab, customerAddresses: [...tab.customerAddresses, value.trim()], updatedAt: nowUtcIso() }
            }
            return { ...tab, customerPhones: [...tab.customerPhones, value.trim()], updatedAt: nowUtcIso() }
          }),
        }))
      },

      removeContact: (id, index) => {
        set(state => ({
          tabs: state.tabs.map(tab => {
            if (tab.id !== id) return tab
            if (tab.customerTab === 'addresses') {
              return { ...tab, customerAddresses: tab.customerAddresses.filter((_, i) => i !== index), updatedAt: nowUtcIso() }
            }
            return { ...tab, customerPhones: tab.customerPhones.filter((_, i) => i !== index), updatedAt: nowUtcIso() }
          }),
        }))
      },

      /** تعليق الفاتورة (Hold) — بتتنقل لقائمة المعلّقين في الـ Mock DB */
      holdTab: async id => {
        const tab = findTab(id)
        if (!tab) return false
        if (tab.items.length === 0) return false
        await invoicesApi.hold(tab)
        const state = get()
        const remaining = state.tabs.filter(entry => entry.id !== id)
        if (remaining.length === 0) {
          set({ tabs: [], activeTabId: null, secondaryTabId: null })
          await get().createTab(tab.type)
          return true
        }
        const activeTabId = state.activeTabId === id ? (remaining[0]?.id ?? null) : state.activeTabId
        const secondaryTabId = state.secondaryTabId === id ? null : state.secondaryTabId
        set({ tabs: remaining, activeTabId, secondaryTabId })
        return true
      },

      /** ترحيل الفاتورة (Save) — بتتنقل للفواتير المرحّلة في الـ Mock DB */
      postTab: async id => {
        const tab = findTab(id)
        if (!tab) return false
        if (tab.items.length === 0) return false
        await invoicesApi.post(tab)
        const state = get()
        const remaining = state.tabs.filter(entry => entry.id !== id)
        if (remaining.length === 0) {
          // عشان مساحة العمل تفضل جاهزة للكاشير بعد كل عملية بيع
          set({ tabs: [], activeTabId: null, secondaryTabId: null })
          await get().createTab(tab.type)
          return true
        }
        const activeTabId = state.activeTabId === id ? (remaining[0]?.id ?? null) : state.activeTabId
        const secondaryTabId = state.secondaryTabId === id ? null : state.secondaryTabId
        set({ tabs: remaining, activeTabId, secondaryTabId })
        return true
      },

      /** استرجاع فاتورة معلّقة لمساحة العمل */
      restoreHeld: async id => {
        const restored = await invoicesApi.restoreHeld(id)
        if (!restored) return false
        const draft: InvoiceDraft = { ...restored, status: 'OPEN', customerTab: 'phones', sideTab: 'preview' }
        set(state => ({ tabs: [...state.tabs, draft], activeTabId: draft.id }))
        return true
      },

      /** تصفير كل التبويبات (يُستخدم مع Reset Mock DB) */
      clearAll: async () => {
        set({ tabs: [], activeTabId: null, secondaryTabId: null, splitView: false })
        await get().createTab('SALE')
      },
    }),
    {
      name: STORAGE_KEYS.invoices,
      storage: createPlainStorage<PersistedInvoices>(),
      partialize: state => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        secondaryTabId: state.secondaryTabId,
        splitView: state.splitView,
      }),
    },
  ),
)
