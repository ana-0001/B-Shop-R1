/** src/pages/OnboardingPage.tsx — معالج الإعداد الأولي (4 خطوات: ترحيب → ملف → ثيم/لغة → إكمال) */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_NAMES } from '@/utils/constants'
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper'
import { StepWelcome } from '@/components/onboarding/StepWelcome'
import { StepProfile } from '@/components/onboarding/StepProfile'
import { StepAppearance } from '@/components/onboarding/StepAppearance'
import { StepComplete } from '@/components/onboarding/StepComplete'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const TOTAL_STEPS = 4

export function OnboardingPage() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const auth = useAuthStore()
  const navigate = useNavigate()
  useDocumentTitle('B-Shop — Onboarding')

  const [currentStep, setCurrentStep] = useState(1)

  /** بيانات الملف الشخصي — بتتربط بمتجر المصادقة */
  const [jobTitle, setJobTitle] = useState(auth.operatorProfile.jobTitle)
  const [avatarIcon, setAvatarIcon] = useState(auth.operatorProfile.avatarIcon)

  const isLastStep = currentStep === TOTAL_STEPS

  function nextStep(): void {
    // آخر خطوة: حفظ الإعدادات وفتح النظام الرئيسي
    if (isLastStep) {
      void finishOnboarding()
      return
    }
    setCurrentStep(Math.min(TOTAL_STEPS, currentStep + 1))
  }

  /** حفظ الإعداد في الـ API أولًا ثم فتح لوحة التحكم */
  async function finishOnboarding(): Promise<void> {
    await auth.completeOnboarding({ jobTitle: jobTitle.trim(), avatarIcon })
    toast.success(t('notif.onboardingDone'))
    navigate(ROUTE_NAMES.dashboard)
  }

  function previousStep(): void {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  return (
    <section className="erp-card bg-glass max-w-[40rem] w-full p-xl space-y-lg shadow-xl">
      <OnboardingStepper current={currentStep} total={TOTAL_STEPS} />

      {/* محتوى الخطوة الديناميكي */}
      <div className="min-h-[15rem] flex flex-col justify-center">
        {currentStep === 1 && <StepWelcome />}
        {currentStep === 2 && (
          <StepProfile
            jobTitle={jobTitle}
            avatarIcon={avatarIcon}
            onJobTitleChange={setJobTitle}
            onAvatarIconChange={setAvatarIcon}
          />
        )}
        {currentStep === 3 && <StepAppearance />}
        {currentStep === 4 && (
          <StepComplete displayName={auth.user?.displayName ?? ''} jobTitle={jobTitle} />
        )}
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between border-t border-border pt-md">
        <Button size="md" disabled={currentStep === 1} onClick={previousStep}>
          <ArrowLeft className="w-3.5 h-3.5 icon-directional" />
          <span>{t('onboard.prev')}</span>
        </Button>
        <Button variant="primary" size="md" onClick={nextStep}>
          <span>{isLastStep ? t('onboard.finish') : t('onboard.next')}</span>
          <ArrowRight className="w-3.5 h-3.5 icon-directional" />
        </Button>
      </div>
    </section>
  )
}
