/**
 * src/stores/storage.ts — طبقة تخزين موحدة لمتاجر Zustand.
 * بتكتب حالة المتجر كـ JSON خام (بدون غلاف {state, version}) —
 * بنفس شكل وبنية @pinia-plugin-persistedstate في المشروع الأصلي،
 * فبيانات localStorage القديمة بتشتغل في النسخة الجديدة بدون أي ترحيل.
 */
import { createJSONStorage } from 'zustand/middleware'
import type { StateStorage, PersistStorage } from 'zustand/middleware'

const localStorageSink: StateStorage = {
  getItem: name => {
    try {
      const raw = window.localStorage.getItem(name)
      if (raw === null) return null
      // التوافق الرجعي: بقبل الحالة الخام (شكل Pinia) ونعيد تلفيفها لشكل Zustand داخليًا
      const parsed = JSON.parse(raw) as { state?: unknown; version?: number } | unknown
      if (parsed && typeof parsed === 'object' && 'state' in (parsed as { state?: unknown })) {
        return raw
      }
      return JSON.stringify({ state: parsed, version: 0 })
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      // بتفكيك غلاف {state, version} الخاص بـ Zustand ونكتب الحالة الخام فقط —
      // بنفس شكل وبنية @pinia-plugin-persistedstate في المشروع الأصلي
      const parsed = JSON.parse(value) as { state?: unknown; version?: number }
      const raw =
        parsed && typeof parsed === 'object' && 'state' in parsed ? JSON.stringify(parsed.state) : value
      window.localStorage.setItem(name, raw)
    } catch {
      // التخزين ممتلئ أو ممنوع — بنكمل في الذاكرة فقط
    }
  },
  removeItem: name => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // تجاهل هادئ
    }
  },
}

/** تخزين JSON بمحتوى خام — القيمة المكتوبة هي الحالة نفسها بدون غلاف */
export function createPlainStorage<S>(): PersistStorage<S> | undefined {
  return createJSONStorage<S>(() => localStorageSink)
}

/**
 * قراءة حالة مخزنة بصيغة Pinia/Zustand الخام — بتقبل الشكلين
 * ({state, version} أو الحالة الخام) عشان التوافق الرجعي الكامل.
 */
export function readPersistedState<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: T } | T
    if (parsed && typeof parsed === 'object' && 'state' in (parsed as { state?: T })) {
      return (parsed as { state: T }).state ?? null
    }
    return parsed as T
  } catch {
    return null
  }
}
