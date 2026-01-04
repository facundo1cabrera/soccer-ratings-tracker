// Types
export interface Player {
  id: number | string
  name: string
  profileImage?: string
  rating: number
}

export interface Team {
  name: string
  goals: number
  players: Player[]
}

export interface Match {
  id: number
  date: string
  result: string
  name: string
  rating: number
  team1: Team
  team2: Team
}

// Input types for creating/rating matches
export interface CreateMatchInput {
  matchName: string
  team1Name: string
  team2Name: string
  team1Players: { id: string; name: string }[]
  team2Players: { id: string; name: string }[]
}

export interface PlayerRating {
  id: string
  name: string
  rating: number
  team: 'team1' | 'team2'
}

export interface SaveMatchWithRatingsInput {
  matchName: string
  team1Name: string
  team2Name: string
  team1Players: { id: string; name: string }[]
  team2Players: { id: string; name: string }[]
  playerRatings: PlayerRating[]
}

// Hardcoded data - will be replaced with API calls in the future
const hardcodedMatches: Match[] = [
  {
    id: 1,
    date: "2024-01-15",
    result: "Victoria",
    name: "River vs Boca",
    rating: 8.5,
    team1: {
      name: "River",
      goals: 3,
      players: [
        { id: 1, name: "Juan Pérez", profileImage: "/placeholder-user.jpg", rating: 8.5 },
        { id: 2, name: "Carlos García", rating: 9.0 },
        { id: 3, name: "Luis Martínez", profileImage: "/placeholder-user.jpg", rating: 8.0 },
        { id: 4, name: "Pedro Rodríguez", rating: 7.5 },
        { id: 5, name: "Miguel López", rating: 8.8 },
      ],
    },
    team2: {
      name: "Boca",
      goals: 1,
      players: [
        { id: 6, name: "Diego Sánchez", rating: 6.5 },
        { id: 7, name: "Fernando Torres", profileImage: "/placeholder-user.jpg", rating: 7.0 },
        { id: 8, name: "Roberto Silva", rating: 6.0 },
      ],
    },
  },
  {
    id: 2,
    date: "2024-01-12",
    result: "Empate",
    name: "Partido entre amigos",
    rating: 6.2,
    team1: {
      name: "Equipo A",
      goals: 2,
      players: [
        { id: 9, name: "Facundo", profileImage: "/placeholder-user.jpg", rating: 7.0 },
        { id: 10, name: "Martín", rating: 6.5 },
        { id: 11, name: "Santiago", rating: 5.8 },
      ],
    },
    team2: {
      name: "Equipo B",
      goals: 2,
      players: [
        { id: 12, name: "Tomás", rating: 6.0 },
        { id: 13, name: "Lucas", profileImage: "/placeholder-user.jpg", rating: 6.5 },
      ],
    },
  },
  {
    id: 3,
    date: "2024-01-10",
    result: "Derrota",
    name: "River vs Boca",
    rating: 4.8,
    team1: {
      name: "River",
      goals: 0,
      players: [
        { id: 14, name: "Juan Pérez", profileImage: "/placeholder-user.jpg", rating: 4.5 },
        { id: 15, name: "Carlos García", rating: 5.0 },
        { id: 16, name: "Luis Martínez", rating: 4.0 },
      ],
    },
    team2: {
      name: "Boca",
      goals: 2,
      players: [
        { id: 17, name: "Diego Sánchez", rating: 7.5 },
        { id: 18, name: "Fernando Torres", profileImage: "/placeholder-user.jpg", rating: 8.0 },
        { id: 19, name: "Roberto Silva", rating: 7.0 },
        { id: 20, name: "Andrés Gómez", rating: 6.5 },
      ],
    },
  },
  {
    id: 4,
    date: "2024-01-08",
    result: "Victoria",
    name: "Partido entre amigos",
    rating: 9.1,
    team1: {
      name: "Equipo A",
      goals: 5,
      players: [
        { id: 21, name: "Facundo", profileImage: "/placeholder-user.jpg", rating: 9.5 },
        { id: 22, name: "Martín", rating: 9.0 },
        { id: 23, name: "Santiago", rating: 8.8 },
        { id: 24, name: "Nicolás", rating: 9.2 },
      ],
    },
    team2: {
      name: "Equipo B",
      goals: 1,
      players: [],
    },
  },
  {
    id: 5,
    date: "2024-01-05",
    result: "Victoria",
    name: "River vs Boca",
    rating: 7.3,
    team1: {
      name: "River",
      goals: 2,
      players: [
        { id: 25, name: "Juan Pérez", profileImage: "/placeholder-user.jpg", rating: 7.5 },
        { id: 26, name: "Carlos García", rating: 7.0 },
        { id: 27, name: "Luis Martínez", rating: 7.8 },
      ],
    },
    team2: {
      name: "Boca",
      goals: 1,
      players: [
        { id: 28, name: "Diego Sánchez", rating: 6.5 },
        { id: 29, name: "Fernando Torres", profileImage: "/placeholder-user.jpg", rating: 7.0 },
      ],
    },
  },
  {
    id: 6,
    date: "2024-01-03",
    result: "Empate",
    name: "Partido entre amigos",
    rating: 5.9,
    team1: {
      name: "Equipo A",
      goals: 1,
      players: [
        { id: 30, name: "Facundo", profileImage: "/placeholder-user.jpg", rating: 6.0 },
        { id: 31, name: "Martín", rating: 5.8 },
      ],
    },
    team2: {
      name: "Equipo B",
      goals: 1,
      players: [
        { id: 32, name: "Tomás", rating: 6.2 },
        { id: 33, name: "Lucas", profileImage: "/placeholder-user.jpg", rating: 5.5 },
        { id: 34, name: "Matías", rating: 6.0 },
      ],
    },
  },
]

