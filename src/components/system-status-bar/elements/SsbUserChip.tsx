/** src/components/system-status-bar/elements/SsbUserChip.tsx — رقاقة المستخدم الحالي */
import { UserRound, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useAuthComputed } from '@/stores/auth'

export function SsbUserChip() {
  const { t } = useI18n()
  const { user, isSuperBombaUser } = useAuthComputed()

  if (!user) return null

  return (
    <span className="ssb-chip ssb-user-chip" aria-label={t('ssb.user.aria')} title={t('ssb.user.aria')} data-testid="ssb-user">
      <UserRound aria-hidden="true" />
      <strong className="ssb-chip-value ssb-user-name">{user.displayName}</strong>
      {isSuperBombaUser && (
        <span className="ssb-system-badge">
          <ShieldCheck aria-hidden="true" />
          <span>{t('user.systemCreator')}</span>
        </span>
      )}
    </span>
  )
}
