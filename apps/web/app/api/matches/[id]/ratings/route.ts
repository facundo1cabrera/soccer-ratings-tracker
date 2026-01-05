import { NextRequest, NextResponse } from 'next/server'
import type { Match, PlayerRating } from '@/lib/match-service'
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

    const playerRatings: PlayerRating[] = await request.json()
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

    const index = matches.findIndex((m) => m.id === matchId)
    matches[index] = updatedMatch
    setMatches(matches)

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match ratings:', error)
    return NextResponse.json(
      { error: 'Failed to update match ratings' },
      { status: 500 }
    )
  }
}

