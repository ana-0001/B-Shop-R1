/** src/components/shared/GlobalSearch.tsx — البحث العام (فلاتر الفواتير في لوحة التحكم زي التصميم) */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { Input } from '@/components/ui/Input'

export function GlobalSearch() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // مزامنة القيمة لو الفلتر اتغير من مكان تاني (زي تنظيف الفلتر)
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  /** بحث حي مع مهلة — بيوصل الفلتر للوحة التحكم عبر query string */
  function handleSearch(value: string): void {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const target = {
        pathname: '/dashboard',
        search: value.trim() ? `?q=${encodeURIComponent(value.trim())}` : '',
      }
      if (location.pathname === '/dashboard') {
        navigate(target, { replace: true })
      } else {
        navigate(target)
      }
    }, 250)
  }

  return (
    <div className="relative w-full">
      <Input
        type="search"
        value={query}
        placeholder={t('util.searchPlaceholder')}
        className="pe-8"
        aria-label="Global search"
        onChange={event => handleSearch(event.target.value)}
      />
      <Search className="w-3.5 h-3.5 text-muted-f absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  )
}
