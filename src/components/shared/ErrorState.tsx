/** src/components/shared/ErrorState.tsx — شاشة الأخطاء الموحدة (404 / 500 / 503) بنفس تصميم الملف المرجعي */
import { useNavigate } from 'react-router-dom'
import { Compass, TriangleAlert, LogIn, ChartPie, RotateCcw, Power } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export interface ErrorStateProps {
  code: '404' | '500' | '503'
  diagnostic?: string
  actions?: React.ReactNode
}

export function ErrorState({ code, diagnostic = '', actions }: ErrorStateProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const isNotFound = code === '404'

  return (
    <article className={cn('erp-card bg-glass max-w-[32rem] w-full p-xl text-center space-y-md shadow-xl', !isNotFound && 'border-err')}>
      <div
        className={cn(
          'w-16 h-16 mx-auto rounded-full bg-surface-alt border flex items-center justify-center text-3xl',
          isNotFound ? 'border-border text-primary' : 'border-err text-err',
        )}
      >
        {isNotFound ? <Compass className="w-8 h-8" /> : <TriangleAlert className="w-8 h-8" />}
      </div>

      <div className={cn('text-3xl font-extrabold font-mono', isNotFound ? 'gradient-code-text' : 'text-err')}>
        {t(`err${code}.code`)}
      </div>

      <h1 className="text-xl font-extrabold text-bg-f">{t(`err${code}.title`)}</h1>
      <p className="text-xs text-muted-f">{t(`err${code}.desc`)}</p>

      {!isNotFound && diagnostic && (
        <p className="p-sm rounded bg-surface-alt border border-border text-xs font-mono text-err text-start break-all">
          {t('err500.diagnostic')}: {diagnostic}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-sm pt-sm">
        {actions ?? (
          <>
            {isNotFound ? (
              <>
                <Button size="md" onClick={() => navigate('/auth/sign-in')}>
                  <LogIn className="w-3.5 h-3.5 icon-directional" />
                  <span>{t('err404.signin')}</span>
                </Button>
                <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
                  <ChartPie className="w-3.5 h-3.5" />
                  <span>{t('err404.dashboard')}</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('err500.recover')}</span>
                </Button>
                <Button size="md" onClick={() => navigate('/')}>
                  <Power className="w-3.5 h-3.5" />
                  <span>{t('err500.reboot')}</span>
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </article>
  )
}
