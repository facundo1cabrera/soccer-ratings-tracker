import { z } from 'zod'

// Zod schemas for runtime validation and type inference
export const playerSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  profileImage: z.string().optional(),
  rating: z.number().min(0).max(10),
})

export const teamSchema = z.object({
  goals: z.number().int().min(0),
  players: z.array(playerSchema),
})

export const matchSchema = z.object({
  id: z.number(),
  date: z.string(),
  result: z.enum(['Victoria', 'Derrota', 'Empate']),
  name: z.string(),
  rating: z.number().min(0).max(10),
  team1: teamSchema,
  team2: teamSchema,
  playersWhoSubmittedRatings: z.array(z.string())
})

export const playerRatingSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(10),
  team: z.enum(['team1', 'team2']),
  ownerPlayerId: z.string(), // The player who gave this rating
})

export const createMatchInputSchema = z.object({
  matchName: z.string().min(1),
  team1Goals: z.number().int().min(0),
  team2Goals: z.number().int().min(0),
  team1Players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  team2Players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export const saveMatchWithRatingsInputSchema = createMatchInputSchema.extend({
  playerRatings: z.array(playerRatingSchema),
})

// Type inference from schemas
export type Player = z.infer<typeof playerSchema>
export type Team = z.infer<typeof teamSchema>
export type Match = z.infer<typeof matchSchema>
export type PlayerRating = z.infer<typeof playerRatingSchema>
export type CreateMatchInput = z.infer<typeof createMatchInputSchema>
export type SaveMatchWithRatingsInput = z.infer<typeof saveMatchWithRatingsInputSchema>

// API Response types
export const apiErrorSchema = z.object({
  error: z.string(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

