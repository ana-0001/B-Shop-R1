/** src/components/ui/Button.tsx — زر النظام الموحد بكل المتغيرات (بنفس هوية erp-btn في التصميم) */
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * المتغيرات:
 * primary = أزرار التأكيد | success = حفظ/ترحيل | warning = تعليق
 * danger = حذف/رفض | ghost = أزرار شريط الأدوات | outline = افتراضي
 */
export const buttonVariants = cva('erp-btn', {
  variants: {
    variant: {
      default: '',
      primary: 'erp-btn-primary',
      success: 'erp-btn-success',
      warning: 'erp-btn-warning',
      danger: 'erp-btn-danger',
      ghost: 'border-transparent bg-transparent shadow-none hover:bg-hover',
    },
    size: {
      xs: 'py-1 px-2 text-xs',
      sm: 'py-0.5 px-2 text-xs',
      md: '',
      lg: 'py-sm px-lg text-sm',
      icon: 'w-7 h-7 p-0',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
