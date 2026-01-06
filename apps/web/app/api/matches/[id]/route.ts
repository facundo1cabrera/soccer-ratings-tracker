import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { matchSchema, type Match } from '@/lib/match-schemas'
import { getMatchByIdFromDb } from '@/lib/match-db'

// GET /api/matches/[id] - Get a match by ID
export async function GET(
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

    const match = await getMatchByIdFromDb(matchId)

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Validate match before returning
    const validatedMatch = matchSchema.parse(match)
    return NextResponse.json(validatedMatch)
  } catch (error) {
    console.error('Error fetching match:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid match data', details: error.errors },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}

// PUT /api/matches/[id] - Update a match
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

    const rawUpdates = await request.json()
    // Validate partial match updates (using partial schema)
    const updates = matchSchema.partial().parse(rawUpdates)

    // Check if match exists
    const existingMatch = await getMatchByIdFromDb(matchId)
    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Update match in database
    const { prisma } = await import('@/lib/prisma')
    const { dbMatchToMatchSchema } = await import('@/lib/match-db')
    
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.date) updateData.date = new Date(updates.date)
    if (updates.result) updateData.result = updates.result
    if (updates.rating !== undefined) updateData.rating = updates.rating

    const dbMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
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

    // Transform to Match schema format
    const match = await dbMatchToMatchSchema(dbMatch)
    
    // Validate the complete updated match
    const validatedMatch = matchSchema.parse(match)
    return NextResponse.json(validatedMatch)
  } catch (error) {
    console.error('Error updating match:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}

// DELETE /api/matches/[id] - Delete a match
export async function DELETE(
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

    // Check if match exists
    const { getMatchByIdFromDb } = await import('@/lib/match-db')
    const existingMatch = await getMatchByIdFromDb(matchId)
    
    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Delete match (cascade will delete teams, teamPlayers, and playerRatings)
    const { prisma } = await import('@/lib/prisma')
    await prisma.match.delete({
      where: { id: matchId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    )
  }
}

