import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { matchSchema, playerRatingSchema, type Match, type PlayerRating } from '@/lib/match-schemas'
import { getMatches, setMatches } from '@/lib/matches-data'

// PUT /api/matches/[id]/ratings - Update player ratings for a match
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const matchId = parseInt(id, 10)

    if (isNaN(matchId)) {
      return NextResponse.json(
        { error: 'Invalid match ID' },
        { status: 400 }
      )
    }

    const rawPlayerRatings = await request.json()
    // Validate player ratings input
    const playerRatings = z.array(playerRatingSchema).parse(rawPlayerRatings)
    const matches = getMatches()
    const match = matches.find((m) => m.id === matchId)

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Update player ratings
    const updatedTeam1Players = match.team1.players.map((player) => {
      const rating = playerRatings.find(
        (pr) => String(pr.id) === String(player.id) && pr.team === 'team1'
      )
      return rating ? { ...player, rating: rating.rating } : player
    })

    const updatedTeam2Players = match.team2.players.map((player) => {
      const rating = playerRatings.find(
        (pr) => String(pr.id) === String(player.id) && pr.team === 'team2'
      )
      return rating ? { ...player, rating: rating.rating } : player
    })

    // Calculate new average rating
    const allRatings = playerRatings.map((p) => p.rating)
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : match.rating

    const updatedMatch: Match = {
      ...match,
      rating: averageRating,
      team1: {
        ...match.team1,
        players: updatedTeam1Players,
      },
      team2: {
        ...match.team2,
        players: updatedTeam2Players,
      },
    }

    // Validate the updated match before saving
    const validatedMatch = matchSchema.parse(updatedMatch)
    const index = matches.findIndex((m) => m.id === matchId)
    matches[index] = validatedMatch
    setMatches(matches)

    return NextResponse.json(validatedMatch)
  } catch (error) {
    console.error('Error updating match ratings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update match ratings' },
      { status: 500 }
    )
  }
}

