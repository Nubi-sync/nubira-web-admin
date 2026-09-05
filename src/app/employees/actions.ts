'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function createEmployee(formData: FormData) {
  const rawUsername = formData.get('username') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  if (!rawUsername || !password || !role) {
    return { error: 'All fields (Username/Name, Password, Role) are required.' }
  }

  // 1. Preserve original username (spaces & capital letters e.g. "Ramesh Kumar" or "QC Head")
  const displayName = rawUsername.trim()
  if (displayName.length < 2) {
    return { error: 'Please enter a valid employee name / username (at least 2 characters).' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  // Internal RFC-compliant email for Supabase Auth (lowercase, underscores instead of spaces)
  const authEmailKey = displayName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.-]/g, '')
  const fakeEmail = `${authEmailKey}@nubira.local`

  try {
    // 2. Check if username already exists in profiles (case-insensitive)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .ilike('username', displayName)
      .limit(1)
      .maybeSingle()

    if (existingProfile) {
      return { error: `Employee "${displayName}" already exists in the system. Please use a different name.` }
    }

    // 3. Create user in Supabase Auth
    let authUserId: string | null = null
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        username: displayName,
        display_name: displayName,
        role: role
      }
    })

    if (authError) {
      // If user already exists in auth.users (orphaned auth account from previous deleted profile)
      if (authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('exists')) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const matched = userList?.users?.find(u => u.email?.toLowerCase() === fakeEmail.toLowerCase())
        if (matched) {
          await supabaseAdmin.auth.admin.updateUserById(matched.id, {
            password: password,
            user_metadata: { username: displayName, display_name: displayName, role: role }
          })
          authUserId = matched.id
        } else {
          return { error: `Auth registration failed: ${authError.message}` }
        }
      } else {
        return { error: authError.message }
      }
    } else if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) {
      return { error: 'Failed to initialize employee authentication credentials.' }
    }

    // 4. Insert/Upsert into profiles table with the REAL original name (e.g. "Ramesh Kumar")
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authUserId,
      username: displayName,
      role: role,
      is_active: true
    })

    if (profileError) {
      console.error('Error inserting employee profile:', profileError)
      return { error: `Failed to save employee profile: ${profileError.message}` }
    }

    revalidatePath('/employees')
    revalidatePath('/')
    return { success: true, username: displayName }
  } catch (err: any) {
    console.error('Unexpected error in createEmployee:', err)
    return { error: err?.message || 'Server error while creating employee.' }
  }
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
