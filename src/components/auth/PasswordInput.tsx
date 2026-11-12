/** src/components/auth/PasswordInput.tsx — حقل كلمة المرور مع زر إظهار/إخفاء ورسالة تحقق */
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { Label } from '@/components/ui/Label'

export interface PasswordInputProps {
  value?: string
  id?: string
  /** رسالة خطأ جاهزة (مترجمة) من مستوى النموذج */
  errorMessage?: string | null
  disabled?: boolean
  onChange?: (value: string) => void
}

export function PasswordInput({
  value = '',
  id = 'authPassword',
  errorMessage = null,
  disabled = false,
  onChange,
}: PasswordInputProps) {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)

  const hasError = !!errorMessage || (value.length > 0 && value.length < 6)
  const isValid = !errorMessage && value.length >= 6

  const feedbackText = errorMessage
    ? errorMessage
    : isValid
      ? t('signin.okPass')
      : value.length > 0
        ? t('signin.errPassShort')
        : ''

  return (
    <div>
      <Label htmlFor={id}>{t('signin.passLabel')}</Label>

      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          disabled={disabled}
          className="erp-input pe-8"
          placeholder="••••••••"
          aria-invalid={hasError}
          aria-describedby={`${id}-feedback`}
          onChange={event => onChange?.(event.target.value)}
        />
        <button
          type="button"
          className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-f hover:text-bg-f px-xs"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      {feedbackText && (
        <p
          id={`${id}-feedback`}
          className={`text-xs mt-xs font-semibold ${hasError ? 'text-err' : 'text-ok'}`}
        >
          {feedbackText}
        </p>
      )}
    </div>
  )
}
