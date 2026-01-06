import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAllMatchesFromDb, findOrCreatePlayer, dbMatchToMatchSchema } from '@/lib/match-db'
import { ensureUserExists } from '@/lib/user-db'
import { matchSchema, saveMatchWithRatingsInputSchema, createMatchInputSchema, type Match, type SaveMatchWithRatingsInput, type CreateMatchInput } from '@/lib/match-schemas'

// GET /api/matches - Get all matches
export async function GET() {
  try {
    const matches = await getAllMatchesFromDb()
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

// POST /api/matches - Create a new match (with or without ratings)
export async function POST(request: NextRequest) {
  try {
    // Ensure user exists in database if authenticated (just-in-time creation)
    const { userId } = await auth()
    if (userId) {
      await ensureUserExists(userId)
    }

    const rawBody = await request.json()
    
    // Try to parse as match with ratings first, then as match without ratings
    let body: SaveMatchWithRatingsInput | CreateMatchInput
    let hasRatings = false
    
    try {
      body = saveMatchWithRatingsInputSchema.parse(rawBody)
      hasRatings = true
    } catch {
      body = createMatchInputSchema.parse(rawBody)
      hasRatings = false
    }

    // Calculate average rating for the match (if ratings provided)
    const allRatings = hasRatings && 'playerRatings' in body 
      ? body.playerRatings.map((p) => p.rating)
      : []
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

    // Find or create all players
    const playerIdMap = new Map<string, string>() // Map from input player ID to database player ID
    
    for (const player of [...body.team1Players, ...body.team2Players]) {
      if (!playerIdMap.has(player.id)) {
        const dbPlayerId = await findOrCreatePlayer(player.name)
        playerIdMap.set(player.id, dbPlayerId)
      }
    }

    // Create match with teams and players in a transaction
    const dbMatch = await prisma.match.create({
      data: {
        date: new Date(),
        result,
        name: body.matchName,
        rating: averageRating,
        teams: {
          create: [
            {
              goals: body.team1Goals,
              teamPlayers: {
                create: body.team1Players.map(p => ({
                  playerId: playerIdMap.get(p.id)!,
                })),
              },
            },
            {
              goals: body.team2Goals,
              teamPlayers: {
                create: body.team2Players.map(p => ({
                  playerId: playerIdMap.get(p.id)!,
                })),
              },
            },
          ],
        },
      },
      include: {
        teams: {
          include: {
            teamPlayers: {
              include: {
                player: true,
              },
            },
          },
        },
        playerRatings: true,
      },
    })

    // If ratings are provided, create PlayerRating records
    if (hasRatings && 'playerRatings' in body) {
      const ownerPlayerId = body.playerRatings[0]?.ownerPlayerId
      if (ownerPlayerId) {
        const ownerDbPlayerId = playerIdMap.get(ownerPlayerId) || ownerPlayerId
        
        // Create ratings for each player
        for (const rating of body.playerRatings) {
          const destinationPlayerId = playerIdMap.get(rating.id) || rating.id
          
          await prisma.playerRating.upsert({
            where: {
              matchId_ownerPlayerId_destinationPlayerId: {
                matchId: dbMatch.id,
                ownerPlayerId: ownerDbPlayerId,
                destinationPlayerId,
              },
            },
            update: {
              rating: rating.rating,
            },
            create: {
              matchId: dbMatch.id,
              ownerPlayerId: ownerDbPlayerId,
              destinationPlayerId,
              rating: rating.rating,
            },
          })
        }
      }
    }

    // Fetch the complete match with updated ratings
    const completeMatch = await prisma.match.findUnique({
      where: { id: dbMatch.id },
      include: {
        teams: {
          include: {
            teamPlayers: {
              include: {
                player: true,
              },
            },
          },
        },
        playerRatings: true,
      },
    })

    if (!completeMatch) {
      throw new Error('Failed to fetch created match')
    }

    // Transform to Match schema format
    const match = await dbMatchToMatchSchema(completeMatch)

    // Validate the created match before returning
    const validatedMatch = matchSchema.parse(match)
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

