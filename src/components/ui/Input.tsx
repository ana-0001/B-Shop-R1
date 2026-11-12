/** src/components/ui/Input.tsx — حقل إدخال موحد (بنفس هوية erp-input في التصميم) */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn('erp-input', className)} {...props} />
  ),
)
Input.displayName = 'Input'
