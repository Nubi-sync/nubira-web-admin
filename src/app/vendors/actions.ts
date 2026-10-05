'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { CacheManager } from '@/lib/cache/cache-manager'

export type BrandRecord = {
  id: string
  brand_code: string
  brand_name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  city?: string | null
  address?: string | null
  gstin?: string | null
  is_active: boolean
  created_at: string
}

export type VendorRecord = {
  id: string
  vendor_code: string
  vendor_name: string
  brand_id?: string | null
  brand_name: string
  vendor_type: 'STITCHING_JOB_WORK' | 'FABRIC_SUPPLIER' | 'TRIMS_ACCESSORIES' | 'PRINTING_EMBROIDERY' | 'WASHING_FINISHING'
  contact_person?: string | null
  phone?: string | null
  city?: string | null
  address?: string | null
  gst_no?: string | null
  stitching_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------------
// GET ALL BRANDS
// ----------------------------------------------------------------------
export async function getBrands(companyName?: string): Promise<BrandRecord[]> {
  let targetCompany = (companyName || '').trim()
  if (!targetCompany) {
    try {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const tenant = await resolveUserTenant(user)
        targetCompany = (tenant.companyName || '').trim()
      }
    } catch (_) {}
  }

  const normComp = (targetCompany || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  return CacheManager.fetchOrSet<BrandRecord[]>(
    `company:${normComp}:brands`,
    async () => {
      try {
        const supabase = supabaseAdmin
        let query = supabase
          .from('brands')
          .select('*')
          .order('brand_name', { ascending: true })

        if (targetCompany) {
          query = query.ilike('company_name', targetCompany)
        }

        const { data, error } = await query

        if (error || !data) {
          return []
        }

        return data as BrandRecord[]
      } catch (err) {
        console.error('Error fetching brands:', err)
        return []
      }
    },
    300,
    [`company:${normComp}:brands`, 'brands']
  )
}

// ----------------------------------------------------------------------
// GET ALL VENDORS
// ----------------------------------------------------------------------
export async function getVendors(companyName?: string): Promise<VendorRecord[]> {
  let targetCompany = (companyName || '').trim()
  if (!targetCompany) {
    try {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const tenant = await resolveUserTenant(user)
        targetCompany = (tenant.companyName || '').trim()
      }
    } catch (_) {}
  }

  const normComp = (targetCompany || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  return CacheManager.fetchOrSet<VendorRecord[]>(
    `company:${normComp}:vendors`,
    async () => {
      try {
        const supabase = supabaseAdmin
        let query = supabase
          .from('vendors')
          .select('*')
          .order('vendor_name', { ascending: true })

        if (targetCompany) {
          query = query.or(`tenant_company.ilike.${targetCompany},brand_name.ilike.${targetCompany}`)
        }

        const { data, error } = await query

        if (error || !data) {
          return []
        }

        return data as VendorRecord[]
      } catch (err) {
        console.error('Error fetching vendors:', err)
        return []
      }
    },
    300,
    [`company:${normComp}:vendors`, 'vendors']
  )
}

// ----------------------------------------------------------------------
// CREATE VENDOR
// ----------------------------------------------------------------------
export async function createVendor(formData: FormData) {
  const supabase = supabaseAdmin

  let tenantCompany = (formData.get('tenant_company') as string)?.trim() || (formData.get('company_name') as string)?.trim() || ''
  if (!tenantCompany) {
    try {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const tenant = await resolveUserTenant(user)
        tenantCompany = (tenant.companyName || '').trim()
      }
    } catch (_) {}
  }

  const vendor_name = (formData.get('vendor_name') as string)?.trim()
  const brand_name = (formData.get('brand_name') as string)?.trim().toUpperCase() || ''
  let brand_id = (formData.get('brand_id') as string)?.trim() || null
  const vendor_type = (formData.get('vendor_type') as any) || 'STITCHING_JOB_WORK'
  const contact_person = (formData.get('contact_person') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || 'Kolkata'
  const address = (formData.get('address') as string)?.trim() || null
  const gst_no = (formData.get('gst_no') as string)?.trim() || null
  const stitching_rate_str = formData.get('stitching_rate') as string
  const stitching_rate = stitching_rate_str ? parseFloat(stitching_rate_str) : 20.00

  if (!vendor_name) {
    return { error: 'Please enter a valid Vendor / Unit Name.' }
  }

  // Generate unique vendor code if not given
  let vendor_code = (formData.get('vendor_code') as string)?.trim().toUpperCase()
  if (!vendor_code) {
    const prefix = brand_name ? brand_name.slice(0, 2) : 'VN'
    const rand = Math.floor(100 + Math.random() * 900)
    vendor_code = `${prefix}-VND-${rand}`
  }

  // If brand_id not supplied, look up by brand_name
  if (!brand_id && brand_name) {
    try {
      let bQuery = supabase
        .from('brands')
        .select('id')
        .eq('brand_name', brand_name)
      if (tenantCompany) {
        bQuery = bQuery.ilike('company_name', tenantCompany)
      }
      const { data: bData } = await bQuery.limit(1).maybeSingle()
      if (bData) brand_id = bData.id
    } catch (_) {}
  }

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      vendor_code,
      vendor_name,
      brand_id,
      brand_name,
      tenant_company: tenantCompany || null,
      vendor_type,
      contact_person,
      phone,
      city,
      address,
      gst_no,
      stitching_rate: isNaN(stitching_rate) ? 20.00 : stitching_rate,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating vendor:', error)
    return { error: error.message }
  }

  const normComp = (tenantCompany || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  await CacheManager.invalidateTag('vendors')
  await CacheManager.invalidateTag(`company:${normComp}:vendors`)
  await CacheManager.invalidateTag(`company:${normComp}:buyers_vendors_hub:v4`)
  revalidatePath('/vendors')
  revalidatePath('/stitching-sewing/vendors')
  revalidatePath('/buyers-vendors')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
  revalidatePath('/dispatch')
  revalidatePath('/stitching-sewing/dispatch')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true, data }
}

