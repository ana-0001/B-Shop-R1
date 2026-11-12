/** src/components/shared/PageHeader.tsx — رأس صفحة موحد (كِكر + عنوان + وصف + أزرار) */
import { cn } from '@/utils/cn'

export interface PageHeaderProps {
  kicker?: string
  kickerClass?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ kicker, kickerClass, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-sm', className)}>
      <div>
        {kicker && <p className={cn('text-xs font-bold mb-xs', kickerClass)}>{kicker}</p>}
        <h1 className="text-xl font-extrabold text-bg-f">{title}</h1>
        {subtitle && <p className="text-xs text-muted-f mt-xs">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-xs">{actions}</div>
    </div>
  )
}
