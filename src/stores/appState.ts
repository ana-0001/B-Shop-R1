/**
 * src/stores/appState.ts — حالة مشتركة على مستوى التطبيق (غير محفوظة).
 * بديل useState()/useAsyncState() في Nuxt — بتجمع:
 * حالة النوافذ المشتركة (المعلّقين/التصفير/الإعدادات) + عدّاد البيانات + فلاجل المزامنة
 * + بيانات النظام (Meta) + الثيم المحسوم + إشعارات شريط الحالة + خطأ قاتل (500/503).
 */
import { create } from 'zustand'
import type { SystemMeta } from '@/hooks/useSystemMeta'
import type { SsbNotification } from '@/components/system-status-bar/types'

/** خطأ قاتل بيستبدل محتوى التطبيق بشاشة الأخطاء (بديل showError في Nuxt) */
export interface FatalError {
  statusCode: 404 | 500 | 503
  statusMessage?: string
  /** بيانات فشل فحص الإقلاع (كود 503) */
  bootFailed?: boolean
  failedKey?: string
  detail?: string
}

interface AppState {
  heldDialogOpen: boolean
  resetDialogOpen: boolean
  ssbSettingsOpen: boolean
  heldCount: number
  dataVersion: number
  isSyncing: boolean
  meta: SystemMeta | null
  resolvedTheme: 'light' | 'dark'
  ssbNotifications: SsbNotification[]
  ssbLastSyncAt: string | null
  fatalError: FatalError | null
  setHeldDialogOpen: (open: boolean) => void
  setResetDialogOpen: (open: boolean) => void
  setSsbSettingsOpen: (open: boolean) => void
  setHeldCount: (count: number) => void
  setDataVersion: (updater: (value: number) => number) => void
  setSyncing: (value: boolean) => void
  setMeta: (meta: SystemMeta | null) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
  setNotifications: (updater: (items: SsbNotification[]) => SsbNotification[]) => void
  setLastSyncAt: (iso: string | null) => void
  setFatalError: (error: FatalError | null) => void
}

export const useAppState = create<AppState>()(set => ({
  heldDialogOpen: false,
  resetDialogOpen: false,
  ssbSettingsOpen: false,
  heldCount: 0,
  dataVersion: 0,
  isSyncing: false,
  meta: null,
  resolvedTheme: 'light',
  ssbNotifications: [],
  ssbLastSyncAt: null,
  fatalError: null,
  setHeldDialogOpen: open => set({ heldDialogOpen: open }),
  setResetDialogOpen: open => set({ resetDialogOpen: open }),
  setSsbSettingsOpen: open => set({ ssbSettingsOpen: open }),
  setHeldCount: count => set({ heldCount: count }),
  setDataVersion: updater => set(state => ({ dataVersion: updater(state.dataVersion) })),
  setSyncing: value => set({ isSyncing: value }),
  setMeta: meta => set({ meta }),
  setResolvedTheme: theme => set({ resolvedTheme: theme }),
  setNotifications: updater => set(state => ({ ssbNotifications: updater(state.ssbNotifications) })),
  setLastSyncAt: iso => set({ ssbLastSyncAt: iso }),
  setFatalError: error => set({ fatalError: error }),
}))
