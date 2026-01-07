'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { matchService } from '@/lib/match-service'
import type { Match } from '@/lib/match-service'
import { ArrowLeft, Eye } from 'lucide-react'

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
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchId, setMatchId] = useState<number | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [showLoginSheet, setShowLoginSheet] = useState(false)

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

  // Show login sheet when user is not authenticated and page is loaded
  useEffect(() => {
    if (isLoaded && !user && !loading && match) {
      setShowLoginSheet(true)
    }
  }, [isLoaded, user, loading, match])

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

  // Get set of player IDs who have already submitted ratings
  const playersWhoSubmittedRatings = new Set(
    match.playersWhoSubmittedRatings || []
  )

  // Combine all players with team information, filtering out players who have already submitted ratings
  const allPlayers: PlayerOption[] = [
    ...match.team1.players
      .filter((p) => !playersWhoSubmittedRatings.has(String(p.id)))
      .map((p) => ({
        id: p.id,
        name: p.name,
        team: 'team1' as const,
      })),
    ...match.team2.players
      .filter((p) => !playersWhoSubmittedRatings.has(String(p.id)))
      .map((p) => ({
        id: p.id,
        name: p.name,
        team: 'team2' as const,
      })),
  ]

  // Build sign-in URL with redirect
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(pathname || '')}`

  return (
    <>
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <Link href={`/match/${matchId}`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver resultados
                    </Button>
                  </Link>
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    disabled={!selectedPlayerId}
                    className="w-full sm:w-auto"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Login Bottom Sheet */}
      <Sheet open={showLoginSheet} onOpenChange={setShowLoginSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>¿Quieres iniciar sesión?</SheetTitle>
            <SheetDescription>
              No se guardará el partido en tu historial si no estás logueado.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginSheet(false)}
              className="w-full sm:w-auto"
            >
              Continuar sin iniciar sesión
            </Button>
            <Link href={signInUrl} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                Iniciar sesión
              </Button>
            </Link>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

