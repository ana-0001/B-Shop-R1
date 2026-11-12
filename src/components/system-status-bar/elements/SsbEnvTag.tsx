/** src/components/system-status-bar/elements/SsbEnvTag.tsx — وسم البيئة (PRD: Environment Tag) */
import { useI18n } from '@/hooks/useI18n'

export function SsbEnvTag() {
  const { t } = useI18n()
  const isDev = import.meta.env.DEV
  const envLabel = isDev ? t('ssb.env.dev') : t('ssb.env.prod')

  return (
    <span className="ssb-env-tag" data-env={isDev ? 'dev' : 'prod'} data-testid="ssb-env">
      {envLabel}
    </span>
  )
}
