/** src/components/system-status-bar/elements/SsbSettingsTrigger.tsx — زر فتح درج الإعدادات (PRD: Settings Drawer) */
import { Settings2 } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useAppState } from '@/stores/appState'

export function SsbSettingsTrigger() {
  const { t } = useI18n()
  const settingsOpen = useAppState(state => state.ssbSettingsOpen)
  const setSsbSettingsOpen = useAppState(state => state.setSsbSettingsOpen)

  return (
    <button
      type="button"
      className="ssb-icon-btn"
      aria-label={t('ssb.aria.settings')}
      title={t('ssb.aria.settings')}
      aria-haspopup="dialog"
      aria-expanded={settingsOpen}
      data-testid="ssb-settings"
      onClick={() => setSsbSettingsOpen(true)}
    >
      <Settings2 aria-hidden="true" />
    </button>
  )
}
