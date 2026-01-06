'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X } from 'lucide-react'

interface Player {
  id: string
  name: string
}

export default function CreateMatchPage() {
  const router = useRouter()
  const [matchName, setMatchName] = useState('')
  const [team1Goals, setTeam1Goals] = useState<number>(0)
  const [team2Goals, setTeam2Goals] = useState<number>(0)
  const [team1Players, setTeam1Players] = useState<Player[]>([])
  const [team2Players, setTeam2Players] = useState<Player[]>([])

  const addPlayer = (team: 'team1' | 'team2') => {
    const newPlayer: Player = {
      id: `${team}-${Date.now()}-${Math.random()}`,
      name: '',
    }
    if (team === 'team1') {
      setTeam1Players([...team1Players, newPlayer])
    } else {
      setTeam2Players([...team2Players, newPlayer])
    }
  }

  const removePlayer = (team: 'team1' | 'team2', playerId: string) => {
    if (team === 'team1') {
      setTeam1Players(team1Players.filter((p) => p.id !== playerId))
    } else {
      setTeam2Players(team2Players.filter((p) => p.id !== playerId))
    }
  }

  const updatePlayerName = (
    team: 'team1' | 'team2',
    playerId: string,
    name: string
  ) => {
    if (team === 'team1') {
      setTeam1Players(
        team1Players.map((p) => (p.id === playerId ? { ...p, name } : p))
      )
    } else {
      setTeam2Players(
        team2Players.map((p) => (p.id === playerId ? { ...p, name } : p))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out players without names
    const validTeam1Players = team1Players.filter((p) => p.name.trim() !== '')
    const validTeam2Players = team2Players.filter((p) => p.name.trim() !== '')
    
    try {
      // Create match without ratings first
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchName,
          team1Goals,
          team2Goals,
          team1Players: validTeam1Players,
          team2Players: validTeam2Players,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create match')
      }
      
      const createdMatch = await response.json()
      
      // Redirect to share page
      router.push(`/match/${createdMatch.id}/share`)
    } catch (error) {
      console.error('Error creating match:', error)
      // TODO: Show error message to user
    }
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Match Name */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Crear nuevo partido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matchName">Nombre del partido</Label>
                  <Input
                    id="matchName"
                    type="text"
                    placeholder="Ej: Partido entre amigos"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Teams Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team 1 */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Local</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team1Goals">Goles</Label>
                    <Input
                      id="team1Goals"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={team1Goals}
                      onChange={(e) => setTeam1Goals(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jugadores</Label>
                    <div className="space-y-2">
                      {team1Players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="text"
                            placeholder="Nombre del jugador"
                            value={player.name}
                            onChange={(e) =>
                              updatePlayerName('team1', player.id, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlayer('team1', player.id)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addPlayer('team1')}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar jugador
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team 2 */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Visitante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team2Goals">Goles</Label>
                    <Input
                      id="team2Goals"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={team2Goals}
                      onChange={(e) => setTeam2Goals(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jugadores</Label>
                    <div className="space-y-2">
                      {team2Players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="text"
                            placeholder="Nombre del jugador"
                            value={player.name}
                            onChange={(e) =>
                              updatePlayerName('team2', player.id, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlayer('team2', player.id)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addPlayer('team2')}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar jugador
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Crear partido
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

