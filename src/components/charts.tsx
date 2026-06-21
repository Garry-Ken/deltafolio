import type { ChartPoint } from '../types'

interface DonutProps {
  segments: { value: number; color: string; label: string }[]
  size?: number
}

export function Donut({ segments, size = 160 }: DonutProps) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null
  const r = 54, cx = 64, cy = 64, C = 2 * Math.PI * r
  let offset = 0

  return (
    <svg viewBox="0 0 128 128" width={size} height={size}>
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * C
        const o = offset
        offset += dash
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={14}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-o}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.85}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={42} fill="var(--donut-bg, white)" className="fill-white dark:fill-[#1c1c1e]" />
    </svg>
  )
}

interface SparklineProps {
  points: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ points, width = 64, height = 24, color }: SparklineProps) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const up = points[points.length - 1] >= points[0]
  const c = color ?? (up ? '#30d158' : '#ff3b30')

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 2) - 1
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <polyline points={coords.join(' ')} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface PriceLineProps {
  data: ChartPoint[]
  width?: number
  height?: number
}

export function PriceLine({ data, width = 320, height = 180 }: PriceLineProps) {
  if (data.length < 2) return <div className="flex items-center justify-center text-[#86868b] text-sm" style={{ width, height }}>No chart data</div>

  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const pad = 4

  const up = prices[prices.length - 1] >= prices[0]
  const color = up ? '#30d158' : '#ff3b30'

  const coords = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (d.price - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0]},${c[1]}`).join(' ')
  const areaPath = `${linePath} L${coords[coords.length - 1][0]},${height} L${coords[0][0]},${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#area-grad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r={3} fill={color} />
    </svg>
  )
}
