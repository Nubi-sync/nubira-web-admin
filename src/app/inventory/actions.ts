'use server'

import { createClient } from '@/utils/supabase/server'
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