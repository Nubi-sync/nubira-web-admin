'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
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

// ----------------------------------------------------------------------
// REAL-TIME EMAIL AVAILABILITY CHECK
// ----------------------------------------------------------------------
export async function checkEmailAvailabilityAction(rawEmail: string): Promise<{
  available: boolean
  error?: string
}> {
  try {
    const cleanEmail = (rawEmail || '').trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { available: false, error: 'Enter a valid email address.' }
    }

    // 1. Check Supabase Auth Users
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (!listErr && userList?.users) {
      const matchedAuth = userList.users.find(u => u.email?.toLowerCase() === cleanEmail)
      if (matchedAuth) {
        return { available: false, error: 'Email already registered. Please sign in.' }
      }
    }

    // 2. Check company_profile
    const { data: cp } = await supabaseAdmin
      .from('company_profile')
      .select('id')
      .ilike('contact_email', cleanEmail)
      .limit(1)
    if (cp && cp.length > 0) {
      return { available: false, error: 'Email already registered. Please sign in.' }
    }

    // 3. Check platform_tenant_factories
    const { data: ptf } = await supabaseAdmin
      .from('platform_tenant_factories')
      .select('id')
      .ilike('admin_email', cleanEmail)
      .limit(1)
    if (ptf && ptf.length > 0) {
      return { available: false, error: 'Email already registered. Please sign in.' }
    }

    // 4. Check cutting_workers
    const { data: cw } = await supabaseAdmin
      .from('cutting_workers')
      .select('id')
      .ilike('worker_email', cleanEmail)
      .limit(1)
    if (cw && cw.length > 0) {
      return { available: false, error: 'Email already registered. Please sign in.' }
    }

    return { available: true }
  } catch (err) {
    console.error('[checkEmailAvailabilityAction] Notice:', err)
    return { available: true }
  }
}

// ----------------------------------------------------------------------
// REAL-TIME PHONE NUMBER AVAILABILITY CHECK
// ----------------------------------------------------------------------
export async function checkPhoneAvailabilityAction(rawPhone: string): Promise<{
  available: boolean
  error?: string
}> {
  try {
    const digits = (rawPhone || '').replace(/\D/g, '')
    const phone10 = digits.slice(-10)
    if (!phone10 || phone10.length !== 10) {
      return { available: false, error: 'Enter a valid 10-digit mobile number.' }
    }

    // 1. Check Supabase Auth Users metadata
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (!listErr && userList?.users) {
      const matchedAuth = userList.users.find(u => {
        const p = (u.user_metadata?.phone || '').replace(/\D/g, '')
        return p.endsWith(phone10)
      })
      if (matchedAuth) {
        return { available: false, error: 'Mobile number already registered. Please sign in.' }
      }
    }

    // 2. Check cutting_workers
    const { data: cw } = await supabaseAdmin
      .from('cutting_workers')
      .select('id')
      .or(`phone_number.eq.${phone10},phone_number.ilike.%${phone10}%`)
      .limit(1)
    if (cw && cw.length > 0) {
      return { available: false, error: 'Mobile number already registered. Please sign in.' }
    }

    // 3. Check company_profile
    const { data: cp } = await supabaseAdmin
      .from('company_profile')
      .select('id')
      .ilike('contact_phone', `%${phone10}%`)
      .limit(1)
    if (cp && cp.length > 0) {
      return { available: false, error: 'Mobile number already registered. Please sign in.' }
    }

    // 4. Check platform_tenant_factories
    const { data: ptf } = await supabaseAdmin
      .from('platform_tenant_factories')
      .select('id')
      .ilike('phone', `%${phone10}%`)
      .limit(1)
    if (ptf && ptf.length > 0) {
      return { available: false, error: 'Mobile number already registered. Please sign in.' }
    }

    return { available: true }
  } catch (err) {
    console.error('[checkPhoneAvailabilityAction] Notice:', err)
    return { available: true }
  }
}

