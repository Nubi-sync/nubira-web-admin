'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createArticle(formData: FormData) {
  const supabase = await createClient()
  
  const art_no = (formData.get('art_no') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string)?.trim() || ''
  const stitching_rate_str = formData.get('stitching_rate') as string
  const size_rates_str = formData.get('size_rates') as string
  
  const stitching_rate = parseFloat(stitching_rate_str)
  let size_rates: Record<string, number> = {}
  if (size_rates_str) {
    try {
      size_rates = JSON.parse(size_rates_str)
    } catch (_) {}
  }

  if (!art_no || isNaN(stitching_rate) || stitching_rate <= 0) {
    return { error: 'Please enter a valid Article Number and Stitching Rate greater than 0.' }
  }

  const insertPayload: any = {
    art_no: art_no,
    description: description,
    stitching_rate: stitching_rate,
    is_active: true,
  }
  if (Object.keys(size_rates).length > 0) {
    insertPayload.size_rates = size_rates
  }

  let { data, error } = await supabase
    .from('articles')
    .insert(insertPayload)
    .select()
    .single()

  // Fallback if size_rates column not in schema yet
  if (error && (error.message?.includes('size_rates') || error.code === '42703')) {
    delete insertPayload.size_rates
    const fallbackRes = await supabase.from('articles').insert(insertPayload).select().single()
    data = fallbackRes.data
    error = fallbackRes.error
  }

  if (error) {
    if (error.code === '23505') {
      return { error: 'Article Number ' + art_no + ' already exists.' }
    }
    return { error: error.message }
  }

  revalidatePath('/articles')
  revalidatePath('/allotments')
  revalidatePath('/inventory')
  return { success: true, data }
}

export async function updateArticleRate(articleId: string, oldRate: number, newRate: number, sizeRates?: Record<string, number>) {
  const supabase = await createClient()

  if (isNaN(newRate) || newRate <= 0) {
    return { error: 'Please enter a valid rate greater than 0.' }
  }

  const updatePayload: any = { stitching_rate: newRate }
  if (sizeRates && Object.keys(sizeRates).length > 0) {
    updatePayload.size_rates = sizeRates
  }

  // 1. Update article current rate
  let { error: updateError } = await supabase
    .from('articles')
    .update(updatePayload)
    .eq('id', articleId)

  if (updateError && (updateError.message?.includes('size_rates') || updateError.code === '42703')) {
    delete updatePayload.size_rates
    const res = await supabase.from('articles').update(updatePayload).eq('id', articleId)
    updateError = res.error
  }

  if (updateError) {
    return { error: updateError.message }
  }

  // 2. Log in rate_history
  const { error: historyError } = await supabase
    .from('rate_history')
    .insert({
      article_id: articleId,
      old_rate: oldRate,
      new_rate: newRate,
    })

  if (historyError) {
    console.error('Failed to log rate history:', historyError)
  }

  revalidatePath('/articles')
  revalidatePath('/allotments')
  return { success: true }
}

export async function toggleArticleArchive(articleId: string, currentIsActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .update({ is_active: !currentIsActive })
    .eq('id', articleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/articles')
  revalidatePath('/allotments')
  return { success: true }
}

export async function bulkArchiveArticles(articleIds: string[]) {
  const supabase = await createClient()

  if (!articleIds || articleIds.length === 0) return { success: true }

  const { error } = await supabase
    .from('articles')
    .update({ is_active: false })
    .in('id', articleIds)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/articles')
  return { success: true }
}

export async function bulkRestoreArticles(articleIds: string[]) {
  const supabase = await createClient()

  if (!articleIds || articleIds.length === 0) return { success: true }

  const { error } = await supabase
    .from('articles')
    .update({ is_active: true })
    .in('id', articleIds)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/articles')
  return { success: true }
}

export async function getRateHistory(articleId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rate_history')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching rate history', error)
    return { error: error.message }
  }

  return { data }
}
