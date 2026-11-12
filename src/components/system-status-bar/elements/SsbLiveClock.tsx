/** src/components/system-status-bar/elements/SsbLiveClock.tsx — الساعة الحية 12 ساعة مع Tooltip احترافي (PRD) */
import { useEffect, useRef, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Clock3, MapPin, CalendarDays, MoonStar } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useLiveClock } from '@/components/system-status-bar/composables/useLiveClock'

export function SsbLiveClock() {
  const { t } = useI18n()
  const { time12, cairo24, gregorian, hijri } = useLiveClock()

  /** حالة الفتح اليدوية — للتحويم (hover) والتركيز معًا */
  const [isOpen, setIsOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** إغلاق مؤجل عند مغادرة المؤشر عشان النقر داخل الـ Popover ما يقفلش فجأة */
  function scheduleClose(): void {
    closeTimer.current = setTimeout(() => setIsOpen(false), 180)
  }

  function cancelClose(): void {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  useEffect(() => () => cancelClose(), [])

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="ssb-icon-btn ssb-clock"
          aria-label={t('ssb.aria.clock')}
          title={t('ssb.aria.clock')}
          data-testid="ssb-clock"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={scheduleClose}
          onFocus={() => setIsOpen(true)}
          onBlur={scheduleClose}
        >
          <Clock3 aria-hidden="true" />
          <span>{time12}</span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="ssb-pop-content"
          side="top"
          sideOffset={8}
          align="end"
          onOpenAutoFocus={event => event.preventDefault()}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* عنوان البطاقة */}
          <p className="ssb-pop-title">
            <CalendarDays aria-hidden="true" />
            <span>{t('ssb.clock.tooltipTitle')}</span>
          </p>

          {/* 24 ساعة بتوقيت القاهرة */}
          <div className="ssb-pop-row">
            <span className="ssb-pop-row-label">
              <MapPin aria-hidden="true" />
              <span>{t('ssb.clock.cairo24')}</span>
            </span>
            <span className="ssb-pop-row-value" data-testid="ssb-cairo24">{cairo24}</span>
          </div>

          {/* التاريخ الميلادي */}
          <div className="ssb-pop-row">
            <span className="ssb-pop-row-label">
              <CalendarDays aria-hidden="true" />
              <span>{t('ssb.clock.gregorian')}</span>
            </span>
            <span className="ssb-pop-row-value">{gregorian}</span>
          </div>

          {/* التاريخ الهجري (أم القرى) */}
          <div className="ssb-pop-row">
            <span className="ssb-pop-row-label">
              <MoonStar aria-hidden="true" />
              <span>{t('ssb.clock.hijri')}</span>
            </span>
            <span className="ssb-pop-row-value" data-testid="ssb-hijri">{hijri}</span>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
