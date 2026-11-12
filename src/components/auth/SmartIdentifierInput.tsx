/** src/components/auth/SmartIdentifierInput.tsx — حقل المعرّف الموحد الذكي.
 * بيكشف النوع أثناء الكتابة (بريد / موبايل / اسم مستخدم) ويعرض Badge وأيقونة مناسبة. */
import { Mail, Smartphone, UserCheck, UserRound } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import {
  detectIdentifierType,
  identifierBadgeClass,
  identifierBadgeKey,
  identifierFeedbackKey,
} from '@/utils/identifier'
import { Label } from '@/components/ui/Label'

export interface SmartIdentifierInputProps {
  value?: string
  id?: string
  /** رسالة خطأ جاهزة (مترجمة) من مستوى النموذج — بتلغي رسالة الفحص اللحظي */
  errorMessage?: string | null
  disabled?: boolean
  onChange?: (value: string) => void
}

export function SmartIdentifierInput({
  value = '',
  id = 'authIdentifier',
  errorMessage = null,
  disabled = false,
  onChange,
}: SmartIdentifierInputProps) {
  const { t } = useI18n()

  const detectedType = detectIdentifierType(value)
  const isInvalid = detectedType === 'invalid' || detectedType === 'empty'
  const hasError = !!errorMessage || isInvalid
  const isValid =
    !errorMessage && (detectedType === 'email' || detectedType === 'phone' || detectedType === 'username')

  const feedbackText = errorMessage
    ? errorMessage
    : t(identifierFeedbackKey(detectedType))

  const TrailingIcon = detectedType === 'email' ? Mail
    : detectedType === 'phone' ? Smartphone
    : detectedType === 'username' ? UserCheck
    : UserRound

  const iconClass = isValid ? 'text-ok' : 'text-muted-f'

  return (
    <div>
      <div className="flex justify-between items-center mb-xs">
        <Label htmlFor={id} className="!mb-0">{t('signin.idLabel')}</Label>
        <span className={`erp-badge ${identifierBadgeClass(detectedType)}`}>
          {t(identifierBadgeKey(detectedType))}
        </span>
      </div>

      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={value}
          disabled={disabled}
          className="erp-input pe-8"
          placeholder={t('signin.idPlaceholder')}
          aria-invalid={hasError}
          aria-describedby={`${id}-feedback`}
          onChange={event => onChange?.(event.target.value)}
        />
        <TrailingIcon
          className={`w-3.5 h-3.5 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconClass}`}
        />
      </div>

      <p
        id={`${id}-feedback`}
        className={`text-xs mt-xs font-semibold ${hasError ? 'text-err' : isValid ? 'text-ok' : 'text-muted-f'}`}
      >
        {feedbackText}
      </p>
    </div>
  )
}
