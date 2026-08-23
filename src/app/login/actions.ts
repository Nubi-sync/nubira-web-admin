'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
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
