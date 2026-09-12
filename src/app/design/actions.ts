'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { 
  TechPack, 
  SampleApproval, 
  GradingScheme, 
  MaterialItem,
  GarmentCategory,
  SizeSystem,
  EmbellishmentSequence,
  SeamClass,
  TechPackStatus,
  SampleStage,
  SampleApprovalStatus,
  PointOfMeasure
} from './types/design'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper: Map uppercase DB category to UI display category
function mapCategoryToUI(cat: string): GarmentCategory {
  const norm = (cat || '').toUpperCase()
  if (norm.includes('HOODIE')) return 'Hoodie'
  if (norm.includes('TSHIRT') || norm.includes('T-SHIRT') || norm.includes('TEE')) return 'T-Shirt'
  if (norm.includes('POLO')) return 'Polo'
  if (norm.includes('JOGGER')) return 'Jogger'
  if (norm.includes('JACKET')) return 'Jacket'
  if (norm.includes('ROMPER')) return 'Kids Romper'
  return 'Hoodie'
}

// -----------------------------------------------------------------------------
// 1. TECH PACKS
// -----------------------------------------------------------------------------

export async function fetchTechPacksAction(): Promise<TechPack[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_tech_packs')
      .select('*, brands(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchTechPacksAction] Supabase error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      style_number: row.style_number,
      style_name: `${row.category} Style ${row.style_number}`,
      brand_name: row.brands?.brand_name || 'Inhouse',
      category: mapCategoryToUI(row.category),
      size_system: (row.size_system as SizeSystem) || 'ALPHA_ADULT',
      base_size: row.base_size || 'M',
      fabric_composition: row.fabric_composition || '100% Cotton',
      target_gsm: Number(row.target_gsm) || 300,
      embellishment_sequence: (row.embellishment_sequence as EmbellishmentSequence) || 'NONE',
      cad_front_url: row.cad_front_url || undefined,
      cad_back_url: row.cad_back_url || undefined,
      spi: Number(row.spi) || 12,
      seam_class: (row.seam_class as SeamClass) || 'ISO 4915 Class 401 (Chainstitch)',
      status: (row.status as TechPackStatus) || 'DRAFT',
      target_cut_date: new Date(new Date(row.created_at).getTime() + 14 * 86400000).toISOString().split('T')[0],
      version: Number(row.version) || 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
  } catch (err) {
    console.error('[fetchTechPacksAction] Unexpected error:', err)
    return []
  }
}

export async function createTechPackAction(payload: {
  style_number: string
  style_name?: string
  brand_id?: string
  brand_name?: string
  category: string
  size_system: SizeSystem
  base_size: string
  fabric_composition: string
  target_gsm: number
  embellishment_sequence: EmbellishmentSequence
  spi: number
  seam_class: SeamClass
  cad_front_url?: string
  cad_back_url?: string
}): Promise<{ success: boolean; data?: TechPack; error?: string }> {
  try {
    // 1. Resolve Brand
    let brandId = payload.brand_id
    if (!brandId) {
      const { data: brand } = await supabaseAdmin
        .from('brands')
        .select('id')
        .limit(1)
        .single()
      brandId = brand?.id
    }

    if (!brandId) {
      return { success: false, error: 'No active brand found in database.' }
    }

    const categoryDB = payload.category.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '')

    const { data, error } = await supabaseAdmin
      .from('design_tech_packs')
      .insert({
        style_number: payload.style_number.trim(),
        brand_id: brandId,
        category: categoryDB,
        size_system: payload.size_system,
        base_size: payload.base_size,
        fabric_composition: payload.fabric_composition.trim(),
        target_gsm: Number(payload.target_gsm),
        embellishment_sequence: payload.embellishment_sequence,
        spi: Number(payload.spi),
        seam_class: payload.seam_class,
        cad_front_url: payload.cad_front_url || null,
        cad_back_url: payload.cad_back_url || null,
        status: 'DRAFT',
        version: 1
      })
      .select('*, brands(*)')
      .single()

    if (error) {
      console.error('[createTechPackAction] DB Insert Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/tech-packs')

    const createdPack: TechPack = {
      id: data.id,
      style_number: data.style_number,
      style_name: `${data.category} Style ${data.style_number}`,
      brand_name: data.brands?.brand_name || payload.brand_name || 'Inhouse',
      category: mapCategoryToUI(data.category),
      size_system: data.size_system as SizeSystem,
      base_size: data.base_size,
      fabric_composition: data.fabric_composition,
      target_gsm: Number(data.target_gsm),
      embellishment_sequence: data.embellishment_sequence as EmbellishmentSequence,
      spi: Number(data.spi),
      seam_class: data.seam_class as SeamClass,
      status: data.status as TechPackStatus,
      target_cut_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      version: data.version,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return { success: true, data: createdPack }
  } catch (err: any) {
    console.error('[createTechPackAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Server error creating tech pack.' }
  }
}

// -----------------------------------------------------------------------------
// 2. SAMPLE APPROVALS
// -----------------------------------------------------------------------------

export async function fetchSampleApprovalsAction(): Promise<SampleApproval[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_sample_audits')
      .select('*, design_tech_packs(style_number, category, brands(brand_name))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchSampleApprovalsAction] Supabase error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      tech_pack_id: row.tech_pack_id,
      style_number: row.design_tech_packs?.style_number || 'UNKNOWN',
      style_name: `${row.design_tech_packs?.category || ''} Style ${row.design_tech_packs?.style_number || ''}`,
      brand_name: row.design_tech_packs?.brands?.brand_name || 'Inhouse',
      sample_stage: (row.sample_stage as SampleStage) || 'PPS',
      measured_chest: Number(row.measured_chest) || 0,
      target_chest: 53.0,
      measured_length: Number(row.measured_length) || 0,
      target_length: 72.0,
      measured_sleeve: Number(row.measured_sleeve) || 0,
      target_sleeve: 87.0,
      variance_status: row.within_tolerance ? 'WITHIN_TOLERANCE' : 'OUT_OF_TOLERANCE',
      fit_comments: row.fit_comments || '',
      buyer_reviewer_email: row.buyer_reviewer_email || row.buyer_reviewer_name || 'reviewer@brand.com',
      approval_status: (row.verdict as SampleApprovalStatus) || 'APPROVED',
      submitted_date: row.created_at,
      audit_date: row.approved_at || row.created_at
    }))
  } catch (err) {
    console.error('[fetchSampleApprovalsAction] Unexpected error:', err)
    return []
  }
}

