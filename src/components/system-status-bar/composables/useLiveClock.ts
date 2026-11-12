/**
 * src/components/system-status-bar/composables/useLiveClock.ts — محرك الساعة الحية.
 * منقول حرفيًا من المشروع الأصلي:
 * - العرض الرئيسي 12 ساعة (hh:mm A) — بأرقام عربية في الواجهة العربية.
 * - كل العروض مثبتة على توقيت القاهرة (Africa/Cairo) لدقة البيانات المالية.
 * - Tooltip احترافي عند التحويم يعرض 24 ساعة + التاريخ الميلادي + الهجري (أم القرى).
 */
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/hooks/useI18n'

/** المنطقة الزمنية المثبتة حاليًا (PRD: تُستبدل مستقبلًا من سياق RegionSettings العام) */
export const SSB_TIMEZONE = 'Africa/Cairo'

/** كاش منسّقات Intl — المفتاح `${tag}|${options-hash}` */
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(tag: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${tag}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

/** وسم الـ locale الكامل حسب لغة الواجهة */
function localeTag(locale: 'en' | 'ar'): string {
  return locale === 'ar' ? 'ar-EG' : 'en-US'
}

/**
 * بناء سطر التاريخ بصيغة PRD: "Tuesday : 12 - (05 - May) - 2026 AD".
 * بنستخدم formatToParts عشان نركّب الصيغة يدويًا بأسماء الأيام والشهور المحلية.
 */
function formatPrdDate(
  date: Date,
  tag: string,
  withCalendar?: 'gregory' | 'islamic-umalqura',
  timeZone?: string,
): string {
  const fullTag = withCalendar ? `${tag}-u-ca-${withCalendar}` : tag
  const parts = getFormatter(fullTag, {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    era: 'short',
  }).formatToParts(date)

  const pick = (type: string): string => parts.find(part => part.type === type)?.value ?? ''

  // اسم الشهر الكامل — منسّق منفصل لأن Intl لا يسمح بدمج month: 'long' مع '2-digit'
  const monthName = getFormatter(fullTag, { timeZone, month: 'long' }).format(date)

  return `${pick('weekday')} : ${pick('day')} - (${pick('month')} - ${monthName}) - ${pick('year')} ${pick('era')}`
}

export function useLiveClock() {
  const { locale } = useI18n()

  /** اللحظة الحالية — تتحدث كل ثانية */
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return useMemo(() => {
    const tag = localeTag(locale)

    /** العرض الرئيسي — 12 ساعة hh:mm A بتوقيت القاهرة (مثال: 02:30 PM / ٠٢:٣٠ م) */
    const time12 = (() => {
      try {
        return getFormatter(tag, {
          timeZone: SSB_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now)
      } catch {
        return now.toISOString()
      }
    })()

    /** وقت القاهرة 24 ساعة مع الثواني — للـ Tooltip */
    const cairo24 = (() => {
      try {
        return getFormatter(tag, {
          timeZone: SSB_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }).format(now)
      } catch {
        return '—'
      }
    })()

    /** التاريخ الميلادي بصيغة PRD — بتوقيت القاهرة عشان تاريخ العمليات المالي يتطابق */
    const gregorian = (() => {
      try {
        return formatPrdDate(now, tag, undefined, SSB_TIMEZONE)
      } catch {
        return '—'
      }
    })()

    /** التاريخ الهجري بتقويم أم القرى (Umm al-Qura) بصيغة PRD — بتوقيت القاهرة */
    const hijri = (() => {
      try {
        return formatPrdDate(now, tag, 'islamic-umalqura', SSB_TIMEZONE)
      } catch {
        return '—'
      }
    })()

    return { now, time12, cairo24, gregorian, hijri }
  }, [now, locale])
}
