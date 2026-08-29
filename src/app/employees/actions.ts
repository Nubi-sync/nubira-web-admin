'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function createEmployee(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  if (!username || !password || !role) {
    return { error: 'All fields are required' }
  }

  // 1. Create user in Supabase Auth using admin client
  const fakeEmail = `${username.toLowerCase().trim()}@nubira.local`
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: fakeEmail,
    password: password,
    email_confirm: true, // Skip email verification
  })

  if (authError) {
    // If username already exists, it will throw an email already in use error
    return { error: authError.message.includes('already registered') 
        ? 'Username already exists' 
        : authError.message 
    }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // 2. Insert into profiles table
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    username: username.toLowerCase().trim(),
    role: role,
  })

  if (profileError) {
    // If profile insert fails, we should ideally clean up the auth user, but for now we return error
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/employees')
  return { success: true }
}

export async function toggleEmployeeStatus(userId: string, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/employees')
  return { success: true }
}

export async function updateEmployeeRole(userId: string, newRole: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/employees')
  return { success: true }
}

export async function resetEmployeePassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/employees')
  return { success: true }
}

export async function deleteEmployee(userId: string) {
  try {
    // 1. Delete from profiles
    const { error: profError } = await supabaseAdmin.from('profiles').delete().eq('id', userId)
    if (profError) {
      console.warn('Profiles delete error:', profError.message)
    }

    // 2. Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Auth delete error:', authError.message)
    }

    revalidatePath('/employees')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting employee:', err)
    return { error: err?.message || 'Failed to delete employee' }
  }
}
