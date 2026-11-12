/** src/components/ui/Textarea.tsx — منطقة نص موحدة (ملاحظات الفواتير) */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn('erp-input min-h-[4.5em]', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'
