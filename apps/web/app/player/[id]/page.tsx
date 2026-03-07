"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Calendar, TrendingUp, UserX, ChevronRight } from "lucide-react"
import { getPlayerHistory } from "@/lib/api-client"
import type { PlayerHistory } from "@/lib/api-client"
import { MonthlyPerformanceChart } from "@/components/MonthlyPerformanceChart"
import { getRatingColor } from "@/lib/rating-utils"

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

        {/* Monthly performance chart */}
        {matches.length >= 1 && (
          <section className="mb-8">
            <MonthlyPerformanceChart
              matches={matches}
              overallAvg={stats.avgRating}
            />
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
