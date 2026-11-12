/** src/components/ui/Card.tsx — بطاقة النظام الموحدة (erp-card) مع أجزائها */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Card = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <article ref={ref} className={cn('erp-card bg-glass', className)} {...props}>
      {children}
    </article>
  ),
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('flex flex-wrap justify-between items-center gap-xs mb-sm', className)}
      {...props}
    >
      {children}
    </header>
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h2 ref={ref} className={cn('font-extrabold text-bg-f', className)} {...props}>
      {children}
    </h2>
  ),
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-muted-f mt-xs', className)} {...props}>
      {children}
    </p>
  ),
)
CardDescription.displayName = 'CardDescription'
