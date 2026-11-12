/** src/components/shared/SyncSkeleton.tsx — غلاف الـ Skeleton اللي بيظهر أثناء مزامنة الـ API */
import { useI18n } from '@/hooks/useI18n'
import { useAppData } from '@/hooks/useAppData'
import { Skeleton } from '@/components/ui/Skeleton'

export function SyncSkeleton() {
  const { t } = useI18n()
  const { isSyncing } = useAppData()

  if (!isSyncing) return null

  return (
    <div className="erp-section space-y-md" aria-busy="true" aria-label={t('common.loading')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-sm">
        {[1, 2, 3, 4].map(index => (
          <div key={index} className="erp-card bg-glass space-y-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        ))}
      </div>
      <div className="erp-card bg-glass space-y-sm">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  )
}
