'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { matchService } from '@/lib/match-service'
import type { Match } from '@/lib/match-service'
import { useUser } from '@clerk/nextjs'

interface Player {
  id: string
  name: string
  rating: number
  team: 'team1' | 'team2'
}

interface RateMatchPageProps {
  params: Promise<{ id: string }>
}

export default function RateMatchPage({ params }: RateMatchPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [matchId, setMatchId] = useState<number | null>(null)
  const [ownerPlayerId, setOwnerPlayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      const id = parseInt(resolvedParams.id, 10)
      if (isNaN(id)) {
        router.push('/')
        return
      }
      setMatchId(id)
      
      // Get player ID from query params
      const playerId = searchParams.get('playerId')
      if (!playerId) {
        router.push(`/match/${id}/join`)
        return
      }
      setOwnerPlayerId(playerId)
    }
    loadParams()
  }, [params, router, searchParams])

  useEffect(() => {
    if (matchId === null || ownerPlayerId === null) return

    const currentMatchId = matchId
    const currentOwnerPlayerId = ownerPlayerId
    async function loadMatch() {
      try {
        const loadedMatch = await matchService.getMatchById(currentMatchId)
        if (!loadedMatch) {
          router.push('/')
          return
        }
        setMatch(loadedMatch)

        // Combine all players with initial rating of 5.0, filtering out the owner
        const allPlayers: Player[] = [
          ...loadedMatch.team1.players
            .filter((p) => String(p.id) !== currentOwnerPlayerId)
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              rating: 5.0,
              team: 'team1' as const,
            })),
          ...loadedMatch.team2.players
            .filter((p) => String(p.id) !== currentOwnerPlayerId)
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              rating: 5.0,
              team: 'team2' as const,
            })),
        ]
        setPlayers(allPlayers)
      } catch (error) {
        console.error('Error loading match:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    loadMatch()
  }, [matchId, ownerPlayerId, router])

  const updatePlayerRating = (playerId: string, rating: number) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, rating } : p))
    )
  }

  const handleSave = async () => {
    if (!match || !matchId || !ownerPlayerId) return

    try {
      // Update match ratings with ownerPlayerId
      const playerRatings = players.map((p) => ({
        id: p.id,
        name: p.name,
        rating: p.rating,
        team: p.team,
        ownerPlayerId: ownerPlayerId,
      }))

      const updatedMatch = await matchService.updateMatchRatings(
        matchId,
        playerRatings
      )

      if (!updatedMatch) {
        throw new Error('Failed to update match ratings')
      }

      // Redirect to match detail page
      router.push(`/match/${matchId}`)
    } catch (error) {
      console.error('Error saving ratings:', error)
      // TODO: Show error message to user
      router.push('/')
    }
  }

  if (loading || !match || !ownerPlayerId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  if (players.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <Link href={`/match/${matchId}/join`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No hay otros jugadores para calificar.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 sm:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Go Back Button */}
        <Link href={`/match/${matchId}/join`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        {/* Match Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            {match.name}
          </h1>
          <p className="text-muted-foreground">
            Califica el rendimiento de cada jugador
          </p>
        </div>

        {/* Players List */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {players.map((player) => (
            <Card key={player.id} className="border-border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">
                        {player.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {player.team === 'team1'
                          ? match.team1.name
                          : match.team2.name}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-foreground min-w-12 text-right">
                      {player.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[player.rating]}
                      min={0}
                      max={10}
                      step={0.1}
                      onValueChange={(value) =>
                        updatePlayerRating(player.id, value[0])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.0</span>
                      <span>10.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:border-t-0 sm:p-0 sm:mt-8 sm:bg-transparent">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto"
              size="lg"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

