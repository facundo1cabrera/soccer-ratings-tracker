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

  const teamPlayer = await prisma.teamPlayer.findFirst({
    where: {
      player: { userId },
      team: { matchId },
    },
    select: { playerId: true },
  })

  return NextResponse.json({ playerId: teamPlayer?.playerId ?? null })
}
