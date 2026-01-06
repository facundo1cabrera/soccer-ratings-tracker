import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserExists } from './user-db'

/**
 * Wraps an API route handler to ensure the authenticated user exists in the database.
 * This is a helper function that can be used to wrap route handlers that need user creation.
 * 
 * @param handler - The route handler function to wrap
 * @param requireAuth - Whether authentication is required (default: false, will create user if authenticated but not required)
 * @returns A wrapped handler that ensures user exists before executing
 */
export function withUserCreation<T extends any[]>(
  handler: (
    request: NextRequest,
    ...args: T
  ) => Promise<NextResponse>,
  requireAuth: boolean = false
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { userId } = await auth()
    
    // If auth is required and user is not authenticated, return 401
    if (requireAuth && !userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Ensure user exists if authenticated (just-in-time creation)
    if (userId) {
      await ensureUserExists(userId)
    }
    
    // Call the original handler
    return handler(request, ...args)
  }
}

