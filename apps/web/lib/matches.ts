// Re-export types and service for backward compatibility
// All match operations should now use matchService from './match-service'
export type {
  Match,
  Player,
  Team,
} from './match-service'

import { matchService } from './match-service'
import type { Match } from './match-service'

/**
 * @deprecated Use matchService.getAllMatches() instead
 * This is kept for backward compatibility
 */
export async function getMatches(): Promise<Match[]> {
  return matchService.getAllMatches()
}

/**
 * @deprecated Use matchService.getMatchById() instead
 * This is kept for backward compatibility
 */
export async function getMatchById(id: number): Promise<Match | null> {
  return matchService.getMatchById(id)
}

// For synchronous access (used in server components)
// This will be replaced with async calls when API is integrated
let cachedMatches: Match[] | null = null

export async function getMatchesSync(): Promise<Match[]> {
  if (!cachedMatches) {
    cachedMatches = await matchService.getAllMatches()
  }
  return cachedMatches
}

