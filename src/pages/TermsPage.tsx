/** src/pages/TermsPage.tsx — شاشة الشروط والأحكام (5 بنود إلزامية + checkbox لتفعيل القبول) */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LogOut } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useSonner } from '@/hooks/useSonner'
import { useAuthStore } from '@/stores/auth'
import { resolvePostAuthRoute } from '@/utils/auth-flow'
import { ROUTE_NAMES } from '@/utils/constants'
import { AppLogo } from '@/components/shared/AppLogo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function TermsPage() {
  const { t } = useI18n()
  const { toast } = useSonner()
  const authStore = useAuthStore()
  const navigate = useNavigate()
  useDocumentTitle('B-Shop — Terms & Conditions')

  const [hasAgreed, setHasAgreed] = useState(false)

  /** البنود الخمسة — نصوصها في ملفات الترجمة (en/ar) */
  const clauses = [1, 2, 3, 4, 5].map(index => ({
    title: t(`terms.clause${index}Title`),
    body: t(`terms.clause${index}Body`),
  }))

  /** قبول الشروط والتوجيه حسب بوابات الـ Onboarding */
  async function acceptTerms(): Promise<void> {
    // انتظار الحفظ في الـ API أولًا — عشان بوابات الـ middleware تتقرر على حالة سليمة
    await authStore.acceptTerms()
    toast.success(t('notif.termsAccepted'))
    const state = useAuthStore.getState()
    navigate(resolvePostAuthRoute(false, !!state.termsAcceptedAt && !state.onboardingCompleted))
  }

  /** رفض الشروط = تسجيل خروج كامل */
  async function declineTerms(): Promise<void> {
    await authStore.signOut()
    toast.warning(t('notif.termsDeclined'))
    navigate(ROUTE_NAMES.signIn)
  }

  return (
    <section className="erp-glass-card max-w-[42rem] w-full space-y-md">
      <header className="flex items-center justify-between border-b border-border pb-sm gap-sm">
        <div className="flex items-center gap-sm">
          <span className="w-10 h-10 rounded-lg bg-primary text-primary-f flex items-center justify-center text-lg">
            <AppLogo size="sm" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-bg-f">{t('terms.title')}</h1>
            <p className="text-xs text-muted-f">{t('terms.subtitle')}</p>
          </div>
        </div>
        <Badge variant="war">{t('terms.badge')}</Badge>
      </header>

      {/* البنود الخمسة */}
      <div className="max-h-64 overflow-y-auto space-y-sm p-sm rounded-lg border border-border bg-surface text-xs">
        {clauses.map(clause => (
          <article key={clause.title} className="p-sm rounded border border-border bg-surface-alt space-y-xs">
            <h3 className="font-extrabold text-primary">{clause.title}</h3>
            <p className="text-muted-f leading-relaxed">{clause.body}</p>
          </article>
        ))}
      </div>

      {/* مربع الموافقة الإلزامي */}
      <label className="flex items-center gap-sm p-sm rounded border border-border bg-surface-alt cursor-pointer text-xs font-bold text-bg-f">
        <Checkbox id="termsAgreeCheckbox" checked={hasAgreed} onCheckedChange={setHasAgreed} />
        <span>{t('terms.agreeLabel')}</span>
      </label>

      <div className="flex items-center justify-between gap-sm pt-xs flex-wrap">
        <Button variant="danger" size="md" onClick={() => void declineTerms()}>
          <LogOut className="w-3.5 h-3.5 icon-directional" />
          <span>{t('terms.decline')}</span>
        </Button>
        <Button variant="primary" size="lg" disabled={!hasAgreed} onClick={() => void acceptTerms()}>
          <span>{t('terms.accept')}</span>
          <ArrowRight className="w-3.5 h-3.5 icon-directional" />
        </Button>
      </div>
    </section>
  )
}
