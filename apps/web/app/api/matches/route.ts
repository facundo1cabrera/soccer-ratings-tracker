import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getMatches, setMatches, getNextMatchId } from '@/lib/matches-data'
import { matchSchema, saveMatchWithRatingsInputSchema, type Match, type SaveMatchWithRatingsInput } from '@/lib/match-schemas'

// GET /api/matches - Get all matches
export async function GET() {
  try {
    const matches = getMatches()
    // Validate all matches against schema
    const validatedMatches = z.array(matchSchema).parse(matches)
    return NextResponse.json(validatedMatches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

// POST /api/matches - Create a new match
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    // Validate input with Zod
    const body = saveMatchWithRatingsInputSchema.parse(rawBody)

    // Calculate average rating for the match
    const allRatings = body.playerRatings.map((p) => p.rating)
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 5.0

    // Calculate result based on goals
    let result: string
    if (body.team1Goals > body.team2Goals) {
      result = 'Victoria'
    } else if (body.team1Goals < body.team2Goals) {
      result = 'Derrota'
    } else {
      result = 'Empate'
    }

    // Generate unique player IDs
    let playerIdCounter = Math.max(
      ...body.team1Players.map(p => {
        const numId = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10)
        return isNaN(numId) ? 0 : numId
      }),
      ...body.team2Players.map(p => {
        const numId = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10)
        return isNaN(numId) ? 0 : numId
      }),
      0
    )

    // Create match object
    const newMatch: Match = {
      id: getNextMatchId(),
      date: new Date().toISOString().split('T')[0],
      result: result as 'Victoria' | 'Derrota' | 'Empate',
      name: body.matchName,
      rating: averageRating,
      team1: {
        name: body.team1Name,
        goals: body.team1Goals,
        players: body.team1Players.map((player) => {
          const rating = body.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team1'
          )
          let playerId: number
          const parsedId = parseInt(String(player.id).replace(/[^0-9]/g, ''), 10)
          if (!isNaN(parsedId) && parsedId > 0) {
            playerId = parsedId
          } else {
            playerIdCounter++
            playerId = playerIdCounter
          }
          return {
            id: playerId,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
      team2: {
        name: body.team2Name,
        goals: body.team2Goals,
        players: body.team2Players.map((player) => {
          const rating = body.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team2'
          )
          let playerId: number
          const parsedId = parseInt(String(player.id).replace(/[^0-9]/g, ''), 10)
          if (!isNaN(parsedId) && parsedId > 0) {
            playerId = parsedId
          } else {
            playerIdCounter++
            playerId = playerIdCounter
          }
          return {
            id: playerId,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
    }

    // Add to beginning (newest first)
    const allMatches = getMatches()
    allMatches.unshift(newMatch)
    setMatches(allMatches)

    // Validate the created match before returning
    const validatedMatch = matchSchema.parse(newMatch)
    return NextResponse.json(validatedMatch, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

