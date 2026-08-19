'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createArticle(formData: FormData) {
  const supabase = await createClient()
  
  const art_no = formData.get('art_no') as string
  const description = formData.get('description') as string
  const stitching_rate_str = formData.get('stitching_rate') as string
  
  const stitching_rate = parseFloat(stitching_rate_str)

  if (!art_no || isNaN(stitching_rate)) {
    return { error: 'Article Number and valid Stitching Rate are required' }
  }

  const { error } = await supabase.from('articles').insert({
    art_no: art_no.trim().toUpperCase(),
    description: description.trim(),
    stitching_rate: stitching_rate,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/articles')
  return { success: true }
}

export async function updateArticleRate(articleId: string, oldRate: number, newRate: number) {
  const supabase = await createClient()

  // 1. Update the article's current rate
  const { error: updateError } = await supabase
    .from('articles')
    .update({ stitching_rate: newRate })
    .eq('id', articleId)

  if (updateError) {
    return { error: updateError.message }
  }

  // 2. Log this in rate_history
  const { error: historyError } = await supabase
    .from('rate_history')
    .insert({
      article_id: articleId,
      old_rate: oldRate,
      new_rate: newRate,
    })

  if (historyError) {
    // Note: We might want a transaction for this in production, but for now this is fine.
    console.error('Failed to log rate history:', historyError)
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
