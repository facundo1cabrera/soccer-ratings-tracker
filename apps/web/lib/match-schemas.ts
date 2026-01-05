import { z } from 'zod'

// Zod schemas for runtime validation and type inference
export const playerSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  profileImage: z.string().optional(),
  rating: z.number().min(0).max(10),
})

export const teamSchema = z.object({
  name: z.string(),
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
})

export const playerRatingSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(10),
  team: z.enum(['team1', 'team2']),
})

export const saveMatchWithRatingsInputSchema = z.object({
  matchName: z.string().min(1),
  team1Name: z.string().min(1),
  team2Name: z.string().min(1),
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
  playerRatings: z.array(playerRatingSchema),
})

// Type inference from schemas
export type Player = z.infer<typeof playerSchema>
export type Team = z.infer<typeof teamSchema>
export type Match = z.infer<typeof matchSchema>
export type PlayerRating = z.infer<typeof playerRatingSchema>
export type SaveMatchWithRatingsInput = z.infer<typeof saveMatchWithRatingsInputSchema>

// API Response types
export const apiErrorSchema = z.object({
  error: z.string(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

