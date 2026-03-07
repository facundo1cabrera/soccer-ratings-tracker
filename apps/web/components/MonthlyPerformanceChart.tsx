"use client"

import { getRatingCssColor } from "@/lib/rating-utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MatchEntry = { date: string; rating: number }

type MonthBucket = {
  key: string
  label: string
  avg: number | null
}

// ---------------------------------------------------------------------------
// SVG layout constants (viewBox units)
// ---------------------------------------------------------------------------

const CHART_W = 520
const CHART_H = 200
const PAD_TOP = 36
const PAD_RIGHT = 36
const PAD_BOTTOM = 28
const PAD_LEFT = 8
const SCALE_W = 10
const BAR_GAP = 4
const N = 12

const TOTAL_W = PAD_LEFT + CHART_W + PAD_RIGHT
const TOTAL_H = PAD_TOP + CHART_H + PAD_BOTTOM

const barW = (CHART_W - (N - 1) * BAR_GAP) / N

function ratingToY(rating: number): number {
  return PAD_TOP + CHART_H - (rating / 10) * CHART_H
}

function ratingToBarH(rating: number): number {
  return (rating / 10) * CHART_H
}

// ---------------------------------------------------------------------------
// Scale bar tiers (matches getChartColor thresholds exactly)
// ---------------------------------------------------------------------------

const SCALE_TIERS = [
  { min: 9.0, max: 10,  color: "var(--color-purple-500)" },
  { min: 8.6, max: 9.0, color: "var(--color-blue-600)"   },
  { min: 8.1, max: 8.6, color: "var(--color-blue-400)"   },
  { min: 7.6, max: 8.1, color: "var(--color-green-600)"  },
  { min: 7.1, max: 7.6, color: "var(--color-green-400)"  },
  { min: 6.6, max: 7.1, color: "var(--color-yellow-500)" },
  { min: 6.1, max: 6.6, color: "var(--color-orange-500)" },
  { min: 0,   max: 6.1, color: "var(--color-red-500)"    },
]

const SCALE_LABELS = [9, 8, 7, 6]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMonthBuckets(matches: MatchEntry[]): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []

  for (let i = N - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d
        .toLocaleDateString("es-AR", { month: "short" })
        .replace(/\.$/, "")
        .replace(/^\w/, (c) => c.toUpperCase()),
      avg: null,
    })
  }

  const byMonth: Record<string, number[]> = {}
  for (const m of matches) {
    const d = new Date(m.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(m.rating)
  }

  return buckets.map((b) => {
    const ratings = byMonth[b.key]
    if (!ratings || ratings.length === 0) return b
    return {
      ...b,
      avg: ratings.reduce((s, r) => s + r, 0) / ratings.length,
    }
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RatingScaleBar({
  x,
  y,
  width,
  height,
}: {
  x: number
  y: number
  width: number
  height: number
}) {
  return (
    <g>
      {SCALE_TIERS.map((tier) => {
        const tierY = y + (1 - tier.max / 10) * height
        const tierH = Math.max(((tier.max - tier.min) / 10) * height, 0.5)
        return (
          <rect
            key={tier.min}
            x={x}
            y={tierY}
            width={width}
            height={tierH}
            fill={tier.color}
          />
        )
      })}
      {SCALE_LABELS.map((r) => {
        const ly = y + (1 - r / 10) * height
        return (
          <text key={r} x={x + width + 5} y={ly + 4} fill="var(--color-muted-foreground)" fontSize={10}>
            {r}
          </text>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Props = {
  matches: MatchEntry[]
  overallAvg: number
}

export function MonthlyPerformanceChart({ matches, overallAvg }: Props) {
  const buckets = buildMonthBuckets(matches)
  const hasData = matches.length > 0
  const avgLineY = ratingToY(overallAvg)
  const avgLineColor = getRatingCssColor(overallAvg)

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-foreground text-xl font-bold text-center mb-3">
        Resumen (últimos 12 meses)
      </h2>

      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Month labels — every 2nd bar */}
        {buckets.map((b, i) => {
          if (i % 2 !== 0) return null
          const cx = PAD_LEFT + i * (barW + BAR_GAP) + barW / 2
          return (
            <text
              key={`ml-${b.key}`}
              x={cx}
              y={PAD_TOP - 8}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
              fontSize={12}
            >
              {b.label}
            </text>
          )
        })}

        {/* Bars */}
        {buckets.map((b, i) => {
          const bx = PAD_LEFT + i * (barW + BAR_GAP)

          if (b.avg === null) {
            // No data — leave the slot empty, only show the "-" label below
            return null
          }

          const bh = ratingToBarH(b.avg)
          const by = PAD_TOP + (CHART_H - bh)
          const col = getRatingCssColor(b.avg)

          return (
            <g key={b.key}>
              {/* Full-height muted backdrop */}
              <rect
                x={bx}
                y={PAD_TOP}
                width={barW}
                height={CHART_H}
                fill="var(--color-muted)"
                rx={3}
              />
              {/* Coloured portion */}
              <rect x={bx} y={by} width={barW} height={bh} fill={col} rx={3} />
            </g>
          )
        })}

        {/* Average reference line */}
        {hasData && (
          <line
            x1={PAD_LEFT}
            y1={avgLineY}
            x2={PAD_LEFT + CHART_W}
            y2={avgLineY}
            stroke={avgLineColor}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}

        {/* Rating labels below bars */}
        {buckets.map((b, i) => {
          const cx = PAD_LEFT + i * (barW + BAR_GAP) + barW / 2
          const ty = PAD_TOP + CHART_H + 18
          const col = b.avg !== null ? getRatingCssColor(b.avg) : "var(--color-muted-foreground)"
          return (
            <text
              key={`rl-${b.key}`}
              x={cx}
              y={ty}
              textAnchor="middle"
              fill={col}
              fontSize={10}
              fontWeight="bold"
            >
              {b.avg !== null ? b.avg.toFixed(1) : "-"}
            </text>
          )
        })}

        {/* Right-side colour scale bar */}
        <RatingScaleBar
          x={PAD_LEFT + CHART_W + 8}
          y={PAD_TOP}
          width={SCALE_W}
          height={CHART_H}
        />
      </svg>

      <p className="text-muted-foreground text-xs mt-1 ml-1">
        Promedio mensual de rendimiento
      </p>
    </div>
  )
}
