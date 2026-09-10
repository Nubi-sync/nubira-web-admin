'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

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
export async function getBrands(): Promise<BrandRecord[]> {
  try {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('brand_name', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as BrandRecord[]
  } catch (err) {
    console.error('Error fetching brands:', err)
    return []
  }
}

// ----------------------------------------------------------------------
// GET ALL VENDORS
// ----------------------------------------------------------------------
export async function getVendors(): Promise<VendorRecord[]> {
  try {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('vendor_name', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as VendorRecord[]
  } catch (err) {
    console.error('Error fetching vendors:', err)
    return []
  }
}

// ----------------------------------------------------------------------
// CREATE VENDOR
// ----------------------------------------------------------------------
export async function createVendor(formData: FormData) {
  const supabase = supabaseAdmin

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
    const prefix = brand_name.slice(0, 2)
    const rand = Math.floor(100 + Math.random() * 900)
    vendor_code = `${prefix}-VND-${rand}`
  }

  // If brand_id not supplied, look up by brand_name
  if (!brand_id && brand_name) {
    try {
      const { data: bData } = await supabase
        .from('brands')
        .select('id')
        .eq('brand_name', brand_name)
        .limit(1)
        .maybeSingle()
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

  revalidatePath('/vendors')
  revalidatePath('/production-orders')
  revalidatePath('/dispatch')
  return { success: true, data }
}

// ----------------------------------------------------------------------
// UPDATE VENDOR
// ----------------------------------------------------------------------
export async function updateVendor(vendorId: string, payload: Partial<VendorRecord>) {
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

  revalidatePath('/vendors')
  revalidatePath('/production-orders')
  revalidatePath('/dispatch')
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

  revalidatePath('/vendors')
  return { success: true }
}

// ----------------------------------------------------------------------
// CREATE BRAND
// ----------------------------------------------------------------------
export async function createBrand(brandName: string, brandCode: string, contactPerson?: string, city?: string) {
  const supabase = supabaseAdmin

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
      contact_person: contactPerson || 'Buyer Office',
      city: city || 'Kolkata',
      is_active: true
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/vendors')
  revalidatePath('/production-orders')
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

  revalidatePath('/vendors')
  revalidatePath('/production-orders')
  return { success: true }
}
