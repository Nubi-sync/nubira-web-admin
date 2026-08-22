'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDeliveryChallan(formData: FormData) {
  const supabase = await createClient()

  const challanNo = (formData.get('challan_no') as string)?.trim() || `CH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
  const buyerName = (formData.get('buyer_name') as string)?.trim()
  const destination = (formData.get('destination') as string)?.trim() || null
  const vehicleNo = (formData.get('vehicle_no') as string)?.trim() || null
  const driverName = (formData.get('driver_name') as string)?.trim() || null
  const driverPhone = (formData.get('driver_phone') as string)?.trim() || null
  const itemsJson = formData.get('items_json') as string

  if (!buyerName || !itemsJson) {
    throw new Error('Please provide buyer name and at least one item.')
  }

  const items: Array<{
    article_id: string
    color?: string
    size?: string
    quantity: number
  }> = JSON.parse(itemsJson)

  if (items.length === 0) {
    throw new Error('Please add at least one article item.')
  }

  const totalPieces = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Insert Delivery Challan
  const { data: challanData, error: challanError } = await supabase
    .from('delivery_challans')
    .insert({
      challan_no: challanNo,
      buyer_name: buyerName,
      destination,
      vehicle_no: vehicleNo,
      driver_name: driverName,
      driver_phone: driverPhone,
      total_pieces: totalPieces,
      delivery_date: todayStr,
      status: 'DISPATCHED',
    })
    .select()
    .single()

  if (challanError) {
    throw new Error(challanError.message)
  }

  const challanId = challanData.id

  // 2. Insert Challan Items & Store Outward entries
  for (const item of items) {
    if (item.quantity > 0) {
      await supabase.from('challan_items').insert({
        challan_id: challanId,
        article_id: item.article_id,
        color: item.color || null,
        size: item.size || null,
        quantity: item.quantity,
      })

      await supabase.from('store_transactions').insert({
        article_id: item.article_id,
        type: 'OUTWARD',
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
        party_name: buyerName,
        challan_no: challanNo,
        transport_no: vehicleNo,
        entry_date: todayStr,
      })
    }
  }

  revalidatePath('/dispatch')
  revalidatePath('/inventory')
  revalidatePath('/reports')
  revalidatePath('/')
}

export async function recordCountingAudit(formData: FormData) {
  const supabase = await createClient()

  const articleId = formData.get('article_id') as string
  const color = (formData.get('color') as string)?.trim() || null
  const size = (formData.get('size') as string)?.trim() || null
  const countedQty = parseInt(formData.get('counted_qty') as string)
  const expectedQty = parseInt((formData.get('expected_qty') as string) || '0')
  const remarks = (formData.get('remarks') as string)?.trim() || null

  if (!articleId || !countedQty || countedQty <= 0) {
    throw new Error('Please select article and enter valid counted quantity.')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('counting_reports').insert({
    article_id: articleId,
    color,
    size,
    counted_qty: countedQty,
    expected_qty: expectedQty,
    remarks,
    entry_date: todayStr,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dispatch')
  revalidatePath('/reports')
}