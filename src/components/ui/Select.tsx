/** src/components/ui/Select.tsx — قائمة اختيار موحدة (select أصلي بستايل erp-input مع سهم اتجاهي) */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  className?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className, children, ...props }, ref) => (
    <select ref={ref} className={cn('erp-input', className)} {...props}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
