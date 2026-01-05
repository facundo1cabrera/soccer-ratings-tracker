import { NextRequest, NextResponse } from 'next/server'
import type { Match } from '@/lib/match-service'
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

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error fetching match:', error)
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

    const updates: Partial<Match> = await request.json()
    const matches = getMatches()
    const index = matches.findIndex((m) => m.id === matchId)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const updatedMatch = { ...matches[index], ...updates }
    matches[index] = updatedMatch
    setMatches(matches)

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match:', error)
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

