'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { matchService } from '@/lib/match-service'

interface Player {
  id: string
  name: string
  rating: number
  team: 'team1' | 'team2'
}

interface MatchData {
  matchName: string
  team1Name: string
  team2Name: string
  team1Players: { id: string; name: string }[]
  team2Players: { id: string; name: string }[]
}

export default function RateMatchPage() {
  const router = useRouter()
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    // Get match data from sessionStorage
    const storedData = sessionStorage.getItem('pendingMatch')
    if (!storedData) {
      // If no data, redirect back to create page
      router.push('/match/create')
      return
    }

    const data: MatchData = JSON.parse(storedData)
    setMatchData(data)

    // Combine all players with initial rating of 5.0
    const allPlayers: Player[] = [
      ...data.team1Players.map((p) => ({
        ...p,
        rating: 5.0,
        team: 'team1' as const,
      })),
      ...data.team2Players.map((p) => ({
        ...p,
        rating: 5.0,
        team: 'team2' as const,
      })),
    ]
    setPlayers(allPlayers)
  }, [router])

  const updatePlayerRating = (playerId: string, rating: number) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, rating } : p))
    )
  }

  const handleSave = async () => {
    if (!matchData) return

    try {
      // Save match with ratings using the service
      const savedMatch = await matchService.saveMatchWithRatings({
        matchName: matchData.matchName,
        team1Name: matchData.team1Name,
        team2Name: matchData.team2Name,
        team1Players: matchData.team1Players,
        team2Players: matchData.team2Players,
        playerRatings: players.map((p) => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          team: p.team,
        })),
      })

      // Clear sessionStorage
      sessionStorage.removeItem('pendingMatch')

      // Redirect to match detail page
      router.push(`/match/${savedMatch.id}`)
    } catch (error) {
      console.error('Error saving match:', error)
      // TODO: Show error message to user
      // For now, just redirect to home
      sessionStorage.removeItem('pendingMatch')
      router.push('/')
    }
  }

  if (!matchData) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p>Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 sm:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Go Back Button */}
        <Link href="/match/create">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        {/* Match Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            {matchData.matchName}
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
                          ? matchData.team1Name
                          : matchData.team2Name}
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

