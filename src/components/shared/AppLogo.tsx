/** src/components/shared/AppLogo.tsx — الشعار الرسمي للمشروع (Logo-favicon.svg) مع نص العلامة */
import logoUrl from '@/assets/img/logo.svg'
import { cn } from '@/utils/cn'

export interface AppLogoProps {
  /** عرض الشعار — نفس مقاسات المشروع الأصلي */
  size?: 'sm' | 'md' | 'lg'
  withText?: boolean
  className?: string
}

const sizeClass = {
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-16 h-16',
} as const

export function AppLogo({ size = 'md', withText = false, className }: AppLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-xs', className)}>
      <img
        src={logoUrl}
        alt="B-Shop Logo"
        className={cn(sizeClass[size], 'object-contain rounded bg-surface-alt border border-border p-0.5')}
      />
      {withText && <span className="font-extrabold text-sm tracking-wide text-bg-f">B-Shop</span>}
    </span>
  )
}
