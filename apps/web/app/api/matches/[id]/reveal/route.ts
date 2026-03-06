import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const revealBodySchema = z.object({
  subjectPlayerId: z.string(),
  ownerPlayerId: z.string(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const matchId = parseInt(id, 10)
  if (isNaN(matchId)) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 })
  }

  const subjectPlayerId = new URL(request.url).searchParams.get('subjectPlayerId')
  if (!subjectPlayerId) {
    return NextResponse.json({ error: 'subjectPlayerId required' }, { status: 400 })
  }

  const reveal = await prisma.ratingReveal.findUnique({
    where: { matchId_subjectPlayerId: { matchId, subjectPlayerId } },
    include: { owner: { select: { name: true } } },
  })

  if (!reveal) {
    return NextResponse.json({ reveal: null })
  }

  const playerRating = await prisma.playerRating.findUnique({
    where: {
      matchId_ownerPlayerId_destinationPlayerId: {
        matchId,
        ownerPlayerId: reveal.ownerPlayerId,
        destinationPlayerId: subjectPlayerId,
      },
    },
    select: { rating: true },
  })

  return NextResponse.json({
    reveal: {
      ownerPlayerId: reveal.ownerPlayerId,
      ownerName: reveal.owner.name,
      rating: playerRating?.rating ?? null,
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const matchId = parseInt(id, 10)
  if (isNaN(matchId)) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 })
  }

  const body = revealBodySchema.safeParse(await request.json())
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { subjectPlayerId, ownerPlayerId } = body.data

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.ratingReveal.findUnique({
        where: { matchId_subjectPlayerId: { matchId, subjectPlayerId } },
      })
      if (existing) throw new Error('ALREADY_REVEALED')

      const playerRating = await tx.playerRating.findUnique({
        where: {
          matchId_ownerPlayerId_destinationPlayerId: {
            matchId,
            ownerPlayerId,
            destinationPlayerId: subjectPlayerId,
          },
        },
        select: { rating: true },
      })

      const reveal = await tx.ratingReveal.create({
        data: { matchId, subjectPlayerId, ownerPlayerId },
        include: { owner: { select: { name: true } } },
      })

      return { reveal, rating: playerRating?.rating ?? null }
    })

    return NextResponse.json({
      ownerPlayerId: result.reveal.ownerPlayerId,
      ownerName: result.reveal.owner.name,
      rating: result.rating,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_REVEALED') {
      return NextResponse.json({ error: 'Already revealed' }, { status: 409 })
    }
    console.error('Error revealing rating:', error)
    return NextResponse.json({ error: 'Failed to reveal rating' }, { status: 500 })
  }
}