export async function createSampleApprovalAction(payload: {
  tech_pack_id: string
  sample_stage: string
  measured_chest: number
  measured_length: number
  measured_sleeve: number
  measured_neck?: number
  variance_max_cm: number
  within_tolerance: boolean
  fit_comments: string
  buyer_reviewer_name: string
  buyer_reviewer_email?: string
  verdict: 'APPROVED' | 'REVISE_FIT' | 'REJECTED'
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_sample_audits')
      .insert({
        tech_pack_id: payload.tech_pack_id,
        sample_stage: payload.sample_stage,
        measured_chest: payload.measured_chest,
        measured_length: payload.measured_length,
        measured_sleeve: payload.measured_sleeve,
        measured_neck: payload.measured_neck || null,
        variance_max_cm: payload.variance_max_cm,
        within_tolerance: payload.within_tolerance,
        fit_comments: payload.fit_comments,
        buyer_reviewer_name: payload.buyer_reviewer_name,
        buyer_reviewer_email: payload.buyer_reviewer_email || null,
        verdict: payload.verdict,
        approved_at: payload.verdict === 'APPROVED' ? new Date().toISOString() : null
      })
      .select('*, design_tech_packs(style_number, category, brands(brand_name))')
      .single()

    if (error) {
      console.error('[createSampleApprovalAction] DB Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/sample-approvals')
    revalidatePath('/design/tech-packs')

    return { success: true, data }
  } catch (err: any) {
    console.error('[createSampleApprovalAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to submit sample audit.' }
  }
}

// -----------------------------------------------------------------------------
// 3. GRADING MATRIX
// -----------------------------------------------------------------------------

export async function fetchGradingSchemesAction(): Promise<GradingScheme[]> {
  try {
    const { data: techPacks, error } = await supabaseAdmin
      .from('design_tech_packs')
      .select(`
        id,
        style_number,
        category,
        size_system,
        base_size,
        design_poms (
          id,
          pom_code,
          pom_name,
          tolerance_cm,
          sort_order,
          design_measurement_values (
            id,
            size_label,
            value_cm,
            grade_step_cm,
            is_base_size
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchGradingSchemesAction] DB error:', error)
      return []
    }

    if (!techPacks || techPacks.length === 0) return []

    return techPacks.map((tp: any) => {
      const pomsList: PointOfMeasure[] = (tp.design_poms || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((p: any) => {
          const sizesMap: Record<string, number> = {}
          let baseVal = 0
          let gradeStep = 0

          ;(p.design_measurement_values || []).forEach((v: any) => {
            sizesMap[v.size_label] = Number(v.value_cm)
            if (v.is_base_size) {
              baseVal = Number(v.value_cm)
            }
            if (v.grade_step_cm !== 0) {
              gradeStep = Math.abs(Number(v.grade_step_cm))
            }
          })

          return {
            pom_code: p.pom_code,
            pom_name: p.pom_name,
            tolerance_cm: Number(p.tolerance_cm) || 0.5,
            grade_step_cm: gradeStep || 2.5,
            base_value_cm: baseVal || 50.0,
            sizes: sizesMap
          }
        })

      // Collect all unique sizes across POMs
      const sizesSet = new Set<string>()
      pomsList.forEach(p => {
        Object.keys(p.sizes).forEach(s => sizesSet.add(s))
      })

      const sizesArray = Array.from(sizesSet)
      if (sizesArray.length === 0) {
        sizesArray.push('XS', 'S', 'M', 'L', 'XL', '2XL')
      }

      return {
        id: tp.id,
        name: `${tp.style_number} (${mapCategoryToUI(tp.category)}) Grading Matrix`,
        category: (tp.size_system as SizeSystem) || 'ALPHA_ADULT',
        base_size: tp.base_size || 'M',
        sizes: sizesArray,
        poms: pomsList
      }
    })
  } catch (err) {
    console.error('[fetchGradingSchemesAction] Unexpected error:', err)
    return []
  }
}

// -----------------------------------------------------------------------------
// 4. MATERIALS LIBRARY
// -----------------------------------------------------------------------------

export async function fetchMaterialsLibraryAction(): Promise<MaterialItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_materials_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchMaterialsLibraryAction] DB error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => {
      const isFabric = (row.material_type || '').includes('FABRIC')
      const isTrim = (row.material_type || '').includes('TRIM') || (row.material_type || '').includes('RIB')

      return {
        id: row.id,
        material_code: row.material_code,
        material_name: row.material_name,
        type: isFabric ? 'FABRIC' : isTrim ? 'TRIM' : 'THREAD',
        construction: row.material_type,
        composition: row.composition,
        weight_gsm: Number(row.nominal_gsm) || undefined,
        shrinkage_length_pct: Number(row.length_shrinkage_pct) || 0,
        shrinkage_width_pct: Number(row.width_shrinkage_pct) || 0,
        spirality_pct: Number(row.spirality_pct) || 0,
        recommended_needle: row.recommended_needle || 'Ball Point 75/11',
        supplier_mill: 'Direct Mill / Inhouse Certified',
        lead_time_days: 7,
        status: row.is_active ? 'CERTIFIED' : 'DEPRECATED'
      }
    })
  } catch (err) {
    console.error('[fetchMaterialsLibraryAction] Unexpected error:', err)
    return []
  }
}

export async function createMaterialAction(payload: {
  material_code: string
  material_name: string
  material_type: 'KNIT_FABRIC' | 'WOVEN_FABRIC' | 'RIB_TRIM' | 'SEWING_THREAD'
  composition: string
  nominal_gsm: number
  usable_width_cm?: number
  length_shrinkage_pct?: number
  width_shrinkage_pct?: number
  spirality_pct?: number
  recommended_needle?: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_materials_library')
      .insert({
        material_code: payload.material_code.trim().toUpperCase(),
        material_name: payload.material_name.trim(),
        material_type: payload.material_type,
        composition: payload.composition.trim(),
        nominal_gsm: Number(payload.nominal_gsm),
        usable_width_cm: payload.usable_width_cm || 180.0,
        length_shrinkage_pct: payload.length_shrinkage_pct || 3.0,
        width_shrinkage_pct: payload.width_shrinkage_pct || 2.0,
        spirality_pct: payload.spirality_pct || 1.0,
        recommended_needle: payload.recommended_needle || 'Ball Point 75/11',
        is_active: true
      })
      .select('*')
      .single()

    if (error) {
      console.error('[createMaterialAction] DB Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/materials-library')

    return { success: true, data }
  } catch (err: any) {
    console.error('[createMaterialAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to create material.' }
  }
}

// -----------------------------------------------------------------------------
// 5. BRANDS LIST
// -----------------------------------------------------------------------------

export async function fetchBrandsAction(): Promise<{ id: string; brand_name: string; brand_code: string }[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('id, brand_name, brand_code')
      .eq('is_active', true)
      .order('brand_name')

    if (error) {
      console.error('[fetchBrandsAction] DB error:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[fetchBrandsAction] Unexpected error:', err)
    return []
  }
}
