'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { matchService } from "@/lib/match-service"
import type { Match } from "@/lib/match-service"
import { ArrowLeft } from "lucide-react"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getRatingColor(rating: number): string {
  if (rating >= 9.0) {
    return "bg-purple-500"
  } else if (rating >= 8.6) {
    return "bg-blue-600"
  } else if (rating >= 8.1) {
    return "bg-blue-400"
  } else if (rating >= 7.6) {
    return "bg-green-600"
  } else if (rating >= 7.1) {
    return "bg-green-400"
  } else if (rating >= 6.6) {
    return "bg-yellow-500"
  } else if (rating >= 6.1) {
    return "bg-orange-500"
  } else {
    return "bg-red-500"
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchId, setMatchId] = useState<number | null>(null)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      const id = parseInt(resolvedParams.id, 10)
      if (isNaN(id)) {
        router.push('/')
        return
      }
      setMatchId(id)
    }
    loadParams()
  }, [params, router])

  useEffect(() => {
    if (matchId === null) return

    const currentMatchId = matchId // Store in local variable for type narrowing
    async function loadMatch() {
      try {
        const loadedMatch = await matchService.getMatchById(currentMatchId)
        if (!loadedMatch) {
          router.push('/')
          return
        }
        setMatch(loadedMatch)
      } catch (error) {
        console.error('Error loading match:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    loadMatch()
  }, [matchId, router])

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Go Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        {/* Match Title and Date */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            {match.name}
          </h1>
          <p className="text-muted-foreground">{formatDate(match.date)}</p>
        </div>

        {/* Teams Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team 1 */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Local</CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  {match.team1.goals}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {match.team1.players.length > 0 ? (
                <div className="space-y-3">
                  {match.team1.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          {player.profileImage ? (
                            <AvatarImage
                              src={player.profileImage}
                              alt={player.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {player.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold text-white px-2 py-1 rounded shrink-0 ${getRatingColor(player.rating)}`}
                      >
                        {player.rating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay jugadores registrados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Visitante</CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  {match.team2.goals}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {match.team2.players.length > 0 ? (
                <div className="space-y-3">
                  {match.team2.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          {player.profileImage ? (
                            <AvatarImage
                              src={player.profileImage}
                              alt={player.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {player.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold text-white px-2 py-1 rounded shrink-0 ${getRatingColor(player.rating)}`}
                      >
                        {player.rating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay jugadores registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

