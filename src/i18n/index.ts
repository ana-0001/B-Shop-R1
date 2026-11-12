/**
 * src/i18n/index.ts — نظام الترجمة المركزي (i18n) للمشروع.
 * منقول حرفيًا من useI18n في المشروع الأصلي:
 * - القواميس في src/locales/en.json و ar.json بمفاتيح مسطحة.
 * - اتجاه الصفحة (LTR/RTL) متاح كقيمة مشتقة.
 * - دالة t() بتدعم الاستبدال {param} للقيم الديناميكية.
 */
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'
import type { LocaleCode } from '@/types'

type Dictionary = Record<string, string>

const dictionaries: Record<LocaleCode, Dictionary> = {
  en: en as Dictionary,
  ar: ar as Dictionary,
}

/** ترجمة مفتاح مع دعم الاستبدال — بترجع المفتاح نفسه لو مش موجود (fallback إنجليزي) */
export function translate(locale: LocaleCode, key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[locale] ?? dictionaries.en
  let text = dict[key] ?? dictionaries.en[key] ?? key
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replaceAll(`{${param}}`, String(value))
    }
  }
  return text
}

/** اتجاه الواجهة حسب اللغة */
export function localeDir(locale: LocaleCode): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
