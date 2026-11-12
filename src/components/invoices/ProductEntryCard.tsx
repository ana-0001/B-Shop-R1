/** src/components/invoices/ProductEntryCard.tsx — بطاقة إدخال الأصناف:
 * شرائح التسعير + الباركود + الكتالوج + الفلاتر + الكمية/السعر/الإجمالي + المعاينة */
import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSystemMeta } from '@/hooks/useSystemMeta'
import { useAppState } from '@/stores/appState'
import { computeLineTotal } from '@/utils/invoice'
import { formatCurrency } from '@/utils/format'
import { productImage } from '@/utils/product-image'
import { localizedEntityName } from '@/types'
import type { InvoiceDraft } from '@/stores/invoices'
import type { Product, PriceTier } from '@/types'
import { PRICE_TIERS } from '@/utils/constants'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export interface ProductEntryCardProps {
  draft: InvoiceDraft
  onAdd: (item: { barcode: string; name: string; nameAr: string; qty: number; unitPrice: number; notes?: string }) => void
  onUpdateTier: (tier: PriceTier) => void
}

export function ProductEntryCard({ draft, onAdd, onUpdateTier }: ProductEntryCardProps) {
  const { t, locale } = useI18n()
  const { meta, productByBarcode } = useSystemMeta()

  /** حالة إدخال الصنف الحالي (مسودة السطر) */
  const [entry, setEntry] = useState({
    barcode: '',
    categoryId: 'ALL',
    manufacturerId: 'ALL',
    name: '',
    nameAr: '',
    qty: 1,
    unitPrice: 0,
    notes: '',
  })

  const activeProduct = useMemo(() => productByBarcode(entry.barcode), [entry.barcode, productByBarcode, meta])
  const previewImage = activeProduct?.imageUrl ?? productImage(entry.categoryId === 'ALL' ? undefined : entry.categoryId)
  const lineTotal = computeLineTotal(entry.qty, entry.unitPrice)

  /** تطبيق بيانات منتج على المسودة بسعر الشريحة الحالية */
  function applyProduct(product: Product): void {
    setEntry(prev => ({
      ...prev,
      barcode: product.barcode,
      name: product.name,
      nameAr: product.nameAr,
      unitPrice: product.prices[draft.priceTier] ?? product.prices[1],
      categoryId: product.categoryId,
      manufacturerId: product.manufacturerId,
    }))
  }

  // أول منتج في الكتالوج كقيمة افتراضية عند جاهزية البيانات
  const metaProducts = useAppState(state => state.meta?.products ?? [])
  useEffect(() => {
    if (!entry.barcode && metaProducts.length > 0) applyProduct(metaProducts[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaProducts])

  // تغيير شريحة التسعير بيرجّع سعر الصنف الحالي بالشريحة الجديدة
  useEffect(() => {
    const product = productByBarcode(entry.barcode)
    if (product) {
      setEntry(prev => ({ ...prev, unitPrice: product.prices[draft.priceTier] ?? product.prices[1] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.priceTier])

  /** المنتجات المطابقة لفلاتر الفئة والمصنع */
  const matchingProducts = useMemo<Product[]>(
    () =>
      (meta?.products ?? []).filter(
        product =>
          (entry.categoryId === 'ALL' || product.categoryId === entry.categoryId)
          && (entry.manufacturerId === 'ALL' || product.manufacturerId === entry.manufacturerId),
      ),
    [meta, entry.categoryId, entry.manufacturerId],
  )

  function onBarcodeChange(value: string): void {
    const barcode = value.trim()
    setEntry(prev => ({ ...prev, barcode }))
    const product = productByBarcode(barcode)
    if (product) applyProduct(product)
  }

  function onCatalogChange(barcode: string): void {
    const product = productByBarcode(barcode)
    if (product) applyProduct(product)
  }

  function setCategoryFilter(value: string): void {
    const nextMatching = (meta?.products ?? []).filter(
      product =>
        (value === 'ALL' || product.categoryId === value)
        && (entry.manufacturerId === 'ALL' || product.manufacturerId === entry.manufacturerId),
    )
    setEntry(prev => ({ ...prev, categoryId: value }))
    if (nextMatching[0]) applyProduct(nextMatching[0])
  }

  function setManufacturerFilter(value: string): void {
    const nextMatching = (meta?.products ?? []).filter(
      product =>
        (entry.categoryId === 'ALL' || product.categoryId === entry.categoryId)
        && (value === 'ALL' || product.manufacturerId === value),
    )
    setEntry(prev => ({ ...prev, manufacturerId: value }))
    if (nextMatching[0]) applyProduct(nextMatching[0])
  }

  /** إضافة الصنف للفاتورة وتصفير الكمية والملاحظة */
  function addItem(): void {
    if (!entry.name.trim()) return
    onAdd({
      barcode: entry.barcode || '99001122',
      name: entry.name.trim(),
      nameAr: entry.nameAr,
      qty: Math.max(1, Math.round(Number(entry.qty) || 1)),
      unitPrice: Math.max(0, Number(entry.unitPrice) || 0),
      notes: entry.notes.trim() || undefined,
    })
    setEntry(prev => ({ ...prev, qty: 1, notes: '' }))
  }

  const categoryOptions = [
    { value: 'ALL', label: t('inv.allCategories') },
    ...(meta?.categories ?? []).map(category => ({ value: category.id, label: localizedEntityName(category, locale) })),
  ]

  const manufacturerOptions = [
    { value: 'ALL', label: t('inv.allManufacturers') },
    ...(meta?.manufacturers ?? []).map(manufacturer => ({ value: manufacturer.id, label: localizedEntityName(manufacturer, locale) })),
  ]

  const catalogOptions = matchingProducts.map(product => ({
    value: product.barcode,
    label: `${localizedEntityName(product, locale)} — ${formatCurrency(product.prices[draft.priceTier], locale)}`,
  }))

  return (
    <div className="bg-surface-alt p-sm rounded border border-border flex flex-col gap-sm">
      {/* شرائح التسعير + الباركود */}
      <div className="flex items-center justify-between gap-sm pb-xs border-b border-border flex-wrap">
        <div className="flex items-center gap-xs">
          <span className="font-bold text-bg-f text-xs">{t('inv.priceTier')}</span>
          <div className="flex items-center gap-xs">
            {PRICE_TIERS.map(tier => (
              <button
                key={tier}
                type="button"
                className={`price-tier-btn ${draft.priceTier === tier ? 'active' : ''}`}
                onClick={() => onUpdateTier(tier)}
              >
                {t(`inv.tier${tier}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-xs">
          <Label className="!mb-0 !font-bold">{t('inv.barcode')}:</Label>
          <Input
            type="text"
            value={entry.barcode}
            className="!w-28 font-mono text-center text-xs"
            aria-label="Barcode"
            onChange={event => onBarcodeChange(event.target.value)}
          />
        </div>
      </div>

      {/* الكتالوج والفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
        <div>
          <Label>{t('inv.quickLookup')}</Label>
          <Select
            value={entry.barcode}
            options={catalogOptions}
            className="text-xs"
            aria-label="Catalog"
            onChange={event => onCatalogChange(event.target.value)}
          />
        </div>
        <div>
          <Label>{t('inv.category')}:</Label>
          <Select
            value={entry.categoryId}
            options={categoryOptions}
            className="text-xs"
            aria-label="Category filter"
            onChange={event => setCategoryFilter(event.target.value)}
          />
        </div>
        <div>
          <Label>{t('inv.manufacturer')}:</Label>
          <Select
            value={entry.manufacturerId}
            options={manufacturerOptions}
            className="text-xs"
            aria-label="Manufacturer filter"
            onChange={event => setManufacturerFilter(event.target.value)}
          />
        </div>
      </div>

      {/* إدخال السطر */}
      <div className="grid grid-cols-2 sm:grid-cols-12 gap-sm items-end bg-surface p-sm rounded border border-border">
        <div className="col-span-2 sm:col-span-3">
          <Label>{t('inv.itemName')}:</Label>
          <Input
            type="text"
            value={entry.name}
            className="font-bold"
            aria-label="Item name"
            onChange={event => setEntry(prev => ({ ...prev, name: event.target.value }))}
          />
        </div>
        <div className="col-span-1 sm:col-span-1">
          <Label>{t('inv.qty')}:</Label>
          <Input
            type="number"
            min={1}
            value={entry.qty}
            className="text-center font-bold font-mono"
            aria-label="Quantity"
            onChange={event => setEntry(prev => ({ ...prev, qty: Number(event.target.value) }))}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Label>{t('inv.unitPrice')}:</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={entry.unitPrice}
            className="text-center font-bold font-mono text-ok"
            aria-label="Unit price"
            onChange={event => setEntry(prev => ({ ...prev, unitPrice: Number(event.target.value) }))}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Label>{t('inv.lineTotal')}:</Label>
          <Input
            type="text"
            value={formatCurrency(lineTotal, locale)}
            readOnly
            className="text-center font-bold font-mono bg-surface-alt text-primary !text-xs"
            aria-label="Line total"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Button variant="primary" size="md" className="w-full h-8 text-xs" onClick={addItem}>
            <Plus className="w-3.5 h-3.5" />
            {t('inv.addBtn')}
          </Button>
        </div>

        {/* معاينة الصنف */}
        <div className="col-span-2 row-span-2 sm:col-span-2 flex self-stretch rounded border border-border bg-surface-alt p-xs">
          <div className="w-full h-full min-h-[5.5em] bg-surface border border-border rounded p-xs flex items-center justify-center shadow-sm overflow-hidden">
            <img src={previewImage} alt="Selected item preview" className="w-full h-full object-contain rounded" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-10">
          <Label>{t('inv.lineNote')}</Label>
          <Input
            type="text"
            value={entry.notes}
            placeholder={t('inv.lineNotePlaceholder')}
            className="text-xs"
            aria-label="Item line note"
            onChange={event => setEntry(prev => ({ ...prev, notes: event.target.value }))}
          />
        </div>
      </div>
    </div>
  )
}
