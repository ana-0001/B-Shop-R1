/**
 * src/hooks/useClock.ts — ساعة حية لشريط الحالة السفلي.
 * منقول حرفيًا — بتحدّث الوقت كل ثانية وتتنظم تلقائيًا مع دورة حياة المكون.
 */
import { useEffect, useState } from 'react'

export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return { now }
}
