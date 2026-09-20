'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { resolveUserTenant } from '@/lib/tenant-context'
import { CacheManager } from '@/lib/cache/cache-manager'

// ----------------------------------------------------------------------
// FETCH EMPLOYEES (Cached)
// ----------------------------------------------------------------------
export async function fetchEmployeesAction(companyName?: string) {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:employees:list`

  return CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300)
      return data || []
    },
    180,
    [`company:${normComp}:employees`, 'employees']
  )
}

export async function createEmployee(formData: FormData) {
  const rawUsername = formData.get('username') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const forcedModule = (formData.get('forcedModule') as string) || ''

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
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const tenant = currentUser ? await resolveUserTenant(currentUser) : null
    const companyName = tenant?.companyName || 'Nubira Creation'

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
    const { ROLE_MODULE_MAPPING } = await import('@/lib/access-control')
    const baseModules = ROLE_MODULE_MAPPING[role] || (role === 'ADMIN' ? ['/modules'] : ['/stitching-sewing'])
    const allowedModules = forcedModule
      ? Array.from(new Set([forcedModule, ...baseModules]))
      : baseModules

    let authUserId: string | null = null
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        username: displayName,
        display_name: displayName,
        role: role,
        allowed_modules: allowedModules,
        company_name: companyName,
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
            user_metadata: { 
              username: displayName, 
              display_name: displayName, 
              role: role, 
              allowed_modules: allowedModules,
              company_name: companyName,
            }
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
      allowed_modules: allowedModules,
      company_name: companyName,
      is_head: false, // Explicitly false: this is a floor worker, NOT a Department Head
      is_active: true
    })

    if (profileError) {
      console.error('Error inserting employee profile:', profileError)
      return { error: `Failed to save employee profile: ${profileError.message}` }
    }

    await CacheManager.invalidateTag('employees')
    revalidatePath('/employees')
    revalidatePath('/stitching-sewing/employees')
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
  
  await CacheManager.invalidateTag('employees')
  revalidatePath('/employees')
  revalidatePath('/stitching-sewing/employees')
  return { success: true }
}

export async function updateEmployeeRole(userId: string, newRole: string) {
  const { ROLE_MODULE_MAPPING } = await import('@/lib/access-control')
  const allowedModules = ROLE_MODULE_MAPPING[newRole] || ['/stitching-sewing']

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      role: newRole,
      allowed_modules: allowedModules,
      is_head: false
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  try {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole, allowed_modules: allowedModules }
    })
  } catch (_) {}
  
  await CacheManager.invalidateTag('employees')
  revalidatePath('/employees')
  revalidatePath('/stitching-sewing/employees')
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

  await CacheManager.invalidateTag('employees')
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

    await CacheManager.invalidateTag('employees')
    revalidatePath('/employees')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting employee:', err)
    return { error: err?.message || 'Failed to delete employee' }
  }
}
