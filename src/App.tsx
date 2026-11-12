/**
 * src/App.tsx — الجذر الرئيسي للتطبيق.
 * - إطار التطبيق الخارجي (app-shell-frame) زي ملف التصميم بالظبط.
 * - مزامنة الثيم (light/dark/system) واللغة (ltr/rtl) مع وسم html.
 * - شريط العنوان العلوي الموحد (AppTitleBar) + إشعارات Sonner.
 * - شريط الحالة النظامي (SystemStatusBar) جوه شل مساحة العمل / شل المصادقة.
 * - Error Boundary + شاشة الأخطاء الموحدة (404/500/503) بإعادة محاولة أوتوماتيكية للإقلاع.
 */
import { Component, useEffect, useRef, useState } from 'react'
import { useTranslationSync } from '@/hooks/useThemeSync'
import { AppTitleBar } from '@/components/shared/AppTitleBar'
import { ErrorState } from '@/components/shared/ErrorState'
import { SystemStatusBar } from '@/components/system-status-bar/SystemStatusBar'
import { AppRouter } from '@/routes'
import { Toaster } from 'sonner'
import { useAppState } from '@/stores/appState'
import { usePreferencesStore } from '@/stores/preferences'
import { useI18n } from '@/hooks/useI18n'
import { RefreshCw, RotateCcw } from 'lucide-react'

const AUTO_RETRY_SECONDS = 10

export default function App() {
  // مزامنة الثيم والاتجاه مع وسم html (بديل watch في app.vue)
  useTranslationSync()

  const fatalError = useAppState(state => state.fatalError)
  const setFatalError = useAppState(state => state.setFatalError)
  const setResolvedTheme = useAppState(state => state.setResolvedTheme)
  const resolvedTheme = useAppState(state => state.resolvedTheme)
  const locale = usePreferencesStore(state => state.locale)
  const { dir } = useI18n()

  /** موضع الإشعارات حسب الاتجاه */
  const toastPosition = dir === 'rtl' ? 'bottom-left' : 'bottom-right'

  /** شاشة أخطاء قاتلة — بديل showError/createError في Nuxt */
  if (fatalError) {
    return (
      <FatalErrorScreen
        key={locale}
        fatalError={fatalError}
        resolvedTheme={resolvedTheme}
        onClear={setFatalError}
        setResolvedTheme={setResolvedTheme}
      />
    )
  }

  return (
    <AppWithBoundary resolvedTheme={resolvedTheme} toastPosition={toastPosition} />
  )
}

/** شل التطبيق + Error Boundary لالتقاط استثناءات الرندر (بديل error.vue) */
function AppWithBoundary({
  resolvedTheme,
  toastPosition,
}: {
  resolvedTheme: 'light' | 'dark'
  toastPosition: 'bottom-right' | 'bottom-left'
}) {
  const setFatalError = useAppState(state => state.setFatalError)

  const handleError = (error: Error): void => {
    // استثناءات الرندر بتروح لشاشة الأخطاء 500 (بديل الـ error boundary في Nuxt)
    window.setTimeout(() => {
      setFatalError({
        statusCode: 500,
        statusMessage: error.message || 'Unexpected runtime exception.',
      })
    }, 0)
  }

  return (
    <ErrorCatcher onError={handleError}>
      <div className="min-h-screen bg-bg p-sm flex">
        <div className="app-shell-frame w-full">
          <AppTitleBar />
          <AppRouter />
        </div>
      </div>

      <Toaster
        theme={resolvedTheme}
        position={toastPosition}
        dir={toastPosition === 'bottom-left' ? 'rtl' : 'ltr'}
        duration={3600}
        closeButton
        richColors
      />
    </ErrorCatcher>
  )
}

/** Error Boundary مبنية على componentDidCatch (Class Component مطلوبة للآلية الرسمية) */
interface ErrorCatcherProps {
  children: React.ReactNode
  onError: (error: Error) => void
}

class ErrorCatcher extends Component<ErrorCatcherProps, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      // الشاشة البديلة بتترسم من App بعد تحديث حالة الخطأ القاتل
      return null
    }
    return this.props.children
  }
}

