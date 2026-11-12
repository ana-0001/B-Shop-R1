/** src/components/onboarding/StepComplete.tsx — الخطوة 4: ملخص الإكمال */
import { CheckCheck } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

export interface StepCompleteProps {
  displayName: string
  jobTitle: string
}

export function StepComplete({ displayName, jobTitle }: StepCompleteProps) {
  const { t } = useI18n()

  return (
    <div className="text-center space-y-md">
      <div className="w-16 h-16 mx-auto rounded-full bg-ok text-ok-f flex items-center justify-center text-2xl shadow-md">
        <CheckCheck className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-extrabold text-bg-f">{t('onboard.step4Title')}</h2>
      <p className="text-xs text-muted-f">
        {t('onboard.summary', { name: displayName, job: jobTitle || '—' })}
      </p>
    </div>
  )
}
