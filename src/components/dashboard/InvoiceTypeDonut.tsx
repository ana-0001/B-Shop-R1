/** src/components/dashboard/InvoiceTypeDonut.tsx — دائرة توزيع أنواع الفواتير (conic-gradient زي التصميم) */
import { useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'

export interface InvoiceTypeDonutProps {
  distribution: { SALE: number; PURCHASE: number; RETURN: number }
  totalCount: number
}

export function InvoiceTypeDonut({ distribution, totalCount }: InvoiceTypeDonutProps) {
  const { t } = useI18n()

  const shares = useMemo(() => {
    const total = distribution.SALE + distribution.PURCHASE + distribution.RETURN
    if (!total) return { sale: 0, purchase: 0, ret: 0 }
    return {
      sale: (distribution.SALE * 100) / total,
      purchase: (distribution.PURCHASE * 100) / total,
      ret: (distribution.RETURN * 100) / total,
    }
  }, [distribution])

  const donutBackground = useMemo(() => {
    const { sale, purchase } = shares
    if (!totalCount) return 'var(--color-surface-alt)'
    return `conic-gradient(var(--color-py) 0 ${sale}%, var(--color-ok) ${sale}% ${sale + purchase}%, var(--color-war) ${sale + purchase}% 100%)`
  }, [shares, totalCount])

  return (
    <div className="flex flex-col items-center justify-center py-md">
      <div
        className="relative w-36 h-36 rounded-full flex items-center justify-center"
        style={{ background: donutBackground }}
        role="img"
        aria-label="Donut chart of invoice types"
      >
        <div className="w-24 h-24 rounded-full bg-surface flex flex-col items-center justify-center">
          <strong className="text-xl font-extrabold font-mono">{totalCount}</strong>
          <span className="text-xs text-muted-f">{t('nav.invoices')}</span>
        </div>
      </div>

      <div className="w-full space-y-sm mt-md text-xs font-semibold">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {t('enum.type.SALE')}
          </span>
          <span className="font-mono">{Math.round(shares.sale)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-ok" />
            {t('enum.type.PURCHASE')}
          </span>
          <span className="font-mono">{Math.round(shares.purchase)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-war" />
            {t('enum.type.RETURN')}
          </span>
          <span className="font-mono">{Math.round(shares.ret)}%</span>
        </div>
      </div>
    </div>
  )
}
