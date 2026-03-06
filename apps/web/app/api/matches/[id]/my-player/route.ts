import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ playerId: null })
  }

  const { id } = await params
  const matchId = parseInt(id, 10)
  if (isNaN(matchId)) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 })
  }

  const userPlayers = await prisma.player.findMany({
    where: { userId },
    select: { id: true },
  })
  const userPlayerIds = new Set(userPlayers.map((p) => p.id))

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teams: { include: { teamPlayers: { select: { playerId: true } } } } },
  })

  if (!match) {
    return NextResponse.json({ playerId: null })
  }

  for (const team of match.teams) {
    for (const tp of team.teamPlayers) {
      if (userPlayerIds.has(tp.playerId)) {
        return NextResponse.json({ playerId: tp.playerId })
      }
    }
  }

  return NextResponse.json({ playerId: null })
}
