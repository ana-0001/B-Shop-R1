/** src/pages/NotFoundPage.tsx — التقاط كل المسارات غير الموجودة (404) */
import { ErrorState } from '@/components/shared/ErrorState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('B-Shop — 404')

  return <ErrorState code="404" />
}
