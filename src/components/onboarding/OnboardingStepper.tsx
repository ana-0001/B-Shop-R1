/** src/components/onboarding/OnboardingStepper.tsx — مؤشر تقدم خطوات الإعداد الأربع */
import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/utils/cn'

export interface OnboardingStepperProps {
  current: number
  total?: number
}

export function OnboardingStepper({ current, total }: OnboardingStepperProps) {
  const { t } = useI18n()
  const totalSteps = total ?? 4

  return (
    <div className="space-y-xs">
      <div className="flex justify-between items-center text-xs font-bold text-muted-f">
        <span>{t('onboard.wizardLabel')}</span>
        <span className="font-mono text-primary">{t('onboard.stepCounter', { current, total: totalSteps })}</span>
      </div>
      <div className="grid grid-cols-4 gap-xs" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
          <div
            key={step}
            className={cn(
              'h-2 rounded-full transition-all',
              step <= current ? 'bg-primary' : 'bg-surface-alt border border-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}
