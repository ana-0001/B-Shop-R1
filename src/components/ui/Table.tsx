/** src/components/ui/Table.tsx — عناصر الجدول الموحدة بنمط shadcn/ui (غلاف + رأس + جسم + صفوف) */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table ref={ref} className={cn('w-full text-start text-xs', className)} {...props}>
        {children}
      </table>
    </div>
  ),
)
Table.displayName = 'Table'

export const TableHead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-surface-alt text-muted-f', className)} {...props}>
      {children}
    </thead>
  ),
)
TableHead.displayName = 'TableHead'

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-border', className)} {...props}>
      {children}
    </tbody>
  ),
)
TableBody.displayName = 'TableBody'

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }>(
  ({ className, clickable, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('hover:bg-hover', clickable && 'cursor-pointer', className)}
      {...props}
    >
      {children}
    </tr>
  ),
)
TableRow.displayName = 'TableRow'

export const TableHeaderCell = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th ref={ref} className={cn('p-sm text-start font-bold whitespace-nowrap', className)} {...props}>
      {children}
    </th>
  ),
)
TableHeaderCell.displayName = 'TableHeaderCell'

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td ref={ref} className={cn('p-sm align-middle', className)} {...props}>
      {children}
    </td>
  ),
)
TableCell.displayName = 'TableCell'
