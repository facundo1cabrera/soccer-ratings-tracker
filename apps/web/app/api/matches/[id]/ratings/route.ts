import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { matchSchema, playerRatingSchema, type Match, type PlayerRating } from '@/lib/match-schemas'
import { prisma } from '@/lib/prisma'
import { ensureUserExists } from '@/lib/user-db'
import { findOrCreatePlayer, dbMatchToMatchSchema } from '@/lib/match-db'

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
    
    // Get current user if logged in
    const { userId } = await auth()
    // Get the owner player ID (the player who is giving the ratings)
    const ownerPlayerId = playerRatings[0]?.ownerPlayerId
    if (!ownerPlayerId) {
      return NextResponse.json(
        { error: 'ownerPlayerId is required' },
        { status: 400 }
      )
    }

    // Get the match with teams to find destination players
    const dbMatch = await prisma.match.findUnique({
      where: { id: matchId },
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
      },
    })

    if (!dbMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const ownerPlayerExists = dbMatch.teams.some(team =>
      team.teamPlayers.some(tp => tp.player.id === ownerPlayerId)
    )

    if (!ownerPlayerExists) {
      return NextResponse.json(
        { error: 'Owner player not found in match' },
        { status: 400 }
      )
    }

    if (userId) {
      await prisma.player.update({
        where: { id: ownerPlayerId },
        data: { userId },
      })
    }

    // Create a map of player names to database player IDs
    const playerNameToDbId = new Map<string, string>()
    dbMatch.teams.forEach(team => {
      team.teamPlayers.forEach(tp => {
        playerNameToDbId.set(tp.player.name, tp.player.id)
      })
    })

    // Upsert all player ratings
    for (const rating of playerRatings) {
      // Find the destination player by matching the rating ID/name with player names
      // The rating.id might be a player name or ID from the frontend
      let destinationDbPlayerId: string | undefined
      
      // Try to find by name first (most common case)
      destinationDbPlayerId = playerNameToDbId.get(rating.name)
      
      // If not found by name, try to find or create by the ID
      if (!destinationDbPlayerId) {
        destinationDbPlayerId = await findOrCreatePlayer(rating.name)
      }

      // Create or update the rating
      await prisma.playerRating.upsert({
        where: {
          matchId_ownerPlayerId_destinationPlayerId: {
            matchId,
            ownerPlayerId: ownerPlayerId,
            destinationPlayerId: destinationDbPlayerId,
          },
        },
        update: {
          rating: rating.rating,
        },
        create: {
          matchId,
          ownerPlayerId: ownerPlayerId,
          destinationPlayerId: destinationDbPlayerId,
          rating: rating.rating,
        },
      })
    }

    // Calculate new average rating from all ratings for this match
    const allRatings = await prisma.playerRating.findMany({
      where: { matchId },
    })
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : dbMatch.rating

    // Update match rating
    await prisma.match.update({
      where: { id: matchId },
      data: { rating: averageRating },
    })

    // Fetch the complete updated match
    const updatedDbMatch = await prisma.match.findUnique({
      where: { id: matchId },
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

    if (!updatedDbMatch) {
      throw new Error('Failed to fetch updated match')
    }

    // Transform to Match schema format
    const updatedMatch = await dbMatchToMatchSchema(updatedDbMatch)

    // Validate the updated match before returning
    const validatedMatch = matchSchema.parse(updatedMatch)
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

