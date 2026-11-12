/**
 * src/components/shared/DataTable.tsx — جدول عام قابل للفرز والبحث.
 * بديل TanStack Table (vue) بنفس السلوك: فرز بالضغط على الرأس
 * (تصاعدي → تنازلي → بدون) + فلتر عام على كل الأعمدة القابلة للقراءة.
 */
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/utils/cn'

export interface DataColumn<T> {
  id: string
  /** القيمة المستخدمة في الفرز والفلتر العام */
  accessor?: (row: T) => string | number
  header: React.ReactNode
  /** محتوى الخلية — لو مش موجود بيتعرض قيمة الـ accessor */
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataColumn<T>[]
  globalFilter?: string
}

type SortDir = 'asc' | 'desc' | null

export function DataTable<T>({ data, columns, globalFilter = '' }: DataTableProps<T>) {
  const { t } = useI18n()
  const [sortId, setSortId] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const filteredAndSorted = useMemo(() => {
    const query = globalFilter.trim().toLowerCase()
    let rows = data
    if (query) {
      rows = data.filter(row =>
        columns.some(column => {
          const value = column.accessor?.(row)
          return value !== undefined && String(value).toLowerCase().includes(query)
        }),
      )
    }
    if (sortId && sortDir) {
      const column = columns.find(entry => entry.id === sortId)
      if (column?.accessor) {
        rows = [...rows].sort((a, b) => {
          const va = column.accessor!(a)
          const vb = column.accessor!(b)
          if (typeof va === 'number' && typeof vb === 'number') {
            return sortDir === 'asc' ? va - vb : vb - va
          }
          const sa = String(va).toLowerCase()
          const sb = String(vb).toLowerCase()
          return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
        })
      }
    }
    return rows
  }, [data, columns, globalFilter, sortId, sortDir])

  function toggleSort(column: DataColumn<T>): void {
    if (column.sortable === false || !column.accessor) return
    if (sortId !== column.id) {
      setSortId(column.id)
      setSortDir('asc')
      return
    }
    setSortDir(current => (current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc'))
    if (sortDir === 'desc') setSortId(null)
  }

  function sortIcon(column: DataColumn<T>): React.ReactNode {
    if (sortId !== column.id || !sortDir) return <ChevronsUpDown className="w-3 h-3 opacity-60" />
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 opacity-60" /> : <ArrowDown className="w-3 h-3 opacity-60" />
  }

  return (
    <Table>
      <TableHead>
        <tr>
          {columns.map(column => (
            <TableHeaderCell
              key={column.id}
              className={cn(
                (column.sortable !== false && column.accessor) && 'cursor-pointer select-none',
                column.className,
              )}
              onClick={() => toggleSort(column)}
            >
              <span className="inline-flex items-center gap-xs">
                {column.header}
                {(column.sortable !== false && column.accessor) && sortIcon(column)}
              </span>
            </TableHeaderCell>
          ))}
        </tr>
      </TableHead>
      <TableBody>
        {filteredAndSorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <EmptyState message={t('tbl.empty')} />
            </TableCell>
          </TableRow>
        )}
        {filteredAndSorted.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map(column => (
              <TableCell key={column.id} className={column.className}>
                {column.cell ? column.cell(row) : String(column.accessor?.(row) ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
