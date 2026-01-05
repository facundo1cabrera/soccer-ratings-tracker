import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { matchSchema, type Match } from '@/lib/match-schemas'
import { getMatches, setMatches } from '@/lib/matches-data'

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

    const matches = getMatches()
    const match = matches.find((m) => m.id === matchId)

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
    const matches = getMatches()
    const index = matches.findIndex((m) => m.id === matchId)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const updatedMatch = { ...matches[index], ...updates }
    // Validate the complete updated match
    const validatedMatch = matchSchema.parse(updatedMatch)
    matches[index] = validatedMatch
    setMatches(matches)

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

    const matches = getMatches()
    const filtered = matches.filter((m) => m.id !== matchId)

    if (filtered.length === matches.length) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    setMatches(filtered)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    )
  }
}

