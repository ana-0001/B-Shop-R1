/** src/components/onboarding/StepProfile.tsx — الخطوة 2: الملف الشخصي والمسمى الوظيفي والأيقونة */
import { UserCog, Calculator, Store, Warehouse } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

/** الأيقونات الرمزية المتاحة للمشغل */
const avatarOptions = [
  { key: 'user-cog', icon: UserCog },
  { key: 'calculator', icon: Calculator },
  { key: 'store', icon: Store },
  { key: 'warehouse', icon: Warehouse },
] as const

export interface StepProfileProps {
  jobTitle: string
  avatarIcon: string
  onJobTitleChange: (value: string) => void
  onAvatarIconChange: (value: string) => void
}

export function StepProfile({ jobTitle, avatarIcon, onJobTitleChange, onAvatarIconChange }: StepProfileProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-md">
      <h2 className="text-lg font-extrabold text-bg-f">{t('onboard.step2Title')}</h2>

      <div>
        <Label htmlFor="onboardJobTitle">{t('onboard.jobTitleLabel')}</Label>
        <Input
          id="onboardJobTitle"
          type="text"
          value={jobTitle}
          placeholder={t('onboard.jobTitlePlaceholder')}
          onChange={event => onJobTitleChange(event.target.value)}
        />
      </div>

      <div>
        <span className="block text-xs font-bold text-bg-f mb-xs">{t('onboard.avatarLabel')}</span>
        <div className="flex items-center gap-sm flex-wrap">
          {avatarOptions.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.key}
                type="button"
                className={`w-12 h-12 rounded-lg border flex items-center justify-center text-lg transition-all ${
                  avatarIcon === option.key
                    ? 'bg-primary text-primary-f border-primary shadow-md'
                    : 'bg-surface-alt text-bg-f border-border hover:bg-hover'
                }`}
                aria-pressed={avatarIcon === option.key}
                onClick={() => onAvatarIconChange(option.key)}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
