import { z } from 'zod'
import type { Match, SaveMatchWithRatingsInput, PlayerRating } from './match-schemas'
import { matchSchema, saveMatchWithRatingsInputSchema, playerRatingSchema, apiErrorSchema } from './match-schemas'

/**
 * Type-safe API client for match operations
 * All functions validate responses at runtime using Zod schemas
 */

type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; status?: number }

async function fetchApi<T>(
  url: string,
  options?: RequestInit,
  schema: z.ZodSchema<T>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const json = await response.json()

    if (!response.ok) {
      const error = apiErrorSchema.safeParse(json)
      return {
        success: false,
        error: error.success ? error.data.error : 'An error occurred',
        status: response.status,
      }
    }

    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      console.error('Response validation failed:', parsed.error)
      return {
        success: false,
        error: 'Invalid response format',
        status: response.status,
      }
    }

    return { success: true, data: parsed.data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Get all matches
 */
export async function getAllMatches(): Promise<ApiResponse<Match[]>> {
  return fetchApi('/api/matches', undefined, z.array(matchSchema))
}

/**
 * Get a match by ID
 */
export async function getMatchById(id: number): Promise<ApiResponse<Match | null>> {
  return fetchApi(`/api/matches/${id}`, undefined, matchSchema.nullable())
}

/**
 * Create a new match with ratings
 */
export async function createMatch(
  input: SaveMatchWithRatingsInput
): Promise<ApiResponse<Match>> {
  // Validate input
  const validated = saveMatchWithRatingsInputSchema.safeParse(input)
  if (!validated.success) {
    return {
      success: false,
      error: `Invalid input: ${validated.error.errors.map(e => e.message).join(', ')}`,
    }
  }

  return fetchApi('/api/matches', {
    method: 'POST',
    body: JSON.stringify(validated.data),
  }, matchSchema)
}

/**
 * Update a match
 */
export async function updateMatch(
  id: number,
  updates: Partial<Match>
): Promise<ApiResponse<Match>> {
  return fetchApi(`/api/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, matchSchema)
}

/**
 * Delete a match
 */
export async function deleteMatch(id: number): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`/api/matches/${id}`, {
      method: 'DELETE',
    })

    if (response.status === 404) {
      return { success: false, error: 'Match not found', status: 404 }
    }

    if (!response.ok) {
      const json = await response.json()
      const error = apiErrorSchema.safeParse(json)
      return {
        success: false,
        error: error.success ? error.data.error : 'Failed to delete match',
        status: response.status,
      }
    }

    return { success: true, data: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Update match ratings
 */
export async function updateMatchRatings(
  matchId: number,
  playerRatings: PlayerRating[]
): Promise<ApiResponse<Match>> {
  // Validate input
  const validated = z.array(playerRatingSchema).safeParse(playerRatings)
  if (!validated.success) {
    return {
      success: false,
      error: `Invalid input: ${validated.error.errors.map(e => e.message).join(', ')}`,
    }
  }

  return fetchApi(`/api/matches/${matchId}/ratings`, {
    method: 'PUT',
    body: JSON.stringify(validated.data),
  }, matchSchema)
}

