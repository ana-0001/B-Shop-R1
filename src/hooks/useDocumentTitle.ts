/** src/hooks/useDocumentTitle.ts — بديل useHead في Nuxt لتعيين عنوان الصفحة */
import { useEffect } from 'react'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
