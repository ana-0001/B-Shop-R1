/** src/components/ui/Checkbox.tsx — مربع اختيار موحد فوق Radix UI (وصولية كاملة) */
import { forwardRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/utils/cn'

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'checked' | 'onCheckedChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, checked, onCheckedChange, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked}
    onCheckedChange={value => onCheckedChange?.(value === true)}
    className={cn('erp-checkbox', className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      {/* علامة الصح بتطلع من CSS (::before في .erp-checkbox:checked) — نفس المشروع الأصلي */}
      <span />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'
