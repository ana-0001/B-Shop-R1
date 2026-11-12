/** src/components/shared/EmptyState.tsx — حالة فارغة موحدة للجداول والقوائم */
import { Inbox } from 'lucide-react'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-lg text-center text-muted-f text-xs flex flex-col items-center gap-sm" role="status">
      <Inbox className="w-6 h-6 opacity-60" />
      <span className="font-semibold">{message}</span>
    </div>
  )
}
