/**
 * src/hooks/useSystemMeta.ts — بيانات النظام المشتركة (فروع، فئات، كتالوج).
 * منقول حرفيًا — بتتحمل مرة واحدة وتتشارك بين كل الصفحات عبر متجر appState.
 */
import { useCallback } from 'react'
import { systemApi } from '@/services/api/endpoints'
import { useAppState } from '@/stores/appState'
import type { Branch, Category, Manufacturer, Product } from '@/types'

export interface SystemMeta {
  currency: 'EGP'
  defaultTaxRate: number
  operationDate: string
  branches: Branch[]
  categories: Category[]
  manufacturers: Manufacturer[]
  products: Product[]
  lowStockThreshold: number
}

export function useSystemMeta() {
  const meta = useAppState(state => state.meta)

  /** تحميل بيانات النظام — بيتجاهل التحميل لو موجودة بالفعل */
  const load = useCallback(async (force = false): Promise<SystemMeta> => {
    const current = useAppState.getState().meta
    if (current && !force) return current
    const next = await systemApi.meta()
    useAppState.getState().setMeta(next)
    return next
  }, [])

  /** بحث منتج بالباركود */
  const productByBarcode = useCallback(
    (barcode: string): Product | undefined =>
      useAppState.getState().meta?.products.find(product => product.barcode === barcode),
    [],
  )

  return { meta, load, productByBarcode }
}
