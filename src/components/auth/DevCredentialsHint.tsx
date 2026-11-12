/** src/components/auth/DevCredentialsHint.tsx — صندوق تلميح الوضع التجريبي (ملء تلقائي لبيانات bomba) */
import { CodeXml, WandSparkles } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { Button } from '@/components/ui/Button'

export interface DevCredentialsHintProps {
  onAutofill: (payload: { identifier: string; password: string }) => void
}

export function DevCredentialsHint({ onAutofill }: DevCredentialsHintProps) {
  const { t } = useI18n()
  const { toast } = useSonner()

  /** بيانات صانع النظام من الـ Seed (تجريبية للوضع Development فقط) */
  function fillDemoCredentials(): void {
    onAutofill({ identifier: 'bomba000@bomba.com', password: 'bomba000' })
    toast.success(t('notif.fillDemo'))
  }

  return (
    <div className="p-sm rounded-lg border border-dashed border-primary bg-surface-alt space-y-xs text-xs">
      <div className="flex items-center justify-between font-bold text-primary gap-xs flex-wrap">
        <span className="flex items-center gap-xs">
          <CodeXml className="w-3.5 h-3.5" />
          <span>{t('signin.devTitle')}</span>
        </span>
        <Button variant="primary" size="sm" onClick={fillDemoCredentials}>
          <WandSparkles className="w-3.5 h-3.5" />
          <span>{t('signin.autofill')}</span>
        </Button>
      </div>
      <p className="text-muted-f">{t('signin.devDesc')}</p>
    </div>
  )
}
