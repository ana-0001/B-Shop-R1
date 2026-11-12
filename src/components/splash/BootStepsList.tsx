/** src/components/splash/BootStepsList.tsx — قائمة خطوات فحص المتطلبات الخمسة أثناء الإقلاع */
import { CircleCheck, CircleDot, CircleX, LoaderCircle } from 'lucide-react'
import type { BootStepState } from '@/components/splash/useBootChecks'
import { cn } from '@/utils/cn'

export interface BootStepsListProps {
  steps: string[]
  states: BootStepState[]
  currentIndex: number
}

export function BootStepsList({ steps, states }: BootStepsListProps) {
  return (
    <div className="space-y-xs text-start text-xs border border-border rounded-lg p-sm bg-surface-alt">
      {steps.map((step, index) => (
        <div
          key={step}
          className="flex items-center justify-between py-0.5"
        >
          <span
            className={cn(
              'flex items-center gap-xs',
              states[index] === 'failed'
                ? 'text-err font-bold'
                : states[index] === 'passed'
                  ? 'text-ok font-semibold'
                  : states[index] === 'running'
                    ? 'text-primary font-bold'
                    : 'text-muted-f',
            )}
          >
            {states[index] === 'passed' ? (
              <CircleCheck className="w-3.5 h-3.5 text-ok" />
            ) : states[index] === 'failed' ? (
              <CircleX className="w-3.5 h-3.5 text-err" />
            ) : states[index] === 'running' ? (
              <LoaderCircle className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : (
              <CircleDot className="w-3.5 h-3.5" />
            )}
            {step}
          </span>
          <span className={cn('font-mono', states[index] === 'failed' && 'text-err font-bold')}>
            {states[index] === 'passed' ? 'OK' : states[index] === 'running' ? '...' : states[index] === 'failed' ? 'FAIL' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
