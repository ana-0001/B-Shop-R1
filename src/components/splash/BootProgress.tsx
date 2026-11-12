/** src/components/splash/BootProgress.tsx — شريط التقدم ونسبة الإقلاع */
export interface BootProgressProps {
  currentStepLabel: string
  percent: number
}

export function BootProgress({ currentStepLabel, percent }: BootProgressProps) {
  return (
    <div className="space-y-xs text-start">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-primary">{currentStepLabel}</span>
        <span className="font-mono text-bg-f">{percent}%</span>
      </div>
      <div
        className="w-full h-3 bg-surface-alt rounded-full overflow-hidden border border-border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary transition-all" style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  )
}
