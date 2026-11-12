/** src/components/ui/Skeleton.tsx — عنصر تحميل نابض (erp-skeleton) أثناء محاكاة جلب البيانات */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('erp-skeleton', className)} aria-hidden="true" {...props} />
  ),
)
Skeleton.displayName = 'Skeleton'
