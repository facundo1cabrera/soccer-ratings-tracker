'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { matchService } from '@/lib/match-service'
import type { Match } from '@/lib/match-service'
import { ArrowLeft } from 'lucide-react'

interface JoinMatchPageProps {
  params: Promise<{ id: string }>
}

interface PlayerOption {
  id: number | string
  name: string
  team: 'team1' | 'team2'
}

export default function JoinMatchPage({ params }: JoinMatchPageProps) {
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchId, setMatchId] = useState<number | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

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

    const currentMatchId = matchId
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

  const handleContinue = () => {
    if (selectedPlayerId && matchId) {
      router.push(`/match/${matchId}/rate?playerId=${selectedPlayerId}`)
    }
  }

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  // Combine all players with team information
  const allPlayers: PlayerOption[] = [
    ...match.team1.players.map((p) => ({
      id: p.id,
      name: p.name,
      team: 'team1' as const,
    })),
    ...match.team2.players.map((p) => ({
      id: p.id,
      name: p.name,
      team: 'team2' as const,
    })),
  ]

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

        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Selecciona tu jugador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{match.name}</h2>
                <p className="text-muted-foreground">
                  Selecciona qué jugador eres para calificar a los demás:
                </p>
              </div>

              {/* Players List */}
              <div className="space-y-2">
                {allPlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(String(player.id))}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedPlayerId === String(player.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {player.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {player.team === 'team1' ? 'Local' : 'Visitante'}
                        </p>
                      </div>
                      {selectedPlayerId === String(player.id) && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  disabled={!selectedPlayerId}
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

