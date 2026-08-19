'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createAllotment(formData: FormData) {
  const supabase = await createClient()
  
  const lineman_id = formData.get('lineman_id') as string
  const article_id = formData.get('article_id') as string
  const target_qty_str = formData.get('target_qty') as string
  
  const target_qty = parseInt(target_qty_str, 10)

  if (!lineman_id || !article_id || isNaN(target_qty) || target_qty <= 0) {
    return { error: 'Please select a Lineman, an Article, and enter a valid quantity.' }
  }

  const { error } = await supabase.from('allotments').insert({
    lineman_id,
    article_id,
    target_qty,
    status: 'IN_PROGRESS',
    allotment_date: new Date().toISOString().split('T')[0] // current date YYYY-MM-DD
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/allotments')
  return { success: true }
}

export async function updateAllotmentStatus(allotmentId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('allotments')
    .update({ status: newStatus })
    .eq('id', allotmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/allotments')
  return { success: true }
}
