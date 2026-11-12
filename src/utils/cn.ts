/** src/utils/cn.js — دمج أصناف Tailwind بذكاء (نفس أدوات shadcn/ui) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
