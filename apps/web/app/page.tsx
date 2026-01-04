'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { matchService } from "@/lib/match-service"
import type { Match } from "@/lib/match-service"

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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const loadedMatches = await matchService.getAllMatches()
        setMatches(loadedMatches)
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

  const hasMoreMatches = matches.length > 5
  const last5Matches = matches.slice(0, 5)

  if (loading) {
    return (
      <main className="min-h-screen bg-background pb-24 sm:pb-0">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 sm:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground">
          Hola, Facundo
        </h1>

        {/* Last 5 Matches Section */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
            Últimos 5 partidos
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {last5Matches.map((match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block"
              >
                <Card className="border-border py-3 sm:py-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="px-4 sm:px-5 pb-1 sm:pb-2">
                    <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-1">
                          {match.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                          <span>{formatDate(match.date)}</span>
                          <span>•</span>
                          <span className="font-medium">{match.result}</span>
                        </div>
                      </div>
                      <span
                        className={`text-sm sm:text-base font-bold text-white px-2 py-1 rounded w-fit shrink-0 ${getRatingColor(match.rating)}`}
                      >
                        {match.rating.toFixed(1)}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {hasMoreMatches && (
            <div className="mt-4 sm:mt-6">
              <Button variant="outline" className="w-full sm:w-auto">
                Ver más
              </Button>
            </div>
          )}
        </section>

        {/* Create New Match Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:border-t-0 sm:p-0 sm:mt-8 sm:bg-transparent">
          <Link href="/match/create">
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Crear nuevo partido
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
