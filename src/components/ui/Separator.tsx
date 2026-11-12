/** src/components/ui/Separator.tsx — فاصل أفقي/رأسي موحد */
import { cn } from '@/utils/cn'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({ orientation = 'horizontal', className, ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
      {...props}
    />
  )
}
