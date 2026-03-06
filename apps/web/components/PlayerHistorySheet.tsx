"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Calendar, TrendingUp, UserX } from "lucide-react"
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

function HistorySkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
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
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function HistoryContent({
  data,
  onClose,
}: {
  data: PlayerHistory
  onClose: () => void
}) {
  const { player, stats, matches } = data

  return (
    <>
      <SheetHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted text-sm font-medium">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle className="text-left">{player.name}</SheetTitle>
            {!player.isClaimed && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <UserX className="h-3 w-3" />
                Sin cuenta vinculada
              </span>
            )}
          </div>
        </div>
      </SheetHeader>

      {/* Stats strip */}
      {stats.totalMatches >= 1 && (
        <div className="grid grid-cols-3 gap-3 py-4 border-b border-border">
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

      {/* Match list */}
      <div className="py-4 space-y-1">
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin partidos registrados
          </p>
        ) : (
          matches.map((match) => (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              onClick={onClose}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${getRatingColor(match.rating)}`}
                >
                  {match.rating.toFixed(1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {match.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getResultBadgeClasses(match.result)}`}
                    >
                      {match.result}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.goals.myTeam}–{match.goals.opponent}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(match.date)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}

interface Props {
  playerId: string | null
  onClose: () => void
}

export function PlayerHistorySheet({ playerId, onClose }: Props) {
  const [data, setData] = useState<PlayerHistory | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!playerId) {
      setData(null)
      return
    }
    setLoading(true)
    getPlayerHistory(playerId).then((res) => {
      if (res.success) setData(res.data)
      setLoading(false)
    })
  }, [playerId])

  return (
    <Sheet open={!!playerId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto px-4 pb-8"
      >
        {loading && <HistorySkeleton />}
        {!loading && data && <HistoryContent data={data} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}
