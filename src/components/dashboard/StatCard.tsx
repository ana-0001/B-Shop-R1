/** src/components/dashboard/StatCard.tsx — بطاقة إحصائية للوحة التحكم (أيقونة + قيمة + وصف) */
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StatCardProps {
  title: string
  value: string
  sub?: string
  icon: LucideIcon
  iconClass?: string
  className?: string
}

export function StatCard({ title, value, sub, icon: Icon, iconClass, className }: StatCardProps) {
  return (
    <article className={cn('erp-card bg-glass', className)}>
      <div className="flex items-center justify-between text-xs font-bold text-muted-f">
        <span>{title}</span>
        <span className={cn('w-9 h-9 rounded bg-surface-alt flex items-center justify-center', iconClass)}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="text-xl font-extrabold text-bg-f mt-sm font-mono">{value}</div>
      {sub && <div className="text-xs text-muted-f mt-xs">{sub}</div>}
    </article>
  )
}
