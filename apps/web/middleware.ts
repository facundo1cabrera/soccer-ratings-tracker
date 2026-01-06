import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  
  // Allow public access to match join, rate, and share pages
  const isMatchPublicRoute = 
    pathname.startsWith('/match/') && 
    (pathname.includes('/join') || pathname.includes('/rate') || pathname.includes('/share'))
  
  if (!isPublicRoute(request) && !isMatchPublicRoute) {
    await auth.protect()
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

