'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { resolveUserTenant } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

export async function updateCompanySettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const tenant = await resolveUserTenant(user)

  const companyName = (formData.get('company_name') as string)?.trim() || tenant.companyName || 'Company Profile'
  const factoryAddress = (formData.get('factory_address') as string)?.trim() || ''
  const gstin = (formData.get('gstin') as string)?.trim() || ''
  const contactPhone = (formData.get('contact_phone') as string)?.trim() || ''
  const contactEmail = (formData.get('contact_email') as string)?.trim() || ''

  try {
    // Find existing company_profile id for this tenant
    const { data: existing } = await supabaseAdmin
      .from('company_profile')
      .select('id')
      .ilike('company_name', tenant.companyName)
      .limit(1)
      .maybeSingle()

    const isNubira = !tenant.companyName || tenant.companyName.toLowerCase().includes('nubira')
    const targetId = existing?.id || (isNubira ? 'default' : crypto.randomUUID())

    const updatePayload: Record<string, any> = {
      id: targetId,
      company_name: companyName,
      factory_address: factoryAddress,
      gstin: gstin,
      updated_at: new Date().toISOString(),
    }
    if (contactPhone) updatePayload.contact_phone = contactPhone
    if (contactEmail) updatePayload.contact_email = contactEmail

    const { error } = await supabaseAdmin
      .from('company_profile')
      .upsert(updatePayload)

    if (error) {
      throw error
    }

    // Sync phone to platform_tenant_factories if matching tenant exists
    try {
      await supabaseAdmin
        .from('platform_tenant_factories')
        .update({
          phone: contactPhone || undefined,
        })
        .ilike('admin_email', user.email || '')
    } catch (_) {}

    revalidatePath('/modules/profile')
    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating company settings:', error)
    return { success: false, error: error.message || 'Failed to update company settings' }
  }
}

export async function updateAdminContact(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const tenant = await resolveUserTenant(user)

  const adminDisplayName = (formData.get('admin_display_name') as string)?.trim() || 'Admin'
  const adminPhone = (formData.get('admin_phone') as string)?.trim() || ''

  try {
    const { data: existing } = await supabaseAdmin
      .from('company_profile')
      .select('id')
      .ilike('company_name', tenant.companyName)
      .limit(1)
      .maybeSingle()

    const isNubira = !tenant.companyName || tenant.companyName.toLowerCase().includes('nubira')
    const targetId = existing?.id || (isNubira ? 'default' : crypto.randomUUID())

    const { error } = await supabaseAdmin
      .from('company_profile')
      .upsert({
        id: targetId,
        admin_display_name: adminDisplayName,
        admin_phone: adminPhone,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

    // Sync admin username to profiles and admin_name to platform_tenant_factories
    try {
      await supabaseAdmin
        .from('profiles')
        .update({ username: adminDisplayName })
        .eq('id', user.id)

      await supabaseAdmin
        .from('platform_tenant_factories')
        .update({
          admin_name: adminDisplayName,
          phone: adminPhone || undefined,
        })
        .ilike('admin_email', user.email || '')
    } catch (_) {}

    revalidatePath('/modules/profile')
    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating admin contact:', error)
    return { success: false, error: error.message || 'Failed to update admin contact' }
  }
}

export async function requestAccountDeletion(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const companyName = (formData.get('company_name') as string)?.trim() || 'Nubira Creation'
  const adminName = (formData.get('admin_name') as string)?.trim() || 'Admin'
  const email = (formData.get('email') as string)?.trim() || user.email || ''
  const phone = (formData.get('phone') as string)?.trim() || ''
  const reason = (formData.get('reason') as string)?.trim() || 'Admin requested deletion from web profile'

  try {
    // 1. Log in database
    const { error } = await supabase
      .from('account_deletion_requests')
      .insert({
        company_name: companyName,
        admin_name: adminName,
        email: email,
        phone: phone,
        reason: reason,
        status: 'PENDING',
      })

    if (error) {
      console.warn('account_deletion_requests table insert note:', error)
    }

    // 2. Build email notification format
    const targetEmail = process.env.PLATFORM_SUPPORT_EMAIL || 'support@zigza.in'
    const emailSubject = `[URGENT] Account Deletion Request - ${companyName} (${adminName})`
    const emailBody = `Account Deletion Request Details:
------------------------------------------
Company Name: ${companyName}
Admin Username: ${adminName}
Admin Auth Email: ${email}
Contact Phone: ${phone || 'Not provided'}
Reason for Deletion: ${reason}
Request Timestamp: ${new Date().toLocaleString()}
------------------------------------------
Please decommission and erase this tenant account per customer request.`

    revalidatePath('/profile')

    return {
      success: true,
      targetEmail,
      emailSubject,
      emailBody,
    }
  } catch (error: any) {
    console.error('Error submitting account deletion request:', error)
    return { success: false, error: error.message || 'Failed to submit deletion request' }
  }
}

export async function updateStaffPassword(newPassword: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized session' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error updating staff password:', err)
    return { success: false, error: err.message || 'Failed to update password' }
  }
}

