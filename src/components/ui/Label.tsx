/** src/components/ui/Label.tsx — عنوان حقل موحد (بنفس نمط shadcn/ui) */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <label ref={ref} className={cn('block text-xs font-bold text-bg-f mb-xs', className)} {...props}>
      {children}
    </label>
  ),
)
Label.displayName = 'Label'
