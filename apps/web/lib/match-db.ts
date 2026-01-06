import { prisma } from './prisma'
import type { Match, Player, Team as MatchTeam } from './match-schemas'

/**
 * Transform database models to Match schema format
 */
export async function dbMatchToMatchSchema(dbMatch: {
  id: number
  date: Date
  result: string
  name: string
  rating: number
  teams: Array<{
    id: number
    name: string
    goals: number
    teamPlayers: Array<{
      player: {
        id: string
        name: string
      }
    }>
  }>
  playerRatings: Array<{
    ownerPlayerId: string
    destinationPlayerId: string
    rating: number
  }>
}): Promise<Match> {
  // Get all unique player IDs from teams
  const allPlayerIds = new Set<string>()
  dbMatch.teams.forEach(team => {
    team.teamPlayers.forEach(tp => {
      allPlayerIds.add(tp.player.id)
    })
  })

  // Fetch all players with their ratings for this match
  const playersWithRatings = await prisma.player.findMany({
    where: { id: { in: Array.from(allPlayerIds) } },
    include: {
      ratingsReceived: {
        where: { matchId: dbMatch.id },
      },
    },
  })

  // Create a map of player ID to average rating
  const playerRatingMap = new Map<string, number>()
  playersWithRatings.forEach((player: { id: string; ratingsReceived: Array<{ rating: number }> }) => {
    if (player.ratingsReceived.length > 0) {
      const avgRating = player.ratingsReceived.reduce(
        (sum: number, r: { rating: number }) => sum + r.rating,
        0
      ) / player.ratingsReceived.length
      playerRatingMap.set(player.id, avgRating)
    } else {
      playerRatingMap.set(player.id, 5.0) // Default rating
    }
  })

  // Transform teams
  const team1 = dbMatch.teams[0]
  const team2 = dbMatch.teams[1] || { id: 0, name: '', goals: 0, teamPlayers: [] }

  const transformTeam = (team: typeof team1): MatchTeam => ({
    name: team.name,
    goals: team.goals,
    players: team.teamPlayers.map(tp => {
      const player = tp.player
      const rating = playerRatingMap.get(player.id) || 5.0
      return {
        id: parseInt(player.id.replace(/[^0-9]/g, ''), 10) || 0,
        name: player.name,
        rating,
      }
    }),
  })

  return {
    id: dbMatch.id,
    date: dbMatch.date.toISOString().split('T')[0],
    result: dbMatch.result as 'Victoria' | 'Derrota' | 'Empate',
    name: dbMatch.name,
    rating: dbMatch.rating,
    team1: transformTeam(team1),
    team2: transformTeam(team2),
  }
}

/**
 * Find or create a player by name
 */
export async function findOrCreatePlayer(name: string): Promise<string> {
  // Try to find existing player by name
  const existing = await prisma.player.findFirst({
    where: { name },
  })

  if (existing) {
    return existing.id
  }

  // Create new player
  const newPlayer = await prisma.player.create({
    data: { name },
  })

  return newPlayer.id
}

/**
 * Get all matches from database
 */
export async function getAllMatchesFromDb(): Promise<Match[]> {
  const dbMatches = await prisma.match.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  return Promise.all(dbMatches.map(dbMatchToMatchSchema))
}

/**
 * Get a match by ID from database
 */
export async function getMatchByIdFromDb(id: number): Promise<Match | null> {
  const dbMatch = await prisma.match.findUnique({
    where: { id },
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

  if (!dbMatch) {
    return null
  }

  return dbMatchToMatchSchema(dbMatch)
}

