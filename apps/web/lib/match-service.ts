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
  team1Goals: number
  team2Goals: number
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
  team1Goals: number
  team2Goals: number
  team1Players: { id: string; name: string }[]
  team2Players: { id: string; name: string }[]
  playerRatings: PlayerRating[]
}

// localStorage keys
const STORAGE_KEY = 'matches'
const LAST_ID_KEY = 'lastMatchId'

// Helper functions for localStorage
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function getFromStorage(): Match[] {
  if (!isBrowser()) return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

function saveToStorage(matches: Match[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    throw error
  }
}

function getNextId(): number {
  if (!isBrowser()) return Date.now()
  try {
    const lastId = localStorage.getItem(LAST_ID_KEY)
    const nextId = lastId ? parseInt(lastId, 10) + 1 : 1
    localStorage.setItem(LAST_ID_KEY, nextId.toString())
    return nextId
  } catch (error) {
    console.error('Error getting next ID:', error)
    return Date.now()
  }
}

function initializeStorage(): void {
  if (!isBrowser()) return
  const existing = getFromStorage()
  if (existing.length === 0) {
    // Migrate hardcoded data to localStorage on first load
    saveToStorage(hardcodedMatches)
    // Set last ID to highest ID in hardcoded data
    const maxId = Math.max(...hardcodedMatches.map(m => m.id))
    localStorage.setItem(LAST_ID_KEY, maxId.toString())
  }
}

// Hardcoded data - used for initial migration to localStorage
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
 * Currently uses localStorage for persistence, but is structured to easily
 * replace with API calls in the future.
 */
class MatchService {
  constructor() {
    // Initialize storage on service creation (only in browser)
    if (isBrowser()) {
      initializeStorage()
    }
  }

  /**
   * Get all matches
   * TODO: Replace with API call: GET /api/matches
   */
  async getAllMatches(): Promise<Match[]> {
    // Future API implementation:
    // const response = await fetch('/api/matches')
    // return response.json()
    
    const matches = getFromStorage()
    // Fallback to hardcoded if localStorage is empty (shouldn't happen after init, but safety check)
    return matches.length > 0 ? matches : hardcodedMatches
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
    
    const matches = getFromStorage()
    const match = matches.find((match) => match.id === id)
    // Fallback to hardcoded if not found in localStorage
    if (match) return match
    return hardcodedMatches.find((m) => m.id === id) || null
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
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 5.0

    // Generate unique player IDs (convert string IDs to numbers)
    let playerIdCounter = Math.max(
      ...input.team1Players.map(p => {
        const numId = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10)
        return isNaN(numId) ? 0 : numId
      }),
      ...input.team2Players.map(p => {
        const numId = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10)
        return isNaN(numId) ? 0 : numId
      }),
      0
    )

    // Calculate result based on goals
    let result: string
    if (input.team1Goals > input.team2Goals) {
      result = 'Victoria'
    } else if (input.team1Goals < input.team2Goals) {
      result = 'Derrota'
    } else {
      result = 'Empate'
    }

    // Create match object
    const newMatch: Match = {
      id: getNextId(),
      date: new Date().toISOString().split('T')[0],
      result,
      name: input.matchName,
      rating: averageRating,
      team1: {
        name: input.team1Name,
        goals: input.team1Goals,
        players: input.team1Players.map((player) => {
          const rating = input.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team1'
          )
          // Try to parse the string ID, or generate a new one
          let playerId: number
          const parsedId = parseInt(String(player.id).replace(/[^0-9]/g, ''), 10)
          if (!isNaN(parsedId) && parsedId > 0) {
            playerId = parsedId
          } else {
            playerIdCounter++
            playerId = playerIdCounter
          }
          return {
            id: playerId,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
      team2: {
        name: input.team2Name,
        goals: input.team2Goals,
        players: input.team2Players.map((player) => {
          const rating = input.playerRatings.find(
            (pr) => pr.id === player.id && pr.team === 'team2'
          )
          // Try to parse the string ID, or generate a new one
          let playerId: number
          const parsedId = parseInt(String(player.id).replace(/[^0-9]/g, ''), 10)
          if (!isNaN(parsedId) && parsedId > 0) {
            playerId = parsedId
          } else {
            playerIdCounter++
            playerId = playerIdCounter
          }
          return {
            id: playerId,
            name: player.name,
            rating: rating?.rating || 5.0,
          }
        }),
      },
    }

    // Save to localStorage
    const matches = getFromStorage()
    matches.unshift(newMatch) // Add to beginning (newest first)
    saveToStorage(matches)

    return newMatch
  }

  /**
   * Update an existing match
   * TODO: Replace with API call: PUT /api/matches/:id
   * 
   * @param id - Match ID
   * @param updates - Partial match data to update
   * @returns Updated match or null if not found
   */
  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | null> {
    // Future API implementation:
    // const response = await fetch(`/api/matches/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // })
    // if (!response.ok) return null
    // return response.json()
    
    const matches = getFromStorage()
    const index = matches.findIndex((m) => m.id === id)
    
    if (index === -1) return null
    
    const updatedMatch = { ...matches[index], ...updates }
    matches[index] = updatedMatch
    saveToStorage(matches)
    
    return updatedMatch
  }

  /**
   * Delete a match
   * TODO: Replace with API call: DELETE /api/matches/:id
   * 
   * @param id - Match ID
   * @returns true if deleted, false if not found
   */
  async deleteMatch(id: number): Promise<boolean> {
    // Future API implementation:
    // const response = await fetch(`/api/matches/${id}`, {
    //   method: 'DELETE',
    // })
    // return response.ok
    
    const matches = getFromStorage()
    const filtered = matches.filter((m) => m.id !== id)
    
    if (filtered.length === matches.length) return false // Not found
    
    saveToStorage(filtered)
    return true
  }

  /**
   * Update player ratings for an existing match
   * TODO: Replace with API call: PUT /api/matches/:id/ratings
   * 
   * @param matchId - Match ID
   * @param playerRatings - Updated player ratings
   * @returns Updated match or null if not found
   */
  async updateMatchRatings(
    matchId: number,
    playerRatings: PlayerRating[]
  ): Promise<Match | null> {
    const match = await this.getMatchById(matchId)
    if (!match) return null

    // Update player ratings
    const updatedTeam1Players = match.team1.players.map((player) => {
      const rating = playerRatings.find(
        (pr) => String(pr.id) === String(player.id) && pr.team === 'team1'
      )
      return rating ? { ...player, rating: rating.rating } : player
    })

    const updatedTeam2Players = match.team2.players.map((player) => {
      const rating = playerRatings.find(
        (pr) => String(pr.id) === String(player.id) && pr.team === 'team2'
      )
      return rating ? { ...player, rating: rating.rating } : player
    })

    // Calculate new average rating
    const allRatings = playerRatings.map((p) => p.rating)
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : match.rating

    return this.updateMatch(matchId, {
      rating: averageRating,
      team1: {
        ...match.team1,
        players: updatedTeam1Players,
      },
      team2: {
        ...match.team2,
        players: updatedTeam2Players,
      },
    })
  }
}

// Export a singleton instance
export const matchService = new MatchService()

// Re-export types for convenience
export type { Match as MatchType, Player as PlayerType, Team as TeamType, CreateMatchInput as CreateMatchInputType, PlayerRating as PlayerRatingType, SaveMatchWithRatingsInput as SaveMatchWithRatingsInputType }

