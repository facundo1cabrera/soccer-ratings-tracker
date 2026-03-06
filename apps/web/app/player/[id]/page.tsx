"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Calendar, TrendingUp, UserX, ChevronRight } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { getPlayerHistory } from "@/lib/api-client"
import type { PlayerHistory } from "@/lib/api-client"

function getRatingColor(rating: number): string {
  if (rating >= 9.0) return "bg-purple-500"
  if (rating >= 8.6) return "bg-blue-600"
  if (rating >= 8.1) return "bg-blue-400"
  if (rating >= 7.6) return "bg-green-600"
  if (rating >= 7.1) return "bg-green-400"
  if (rating >= 6.6) return "bg-yellow-500"
  if (rating >= 6.1) return "bg-orange-500"
  return "bg-red-500"
}

function getChartColor(rating: number): string {
  if (rating >= 9.0) return "#a855f7"
  if (rating >= 8.6) return "#2563eb"
  if (rating >= 8.1) return "#60a5fa"
  if (rating >= 7.6) return "#16a34a"
  if (rating >= 7.1) return "#4ade80"
  if (rating >= 6.6) return "#eab308"
  if (rating >= 6.1) return "#f97316"
  return "#ef4444"
}

function getPerformanceLabel(rating: number): string {
  if (rating >= 9.0) return "Épico"
  if (rating >= 8.6) return "Excelente"
  if (rating >= 8.1) return "Muy bueno"
  if (rating >= 7.6) return "Bueno"
  if (rating >= 7.1) return "Aceptable"
  if (rating >= 6.6) return "Regular"
  if (rating >= 6.1) return "Bajo"
  return "Muy malo"
}

function getResultBadgeClasses(result: string): string {
  switch (result) {
    case "Victoria":
      return "bg-green-500/15 text-green-400 border border-green-500/25"
    case "Derrota":
      return "bg-red-500/15 text-red-400 border border-red-500/25"
    case "Empate":
      return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
    default:
      return "bg-muted text-muted-foreground border border-border"
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="h-8 w-24 bg-muted rounded animate-pulse mb-8" />
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-56 bg-muted rounded-2xl animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<PlayerHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllMatches, setShowAllMatches] = useState(false)

  useEffect(() => {
    getPlayerHistory(id).then((res) => {
      if (res.success) setData(res.data)
      else router.replace("/")
      setLoading(false)
    })
  }, [id, router])

  if (loading || !data) return <LoadingSkeleton />

  const { player, stats, matches } = data
  const visibleMatches = showAllMatches ? matches : matches.slice(0, 5)
  const hasMore = matches.length > 5

  return (
    <main className="min-h-screen bg-background pb-10">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver
        </Button>

        {/* Player header */}
        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-muted text-sm font-medium">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{player.name}</h1>
            {!player.isClaimed && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <UserX className="h-3 w-3" />
                Sin cuenta vinculada
              </span>
            )}
          </div>
        </div>

        {/* Stats strip */}
        {stats.totalMatches >= 1 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCell
              icon={<Trophy className="h-4 w-4 text-yellow-400" />}
              value={stats.victories}
              label="Victorias"
            />
            <StatCell
              icon={<Calendar className="h-4 w-4 text-blue-400" />}
              value={stats.totalMatches}
              label="Partidos"
            />
            <StatCell
              icon={<TrendingUp className="h-4 w-4 text-green-400" />}
              value={stats.avgRating.toFixed(1)}
              label="Promedio"
            />
          </div>
        )}

        {/* Rating trend chart */}
        {matches.length >= 2 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Historial de rendimientos
            </h2>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={[...matches].reverse().map((m, i) => ({
                    name: `${i + 1}`,
                    rating: m.rating,
                    date: formatDate(m.date),
                    result: m.result,
                    color: getChartColor(m.rating),
                    performance: getPerformanceLabel(m.rating),
                  }))}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="#2a2a2a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={4}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 5, 10]}
                  />
                  <Tooltip
                    cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 2" }}
                    content={({ payload }) => {
                      if (!payload || !payload[0]) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-card/95 backdrop-blur border border-border/80 rounded-xl px-3.5 py-2.5 shadow-xl">
                          <p className="text-[11px] text-muted-foreground mb-1">{d.date}</p>
                          <p className="text-base font-bold text-foreground leading-tight">
                            {d.rating.toFixed(1)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: d.color }}
                            />
                            <p className="text-xs font-medium" style={{ color: d.color }}>
                              {d.performance}
                            </p>
                            <span className="text-xs text-muted-foreground">· {d.result}</span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#ratingGradient)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          fill={payload.color}
                          stroke="#0a0a0a"
                          strokeWidth={2}
                        />
                      )
                    }}
                    activeDot={(props: any) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle
                          key={`active-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={7}
                          fill={payload.color}
                          stroke="#fff"
                          strokeWidth={2.5}
                        />
                      )
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4 justify-center">
                {[
                  { label: "Épico", color: "#a855f7" },
                  { label: "Excelente", color: "#2563eb" },
                  { label: "Muy bueno", color: "#60a5fa" },
                  { label: "Bueno", color: "#16a34a" },
                  { label: "Aceptable", color: "#4ade80" },
                  { label: "Regular", color: "#eab308" },
                  { label: "Bajo", color: "#f97316" },
                  { label: "Muy malo", color: "#ef4444" },
                ].map((level) => (
                  <div key={level.label} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className="text-[11px] text-muted-foreground">{level.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Match list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Partidos</h2>
            {matches.length > 0 && (
              <span className="text-xs text-muted-foreground">{matches.length} total</span>
            )}
          </div>

          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Sin partidos registrados
            </p>
          ) : (
            <div className="space-y-2">
              {visibleMatches.map((match) => (
                <Link key={match.id} href={`/match/${match.id}`} className="block group">
                  <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-muted/50 hover:scale-[1.01] active:scale-[0.99]">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${getRatingColor(match.rating)}`}
                    >
                      {match.rating.toFixed(1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{match.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getResultBadgeClasses(match.result)}`}
                        >
                          {match.result}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {match.goals.myTeam}–{match.goals.opponent}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(match.date)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowAllMatches(!showAllMatches)}
              >
                {showAllMatches ? "Ver menos" : "Ver más partidos"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
