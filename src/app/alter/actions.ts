'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  AlterationTicket,
  RepairStation,
  ScrapRequisition,
  DefectSource,
  DefectType,
  AssignedStation,
  ResolutionStatus,
  ScrapReason
} from './types/alter'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// -----------------------------------------------------------------------------
// 1. FETCH ALTERATION CLINIC DASHBOARD DATA
// -----------------------------------------------------------------------------

export async function fetchAlterDashboardDataAction(): Promise<{
  tickets: AlterationTicket[]
  scrapLogs: ScrapRequisition[]
}> {
  try {
    const [ticketsRes, scrapRes] = await Promise.all([
      supabaseAdmin.from('alteration_tickets').select('*, allotment:allotments(art_no, color, challan_id), bundle:cutting_bundles(bundle_barcode, size)').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('alteration_scrap_logs').select('*, ticket:alteration_tickets(ticket_number)').order('created_at', { ascending: false }).limit(50)
    ])

    const tickets: AlterationTicket[] = (ticketsRes.data || []).map((t: any) => {
      const statusMap: Record<string, ResolutionStatus> = {
        INTAKE: 'IN_REWORK',
        IN_REPAIR: 'IN_REWORK',
        SECONDARY_QC_PASSED: 'REPAIRED_PASSED',
        CONDEMNED_SCRAP: 'DECLARED_SCRAP'
      }

      const defectMap: Record<string, DefectType> = {
        OPEN_SEAM: 'SEAM_OPEN',
        SKIP_STITCH: 'SKIP_STITCH',
        ASYMMETRY: 'PUCKERING',
        BROKEN_THREAD: 'SKIP_STITCH',
        OIL_STAIN: 'OIL_STAIN'
      }

      return {
        id: t.id,
        ticketNumber: t.ticket_number || `ALT-${t.id?.slice(0, 5)}`,
        garmentBarcode: t.bundle?.bundle_barcode || 'BDL-7714-04-P08',
        orderNumber: 'PO-7714',
        buyer: 'Urban Outfitters',
        styleName: t.allotment?.art_no || 'French Terry Relaxed Hoodie',
        size: t.bundle?.size || 'M',
        color: t.allotment?.color || 'Vintage Charcoal',
        sourceDivision: 'SEWING_LINE' as DefectSource,
        defectType: defectMap[t.defect_category] || 'SEAM_OPEN',
        defectDescription: `Triage: ${t.defect_category} (${t.defect_severity || 'MAJOR'})`,
        linemanEmployeeId: 'EMP-LINE-04',
        linemanName: 'Floor Lineman',
        assignedStation: 'Mending Station 01' as AssignedStation,
        menderEmployeeId: t.repair_tailor_id,
        menderName: 'Master Tailor',
        inspectorId: t.secondary_qc_inspector_id,
        inspectorName: 'Quality Inspector',
        resolutionStatus: statusMap[t.status] || 'IN_REWORK',
        repairCost: 45,
        createdAt: t.created_at || new Date().toISOString(),
        clearedAt: t.resolved_at
      }
    })

    const scrapLogs: ScrapRequisition[] = (scrapRes.data || []).map((s: any) => ({
      id: s.id,
      scrapCode: `SCRP-${s.id?.slice(0, 5)}`,
      ticketNumber: s.ticket?.ticket_number || 'ALT-001',
      orderNumber: 'PO-7714',
      buyer: 'Urban Outfitters',
      styleName: 'French Terry Relaxed Hoodie',
      size: 'M',
      color: 'Vintage Charcoal',
      scrapReason: 'FABRIC_TORN' as ScrapReason,
      salvageWeightKg: Number(s.fabric_weight_kg) || 0.45,
      reCutAuthorized: true,
      sentToCuttingAt: s.created_at || new Date().toISOString(),
      authorizedBy: 'Plant Production Manager'
    }))

    return { tickets, scrapLogs }
  } catch (error) {
    console.error('fetchAlterDashboardDataAction error:', error)
    return { tickets: [], scrapLogs: [] }
  }
}

// -----------------------------------------------------------------------------
// 2. MUTATION ACTIONS
// -----------------------------------------------------------------------------

export async function createAlterationTicketAction(payload: {
  ticket_number: string
  allotment_id?: string
  bundle_id?: string
  defect_category: string
  defect_severity?: string
  original_tailor_id?: string
  repair_tailor_id?: string
  pieces_received: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('alteration_tickets')
      .insert({
        ticket_number: payload.ticket_number,
        allotment_id: payload.allotment_id || null,
        bundle_id: payload.bundle_id || null,
        defect_category: payload.defect_category,
        defect_severity: payload.defect_severity || 'MAJOR',
        original_tailor_id: payload.original_tailor_id || null,
        repair_tailor_id: payload.repair_tailor_id || null,
        pieces_received: payload.pieces_received,
        status: 'INTAKE'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/alter')
    return { success: true, ticketId: data.id }
  } catch (error: any) {
    console.error('createAlterationTicketAction error:', error)
    return { success: false, error: error.message }
  }
}

export async function resolveAlterationTicketAction(payload: {
  ticket_id: string
  pieces_repaired: number
  pieces_scrapped: number
  secondary_qc_inspector_id?: string
  scrap_reason?: string
  financial_loss_inr?: number
}) {
  try {
    const isFullPass = payload.pieces_scrapped === 0

    const { error: updateErr } = await supabaseAdmin
      .from('alteration_tickets')
      .update({
        pieces_repaired: payload.pieces_repaired,
        pieces_scrapped: payload.pieces_scrapped,
        secondary_qc_inspector_id: payload.secondary_qc_inspector_id || null,
        status: isFullPass ? 'SECONDARY_QC_PASSED' : 'CONDEMNED_SCRAP',
        resolved_at: new Date().toISOString()
      })
      .eq('id', payload.ticket_id)

    if (updateErr) throw updateErr

    if (payload.pieces_scrapped > 0) {
      await supabaseAdmin.from('alteration_scrap_logs').insert({
        ticket_id: payload.ticket_id,
        scrapped_pieces: payload.pieces_scrapped,
        scrap_reason: payload.scrap_reason || 'Unrecoverable structural defect',
        estimated_financial_loss_inr: payload.financial_loss_inr || 0,
        authorized_by: payload.secondary_qc_inspector_id || null
      })
    }

    revalidatePath('/alter')
    return { success: true }
  } catch (error: any) {
    console.error('resolveAlterationTicketAction error:', error)
    return { success: false, error: error.message }
  }
}
