/**
 * Type-safe Match Service using the new API client
 * 
 * This is an alternative implementation that uses the type-safe API client.
 * You can gradually migrate from match-service.ts to this one, or use both.
 * 
 * Example usage:
 * ```ts
 * import { matchServiceV2 } from '@/lib/match-service-v2'
 * 
 * const result = await matchServiceV2.getAllMatches()
 * if (result.success) {
 *   console.log(result.data) // Fully typed!
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */

import {
  getAllMatches as apiGetAllMatches,
  getMatchById as apiGetMatchById,
  createMatch as apiCreateMatch,
  updateMatch as apiUpdateMatch,
  deleteMatch as apiDeleteMatch,
  updateMatchRatings as apiUpdateMatchRatings,
} from './api-client'
import type { Match, SaveMatchWithRatingsInput, PlayerRating } from './match-schemas'

class MatchServiceV2 {
  /**
   * Get all matches
   */
  async getAllMatches(): Promise<Match[]> {
    const result = await apiGetAllMatches()
    if (result.success) {
      return result.data
    }
    console.error('Error fetching matches:', result.error)
    throw new Error(result.error)
  }

  /**
   * Get a match by ID
   */
  async getMatchById(id: number): Promise<Match | null> {
    const result = await apiGetMatchById(id)
    if (result.success) {
      return result.data
    }
    if (result.status === 404) {
      return null
    }
    console.error('Error fetching match:', result.error)
    throw new Error(result.error)
  }

  /**
   * Save a match with player ratings
   */
  async saveMatchWithRatings(input: SaveMatchWithRatingsInput): Promise<Match> {
    const result = await apiCreateMatch(input)
    if (result.success) {
      return result.data
    }
    throw new Error(result.error)
  }

  /**
   * Update an existing match
   */
  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | null> {
    const result = await apiUpdateMatch(id, updates)
    if (result.success) {
      return result.data
    }
    if (result.status === 404) {
      return null
    }
    console.error('Error updating match:', result.error)
    return null
  }

  /**
   * Delete a match
   */
  async deleteMatch(id: number): Promise<boolean> {
    const result = await apiDeleteMatch(id)
    if (result.success) {
      return result.data
    }
    if (result.status === 404) {
      return false
    }
    console.error('Error deleting match:', result.error)
    return false
  }

  /**
   * Update player ratings for an existing match
   */
  async updateMatchRatings(
    matchId: number,
    playerRatings: PlayerRating[]
  ): Promise<Match | null> {
    const result = await apiUpdateMatchRatings(matchId, playerRatings)
    if (result.success) {
      return result.data
    }
    if (result.status === 404) {
      return null
    }
    console.error('Error updating match ratings:', result.error)
    return null
  }
}

// Export a singleton instance
export const matchServiceV2 = new MatchServiceV2()