/**
 * Match Service
 * 
 * This service centralizes all match-related operations.
 * Currently uses hardcoded data, but is structured to easily
 * replace with API calls in the future.
 */
class MatchService {
  /**
   * Get all matches
   * TODO: Replace with API call: GET /api/matches
   */
  async getAllMatches(): Promise<Match[]> {
    // Future API implementation:
    // const response = await fetch('/api/matches')
    // return response.json()
    
    return hardcodedMatches
  }

  /**
   * Get a match by ID
   * TODO: Replace with API call: GET /api/matches/:id
   */
  async getMatchById(id: number): Promise<Match | null> {
    // Future API implementation:
    // const response = await fetch(`/api/matches/${id}`)
    // if (!response.ok) return null
    // return response.json()
    
    const match = hardcodedMatches.find((match) => match.id === id)
    return match || null
  }

  /**
   * Save a match with player ratings
   * TODO: Replace with API call: POST /api/matches
   * 
   * @param input - Match data with player ratings
   * @returns The created match with ID
   */
  async saveMatchWithRatings(input: SaveMatchWithRatingsInput): Promise<Match> {
    // Future API implementation:
    // const response = await fetch('/api/matches', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(input),
    // })
    // if (!response.ok) throw new Error('Failed to save match')
    // return response.json()
    
    // Calculate average rating for the match
    const allRatings = input.playerRatings.map((p) => p.rating)
    const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length

    // Create match object (simulating API response)
    const newMatch: Match = {
      id: Date.now(), // Temporary ID generation
      date: new Date().toISOString().split('T')[0],
      result: 'Pendiente', // Could be calculated based on goals if added
      name: input.matchName,
      rating: averageRating,
      team1: {
        name: input.team1Name,
        goals: 0, // Would come from input in real implementation
        players: input.team1Players.map((player) => {
          const rating = input.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team1'
          )
          return {
            id: player.id,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
      team2: {
        name: input.team2Name,
        goals: 0, // Would come from input in real implementation
        players: input.team2Players.map((player) => {
          const rating = input.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team2'
          )
          return {
            id: player.id,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
    }

    // In a real implementation, this would be added to the API response
    // For now, we just log it (could also add to local state if needed)
    console.log('Match saved:', newMatch)

    return newMatch
  }
}

// Export a singleton instance
export const matchService = new MatchService()

// Re-export types for convenience
export type { Match, Player, Team, CreateMatchInput, PlayerRating, SaveMatchWithRatingsInput }

