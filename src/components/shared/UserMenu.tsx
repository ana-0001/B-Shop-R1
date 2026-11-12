/** src/components/shared/UserMenu.tsx — قائمة المستخدم المنسدلة (المستوى، الصانع، تسجيل الخروج) */
import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useAuthStore, useAuthComputed } from '@/stores/auth'
import { ROUTE_NAMES } from '@/utils/constants'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function UserMenu() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const navigate = useNavigate()
  const signOut = useAuthStore(state => state.signOut)
  const { user, isSuperBombaUser } = useAuthComputed()

  /** تسجيل الخروج مع إشعار والرجوع لشاشة الدخول */
  async function handleSignOut(): Promise<void> {
    await signOut()
    toast.info(t('notif.termsDeclined'))
    navigate(ROUTE_NAMES.signIn)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="h-7 px-sm flex items-center gap-xs rounded border border-border bg-surface hover:bg-hover text-xs font-bold text-bg-f transition-colors outline-none cursor-pointer"
        aria-label={t('user.menuAria')}
      >
        <span className="w-5 h-5 rounded-full bg-primary text-primary-f grid place-items-center text-xs font-extrabold">
          {user?.avatarLetter ?? 'B'}
        </span>
        <span className="hidden sm:inline">{user?.displayName}</span>
        {isSuperBombaUser && (
          <Badge variant="war" className="hidden md:inline-flex">
            <ShieldCheck className="w-3 h-3" />
            {t('user.systemCreator')}
          </Badge>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-modal min-w-[16rem] bg-surface border border-border rounded-lg shadow-lg p-sm space-y-xs outline-none"
        >
          <div className="px-xs py-1 space-y-0.5">
            <p className="text-xs font-extrabold text-bg-f flex items-center gap-xs">
              <UserRound className="w-3.5 h-3.5 text-primary" />
              {user?.displayName}
            </p>
            <p className="text-xs text-muted-f">{t('user.levelBadge', { level: user?.level ?? 0 })}</p>
          </div>

          <DropdownMenu.Separator className="h-px bg-border" />

          <DropdownMenu.Item asChild className="outline-none">
            <Button variant="danger" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5 icon-directional" />
              <span>{t('util.signOut')}</span>
            </Button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
