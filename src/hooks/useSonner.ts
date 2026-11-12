/**
 * src/hooks/useSonner.ts — غلاف موحد لإشعارات Sonner.
 * منقول حرفيًا من useSonner في المشروع الأصلي —
 * كل الإشعارات في المشروع بتخرج من هنا عشان الشكل والألوان تبقى موحدة.
 */
import { toast } from 'sonner'

export function useSonner() {
  return { toast }
}

/** إشعار نجاح */
export function notifySuccess(message: string): void {
  toast.success(message)
}

/** إشعار خطأ */
export function notifyError(message: string): void {
  toast.error(message)
}

/** إشعار تحذير */
export function notifyWarning(message: string): void {
  toast.warning(message)
}

/** إشعار معلومات */
export function notifyInfo(message: string): void {
  toast.info(message)
}
