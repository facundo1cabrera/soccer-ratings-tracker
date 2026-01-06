import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { ensureUserExists } from '@/lib/user-db'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  
  // Allow public access to match pages (results, join, rate, share)
  // Only protect /match/create which requires authentication
  const isMatchPublicRoute = 
    pathname.startsWith('/match/') && 
    !pathname.includes('/create')
  
  // Allow public access to API routes needed for match viewing and rating
  const isPublicApiRoute = 
    // GET /api/matches - list all matches
    (pathname === '/api/matches' && request.method === 'GET') ||
    // GET /api/matches/[id] - get match by ID
    (pathname.startsWith('/api/matches/') && 
     !pathname.includes('/ratings') && 
     request.method === 'GET') ||
    // PUT /api/matches/[id]/ratings - submit ratings (allow unauthenticated)
    (pathname.startsWith('/api/matches/') && 
     pathname.includes('/ratings') && 
     request.method === 'PUT')
  
  if (!isPublicRoute(request) && !isMatchPublicRoute && !isPublicApiRoute) {
    await auth.protect()
  }

  const authResult = await auth()
  if (authResult.userId) {
    ensureUserExists(authResult.userId).catch((error) => {
      console.error('Failed to ensure user exists in middleware:', error)
    })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

