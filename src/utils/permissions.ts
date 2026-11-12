/**
 * src/utils/permissions.ts — منطق صلاحيات super_bomba (المستوى 900).
 * منقول حرفيًا — أي مستخدم مستواه 900 بيتسمح له فورًا (ALLOW_ALL).
 */
import type { SessionUser } from '@/types'
import { SUPER_BOMBA_LEVEL } from '@/utils/constants'

/** هل المستخدم الحالي هو صانع النظام (super bomba)؟ */
export function isSuperBomba(user: SessionUser | null | undefined): boolean {
  return !!user && user.level >= SUPER_BOMBA_LEVEL
}

/**
 * فحص صلاحية على مستوى scope — الصانع بيتجاوزها فورًا.
 * (النسخة الكاملة للفحوصات هتتوفر مع الباك إند)
 */
export function hasScope(user: SessionUser | null | undefined, _scope: string): boolean {
  if (isSuperBomba(user)) return true
  return true
}
