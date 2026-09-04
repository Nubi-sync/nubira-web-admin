'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCompanySettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const companyName = (formData.get('company_name') as string)?.trim() || 'Nubira Creation'
  const factoryAddress = (formData.get('factory_address') as string)?.trim() || ''
  const gstin = (formData.get('gstin') as string)?.trim() || ''
  const contactPhone = (formData.get('contact_phone') as string)?.trim() || ''
  const contactEmail = (formData.get('contact_email') as string)?.trim() || ''

  try {
    const { error } = await supabase
      .from('company_profile')
      .upsert({
        id: 'default',
        company_name: companyName,
        factory_address: factoryAddress,
        gstin: gstin,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

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

  const adminDisplayName = (formData.get('admin_display_name') as string)?.trim() || 'Admin'
  const adminPhone = (formData.get('admin_phone') as string)?.trim() || ''

  try {
    const { error } = await supabase
      .from('company_profile')
      .upsert({
        id: 'default',
        admin_display_name: adminDisplayName,
        admin_phone: adminPhone,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

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
    const targetEmail = 'team.anga9@gmail.com'
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
