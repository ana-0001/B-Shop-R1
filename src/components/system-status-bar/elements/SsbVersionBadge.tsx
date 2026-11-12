/** src/components/system-status-bar/elements/SsbVersionBadge.tsx — شارة الإصدار الذهبية (PRD: Version Badge) */
import { useI18n } from '@/hooks/useI18n'
import { APP_VERSION } from '@/utils/constants'

export function SsbVersionBadge() {
  const { t } = useI18n()

  return (
    <span
      className="ssb-version-badge"
      title={`${t('splash.fiscalBuild')} — ${t('app.subtitle')}`}
      data-testid="ssb-version"
    >
      v{APP_VERSION}
    </span>
  )
}
