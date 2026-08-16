"use client"

/**
 * SVG-based chart components for practice mode statistics.
 * Follows the same pure-SVG approach used elsewhere in the codebase.
 */

// ── Bar Chart ──

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
  maxValue?: number
  showPercentage?: boolean
}

export function BarChart({ data, height = 200, maxValue: maxValueProp, showPercentage }: BarChartProps) {
  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-4">No data available</p>

  const maxValue = maxValueProp ?? Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.min(60, Math.max(30, 600 / data.length - 10))
  const chartWidth = data.length * (barWidth + 10) + 40
  const chartPadding = 40

  return (
    <svg viewBox={`0 0 ${chartWidth} ${height + chartPadding + 20}`} className="w-full" style={{ maxHeight: height + chartPadding + 20 }}>
      {/* Y-axis line */}
      <line x1={chartPadding} y1={10} x2={chartPadding} y2={height + 10} stroke="#e2e8f0" strokeWidth={1} />
      {/* X-axis line */}
      <line x1={chartPadding} y1={height + 10} x2={chartWidth} y2={height + 10} stroke="#e2e8f0" strokeWidth={1} />

      {data.map((item, i) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 20) : 0
        const x = chartPadding + i * (barWidth + 10) + 5
        const y = height + 10 - barHeight
        const color = item.color || `hsl(${160 + i * 30}, 60%, 50%)`

        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
              opacity={0.85}
            >
              <animate
                attributeName="height"
                from="0"
                to={barHeight}
                dur="0.5s"
                fill="freeze"
              />
              <animate
                attributeName="y"
                from={height + 10}
                to={y}
                dur="0.5s"
                fill="freeze"
              />
            </rect>

            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize={11}
              fontWeight="600"
              fill="#475569"
            >
              {showPercentage ? `${item.value}%` : item.value}
            </text>

            {/* X-axis label */}
            <text
              x={x + barWidth / 2}
              y={height + 25}
              textAnchor="middle"
              fontSize={10}
              fill="#64748b"
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Line Chart ──

interface LineChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  width?: number
  color?: string
  showDots?: boolean
  showPercentage?: boolean
}

export function LineChart({
  data,
  height = 160,
  width = 600,
  color = "#10b981",
  showDots = true,
  showPercentage,
}: LineChartProps) {
  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-4">No data available</p>

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = 0

  const getX = (i: number) => padding + (i / Math.max(data.length - 1, 1)) * chartWidth
  const getY = (v: number) => padding + chartHeight - ((v - minValue) / (maxValue - minValue || 1)) * chartHeight

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.value)}`)
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full" style={{ maxHeight: height + 20 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = getY(maxValue * (pct / 100))
        return (
          <g key={pct}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={padding - 8} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
              {showPercentage ? `${Math.round(maxValue * pct / 100)}%` : Math.round(maxValue * pct / 100)}
            </text>
          </g>
        )
      })}

      {/* Line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1s" fill="freeze" />
      </path>

      {/* Dots */}
      {showDots &&
        data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.value)} r={4} fill="white" stroke={color} strokeWidth={2} />
            <text
              x={getX(i)}
              y={getY(d.value) - 10}
              textAnchor="middle"
              fontSize={9}
              fill="#475569"
              fontWeight="600"
            >
              {showPercentage ? `${d.value}%` : d.value}
            </text>
          </g>
        ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={getX(i)}
          y={height + 10}
          textAnchor="middle"
          fontSize={8}
          fill="#94a3b8"
          transform={data.length > 10 ? `rotate(-45 ${getX(i)} ${height + 10})` : undefined}
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// ── Difficulty Heatmap ──

interface HeatmapRow {
  label: string
  value: number // 0–100 (accuracy %)
  attempts: number
}

interface HeatmapProps {
  data: HeatmapRow[]
}

export function DifficultyHeatmap({ data }: HeatmapProps) {
  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-4">No data available</p>

  const getColor = (accuracy: number) => {
    if (accuracy >= 80) return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" }
    if (accuracy >= 60) return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" }
    if (accuracy >= 40) return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" }
    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" }
  }

  return (
    <div className="space-y-1">
      {data.map((row, i) => {
        const colors = getColor(row.value)
        return (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 rounded-lg border ${colors.bg} ${colors.border}`}
          >
            <div className="flex-1 text-xs truncate max-w-[300px]" title={row.label}>
              {row.label}
            </div>
            <div className={`text-xs font-bold ${colors.text} w-12 text-right`}>
              {row.value}%
            </div>
            <div className="text-xs text-slate-500 w-16 text-right">
              {row.attempts} tries
            </div>
          </div>
        )
      })}
    </div>
  )
}
