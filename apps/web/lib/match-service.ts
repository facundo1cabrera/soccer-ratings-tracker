// Import hardcoded matches for fallback
import { hardcodedMatches } from './matches-data'

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

/**
 * Match Service
 * 
 * This service centralizes all match-related operations.
 * Uses API endpoints for data persistence.
 */
class MatchService {
  /**
   * Get all matches
   */
  async getAllMatches(): Promise<Match[]> {
    try {
      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching matches:', error)
      // Fallback to hardcoded data if API fails
      return hardcodedMatches
    }
  }

  /**
   * Get a match by ID
   */
  async getMatchById(id: number): Promise<Match | null> {
    try {
      const response = await fetch(`/api/matches/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch match')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching match:', error)
      // Fallback to hardcoded data if API fails
      return hardcodedMatches.find((m) => m.id === id) || null
    }
  }

  /**
   * Save a match with player ratings
   * 
   * @param input - Match data with player ratings
   * @returns The created match with ID
   */
  async saveMatchWithRatings(input: SaveMatchWithRatingsInput): Promise<Match> {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error('Failed to save match')
      }
      return response.json()
    } catch (error) {
      console.error('Error saving match:', error)
      throw error
    }
  }

  /**
   * Update an existing match
   * 
   * @param id - Match ID
   * @param updates - Partial match data to update
   * @returns Updated match or null if not found
   */
  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | null> {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to update match')
      }
      return response.json()
    } catch (error) {
      console.error('Error updating match:', error)
      return null
    }
  }

  /**
   * Delete a match
   * 
   * @param id - Match ID
   * @returns true if deleted, false if not found
   */
  async deleteMatch(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      })
      if (response.status === 404) return false
      return response.ok
    } catch (error) {
      console.error('Error deleting match:', error)
      return false
    }
  }

  /**
   * Update player ratings for an existing match
   * 
   * @param matchId - Match ID
   * @param playerRatings - Updated player ratings
   * @returns Updated match or null if not found
   */
  async updateMatchRatings(
    matchId: number,
    playerRatings: PlayerRating[]
  ): Promise<Match | null> {
    try {
      const response = await fetch(`/api/matches/${matchId}/ratings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerRatings),
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to update match ratings')
      }
      return response.json()
    } catch (error) {
      console.error('Error updating match ratings:', error)
      return null
    }
  }
}

// Export a singleton instance
export const matchService = new MatchService()

// Re-export types for convenience
export type { Match as MatchType, Player as PlayerType, Team as TeamType, CreateMatchInput as CreateMatchInputType, PlayerRating as PlayerRatingType, SaveMatchWithRatingsInput as SaveMatchWithRatingsInputType }

