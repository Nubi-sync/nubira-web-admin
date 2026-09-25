'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface FreeTrialPayload {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  selectedDivisions?: string[]
}

export async function registerFreeTrialAction(payload: FreeTrialPayload): Promise<{
  success: boolean
  error?: string
  companyName?: string
  firstName?: string
  expiresAt?: string
  tenantId?: string
}> {
  try {
    const rawName = (payload.name || '').trim()
    const cleanEmail = (payload.email || '').trim().toLowerCase()
    const rawPhoneDigits = (payload.phone || '').replace(/\D/g, '')
    const password = payload.password || ''
    const confirmPassword = payload.confirmPassword || ''
    const selectedDivisions = Array.isArray(payload.selectedDivisions) && payload.selectedDivisions.length > 0
      ? payload.selectedDivisions
      : [
          '/design',
          '/merchandising',
          '/cutting',
          '/printing',
          '/embroidery',
          '/stitching-sewing',
          '/washing',
          '/iron',
          '/ready-goods',
          '/alter',
          '/store',
          '/dispatch'
        ]

    // 1. Validations
    if (!rawName || rawName.length < 2) {
      return { success: false, error: 'Please enter your full contact name.' }
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid work email address.' }
    }

    const phone10 = rawPhoneDigits.slice(-10)
    if (!phone10 || phone10.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' }
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please verify.' }
    }

    // 2. Compute Industry / Factory Name from First Name
    const rawFirst = rawName.split(/\s+/)[0] || 'Apparel'
    const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
    const companyName = `${firstName} Industries`
    const plantSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const customUsername = `${firstName.toLowerCase()}_admin`
    const formattedPhone = `+91 ${phone10.slice(0, 5)} ${phone10.slice(5)}`
    
    // 7-Day Trial Expiration Date
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 3. Supabase Auth Provisioning via Service Role
    let authUserId: string | undefined
    try {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'SUPERADMIN',
          displayName: rawName,
          company: companyName,
          phone: formattedPhone,
          username: customUsername
        }
      })

      if (!userErr && userData?.user) {
        authUserId = userData.user.id
      } else if (userErr && userErr.message.toLowerCase().includes('already')) {
        // If user already exists in Auth, fetch user id and update password & company
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
        const existing = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail)
        if (existing) {
          authUserId = existing.id
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            user_metadata: {
              role: 'SUPERADMIN',
              displayName: rawName,
              company: companyName,
              phone: formattedPhone,
              username: customUsername
            }
          })
        }
      }
    } catch (authErr) {
      console.warn('[registerFreeTrialAction] Auth setup notice:', authErr)
    }

    // 4. Upsert Profiles Table
    if (authUserId) {
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: authUserId,
          username: customUsername,
          role: 'ADMIN',
          company_name: companyName,
          is_active: true,
          allowed_modules: selectedDivisions
        })
      } catch (_) {}
    }

    // 5. Upsert Company Profile (editable in /modules/profile)
    try {
      await supabaseAdmin.from('company_profile').upsert({
        company_name: companyName,
        contact_email: cleanEmail,
        contact_phone: formattedPhone,
        factory_address: 'Surat, Gujarat, India'
      }, { onConflict: 'company_name' })
    } catch (_) {}

    // 6. Insert into platform_tenant_factories with 7-Day DEMO_TRIAL
    let provisionedTenantId: string = `ten-${Date.now().toString().slice(-4)}`
    try {
      const tenantRow = {
        company_name: companyName,
        plant_slug: plantSlug,
        admin_email: cleanEmail,
        admin_name: rawName,
        phone: formattedPhone,
        city_state: 'Surat, Gujarat',
        subscription_tier: 'FULL_PLANT_AI',
        access_type: 'DEMO_TRIAL',
        monthly_billing_inr: 0,
        active_divisions_count: selectedDivisions.length,
        status: 'ACTIVE',
        allowed_divisions: selectedDivisions,
        provisioned_at: new Date().toISOString(),
        expires_at: expiresAt,
        last_active_at: new Date().toISOString()
      }

      const { data: tData, error: tErr } = await supabaseAdmin
        .from('platform_tenant_factories')
        .insert([tenantRow])
        .select('id')
        .single()

      if (!tErr && tData?.id) {
        provisionedTenantId = tData.id
      }
    } catch (tErr) {
      console.warn('[registerFreeTrialAction] Tenant insert notice:', tErr)
    }

    // 7. Insert into platform_demo_requests to show in leads list
    try {
      await supabaseAdmin.from('platform_demo_requests').insert([{
        applicant_name: rawName,
        company_name: companyName,
        phone: formattedPhone,
        email: cleanEmail,
        preferred_plan: 'FULL_PLANT_AI',
        city_state: 'Surat, Gujarat',
        status: 'PROVISIONED_TENANT',
        provisioned_tenant_id: provisionedTenantId,
        notes: '7-Day Self-Service Free Trial Activated via Try For Free onboarding',
        submitted_at: new Date().toISOString(),
        contacted_at: new Date().toISOString()
      }])
    } catch (_) {}

    // 8. Audit Log
    try {
      await supabaseAdmin.from('platform_audit_logs').insert([{
        log_code: `TRIAL-${Date.now().toString().slice(-4)}`,
        actor: cleanEmail,
        action: '7-Day Free Trial Activated',
        category: 'SECURITY',
        details: `Tenant factory "${companyName}" activated with 7-day trial by ${rawName} (${cleanEmail})`,
        status: 'SUCCESS',
        ip_address: '127.0.0.1',
        location: 'Surat, Gujarat, India'
      }])
    } catch (_) {}

    revalidatePath('/platform-admin')
    revalidatePath('/platform-admin/tenants')
    revalidatePath('/modules/profile')

    return {
      success: true,
      companyName,
      firstName,
      expiresAt,
      tenantId: provisionedTenantId
    }
  } catch (err: any) {
    console.error('[registerFreeTrialAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to complete registration. Please try again.' }
  }
}
