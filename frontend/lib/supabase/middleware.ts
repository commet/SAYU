import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, just pass through
    return NextResponse.next()
  }

  // Create response first
  const response = NextResponse.next()

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: false, // Disable URL session detection in middleware
          persistSession: false, // Disable session persistence in middleware
          autoRefreshToken: false, // Disable auto refresh in middleware
        },
        realtime: {
          disabled: true // Disable realtime to avoid Edge Runtime issues
        }
      }
    )

    // Only get user without triggering realtime connections
    await supabase.auth.getUser()
  } catch (error) {
    // If any error occurs, just pass through
    console.warn('Supabase middleware error (skipping):', error)
  }

  return response
}