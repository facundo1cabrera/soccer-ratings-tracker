import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const player = await prisma.player.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true },
  })

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  // Determine which player IDs to query matches for
  let playerIds: string[]
  if (player.userId) {
    const siblings = await prisma.player.findMany({
      where: { userId: player.userId },
      select: { id: true },
    })
    playerIds = siblings.map((p) => p.id)
  } else {
    playerIds = [player.id]
  }

  // Fetch all matches where any of these players participated
  const dbMatches = await prisma.match.findMany({
    where: {
      teams: {
        some: {
          teamPlayers: {
            some: { playerId: { in: playerIds } },
          },
        },
      },
    },
    include: {
      teams: {
        include: {
          teamPlayers: {
            select: { playerId: true },
          },
        },
      },
      playerRatings: {
        where: { destinationPlayerId: { in: playerIds } },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Build response matches
  const matchEntries = dbMatches.map((dbMatch) => {
    const team1 = dbMatch.teams[0]
    const team2 = dbMatch.teams[1] ?? { goals: 0, teamPlayers: [] }

    const team1PlayerIds = new Set(team1.teamPlayers.map((tp) => tp.playerId))
    const onTeam1 = playerIds.some((pid) => team1PlayerIds.has(pid))

    const myTeamGoals = onTeam1 ? team1.goals : team2.goals
    const opponentGoals = onTeam1 ? team2.goals : team1.goals

    // Calculate player rating for this match (with outlier filter)
    const ratings = dbMatch.playerRatings.map((r) => r.rating)
    let rating = 5.0
    if (ratings.length > 0) {
      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length
      const filtered = ratings.filter((r) => avg - r <= 3.5)
      rating = filtered.reduce((s, r) => s + r, 0) / filtered.length
    }

    // Adjust result from the player's perspective
    let result = dbMatch.result as 'Victoria' | 'Derrota' | 'Empate'
    if (result !== 'Empate' && !onTeam1) {
      result = result === 'Victoria' ? 'Derrota' : 'Victoria'
    }

    return {
      id: dbMatch.id,
      name: dbMatch.name,
      date: dbMatch.date.toISOString().split('T')[0],
      result,
      rating,
      goals: { myTeam: myTeamGoals, opponent: opponentGoals },
    }
  })

  // Aggregate stats
  const totalMatches = matchEntries.length
  const avgRating =
    totalMatches > 0
      ? matchEntries.reduce((s, m) => s + m.rating, 0) / totalMatches
      : 0
  const victories = matchEntries.filter((m) => m.result === 'Victoria').length
  const defeats = matchEntries.filter((m) => m.result === 'Derrota').length
  const draws = matchEntries.filter((m) => m.result === 'Empate').length

  return NextResponse.json({
    player: {
      id: player.id,
      name: player.name,
      userId: player.userId,
      isClaimed: !!player.userId,
    },
    stats: { totalMatches, avgRating, victories, defeats, draws },
    matches: matchEntries,
  })
}
