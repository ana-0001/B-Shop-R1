/** src/components/shared/ResetDbDialog.tsx — نافذة تأكيد تصفير قاعدة البيانات الافتراضية */
import { TriangleAlert } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useAppData } from '@/hooks/useAppData'
import { useAppState } from '@/stores/appState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export function ResetDbDialog() {
  const { t } = useI18n()
  const { resetMockDb } = useAppData()
  const open = useAppState(state => state.resetDialogOpen)
  const setOpen = useAppState(state => state.setResetDialogOpen)

  async function confirmReset(): Promise<void> {
    setOpen(false)
    await resetMockDb()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[26rem]">
        <DialogHeader>
          <div className="flex items-center gap-xs">
            <TriangleAlert className="w-5 h-5 text-war" />
            <DialogTitle className="text-base">{t('common.confirmResetTitle')}</DialogTitle>
          </div>
          <DialogClose className="erp-btn text-xs py-xs px-sm relative z-10" aria-label="Close dialog">
            ✕
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="text-xs leading-relaxed">
          {t('common.confirmResetDesc')}
        </DialogDescription>

        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm">{t('common.cancel')}</Button>
          </DialogClose>
          <Button variant="danger" size="sm" onClick={confirmReset}>
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
