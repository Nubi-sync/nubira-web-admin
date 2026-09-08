'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const rawInput = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!rawInput || !password) {
    return { error: 'Username/email and password are required' }
  }

  // Format email: If user enters "Store" or "lineman" (without @), convert to "store@nubira.local" (matching mobile app)
  const cleanEmailKey = rawInput.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '')
  const email = rawInput.includes('@') ? rawInput : `${cleanEmailKey}@nubira.local`

  let { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Fallback retry without spaces in case of legacy usernames
  if (error && !rawInput.includes('@') && rawInput.includes(' ')) {
    const noSpaceEmail = `${rawInput.toLowerCase().replace(/\s+/g, '')}@nubira.local`
    const retry = await supabase.auth.signInWithPassword({
      email: noSpaceEmail,
      password,
    })
    if (!retry.error) {
      authData = retry.data
      error = null
    }
  }

  if (error) {
    return { error: error.message }
  }

  // Check user role for dynamic destination routing
  let targetRoute = '/dashboard'
  try {
    const userId = authData.user?.id
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      const role = (profile?.role || '').toUpperCase()
      if (role === 'STORE' || role === 'STORE_SUPERVISOR' || role === 'GODOWN') {
        targetRoute = '/store'
      }
    }
  } catch (err) {
    console.error('Error fetching user profile role upon login:', err)
  }

  revalidatePath('/', 'layout')
  redirect(targetRoute)
}

// Step 1: Send OTP
export async function sendPasswordResetOtp(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    return { error: 'Please enter your registered email address.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: '6-digit OTP has been sent to your email.' }
}

// Step 2: Verify OTP
export async function verifyRecoveryOtp(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()
  const token = (formData.get('token') as string)?.trim()

  if (!email || !token) {
    return { error: 'Please enter the 6-digit OTP code.' }
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })

  if (error) {
    return { error: 'Invalid or expired OTP. Please check the code or request a new one.' }
  }

  return { success: true }
}

// Step 3: Set New Password
export async function setNewPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  return setNewPassword(formData)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