/** شاشة الأخطاء القاتلة — 503 فيها إعادة محاولة أوتوماتيكية بفواصل + زر إعادة يدوي */
function FatalErrorScreen({
  fatalError,
  onClear,
}: {
  fatalError: { statusCode: 404 | 500 | 503; statusMessage?: string; bootFailed?: boolean; failedKey?: string; detail?: string }
  resolvedTheme: 'light' | 'dark'
  onClear: (error: null) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
}) {
  const { t } = useI18n()
  const [retryCountdown, setRetryCountdown] = useState(AUTO_RETRY_SECONDS)
  const retryTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const isBootFailure = fatalError.statusCode === 503 && fatalError.bootFailed

  /** الرجوع لشاشة الإقلاع لإعادة الفحص من جديد (يدوي أو بعد انتهاء العدّاد) */
  function retryBootCheck(): void {
    if (retryTimer.current) {
      clearInterval(retryTimer.current)
      retryTimer.current = null
    }
    onClear(null)
  }

  /** تحديث كامل للتطبيق من الخادم (أقوى من إعادة الفحص فقط) */
  function hardRefresh(): void {
    if (retryTimer.current) {
      clearInterval(retryTimer.current)
      retryTimer.current = null
    }
    window.location.assign('/')
  }

  useEffect(() => {
    if (!isBootFailure) return
    setRetryCountdown(AUTO_RETRY_SECONDS)
    retryTimer.current = setInterval(() => {
      setRetryCountdown(previous => {
        if (previous <= 1) {
          if (retryTimer.current) {
            clearInterval(retryTimer.current)
            retryTimer.current = null
          }
          retryBootCheck()
          return 0
        }
        return previous - 1
      })
    }, 1000)
    return () => {
      if (retryTimer.current) {
        clearInterval(retryTimer.current)
        retryTimer.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBootFailure])

  function recoverToDashboard(): void {
    onClear(null)
  }

  return (
    <div className="min-h-screen bg-bg p-sm flex">
      <div className="app-shell-frame w-full">
        <AppTitleBar />

        <main className="flex-1 flex flex-col items-center justify-center p-md bg-surface-alt overflow-y-auto">
          {/* فشل فحص متطلبات الإقلاع: إعادة محاولة أوتوماتيكية بفواصل + أزرار يدوية */}
          {isBootFailure ? (
            <ErrorState
              code="503"
              diagnostic=""
              actions={
                <div className="flex flex-col items-center gap-sm w-full max-w-[26rem]">
                  <div className="text-xs text-muted-f text-center font-semibold">
                    {t('errBoot.failedCheck')}:
                    <strong className="text-bg-f">{t(fatalError.failedKey ?? 'splash.step1')}</strong>
                  </div>
                  {fatalError.detail && (
                    <div className="font-mono text-xs text-muted-f bg-surface border border-border rounded px-sm py-xs w-full text-center break-all">
                      {t('errBoot.detail')}: {fatalError.detail}
                    </div>
                  )}

                  {/* عدّاد إعادة المحاولة الأوتوماتيكية مع شريط تقدم */}
                  <div className="w-full space-y-xs" role="status" aria-live="polite">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-f">
                      <span>{t('errBoot.autoRetry', { seconds: retryCountdown })}</span>
                      <span className="font-mono">{retryCountdown}s</span>
                    </div>
                    <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-war transition-all duration-1000 ease-linear"
                        style={{ inlineSize: `${(retryCountdown / AUTO_RETRY_SECONDS) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-sm">
                    <button type="button" className="erp-btn erp-btn-primary py-xs px-md text-xs" onClick={retryBootCheck}>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('errBoot.retryNow')}</span>
                    </button>
                    <button type="button" className="erp-btn py-xs px-md text-xs" onClick={hardRefresh}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('errBoot.refresh')}</span>
                    </button>
                  </div>
                </div>
              }
            />
          ) : (
            <ErrorState
              code={fatalError.statusCode === 404 ? '404' : '500'}
              diagnostic={fatalError.statusCode === 404 ? '' : (fatalError.statusMessage ?? fatalError.detail ?? '')}
              actions={
                fatalError.statusCode === 404 ? (
                  <>
                    <button type="button" className="erp-btn py-xs px-md text-xs" onClick={() => window.location.assign('/')}>
                      {t('err404.signin')}
                    </button>
                    <button type="button" className="erp-btn erp-btn-primary py-xs px-md text-xs" onClick={recoverToDashboard}>
                      {t('err404.dashboard')}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="erp-btn erp-btn-primary py-xs px-md text-xs" onClick={recoverToDashboard}>
                      {t('err500.recover')}
                    </button>
                    <button type="button" className="erp-btn py-xs px-md text-xs" onClick={() => window.location.assign('/')}>
                      {t('err500.reboot')}
                    </button>
                  </>
                )
              }
            />
          )}
        </main>

        {/* شريط الحالة النظامي في كل الشاشات بما فيها شاشات الأخطاء */}
        <SystemStatusBar />
      </div>
    </div>
  )
}