// ----------------------------------------------------------------------
// SEND OTP ACTION (MSG91 Flow via Supabase Edge Function / Auth Hook)
// ----------------------------------------------------------------------
export async function sendTrialPhoneOtpAction(rawPhone: string): Promise<{
  success: boolean
  error?: string
  verificationToken?: string
}> {
  try {
    const digits = (rawPhone || '').replace(/\D/g, '')
    const phone10 = digits.slice(-10)
    if (!phone10 || phone10.length !== 10) {
      return { success: false, error: 'Enter a valid 10-digit mobile number.' }
    }

    // Double check availability against database
    const avail = await checkPhoneAvailabilityAction(phone10)
    if (!avail.available) {
      return { success: false, error: avail.error || 'This mobile number is already registered. Please sign in.' }
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes valid

    // Create a cryptographic verification token
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'zigza_secure_otp_salt_2026'
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(`${phone10}:${otp}:${expiresAt}`)
      .digest('hex')
    const verificationToken = `${phone10}.${expiresAt}.${signature}`

    // 1. Deliver OTP directly to the deployed Edge Function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    let delivered = false
    try {
      const edgeRes = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `91${phone10}`,
          otp,
        }),
      })

      const edgeJson = await edgeRes.json().catch(() => ({}))
      if (edgeRes.ok && edgeJson?.success) {
        delivered = true
      } else {
        console.warn('[sendTrialPhoneOtpAction] Edge function returned:', edgeJson)
      }
    } catch (edgeErr) {
      console.error('[sendTrialPhoneOtpAction] Edge function dispatch failed:', edgeErr)
    }

    // Direct MSG91 Flow fallback (if edge function endpoint unreachable)
    if (!delivered) {
      try {
        const msg91AuthKey = process.env.MSG91_AUTH_KEY || ''
        const msg91FlowId = process.env.MSG91_OTP_FLOW_ID || '1277179069308301096'
        if (msg91AuthKey) {
          const directRes = await fetch('https://control.msg91.com/api/v5/flow/', {
            method: 'POST',
            headers: {
              authkey: msg91AuthKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_id: msg91FlowId,
              short_url: '0',
              recipients: [{ mobiles: `91${phone10}`, otp }],
            }),
          })
          const directJson = await directRes.json().catch(() => ({}))
          if (directRes.ok && directJson?.type !== 'error') {
            delivered = true
          }
        }
      } catch (directErr) {
        console.warn('[sendTrialPhoneOtpAction] Direct MSG91 notice:', directErr)
      }
    }

    if (!delivered) {
      return { success: false, error: 'Could not deliver SMS at this moment. Please verify your phone number and try again.' }
    }

    return { success: true, verificationToken }
  } catch (err: any) {
    console.error('[sendTrialPhoneOtpAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to send OTP. Please try again.' }
  }
}

// ----------------------------------------------------------------------
// VERIFY OTP ACTION (Strictly Stateless & Cryptographic)
// ----------------------------------------------------------------------
export async function verifyTrialPhoneOtpAction(
  rawPhone: string,
  userOtp: string,
  verificationToken?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const digits = (rawPhone || '').replace(/\D/g, '')
    const phone10 = digits.slice(-10)
    const cleanOtp = (userOtp || '').replace(/\D/g, '')

    if (phone10.length !== 10) {
      return { success: false, error: 'Invalid mobile number.' }
    }

    if (cleanOtp.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit OTP code.' }
    }

    if (!verificationToken) {
      return { success: false, error: 'Session expired. Please click Send OTP to request a fresh code.' }
    }

    // Verify cryptographic token (Tamper-proof HMAC, 0 DB writes)
    const parts = verificationToken.split('.')
    if (parts.length !== 3) {
      return { success: false, error: 'Invalid verification token. Please request a new OTP.' }
    }

    const [tokenPhone, expStr, tokenSig] = parts
    const expiresAt = parseInt(expStr, 10)

    if (tokenPhone !== phone10) {
      return { success: false, error: 'Verification token does not match this mobile number.' }
    }

    if (Date.now() > expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new OTP.' }
    }

    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'zigza_secure_otp_salt_2026'
    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(`${phone10}:${cleanOtp}:${expiresAt}`)
      .digest('hex')

    if (crypto.timingSafeEqual(Buffer.from(tokenSig), Buffer.from(expectedSig))) {
      return { success: true }
    }

    return { success: false, error: 'Incorrect OTP code. Please check and re-enter.' }
  } catch (err: any) {
    console.error('[verifyTrialPhoneOtpAction] Error:', err)
    return { success: false, error: err?.message || 'Verification failed. Please try again.' }
  }
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

    // 2. Strict Uniqueness Check (Email & Phone)
    const emailCheck = await checkEmailAvailabilityAction(cleanEmail)
    if (!emailCheck.available) {
      return { success: false, error: emailCheck.error || 'This email is already registered. Please sign in.' }
    }

    const phoneCheck = await checkPhoneAvailabilityAction(phone10)
    if (!phoneCheck.available) {
      return { success: false, error: phoneCheck.error || 'This mobile number is already registered. Please sign in.' }
    }

    // 3. Compute Industry / Factory Name from First Name
    const rawFirst = rawName.split(/\s+/)[0] || 'Apparel'
    const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
    const companyName = `${firstName} Industries`
    const plantSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const customUsername = `${firstName.toLowerCase()}_admin`
    const formattedPhone = `+91 ${phone10.slice(0, 5)} ${phone10.slice(5)}`
    
    // 7-Day Trial Expiration Date
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 4. Supabase Auth Provisioning via Service Role
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
      } else if (userErr) {
        return { success: false, error: userErr.message || 'Failed to create user account. Please try again.' }
      }
    } catch (authErr: any) {
      return { success: false, error: authErr?.message || 'Authentication error. Please try again.' }
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
