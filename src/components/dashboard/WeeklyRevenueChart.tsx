/**
 * src/components/dashboard/WeeklyRevenueChart.tsx — شارت المبيعات الأسبوعي (Recharts).
 * بديل Chart.js بنفس الشكل: خط مبيعات ذهبي بامتلاء متدرج + خط مشتريات أخضر متقطع،
 * والألوان بتتبع الثيم الحالي (light/dark) من توكنز النظام.
 */
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useI18n } from '@/hooks/useI18n'
import { useAppState } from '@/stores/appState'

interface WeekPoint {
  label: string
  sales: number
  purchases: number
}

export interface WeeklyRevenueChartProps {
  series: WeekPoint[]
}

export function WeeklyRevenueChart({ series }: WeeklyRevenueChartProps) {
  const { t } = useI18n()
  const resolvedTheme = useAppState(state => state.resolvedTheme)

  /** ألوان الشارت من لوحة PRD الموحّدة (ذهبي/أخضر + محايدات كحلية) */
  const palette = useMemo(() => {
    const dark = resolvedTheme === 'dark'
    return {
      primary: dark ? 'hsl(45 85% 62%)' : 'hsl(45 85% 48%)',
      primaryFill: dark ? 'hsla(45 85% 62% / 0.16)' : 'hsla(45 85% 48% / 0.14)',
      ok: dark ? 'hsl(142 71% 46%)' : 'hsl(142 71% 38%)',
      grid: dark ? 'hsla(220 15% 24% / 0.9)' : 'hsla(220 15% 83% / 0.8)',
      tick: dark ? 'hsl(220 10% 62%)' : 'hsl(220 15% 30%)',
    }
  }, [resolvedTheme])

  return (
    <div className="w-full overflow-hidden h-56" role="img" aria-label="Weekly revenue trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: palette.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            reversed={false}
          />
          <YAxis
            tick={{ fill: palette.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickCount={5}
          />
          <Tooltip cursor={{ stroke: palette.grid }} isAnimationActive={false} />
          <Legend wrapperStyle={{ color: palette.tick, fontSize: 11 }} iconSize={12} />
          <Area
            type="monotone"
            dataKey="sales"
            name={t('dash.legendSales')}
            stroke={palette.primary}
            fill={palette.primaryFill}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: palette.primary, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="purchases"
            name={t('dash.legendPurchases')}
            stroke={palette.ok}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 2.5, fill: palette.ok, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
