import { prisma } from './prisma'
import type { Match, Team as MatchTeam } from './match-schemas'

/**
 * Transform database models to Match schema format
 * @param playerIds - Optional array of player IDs to calculate rating for. If provided, returns the average rating received by these players instead of the overall match average.
 */
export async function dbMatchToMatchSchema(dbMatch: {
  id: number
  date: Date
  result: string
  name: string
  rating: number
  teams: Array<{
    id: number
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
}, playerIds?: string[]): Promise<Match> {
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
  const team2 = dbMatch.teams[1] || { id: 0, goals: 0, teamPlayers: [] }

  const transformTeam = (team: typeof team1): MatchTeam => ({
    goals: team.goals,
    players: team.teamPlayers.map(tp => {
      const player = tp.player
      const rating = playerRatingMap.get(player.id) || 5.0
      return {
        id: player.id, // Return the actual database player ID (cuid string)
        name: player.name,
        rating,
      }
    }),
  })

  // Extract unique player IDs who have submitted ratings (ownerPlayerId)
  const playersWhoSubmittedRatings = Array.from(
    new Set(dbMatch.playerRatings.map(pr => pr.ownerPlayerId))
  )

  // Calculate rating: if playerIds are provided, use the average rating received by those players
  // Otherwise, use the overall match average rating
  let matchRating = dbMatch.rating
  if (playerIds && playerIds.length > 0) {
    // Check if any of the user's players are actually in this match
    const userPlayersInMatch = new Set<string>()
    dbMatch.teams.forEach(team => {
      team.teamPlayers.forEach(tp => {
        if (playerIds.includes(tp.player.id)) {
          userPlayersInMatch.add(tp.player.id)
        }
      })
    })
    
    // Only calculate player-specific rating if the user's players are in the match
    if (userPlayersInMatch.size > 0) {
      // Find all ratings received by the specified players in this match
      const playerRatings = dbMatch.playerRatings.filter(pr => 
        userPlayersInMatch.has(pr.destinationPlayerId)
      )
      
      if (playerRatings.length > 0) {
        // Calculate average of ratings received by the user's players
        matchRating = playerRatings.reduce((sum, pr) => sum + pr.rating, 0) / playerRatings.length
      } else {
        // If user's players are in the match but haven't received ratings yet, use default
        matchRating = 5.0
      }
    }
    // If user's players are not in the match, use the overall average (matchRating = dbMatch.rating)
  }

  return {
    id: dbMatch.id,
    date: dbMatch.date.toISOString().split('T')[0],
    result: dbMatch.result as 'Victoria' | 'Derrota' | 'Empate',
    name: dbMatch.name,
    rating: matchRating,
    team1: transformTeam(team1),
    team2: transformTeam(team2),
    playersWhoSubmittedRatings,
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
 * Get all matches from database for a specific user
 * @param userId - Required user ID. Returns only matches where the user has a player, with ratings specific to that user's players.
 */
export async function getAllMatchesFromUser(userId: string): Promise<Match[]> {
  // Only return matches where at least one player has that userId
  const dbMatches = await prisma.match.findMany({
    where: {
      teams: {
        some: {
          teamPlayers: {
            some: {
              player: {
                userId: userId,
              },
            },
          },
        },
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get all player IDs for that user
  const userPlayers = await prisma.player.findMany({
    where: { userId },
    select: { id: true },
  })
  const playerIds = userPlayers.map(p => p.id)

  return Promise.all(dbMatches.map(dbMatch => dbMatchToMatchSchema(dbMatch, playerIds)))
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