// ----------------------------------------------------------------------
// UPDATE VENDOR
// ----------------------------------------------------------------------
export async function updateVendor(vendorId: string, payload: Partial<VendorRecord> & { tenant_company?: string }) {
  const supabase = supabaseAdmin

  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', vendorId)
    .select()
    .single()

  if (error) {
    console.error('Error updating vendor:', error)
    return { error: error.message }
  }

  await CacheManager.invalidateTag('vendors')
  revalidatePath('/vendors')
  revalidatePath('/stitching-sewing/vendors')
  revalidatePath('/buyers-vendors')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
  revalidatePath('/dispatch')
  revalidatePath('/stitching-sewing/dispatch')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true, data }
}

// ----------------------------------------------------------------------
// TOGGLE VENDOR STATUS
// ----------------------------------------------------------------------
export async function toggleVendorStatus(vendorId: string, currentIsActive: boolean) {
  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('vendors')
    .update({
      is_active: !currentIsActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', vendorId)

  if (error) {
    return { error: error.message }
  }

  await CacheManager.invalidateTag('vendors')
  revalidatePath('/vendors')
  revalidatePath('/stitching-sewing/vendors')
  revalidatePath('/buyers-vendors')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true }
}

// ----------------------------------------------------------------------
// CREATE BRAND
// ----------------------------------------------------------------------
export async function createBrand(brandName: string, brandCode: string, contactPerson?: string, city?: string, companyName?: string) {
  const supabase = supabaseAdmin

  let targetCompany = (companyName || '').trim()
  if (!targetCompany) {
    try {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const tenant = await resolveUserTenant(user)
        targetCompany = (tenant.companyName || '').trim()
      }
    } catch (_) {}
  }

  const cleanName = brandName.trim().toUpperCase()
  const cleanCode = (brandCode || cleanName.slice(0, 3)).trim().toUpperCase()

  if (!cleanName) {
    return { error: 'Please enter a Brand Name.' }
  }

  const { data, error } = await supabase
    .from('brands')
    .insert({
      brand_code: cleanCode,
      brand_name: cleanName,
      company_name: targetCompany || null,
      contact_person: contactPerson || 'Buyer Office',
      city: city || 'Kolkata',
      is_active: true
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  const normComp = (targetCompany || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  await CacheManager.invalidateTag('brands')
  await CacheManager.invalidateTag(`company:${normComp}:brands`)
  await CacheManager.invalidateTag(`company:${normComp}:buyers_vendors_hub:v4`)
  revalidatePath('/vendors')
  revalidatePath('/stitching-sewing/vendors')
  revalidatePath('/buyers-vendors')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true, data }
}

// ----------------------------------------------------------------------
// DELETE VENDOR
// ----------------------------------------------------------------------
export async function deleteVendor(vendorId: string) {
  const supabase = supabaseAdmin

  // Unlink vendor_id from challans, allotments, delivery_challans
  await supabase.from('challans').update({ vendor_id: null }).eq('vendor_id', vendorId)
  await supabase.from('allotments').update({ vendor_id: null }).eq('vendor_id', vendorId)
  await supabase.from('delivery_challans').update({ vendor_id: null }).eq('vendor_id', vendorId)

  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', vendorId)

  if (error) {
    return { error: error.message }
  }

  await CacheManager.invalidateTag('vendors')
  revalidatePath('/vendors')
  revalidatePath('/stitching-sewing/vendors')
  revalidatePath('/production-orders')
  revalidatePath('/stitching-sewing/production-orders')
  revalidatePath('/stitching-sewing/dashboard')
  return { success: true }
}
