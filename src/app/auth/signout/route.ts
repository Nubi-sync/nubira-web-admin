import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Error during sign out:', err)
  }

  // Redirect to /login with 303 See Other
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl, { status: 303 })

  // Explicitly purge all Supabase cookies from the response
  const cookies = request.cookies.getAll()
  for (const cookie of cookies) {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase') || cookie.name.includes('auth')) {
      response.cookies.delete(cookie.name)
    }
  }

  revalidatePath('/', 'layout')
  return response
}

export async function GET(request: NextRequest) {
  return POST(request)
}
