/** src/components/onboarding/StepWelcome.tsx — الخطوة 1: الترحيب */
import { Handshake } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

export function StepWelcome() {
  const { t } = useI18n()

  return (
    <div className="text-center space-y-md">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-f flex items-center justify-center text-2xl shadow-md">
        <Handshake className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-extrabold text-bg-f">{t('onboard.step1Title')}</h2>
      <p className="text-xs text-muted-f max-w-[28rem] mx-auto">{t('onboard.step1Desc')}</p>
    </div>
  )
}
