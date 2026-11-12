/** src/pages/SplashPage.tsx — شاشة الإقلاع (Splash) بفحص المتطلبات الخمسة الحقيقي والتوجيه الشرطي.
 * قرار صاحب المشروع: الدخول للشاشة التالية (تسجيل الدخول أو الرئيسية) بعد نجاح الفحص فقط،
 * وعند عدم التوافق → شاشة الأخطاء (503) مع إعادة محاولة أوتوماتيكية بفواصل + زر يدوي. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cuboid, RotateCcw, ArrowRight } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useAuthComputed } from '@/stores/auth'
import { resolvePostAuthRoute } from '@/utils/auth-flow'
import { ROUTE_NAMES } from '@/utils/constants'
import { useBootChecks } from '@/components/splash/useBootChecks'
import { BootProgress } from '@/components/splash/BootProgress'
import { BootStepsList } from '@/components/splash/BootStepsList'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppState } from '@/stores/appState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** تأخير بسيط بعد اكتمال الفحص قبل التوجيه — زي ملف التصميم */
const REDIRECT_DELAY_MS = 450
/** مهلة إظهار الخطوة الفاشلة قبل الانتقال لشاشة الأخطاء (حتى يراها المستخدم) */
const FAIL_PAUSE_MS = 900

export function SplashPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const auth = useAuthComputed()
  const setFatalError = useAppState(state => state.setFatalError)
  useDocumentTitle('B-Shop ERP')

  const {
    steps,
    currentStepIndex,
    percent,
    currentStepLabel,
    failedStep,
    runChecks,
  } = useBootChecks()

  const [isBooting, setIsBooting] = useState(false)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const authRef = useRef(auth)
  authRef.current = auth

  const stopTimers = useCallback((): void => {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current)
      redirectTimer.current = null
    }
    if (failTimer.current) {
      clearTimeout(failTimer.current)
      failTimer.current = null
    }
  }, [])

  useEffect(() => () => stopTimers(), [stopTimers])

  /** التوجيه حسب حالة الجلسة: دخول → شروط → إعداد → لوحة التحكم */
  const continueToWorkspace = useCallback((): void => {
    stopTimers()
    const currentAuth = authRef.current
    if (!currentAuth.isAuthenticated) {
      navigate(ROUTE_NAMES.signIn)
      return
    }
    navigate(resolvePostAuthRoute(currentAuth.needsTerms, currentAuth.needsOnboarding))
  }, [navigate, stopTimers])

  /** الانتقال إلى شاشة الأخطاء بحالة فشل فحص المتطلبات (كود 503 + بيانات الفحص) */
  const failToErrorScreen = useCallback((): void => {
    const failed = failedStep
    setFatalError({
      statusCode: 503,
      statusMessage: 'B-Shop system requirements check failed',
      bootFailed: true,
      failedKey: failed?.key ?? 'splash.step1',
      detail: failed?.detail ?? '',
    })
  }, [failedStep, setFatalError])

  /** تشغيل تسلسل الإقلاع: فحص فعلي → نجاح: توجيه تلقائي / فشل: شاشة الأخطاء */
  const startBootSequence = useCallback(async (): Promise<void> => {
    if (isBooting) return // حماية من التشغيل المتزامن (نقر مكرر على إعادة الفحص)
    setIsBooting(true)
    stopTimers()
    try {
      const passed = await runChecks()
      if (passed) {
        redirectTimer.current = setTimeout(continueToWorkspace, REDIRECT_DELAY_MS)
        return
      }
      failTimer.current = setTimeout(failToErrorScreen, FAIL_PAUSE_MS)
    } finally {
      setIsBooting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBooting, runChecks, continueToWorkspace, failToErrorScreen, stopTimers])

  useEffect(() => {
    void startBootSequence()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="flex-1 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center p-md">
        <div className="erp-card bg-glass max-w-[32rem] w-full p-xl text-center space-y-lg shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-xl bg-primary text-primary-f flex items-center justify-center text-2xl font-extrabold shadow-md">
            <Cuboid className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="primary" className="mb-xs">{t('app.versionBadge')}</Badge>
            <h1 className="text-2xl font-extrabold text-bg-f mt-xs">{t('splash.title')}</h1>
            <p className="text-xs text-muted-f mt-xs">{t('splash.subtitle')}</p>
          </div>

          <BootProgress currentStepLabel={currentStepLabel} percent={percent} />

          <BootStepsList
            steps={steps.map(step => t(step.key))}
            states={steps.map(step => step.state)}
            currentIndex={currentStepIndex}
          />

          <div className="flex items-center justify-center gap-sm pt-xs">
            <Button size="md" onClick={() => void startBootSequence()}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('splash.replay')}</span>
            </Button>
            <Button variant="primary" size="md" onClick={continueToWorkspace}>
              <span>{t('splash.skip')}</span>
              <ArrowRight className="w-3.5 h-3.5 icon-directional" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
