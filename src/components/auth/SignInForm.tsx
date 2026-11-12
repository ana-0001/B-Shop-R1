/** src/components/auth/SignInForm.tsx — نموذج تسجيل الدخول (Zod schema validation).
 * التحقق بالمخططات في schemas/auth.ts، ورسائل الخطأ مفاتيح ترجمة بتترجم عبر t(). */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { signInSchema } from '@/schemas/auth'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useAuthStore } from '@/stores/auth'
import { resolvePostAuthRoute } from '@/utils/auth-flow'
import { SmartIdentifierInput } from '@/components/auth/SmartIdentifierInput'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { DevCredentialsHint } from '@/components/auth/DevCredentialsHint'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'

export function SignInForm() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const signIn = useAuthStore(state => state.signIn)
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})

  /** رسائل الخطأ المترجمة للحقول */
  const identifierErrorMessage = errors.identifier ? t(errors.identifier) : null
  const passwordErrorMessage = errors.password ? t(errors.password) : null

  /** ملء تلقائي من صندوق التلميح التجريبي */
  function handleAutofill(payload: { identifier: string; password: string }): void {
    setIdentifier(payload.identifier)
    setPassword(payload.password)
    setRemember(true)
    setErrors({})
  }

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()

    // تحقق Zod بنفس مخطط المشروع الأصلي — رسائل الخطأ مفاتيح ترجمة
    const parsed = signInSchema.safeParse({ identifier, password, remember })
    if (!parsed.success) {
      const fieldErrors: { identifier?: string; password?: string } = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as 'identifier' | 'password' | undefined
        if (field === 'identifier' && !fieldErrors.identifier) fieldErrors.identifier = issue.message
        if (field === 'password' && !fieldErrors.password) fieldErrors.password = issue.message
      }
      setErrors(fieldErrors)
      toast.error(t('notif.validationErrors'))
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await signIn(parsed.data.identifier, parsed.data.password)
      // قراءة حالة البوابات بعد تسجيل الدخول مباشرة من المتجر
      const state = useAuthStore.getState()
      toast.success(t('signin.welcome', { name: state.user?.displayName ?? '' }))
      const needsTerms = !state.termsAcceptedAt
      const needsOnboarding = !!state.termsAcceptedAt && !state.onboardingCompleted
      navigate(resolvePostAuthRoute(needsTerms, needsOnboarding))
    } catch {
      toast.error(t('signin.errCredentials'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-md" noValidate onSubmit={onSubmit}>
      <SmartIdentifierInput
        value={identifier}
        errorMessage={identifierErrorMessage}
        disabled={isSubmitting}
        onChange={setIdentifier}
      />

      <PasswordInput
        value={password}
        errorMessage={passwordErrorMessage}
        disabled={isSubmitting}
        onChange={setPassword}
      />

      {/* تذكرني */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-xs cursor-pointer font-semibold text-bg-f">
          <Checkbox id="authRemember" checked={remember} onCheckedChange={setRemember} />
          <span>{t('signin.remember')}</span>
        </label>
        <span className="text-primary font-bold">v1.0 Dev</span>
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full py-sm shadow-md" disabled={isSubmitting}>
        <LogIn className="w-4 h-4 icon-directional" />
        <span>{isSubmitting ? t('signin.signingIn') : t('signin.submit')}</span>
      </Button>

      <DevCredentialsHint onAutofill={handleAutofill} />
    </form>
  )
}
