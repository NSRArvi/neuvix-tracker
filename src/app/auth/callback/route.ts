import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeSafeRedirect } from '@/lib/validation'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate and sanitize "next" parameter to prevent Open Redirect attacks
  const rawNext = searchParams.get('next')
  const next = sanitizeSafeRedirect(rawNext, '/dashboard')

  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error || errorDescription) {
    const message = encodeURIComponent(errorDescription || error || 'Authentication failed')
    return NextResponse.redirect(`${origin}/auth?error=${message}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?error=Could%20not%20authenticate`)
}
