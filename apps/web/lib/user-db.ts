import { prisma } from './prisma'
import { currentUser } from '@clerk/nextjs/server'

/**
 * Ensures a user exists in the database based on Clerk authentication.
 * Creates the user if they don't exist, otherwise returns the existing user.
 * 
 * @param clerkUserId - The Clerk user ID (from auth().userId)
 * @returns The user from the database, or null if clerkUserId is not provided or user creation fails
 */
export async function ensureUserExists(clerkUserId: string | null | undefined) {
  if (!clerkUserId) {
    return null
  }

  try {
    // First, check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkUserId },
    })

    if (existingUser) {
      return existingUser
    }

    // User doesn't exist, fetch user info from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      console.warn(`Clerk user not found for userId: ${clerkUserId}`)
      return null
    }

    // Get email from Clerk user (primary email address)
    const email = clerkUser.emailAddresses?.[0]?.emailAddress
    if (!email) {
      console.warn(`No email found for Clerk user: ${clerkUserId}`)
      return null
    }

    // Get name from Clerk user (firstName + lastName or username)
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || clerkUser.lastName || clerkUser.username || null

    // Create user in database
    // Use upsert to handle race conditions where user might be created between check and create
    const newUser = await prisma.user.upsert({
      where: { id: clerkUserId },
      update: {
        // Update email and name in case they changed in Clerk
        email,
        name,
      },
      create: {
        id: clerkUserId,
        email,
        name,
      },
    })

    return newUser
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    // If there's an error, try to fetch the user one more time
    // (in case it was created by another request)
    try {
      return await prisma.user.findUnique({
        where: { id: clerkUserId },
      })
    } catch (fetchError) {
      console.error('Error fetching user after creation failure:', fetchError)
      return null
    }
  }
}

