'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addStoreTransaction(formData: FormData) {
  const supabase = await createClient()

  const articleId = formData.get('article_id') as string
  const type = formData.get('type') as 'INWARD' | 'OUTWARD'
  const quantity = parseInt(formData.get('quantity') as string)
  const color = (formData.get('color') as string)?.trim() || null
  const size = (formData.get('size') as string)?.trim() || null
  const partyName = (formData.get('party_name') as string)?.trim() || null
  const challanNo = (formData.get('challan_no') as string)?.trim() || null
  const transportNo = (formData.get('transport_no') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!articleId || !quantity || quantity <= 0) {
    throw new Error('Please provide a valid article and positive quantity.')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('store_transactions').insert({
    article_id: articleId,
    type,
    quantity,
    color,
    size,
    party_name: partyName,
    challan_no: challanNo,
    transport_no: transportNo,
    notes,
    entry_date: todayStr,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inventory')
  revalidatePath('/reports')
  revalidatePath('/')
}

export async function addAccessoryTransaction(formData: FormData) {
  const supabase = await createClient()

  const itemName = (formData.get('item_name') as string)?.trim()
  const action = formData.get('action') as 'IN' | 'OUT'
  const quantity = parseInt(formData.get('quantity') as string)
  const unit = (formData.get('unit') as string)?.trim() || 'pcs'
  const partyName = (formData.get('party_name') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!itemName || !quantity || quantity <= 0) {
    throw new Error('Please provide an item name and positive quantity.')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('accessories').insert({
    item_name: itemName,
    action,
    quantity,
    unit,
    party_name: partyName,
    notes,
    entry_date: todayStr,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inventory')
  revalidatePath('/reports')
}

export async function approveQcForStoreInward(allotmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = user?.email || 'Admin'

  const { error } = await supabase
    .from('allotments')
    .update({
      qc_status: 'APPROVED_FOR_STORE',
      admin_approved_at: new Date().toISOString(),
      admin_approved_by: adminEmail,
    })
    .eq('id', allotmentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inventory')
  revalidatePath('/dispatch')
  revalidatePath('/production-orders')
  revalidatePath('/')
}

export async function deleteTruckInward(truckInwardId: string) {
  try {
    const supabase = supabaseAdmin
    await supabase.from('truck_inward_items').delete().eq('truck_inward_id', truckInwardId)
    const { error } = await supabase.from('truck_inwards').delete().eq('id', truckInwardId)
    if (error) {
      console.error('Failed to delete truck inward:', error)
      return { error: error.message }
    }
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteTruckInward:', err)
    return { error: err?.message || 'Failed to delete GRN record' }
  }
}

export async function deleteStoreTransaction(transactionId: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('store_transactions').delete().eq('id', transactionId)
    if (error) {
      console.error('Failed to delete store transaction:', error)
      return { error: error.message }
    }
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteStoreTransaction:', err)
    return { error: err?.message || 'Failed to delete store transaction' }
  }
}

export async function deleteAccessory(accessoryId: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('accessories').delete().eq('id', accessoryId)
    if (error) {
      console.error('Failed to delete accessory entry:', error)
      return { error: error.message }
    }
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteAccessory:', err)
    return { error: err?.message || 'Failed to delete accessory entry' }
  }
}

export async function deleteAccessoryByName(itemName: string) {
  try {
    const supabase = supabaseAdmin
    const { error } = await supabase.from('accessories').delete().eq('item_name', itemName)
    if (error) {
      console.error('Failed to delete accessory trim:', error)
      return { error: error.message }
    }
    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    revalidatePath('/reports')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteAccessoryByName:', err)
    return { error: err?.message || 'Failed to delete accessory trim' }
  }
}