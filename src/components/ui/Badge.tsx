/** src/components/ui/Badge.tsx — شارة موحدة (حالة الفاتورة، نوع المعرّف، المستوى...) */
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

export const badgeVariants = cva('erp-badge', {
  variants: {
    variant: {
      default: 'bg-surface-alt text-muted-f',
      primary: 'bg-primary text-primary-f',
      secondary: 'bg-secondary text-secondary-f',
      accent: 'bg-accent text-accent-f',
      ok: 'bg-ok text-ok-f',
      err: 'bg-err text-err-f',
      war: 'bg-war text-war-f',
      inf: 'bg-inf text-inf-f',
      outline: 'border border-border text-bg-f',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type BadgeVariants = VariantProps<typeof badgeVariants>

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariants {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  ),
)
Badge.displayName = 'Badge'
