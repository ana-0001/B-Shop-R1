/**
 * src/services/api/client.ts — غلاف fetch المركزي لكل طلبات الـ HTTP.
 * منقول من ofetch إلى fetch القياسي بنفس العقد:
 * - في وضع المحاكاة (apiMock=true) الطلبات بتتنفذ من طبقة الـ Mock ولايوصل للشبكة.
 * - لما يتحول المشروع للباك إند الحقيقي نفس الغلاف بيستخدم مباشرة.
 */
import { ApiRequestError } from '@/types'

/** قراءة إعدادات التشغيل — بنفس عقد runtimeConfig في المشروع الأصلي */
function runtimePublic(): { apiMock: boolean; apiBaseUrl: string } {
  try {
    const apiMock = import.meta.env.VITE_API_MOCK
    return {
      apiMock: apiMock !== 'false',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    }
  } catch {
    return { apiMock: true, apiBaseUrl: '/api' }
  }
}

/** هل نحن في وضع المحاكاة؟ */
export function isMockEnabled(): boolean {
  return runtimePublic().apiMock
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT'
  body?: unknown
}

/** تنفيذ طلب حقيقي (يُستخدم فقط عندما apiMock=false) — مع معالجة أخطاء موحدة على شكل ApiRequestError */
export async function realRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { apiBaseUrl } = runtimePublic()
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    throw new ApiRequestError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
      messageAr: 'تعذر الاتصال بالخادم.',
    })
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | { code?: string; message?: string; messageAr?: string }
      | undefined
    throw new ApiRequestError({
      code: body?.code ?? `HTTP_${response.status}`,
      message: body?.message ?? response.statusText,
      messageAr: body?.messageAr ?? body?.message ?? response.statusText,
    })
  }

  return (await response.json()) as T
}
