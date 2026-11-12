/**
 * src/schemas/auth.ts — مخططات Zod للتحقق من نموذج تسجيل الدخول.
 * منقول حرفيًا — رسائل الخطأ مفاتيح ترجمة بتترجم عبر t().
 */
import { z } from 'zod'
import { isValidIdentifier } from '@/utils/identifier'

export const identifierSchema = z
  .string()
  .trim()
  .min(1, 'signin.errIdEmpty')
  .refine(isValidIdentifier, 'signin.errIdInvalid')

export const passwordSchema = z.string().min(6, 'signin.errPassShort')

export const signInSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  remember: z.boolean(),
})

export type SignInInput = z.infer<typeof signInSchema>
