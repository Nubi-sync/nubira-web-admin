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
  PointOfMeasure,
  DesignTeamMember,
  DesignBrief,
  DesignSubmission,
  BodyPartCode,
  BOMComponentCode,
  GarmentTemplate,
  BriefCategory,
  BriefStatus,
  PHVerdict,
  SAVerdict,
  DesignConceptItem,
  DesignConceptColorway
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
  if (norm.includes('SUIT')) return 'Suit'
  if (norm.includes('PANT')) return 'Pant'
  if (norm.includes('ETHNIC')) return 'Ethnic'
  return 'Hoodie'
}

// -----------------------------------------------------------------------------
// 1. TECH PACKS
// -----------------------------------------------------------------------------

export async function fetchTechPacksAction(_companyName?: string): Promise<TechPack[]> {
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
      updated_at: row.updated_at,
      design_submission_id: row.design_submission_id || undefined,
      created_by_ph: row.created_by_ph || undefined,
      approved_by_sa: Boolean(row.approved_by_sa),
      sa_verdict: row.sa_verdict || 'PENDING',
      company_name: row.company_name || 'Nubira Creation'
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
  design_submission_id?: string
  created_by_ph?: string
  company_name?: string
}): Promise<{ success: boolean; data?: TechPack; error?: string }> {
  try {
    let brandId = payload.brand_id
    const isUUID = brandId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId)
    
    if (!isUUID) {
      const brandToFind = (payload.brand_name && payload.brand_name !== 'inhouse' ? payload.brand_name : 'Inhouse').trim()
      
      const { data: existingBrand } = await supabaseAdmin
        .from('brands')
        .select('id')
        .ilike('brand_name', brandToFind)
        .maybeSingle()

      if (existingBrand) {
        brandId = existingBrand.id
      } else {
        const { data: newBrand, error: insertErr } = await supabaseAdmin
          .from('brands')
          .insert({
            brand_name: brandToFind,
            brand_code: brandToFind.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() || 'BRAND'
          })
          .select('id')
          .single()

        if (!insertErr && newBrand) {
          brandId = newBrand.id
        } else {
          const { data: anyBrand } = await supabaseAdmin
            .from('brands')
            .select('id')
            .limit(1)
            .maybeSingle()
          brandId = anyBrand?.id
        }
      }
    }

    if (!brandId) {
      return { success: false, error: 'Failed to resolve or create a valid brand entity in database.' }
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
        design_submission_id: payload.design_submission_id || null,
        created_by_ph: payload.created_by_ph || null,
        approved_by_sa: true,
        sa_verdict: 'APPROVED',
        company_name: payload.company_name || 'Nubira Creation',
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
      updated_at: data.updated_at,
      design_submission_id: data.design_submission_id,
      created_by_ph: data.created_by_ph,
      approved_by_sa: data.approved_by_sa,
      sa_verdict: data.sa_verdict,
      company_name: data.company_name
    }

    return { success: true, data: createdPack }
  } catch (err: any) {
    console.error('[createTechPackAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Server error creating tech pack.' }
  }
}

export async function updateTechPackAction(
  id: string,
  payload: {
    style_number?: string
    brand_name?: string
    category?: string
    size_system?: SizeSystem
    base_size?: string
    fabric_composition?: string
    target_gsm?: number
    embellishment_sequence?: EmbellishmentSequence
    spi?: number
    seam_class?: SeamClass
    status?: TechPackStatus
  }
): Promise<{ success: boolean; data?: TechPack; error?: string }> {
  try {
    let brandId: string | undefined
    if (payload.brand_name) {
      const brandToFind = payload.brand_name.trim()
      const { data: existingBrand } = await supabaseAdmin
        .from('brands')
        .select('id')
        .ilike('brand_name', brandToFind)
        .maybeSingle()

      if (existingBrand) {
        brandId = existingBrand.id
      } else {
        const { data: newBrand } = await supabaseAdmin
          .from('brands')
          .insert({
            brand_name: brandToFind,
            brand_code: brandToFind.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() || 'BRAND'
          })
          .select('id')
          .single()
        if (newBrand) brandId = newBrand.id
      }
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    if (payload.style_number) updates.style_number = payload.style_number.trim()
    if (brandId) updates.brand_id = brandId
    if (payload.category) updates.category = payload.category.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '')
    if (payload.size_system) updates.size_system = payload.size_system
    if (payload.base_size) updates.base_size = payload.base_size
    if (payload.fabric_composition) updates.fabric_composition = payload.fabric_composition.trim()
    if (payload.target_gsm !== undefined) updates.target_gsm = Number(payload.target_gsm)
    if (payload.embellishment_sequence) updates.embellishment_sequence = payload.embellishment_sequence
    if (payload.spi !== undefined) updates.spi = Number(payload.spi)
    if (payload.seam_class) updates.seam_class = payload.seam_class
    if (payload.status) updates.status = payload.status

    const { data, error } = await supabaseAdmin
      .from('design_tech_packs')
      .update(updates)
      .eq('id', id)
      .select('*, brands(*)')
      .single()

    if (error) {
      console.error('[updateTechPackAction] DB Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/tech-packs')

    return {
      success: true,
      data: {
        id: data.id,
        style_number: data.style_number,
        style_name: `${data.category} Style ${data.style_number}`,
        brand_name: data.brands?.brand_name || 'Inhouse',
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
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update tech pack.' }
  }
}

export async function updateTechPackStatusAction(id: string, status: TechPackStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_tech_packs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design')
    revalidatePath('/design/tech-packs')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update status.' }
  }
}

export async function deleteTechPackAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_tech_packs')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design')
    revalidatePath('/design/tech-packs')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete tech pack.' }
  }
}

// -----------------------------------------------------------------------------
// 2. TEAM MANAGEMENT (PH adds/manages designers)
// -----------------------------------------------------------------------------

export async function fetchDesignTeamMembersAction(companyName?: string, phUserId?: string): Promise<DesignTeamMember[]> {
  try {
    let query = supabaseAdmin
      .from('design_team_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (companyName) {
      query = query.eq('company_name', companyName)
    }
    if (phUserId) {
      query = query.eq('ph_user_id', phUserId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[fetchDesignTeamMembersAction] Supabase error:', error)
      return []
    }

    return (data || []).map((row: any) => {
      const fallbackPhone = (row.designer_email?.includes('@designer.nubira.local') ? row.designer_email.split('@')[0] : null)
      const phone = row.phone_number || row.designer_phone || (fallbackPhone && /^\d{10}$/.test(fallbackPhone) ? fallbackPhone : undefined)
      return {
        id: row.id,
        ph_user_id: row.ph_user_id,
        designer_user_id: row.designer_user_id || undefined,
        designer_name: row.designer_name,
        phone_number: phone,
        username: row.username || undefined,
        designer_email: row.designer_email,
        designer_phone: phone,
        company_name: row.company_name,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    })
  } catch (err) {
    console.error('[fetchDesignTeamMembersAction] Unexpected error:', err)
    return []
  }
}

export async function addDesignTeamMemberAction(payload: {
  ph_user_id: string
  designer_name: string
  phone_number: string
  password?: string
  designer_email?: string
  designer_phone?: string
  company_name: string
}): Promise<{ success: boolean; data?: DesignTeamMember; error?: string }> {
  try {
    const rawPhone = (payload.phone_number || payload.designer_phone || '').replace(/\D/g, '')
    const phone10 = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone
    if (phone10.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' }
    }

    const nameClean = payload.designer_name.trim()
    const companyClean = payload.company_name.trim()
    const password = payload.password?.trim() || 'Designer@123'

    // Generate creative unique username: e.g. rahul_nubira or rahul_nubira_2
    const nameSlug = nameClean.toLowerCase().replace(/[^a-z0-9]/g, '_').split('_')[0] || 'designer'
    const companySlug = companyClean.toLowerCase().replace(/[^a-z0-9]/g, '_').split('_')[0] || 'nubira'
    const baseUsername = `${nameSlug}_${companySlug}`

    const { data: existingMembers } = await supabaseAdmin
      .from('design_team_members')
      .select('username')
      .ilike('username', `${baseUsername}%`)

    let finalUsername = baseUsername
    if (existingMembers && existingMembers.length > 0) {
      const existingUsernames = new Set(existingMembers.map((m: any) => m.username?.toLowerCase()))
      if (existingUsernames.has(finalUsername.toLowerCase())) {
        let counter = 2
        while (existingUsernames.has(`${baseUsername}_${counter}`.toLowerCase())) {
          counter++
        }
        finalUsername = `${baseUsername}_${counter}`
      }
    }

    const internalEmail = payload.designer_email?.trim().toLowerCase() || `${phone10}@designer.nubira.local`

    // Check if phone number already registered for this company
    const { data: existingPhone } = await supabaseAdmin
      .from('design_team_members')
      .select('*')
      .eq('company_name', companyClean)
      .or(`phone_number.eq.${phone10},designer_phone.eq.${phone10},designer_email.eq.${internalEmail}`)
      .maybeSingle()

    if (existingPhone) {
      if (existingPhone.status === 'REMOVED') {
        const { data: revived, error: reviveErr } = await supabaseAdmin
          .from('design_team_members')
          .update({
            status: 'ACTIVE',
            designer_name: nameClean,
            phone_number: phone10,
            designer_phone: phone10,
            username: finalUsername,
            designer_email: internalEmail,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPhone.id)
          .select('*')
          .single()

        if (reviveErr) return { success: false, error: reviveErr.message }
        revalidatePath('/design/team')
        return { 
          success: true, 
          data: {
            id: revived.id,
            ph_user_id: revived.ph_user_id,
            designer_name: revived.designer_name,
            phone_number: revived.phone_number || phone10,
            username: revived.username || finalUsername,
            designer_email: revived.designer_email || internalEmail,
            designer_phone: revived.designer_phone || phone10,
            company_name: revived.company_name,
            status: revived.status,
            created_at: revived.created_at,
            updated_at: revived.updated_at
          }
        }
      }
      return { success: false, error: `A team member with mobile number ${phone10} is already registered in this company.` }
    }

    // Create / Update Supabase Auth User with metadata so they can log in directly
    let authUserId: string | undefined
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = userList?.users?.find(
        u => u.email?.toLowerCase() === internalEmail.toLowerCase() ||
             u.user_metadata?.phone_number === phone10
      )

      if (foundUser) {
        authUserId = foundUser.id
        await supabaseAdmin.auth.admin.updateUserById(foundUser.id, {
          password: password,
          user_metadata: {
            role: 'DESIGNER',
            company_name: companyClean,
            full_name: nameClean,
            phone_number: phone10,
            username: finalUsername
          }
        })
      } else {
        const { data: newUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: internalEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            role: 'DESIGNER',
            company_name: companyClean,
            full_name: nameClean,
            phone_number: phone10,
            username: finalUsername
          }
        })
        if (!authErr && newUser?.user) {
          authUserId = newUser.user.id
        }
      }
    } catch (authCreateErr) {
      console.warn('Supabase auth user create notice:', authCreateErr)
    }

    // Insert into design_team_members
    const { data, error } = await supabaseAdmin
      .from('design_team_members')
      .insert({
        ph_user_id: payload.ph_user_id,
        designer_user_id: authUserId || null,
        designer_name: nameClean,
        phone_number: phone10,
        username: finalUsername,
        designer_email: internalEmail,
        designer_phone: phone10,
        company_name: companyClean,
        status: 'ACTIVE'
      })
      .select('*')
      .single()

    if (error) {
      console.error('[addDesignTeamMemberAction] Insert error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design/team')
    return {
      success: true,
      data: {
        id: data.id,
        ph_user_id: data.ph_user_id,
        designer_user_id: data.designer_user_id,
        designer_name: data.designer_name,
        phone_number: data.phone_number || phone10,
        username: data.username || finalUsername,
        designer_email: data.designer_email || internalEmail,
        designer_phone: data.designer_phone || phone10,
        company_name: data.company_name,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }
  } catch (err: any) {
    console.error('[addDesignTeamMemberAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to add team member.' }
  }
}

export async function updateDesignTeamMemberStatusAction(
  memberId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_team_members')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', memberId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/team')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update member status.' }
  }
}

export async function deleteDesignTeamMemberAction(memberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_team_members')
      .delete()
      .eq('id', memberId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/team')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete member.' }
  }
}

// -----------------------------------------------------------------------------
// 3. DESIGN BRIEFS QUEUE (PH allocates work to designers)
// -----------------------------------------------------------------------------

export async function createDesignBriefAction(payload: {
  ph_user_id: string
  designer_member_id?: string
  garment_type: string
  category: string
  max_colors: number
  chart_colors?: number
  target_colors?: string[]
  target_designs?: number
  num_designs?: number
  design_concepts?: BriefDesignConceptRequirement[]
  instructions?: string
  company_name: string
}): Promise<{ success: boolean; data?: DesignBrief; error?: string }> {
  try {
    let concepts = payload.design_concepts
    let targetCount = Number(payload.target_designs || payload.num_designs) || (concepts && concepts.length > 0 ? concepts.length : 1)
    
    // Calculate all unique colors across all concepts if provided
    let allColors: string[] = payload.target_colors ? [...payload.target_colors] : []
    if (concepts && concepts.length > 0) {
      targetCount = concepts.length
      const colorSet = new Set(allColors)
      concepts.forEach(c => {
        c.colors.forEach(col => {
          if (col && col.trim()) colorSet.add(col.trim())
        })
      })
      allColors = Array.from(colorSet)
    }

    const calculatedMaxColors = concepts && concepts.length > 0
      ? Math.max(...concepts.map(c => c.colors.length), 1)
      : (allColors.length > 0 ? allColors.length : Number(payload.chart_colors || payload.max_colors) || 3)

    let rawInstructions = payload.instructions?.trim() || ''
    if (concepts && concepts.length > 0) {
      rawInstructions = `[CONCEPTS_BRIEF: ${JSON.stringify(concepts)}] ${rawInstructions}`.trim()
    }
    if (allColors.length > 0 && !rawInstructions.includes('[COLORS:')) {
      rawInstructions = `[COLORS: ${allColors.join(', ')}] ${rawInstructions}`.trim()
    }
    if (targetCount > 1 && !rawInstructions.includes('[TARGET:')) {
      rawInstructions = `[TARGET: ${targetCount} Designs] ${rawInstructions}`.trim()
    }

    const { data, error } = await supabaseAdmin
      .from('design_briefs')
      .insert({
        ph_user_id: payload.ph_user_id,
        designer_member_id: payload.designer_member_id || null,
        garment_type: payload.garment_type.trim(),
        category: payload.category.trim(),
        max_colors: calculatedMaxColors,
        instructions: rawInstructions || null,
        status: 'ALLOCATED',
        company_name: payload.company_name
      })
      .select('*, design_team_members(*)')
      .single()

    if (error) {
      console.error('[createDesignBriefAction] DB Insert Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/briefs')
    revalidatePath('/design/designer')

    const cleanInst = data.instructions
      ?.replace(/\[CONCEPTS_BRIEF:\s*\[[\s\S]*?\]\]\s*/gi, '')
      ?.replace(/\[TARGET:\s*\d+\s*(?:Designs)?\]\s*/gi, '')
      ?.replace(/\[COLORS:\s*[^\]]+\]\s*/gi, '')
      ?.trim() || undefined

    const created: DesignBrief = {
      id: data.id,
      ph_user_id: data.ph_user_id,
      designer_member_id: data.designer_member_id || undefined,
      designer_name: data.design_team_members?.designer_name || undefined,
      designer_email: data.design_team_members?.designer_email || undefined,
      designer_phone: data.design_team_members?.phone_number || data.design_team_members?.designer_phone || undefined,
      garment_type: data.garment_type,
      category: data.category,
      max_colors: data.max_colors,
      chart_colors: data.max_colors,
      target_colors: allColors.length > 0 ? allColors : undefined,
      target_designs: targetCount,
      num_designs: targetCount,
      design_concepts_brief: concepts && concepts.length > 0 ? concepts : undefined,
      submissions_count: 0,
      instructions: cleanInst,
      status: data.status,
      company_name: data.company_name,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return { success: true, data: created }
  } catch (err: any) {
    console.error('[createDesignBriefAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to create design brief.' }
  }
}

export async function fetchDesignBriefsAction(filters?: {
  companyName?: string
  phUserId?: string
  designerMemberId?: string
  designerEmail?: string
  designerUserId?: string
  status?: string
}): Promise<DesignBrief[]> {
  try {
    let query = supabaseAdmin
      .from('design_briefs')
      .select('*, design_team_members(*), design_submissions(*)')
      .order('created_at', { ascending: false })

    if (filters?.companyName && !filters?.designerEmail && !filters?.designerUserId) {
      query = query.eq('company_name', filters.companyName)
    }
    if (filters?.phUserId) {
      query = query.eq('ph_user_id', filters.phUserId)
    }
    if (filters?.designerMemberId) {
      query = query.eq('designer_member_id', filters.designerMemberId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[fetchDesignBriefsAction] Supabase error:', error)
      return []
    }

    let filteredData = data || []
    if (filters?.designerEmail || filters?.designerUserId) {
      const emailLower = filters.designerEmail?.toLowerCase()
      const rawDigits = emailLower ? emailLower.split('@')[0].replace(/\D/g, '') : ''
      const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits

      filteredData = filteredData.filter((row: any) => {
        const m = row.design_team_members
        if (!m) return false
        if (filters.designerUserId && (m.designer_user_id === filters.designerUserId || m.id === filters.designerUserId)) return true
        if (emailLower && m.designer_email?.toLowerCase() === emailLower) return true
        if (phone10 && (m.phone_number === phone10 || m.designer_phone === phone10)) return true
        return false
      })
    }

    return filteredData.map((row: any) => {
      // Find latest submission
      const subs = (row.design_submissions || []) as any[]
      subs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      const latestSub = subs[0]

      // Extract concepts brief from instructions if serialized
      let parsedConceptsBrief: BriefDesignConceptRequirement[] | undefined
      if (row.instructions) {
        const conceptsMatch = row.instructions.match(/\[CONCEPTS_BRIEF:\s*(\[[\s\S]*?\])\]/i)
        if (conceptsMatch && conceptsMatch[1]) {
          try {
            parsedConceptsBrief = JSON.parse(conceptsMatch[1])
          } catch (e) {
            // Ignore parse error
          }
        }
      }

      // Extract target designs quota from metadata or instructions
      let targetDesigns = parsedConceptsBrief?.length || 1
      if (row.num_designs) {
        targetDesigns = Number(row.num_designs) || targetDesigns
      } else if (row.instructions) {
        const match = row.instructions.match(/\[TARGET:\s*(\d+)\s*(?:Designs)?\]/i)
        if (match && match[1]) {
          targetDesigns = parseInt(match[1], 10) || targetDesigns
        }
      }

      // Extract target colors list from metadata
      let targetColors: string[] | undefined
      if (parsedConceptsBrief && parsedConceptsBrief.length > 0) {
        const set = new Set<string>()
        parsedConceptsBrief.forEach(c => c.colors.forEach(col => { if (col) set.add(col) }))
        targetColors = Array.from(set)
      } else if (row.instructions) {
        const colMatch = row.instructions.match(/\[COLORS:\s*([^\]]+)\]/i)
        if (colMatch && colMatch[1]) {
          targetColors = colMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      }

      const cleanInstructions = row.instructions
        ? row.instructions
            .replace(/\[CONCEPTS_BRIEF:\s*\[[\s\S]*?\]\]\s*/gi, '')
            .replace(/\[TARGET:\s*\d+\s*(?:Designs)?\]\s*/gi, '')
            .replace(/\[COLORS:\s*[^\]]+\]\s*/gi, '')
            .trim() || undefined
        : undefined

      return {
        id: row.id,
        ph_user_id: row.ph_user_id,
        designer_member_id: row.designer_member_id || undefined,
        designer_name: row.design_team_members?.designer_name || undefined,
        designer_email: row.design_team_members?.designer_email || undefined,
        designer_phone: row.design_team_members?.phone_number || row.design_team_members?.designer_phone || undefined,
        garment_type: row.garment_type,
        category: row.category,
        max_colors: row.max_colors,
        chart_colors: row.max_colors,
        target_colors: targetColors,
        target_designs: targetDesigns,
        num_designs: targetDesigns,
        design_concepts_brief: parsedConceptsBrief,
        submissions_count: subs.length,
        instructions: cleanInstructions,
        status: row.status as BriefStatus,
        company_name: row.company_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        latest_submission: latestSub ? (() => {
          const parsedSub = parseConceptsFromNotes(latestSub.designer_notes)
          return {
            id: latestSub.id,
            brief_id: latestSub.brief_id,
            designer_member_id: latestSub.designer_member_id || undefined,
            photo_url_1: latestSub.photo_url_1,
            photo_url_2: latestSub.photo_url_2 || undefined,
            concepts: parsedSub.concepts,
            designer_notes: parsedSub.cleanNotes,
            ph_verdict: latestSub.ph_verdict as PHVerdict,
            ph_feedback: latestSub.ph_feedback || undefined,
            sa_verdict: latestSub.sa_verdict as SAVerdict || undefined,
            sa_notes: latestSub.sa_notes || undefined,
            company_name: latestSub.company_name,
            submitted_at: latestSub.submitted_at,
            reviewed_at: latestSub.reviewed_at || undefined
          }
        })() : undefined
      }
    })
  } catch (err) {
    console.error('[fetchDesignBriefsAction] Unexpected error:', err)
    return []
  }
}

export async function deleteDesignBriefAction(briefId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_briefs')
      .delete()
      .eq('id', briefId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design')
    revalidatePath('/design/briefs')
    revalidatePath('/design/designer')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete brief.' }
  }
}

// -----------------------------------------------------------------------------
// 4. DESIGN SUBMISSIONS & 3-TIER VERIFICATION
// -----------------------------------------------------------------------------

function parseConceptsFromNotes(designerNotes?: string | null): { concepts?: DesignConceptItem[]; cleanNotes?: string } {
  if (!designerNotes) return { cleanNotes: undefined }
  const match = designerNotes.match(/\[CONCEPTS_JSON:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*\]/)
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1])
      const clean = designerNotes.replace(/\[CONCEPTS_JSON:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*\]\s*/, '').trim() || undefined
      return { concepts: Array.isArray(parsed) ? parsed : [parsed], cleanNotes: clean }
    } catch {
      return { cleanNotes: designerNotes }
    }
  }
  return { cleanNotes: designerNotes }
}

export async function submitDesignPhotosAction(payload: {
  brief_id: string
  designer_member_id?: string
  photo_url_1?: string
  photo_url_2?: string
  designer_notes?: string
  concepts?: DesignConceptItem[]
  company_name: string
}): Promise<{ success: boolean; data?: DesignSubmission; error?: string }> {
  try {
    let p1 = payload.photo_url_1?.trim() || ''
    let p2 = payload.photo_url_2?.trim() || ''

    if (payload.concepts && payload.concepts.length > 0) {
      // Pick first colorway photos as primary if not provided
      for (const c of payload.concepts) {
        for (const cw of c.colorways) {
          if (!p1 && cw.photo_front) p1 = cw.photo_front
          if (!p2 && cw.photo_back) p2 = cw.photo_back
          if (p1 && p2) break
        }
        if (p1 && p2) break
      }
    }

    if (!p1) {
      return { success: false, error: 'At least 1 concept photo or mockup is required.' }
    }

    let rawNotes = payload.designer_notes?.trim() || ''
    if (payload.concepts && payload.concepts.length > 0) {
      rawNotes = `[CONCEPTS_JSON: ${JSON.stringify(payload.concepts)}] ${rawNotes}`.trim()
    }

    const { data: subData, error: subErr } = await supabaseAdmin
      .from('design_submissions')
      .insert({
        brief_id: payload.brief_id,
        designer_member_id: payload.designer_member_id || null,
        photo_url_1: p1,
        photo_url_2: p2 || null,
        designer_notes: rawNotes || null,
        ph_verdict: 'PENDING',
        company_name: payload.company_name
      })
      .select('*')
      .single()

    if (subErr) {
      console.error('[submitDesignPhotosAction] Insert error:', subErr)
      return { success: false, error: subErr.message }
    }

    // Update brief status to SUBMITTED
    await supabaseAdmin
      .from('design_briefs')
      .update({ status: 'SUBMITTED', updated_at: new Date().toISOString() })
      .eq('id', payload.brief_id)

    revalidatePath('/design')
    revalidatePath('/design/briefs')
    revalidatePath('/design/designer')

    const parsed = parseConceptsFromNotes(subData.designer_notes)
    const formatted: DesignSubmission = {
      ...subData,
      concepts: parsed.concepts || payload.concepts,
      designer_notes: parsed.cleanNotes
    }

    return { success: true, data: formatted }
  } catch (err: any) {
    console.error('[submitDesignPhotosAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to submit photos.' }
  }
}

export async function fetchDesignSubmissionsAction(filters?: {
  brief_id?: string
  ph_verdict?: string
  sa_verdict?: string
  company_name?: string
}): Promise<DesignSubmission[]> {
  try {
    let query = supabaseAdmin
      .from('design_submissions')
      .select('*, design_briefs(*, design_team_members(*)), design_team_members(*)')
      .order('submitted_at', { ascending: false })

    if (filters?.company_name) {
      query = query.eq('company_name', filters.company_name)
    }
    if (filters?.brief_id) {
      query = query.eq('brief_id', filters.brief_id)
    }
    if (filters?.ph_verdict) {
      query = query.eq('ph_verdict', filters.ph_verdict)
    }
    if (filters?.sa_verdict) {
      query = query.eq('sa_verdict', filters.sa_verdict)
    }

    const { data, error } = await query

    if (error) {
      console.error('[fetchDesignSubmissionsAction] Supabase error:', error)
      return []
    }

    return (data || []).map((row: any) => {
      const parsed = parseConceptsFromNotes(row.designer_notes)
      return {
        id: row.id,
        brief_id: row.brief_id,
        designer_member_id: row.designer_member_id || undefined,
        designer_name: row.design_team_members?.designer_name || row.design_briefs?.design_team_members?.designer_name || 'Designer',
        photo_url_1: row.photo_url_1,
        photo_url_2: row.photo_url_2 || undefined,
        concepts: parsed.concepts,
        designer_notes: parsed.cleanNotes,
        ph_verdict: row.ph_verdict as PHVerdict,
        ph_feedback: row.ph_feedback || undefined,
        sa_verdict: row.sa_verdict as SAVerdict || undefined,
        sa_notes: row.sa_notes || undefined,
        company_name: row.company_name,
        submitted_at: row.submitted_at,
        reviewed_at: row.reviewed_at || undefined,
        brief: row.design_briefs ? {
          id: row.design_briefs.id,
          ph_user_id: row.design_briefs.ph_user_id,
          garment_type: row.design_briefs.garment_type,
          category: row.design_briefs.category,
          max_colors: row.design_briefs.max_colors,
          instructions: row.design_briefs.instructions || undefined,
          status: row.design_briefs.status as BriefStatus,
          company_name: row.design_briefs.company_name,
          created_at: row.design_briefs.created_at,
          updated_at: row.design_briefs.updated_at
        } : undefined
      }
    })
  } catch (err) {
    console.error('[fetchDesignSubmissionsAction] Unexpected error:', err)
    return []
  }
}

export async function reviewDesignSubmissionAction(payload: {
  submission_id: string
  ph_verdict: 'APPROVED' | 'REJECTED'
  ph_feedback?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from('design_submissions')
      .select('brief_id')
      .eq('id', payload.submission_id)
      .single()

    if (fetchErr || !sub) {
      return { success: false, error: 'Submission not found.' }
    }

    const { error: updateErr } = await supabaseAdmin
      .from('design_submissions')
      .update({
        ph_verdict: payload.ph_verdict,
        ph_feedback: payload.ph_feedback?.trim() || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', payload.submission_id)

    if (updateErr) return { success: false, error: updateErr.message }

    // Update brief status accordingly
    const briefStatus: BriefStatus = payload.ph_verdict === 'APPROVED' ? 'PH_APPROVED' : 'PH_REJECTED'
    await supabaseAdmin
      .from('design_briefs')
      .update({ status: briefStatus, updated_at: new Date().toISOString() })
      .eq('id', sub.brief_id)

    revalidatePath('/design')
    revalidatePath('/design/briefs')
    revalidatePath('/design/sa-approvals')
    revalidatePath('/design/designer')

    return { success: true }
  } catch (err: any) {
    console.error('[reviewDesignSubmissionAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to review submission.' }
  }
}

export async function saReviewDesignSubmissionAction(payload: {
  submission_id: string
  sa_verdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED'
  sa_notes?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from('design_submissions')
      .select('brief_id')
      .eq('id', payload.submission_id)
      .single()

    if (fetchErr || !sub) {
      return { success: false, error: 'Submission not found.' }
    }

    const { error: updateErr } = await supabaseAdmin
      .from('design_submissions')
      .update({
        sa_verdict: payload.sa_verdict,
        sa_notes: payload.sa_notes?.trim() || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', payload.submission_id)

    if (updateErr) return { success: false, error: updateErr.message }

    // Map SA verdict to Brief Status
    let briefStatus: BriefStatus = 'SA_APPROVED'
    if (payload.sa_verdict === 'SAVED_FOR_LATER') {
      briefStatus = 'SA_SAVED_FOR_LATER'
    } else if (payload.sa_verdict === 'REJECTED') {
      briefStatus = 'PH_REJECTED'
    }

    await supabaseAdmin
      .from('design_briefs')
      .update({ status: briefStatus, updated_at: new Date().toISOString() })
      .eq('id', sub.brief_id)

    revalidatePath('/design')
    revalidatePath('/design/briefs')
    revalidatePath('/design/sa-approvals')
    revalidatePath('/design/tech-packs')

    return { success: true }
  } catch (err: any) {
    console.error('[saReviewDesignSubmissionAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to update SA verdict.' }
  }
}

// -----------------------------------------------------------------------------
// 5. PH SETTINGS: BODY PART CODES, BOM CODES & GARMENT TEMPLATES
// -----------------------------------------------------------------------------

export async function fetchBodyPartCodesAction(phUserId?: string, companyName?: string): Promise<BodyPartCode[]> {
  try {
    let query = supabaseAdmin
      .from('design_body_part_codes')
      .select('*')
      .order('sort_order', { ascending: true })

    if (companyName) query = query.eq('company_name', companyName)
    if (phUserId) query = query.eq('ph_user_id', phUserId)

    const { data, error } = await query
    if (error) {
      console.error('[fetchBodyPartCodesAction] Supabase error:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[fetchBodyPartCodesAction] Unexpected error:', err)
    return []
  }
}

export async function createBodyPartCodeAction(payload: {
  ph_user_id: string
  company_name: string
  code: string
  body_part_name: string
  sort_order?: number
}): Promise<{ success: boolean; data?: BodyPartCode; error?: string }> {
  try {
    const codeNorm = payload.code.trim().toUpperCase()
    const { data, error } = await supabaseAdmin
      .from('design_body_part_codes')
      .insert({
        ph_user_id: payload.ph_user_id,
        company_name: payload.company_name,
        code: codeNorm,
        body_part_name: payload.body_part_name.trim(),
        sort_order: payload.sort_order || 0
      })
      .select('*')
      .single()

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save body part code.' }
  }
}

export async function deleteBodyPartCodeAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_body_part_codes')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete body part code.' }
  }
}

export async function fetchBOMComponentCodesAction(phUserId?: string, companyName?: string): Promise<BOMComponentCode[]> {
  try {
    let query = supabaseAdmin
      .from('design_bom_component_codes')
      .select('*')
      .order('sort_order', { ascending: true })

    if (companyName) query = query.eq('company_name', companyName)
    if (phUserId) query = query.eq('ph_user_id', phUserId)

    const { data, error } = await query
    if (error) {
      console.error('[fetchBOMComponentCodesAction] Supabase error:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[fetchBOMComponentCodesAction] Unexpected error:', err)
    return []
  }
}

export async function createBOMComponentCodeAction(payload: {
  ph_user_id: string
  company_name: string
  component_type: string
  component_spec: string
  code?: string
  sort_order?: number
}): Promise<{ success: boolean; data?: BOMComponentCode; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_bom_component_codes')
      .insert({
        ph_user_id: payload.ph_user_id,
        company_name: payload.company_name,
        component_type: payload.component_type.trim().toUpperCase(),
        component_spec: payload.component_spec.trim(),
        code: payload.code?.trim().toUpperCase() || null,
        sort_order: payload.sort_order || 0
      })
      .select('*')
      .single()

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save BOM component code.' }
  }
}

export async function deleteBOMComponentCodeAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_bom_component_codes')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete BOM code.' }
  }
}

export async function fetchGarmentTemplatesAction(_companyName?: string): Promise<GarmentTemplate[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_garment_templates')
      .select('*')
      .order('garment_type', { ascending: true })

    if (error) {
      console.error('[fetchGarmentTemplatesAction] Supabase error:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      garment_type: row.garment_type,
      body_parts: row.body_parts || [],
      bom_defaults: row.bom_defaults || [],
      is_system_template: Boolean(row.is_system_template),
      ph_user_id: row.ph_user_id || undefined,
      company_name: row.company_name || undefined,
      created_at: row.created_at
    }))
  } catch (err) {
    console.error('[fetchGarmentTemplatesAction] Unexpected error:', err)
    return []
  }
}

export async function createGarmentTemplateAction(payload: {
  garment_type: string
  body_parts: any[]
  bom_defaults?: any[]
  ph_user_id?: string
  company_name?: string
}): Promise<{ success: boolean; data?: GarmentTemplate; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_garment_templates')
      .insert({
        garment_type: payload.garment_type.trim(),
        body_parts: payload.body_parts,
        bom_defaults: payload.bom_defaults || [],
        is_system_template: false,
        ph_user_id: payload.ph_user_id || null,
        company_name: payload.company_name || null
      })
      .select('*')
      .single()

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create garment template.' }
  }
}

export async function deleteGarmentTemplateAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_garment_templates')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/design/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete template.' }
  }
}

// -----------------------------------------------------------------------------
// 6. TECH PACK FROM APPROVED DESIGN (PH CREATES AFTER SA APPROVAL)
// -----------------------------------------------------------------------------

export async function createTechPackFromApprovedDesignAction(payload: {
  submission_id: string
  style_number: string
  style_name?: string
  brand_name?: string
  garment_type: string
  size_system?: SizeSystem
  base_size?: string
  fabric_composition?: string
  target_gsm?: number
  embellishment_sequence?: EmbellishmentSequence
  spi?: number
  seam_class?: SeamClass
  cad_front_url?: string
  cad_back_url?: string
  company_name: string
  ph_user_id?: string
}): Promise<{ success: boolean; data?: TechPack; error?: string }> {
  try {
    const res = await createTechPackAction({
      style_number: payload.style_number,
      style_name: payload.style_name,
      brand_name: payload.brand_name || 'Inhouse',
      category: payload.garment_type,
      size_system: payload.size_system || 'ALPHA_ADULT',
      base_size: payload.base_size || 'M',
      fabric_composition: payload.fabric_composition || '100% Combed Cotton',
      target_gsm: payload.target_gsm || 220,
      embellishment_sequence: payload.embellishment_sequence || 'NONE',
      spi: payload.spi || 12,
      seam_class: payload.seam_class || 'ISO 4915 Class 401 (Chainstitch)',
      cad_front_url: payload.cad_front_url,
      cad_back_url: payload.cad_back_url,
      design_submission_id: payload.submission_id,
      created_by_ph: payload.ph_user_id,
      company_name: payload.company_name
    })

    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Failed to create tech pack.' }
    }

    // Update brief status to TECH_PACK_CREATED
    const { data: sub } = await supabaseAdmin
      .from('design_submissions')
      .select('brief_id')
      .eq('id', payload.submission_id)
      .maybeSingle()

    if (sub?.brief_id) {
      await supabaseAdmin
        .from('design_briefs')
        .update({ status: 'TECH_PACK_CREATED', updated_at: new Date().toISOString() })
        .eq('id', sub.brief_id)
    }

    revalidatePath('/design')
    revalidatePath('/design/tech-packs')
    revalidatePath('/design/briefs')
    revalidatePath('/design/sa-approvals')

    return { success: true, data: res.data }
  } catch (err: any) {
    console.error('[createTechPackFromApprovedDesignAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to convert approved design to tech-pack.' }
  }
}

// -----------------------------------------------------------------------------
// 7. DESIGN STUDIO METRICS (KPIs)
// -----------------------------------------------------------------------------

export async function fetchDesignStudioMetricsAction(companyName?: string): Promise<{
  active_briefs: number
  pending_ph_reviews: number
  pending_sa_approvals: number
  sa_approved_designs: number
  saved_for_later: number
  active_tech_packs: number
  team_designers_count: number
}> {
  try {
    let briefsQ = supabaseAdmin.from('design_briefs').select('status')
    let subsQ = supabaseAdmin.from('design_submissions').select('ph_verdict, sa_verdict')
    let tpQ = supabaseAdmin.from('design_tech_packs').select('id')
    let teamQ = supabaseAdmin.from('design_team_members').select('id').eq('status', 'ACTIVE')

    if (companyName) {
      briefsQ = briefsQ.eq('company_name', companyName)
      subsQ = subsQ.eq('company_name', companyName)
      tpQ = tpQ.eq('company_name', companyName)
      teamQ = teamQ.eq('company_name', companyName)
    }

    const [briefsRes, subsRes, tpRes, teamRes] = await Promise.all([
      briefsQ,
      subsQ,
      tpQ,
      teamQ
    ])

    const briefs = briefsRes.data || []
    const subs = subsRes.data || []
    const tps = tpRes.data || []
    const team = teamRes.data || []

    const active_briefs = briefs.filter(b => b.status === 'ALLOCATED' || b.status === 'SUBMITTED').length
    const pending_ph_reviews = subs.filter(s => s.ph_verdict === 'PENDING').length
    const pending_sa_approvals = subs.filter(s => s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING')).length
    const sa_approved_designs = subs.filter(s => s.sa_verdict === 'APPROVED').length
    const saved_for_later = subs.filter(s => s.sa_verdict === 'SAVED_FOR_LATER').length
    const active_tech_packs = tps.length
    const team_designers_count = team.length

    return {
      active_briefs,
      pending_ph_reviews,
      pending_sa_approvals,
      sa_approved_designs,
      saved_for_later,
      active_tech_packs,
      team_designers_count
    }
  } catch (err) {
    console.error('[fetchDesignStudioMetricsAction] Error:', err)
    return {
      active_briefs: 0,
      pending_ph_reviews: 0,
      pending_sa_approvals: 0,
      sa_approved_designs: 0,
      saved_for_later: 0,
      active_tech_packs: 0,
      team_designers_count: 0
    }
  }
}

// -----------------------------------------------------------------------------
// 8. SAMPLE APPROVALS (PPS & Fit Audit)
// -----------------------------------------------------------------------------

export async function fetchSampleApprovalsAction(_companyName?: string): Promise<SampleApproval[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_sample_approvals')
      .select('*, design_tech_packs(*, brands(*))')
      .order('submitted_date', { ascending: false })

    if (error) {
      console.error('[fetchSampleApprovalsAction] Supabase error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      tech_pack_id: row.tech_pack_id,
      style_number: row.design_tech_packs?.style_number || 'UNKNOWN',
      style_name: `${row.design_tech_packs?.category || 'Apparel'} Style ${row.design_tech_packs?.style_number || ''}`,
      brand_name: row.design_tech_packs?.brands?.brand_name || 'Inhouse',
      sample_stage: row.sample_stage as SampleStage,
      measured_chest: Number(row.measured_chest) || 0,
      target_chest: Number(row.target_chest) || 0,
      measured_length: Number(row.measured_length) || 0,
      target_length: Number(row.target_length) || 0,
      measured_sleeve: Number(row.measured_sleeve) || 0,
      target_sleeve: Number(row.target_sleeve) || 0,
      variance_status: row.variance_status as 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE',
      fit_comments: row.fit_comments || '',
      buyer_reviewer_email: row.buyer_reviewer_email || 'buyer@brand.com',
      approval_status: row.approval_status as SampleApprovalStatus,
      submitted_date: row.submitted_date || new Date().toISOString().split('T')[0],
      audit_date: row.audit_date || undefined
    }))
  } catch (err) {
    console.error('[fetchSampleApprovalsAction] Unexpected error:', err)
    return []
  }
}

export async function createSampleApprovalAction(payload: {
  tech_pack_id: string
  sample_stage: SampleStage
  measured_chest: number
  target_chest?: number
  measured_length: number
  target_length?: number
  measured_sleeve: number
  target_sleeve?: number
  variance_status?: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE'
  within_tolerance?: boolean
  variance_max_cm?: number
  fit_comments: string
  buyer_reviewer_name?: string
  buyer_reviewer_email: string
  approval_status?: SampleApprovalStatus
  verdict?: 'APPROVED' | 'REJECTED' | 'REVISE_SAMPLE' | 'PENDING'
}): Promise<{ success: boolean; data?: SampleApproval; error?: string }> {
  try {
    const varianceStatus = payload.variance_status || (payload.within_tolerance === false ? 'OUT_OF_TOLERANCE' : 'WITHIN_TOLERANCE')
    const approvalStatus = payload.approval_status || (payload.verdict as SampleApprovalStatus) || 'PENDING'

    const { data, error } = await supabaseAdmin
      .from('design_sample_approvals')
      .insert({
        tech_pack_id: payload.tech_pack_id,
        sample_stage: payload.sample_stage,
        measured_chest: Number(payload.measured_chest),
        target_chest: Number(payload.target_chest || payload.measured_chest),
        measured_length: Number(payload.measured_length),
        target_length: Number(payload.target_length || payload.measured_length),
        measured_sleeve: Number(payload.measured_sleeve),
        target_sleeve: Number(payload.target_sleeve || payload.measured_sleeve),
        variance_status: varianceStatus,
        fit_comments: payload.fit_comments,
        buyer_reviewer_email: payload.buyer_reviewer_email,
        approval_status: approvalStatus,
        submitted_date: new Date().toISOString().split('T')[0],
        audit_date: new Date().toISOString()
      })
      .select('*, design_tech_packs(*, brands(*))')
      .single()

    if (error) {
      console.error('[createSampleApprovalAction] DB Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/sample-approvals')

    return {
      success: true,
      data: {
        id: data.id,
        tech_pack_id: data.tech_pack_id,
        style_number: data.design_tech_packs?.style_number || 'UNKNOWN',
        style_name: `${data.design_tech_packs?.category || 'Apparel'} Style ${data.design_tech_packs?.style_number || ''}`,
        brand_name: data.design_tech_packs?.brands?.brand_name || 'Inhouse',
        sample_stage: data.sample_stage as SampleStage,
        measured_chest: Number(data.measured_chest),
        target_chest: Number(data.target_chest),
        measured_length: Number(data.measured_length),
        target_length: Number(data.target_length),
        measured_sleeve: Number(data.measured_sleeve),
        target_sleeve: Number(data.target_sleeve),
        variance_status: data.variance_status,
        fit_comments: data.fit_comments,
        buyer_reviewer_email: data.buyer_reviewer_email,
        approval_status: data.approval_status,
        submitted_date: data.submitted_date,
        audit_date: data.audit_date
      }
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create sample approval.' }
  }
}

export async function auditSampleApprovalAction(
  id: string,
  approval_status: SampleApprovalStatus,
  fit_comments?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, any> = {
      approval_status,
      audit_date: new Date().toISOString()
    }
    if (fit_comments !== undefined) {
      updates.fit_comments = fit_comments
    }

    const { error } = await supabaseAdmin
      .from('design_sample_approvals')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('[auditSampleApprovalAction] DB error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/design')
    revalidatePath('/design/sample-approvals')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to audit sample approval.' }
  }
}

// -----------------------------------------------------------------------------
// 9. GRADING SCHEMES
// -----------------------------------------------------------------------------

export async function fetchGradingSchemesAction(_companyName?: string): Promise<GradingScheme[]> {
  try {
    const { data: techPacks, error: tpErr } = await supabaseAdmin
      .from('design_tech_packs')
      .select('id, style_number, category, size_system, base_size')
      .limit(20)

    if (tpErr || !techPacks || techPacks.length === 0) {
      return []
    }

    const tpIds = techPacks.map(tp => tp.id)
    const { data: poms, error: pomErr } = await supabaseAdmin
      .from('design_poms')
      .select('*, design_measurement_values(*)')
      .in('tech_pack_id', tpIds)

    if (pomErr) {
      console.error('[fetchGradingSchemesAction] POM error:', pomErr)
      return []
    }

    return techPacks.map((tp: any) => {
      const relatedPoms = (poms || []).filter((p: any) => p.tech_pack_id === tp.id)
      const mappedPoms: PointOfMeasure[] = relatedPoms.map((p: any) => {
        const sizesMap: Record<string, number> = {}
        if (p.design_measurement_values) {
          p.design_measurement_values.forEach((v: any) => {
            sizesMap[v.size_code] = Number(v.value_cm)
          })
        }
        return {
          pom_code: p.pom_code,
          pom_name: p.pom_name,
          tolerance_cm: Number(p.tolerance_cm) || 1.0,
          grade_step_cm: Number(p.grade_step_cm) || 2.0,
          base_value_cm: Number(p.base_value_cm) || 50.0,
          sizes: sizesMap
        }
      })

      return {
        id: tp.id,
        name: `${tp.style_number} - ${tp.category} Grade Rules`,
        category: (tp.size_system as SizeSystem) || 'ALPHA_ADULT',
        base_size: tp.base_size || 'M',
        sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        poms: mappedPoms
      }
    })
  } catch (err) {
    console.error('[fetchGradingSchemesAction] Unexpected error:', err)
    return []
  }
}

export async function createGradingSchemeAction(payload: {
  tech_pack_id: string
  pom_code: string
  pom_name: string
  tolerance_cm: number
  grade_step_cm: number
  base_value_cm: number
  base_size?: string
  sizes?: string[]
}): Promise<{ success: boolean; data?: PointOfMeasure; error?: string }> {
  try {
    const { data: pom, error: pomErr } = await supabaseAdmin
      .from('design_poms')
      .insert({
        tech_pack_id: payload.tech_pack_id,
        pom_code: payload.pom_code.trim().toUpperCase(),
        pom_name: payload.pom_name.trim(),
        tolerance_cm: Number(payload.tolerance_cm),
        grade_step_cm: Number(payload.grade_step_cm),
        base_value_cm: Number(payload.base_value_cm)
      })
      .select('id')
      .single()

    if (pomErr || !pom) {
      return { success: false, error: pomErr?.message || 'Failed to insert POM.' }
    }

    const sizes = payload.sizes && payload.sizes.length > 0 ? payload.sizes : ['XS', 'S', 'M', 'L', 'XL', '2XL']
    const baseIndex = payload.base_size ? Math.max(0, sizes.indexOf(payload.base_size)) : 2
    const step = Number(payload.grade_step_cm)
    const baseVal = Number(payload.base_value_cm)

    const sizesMap: Record<string, number> = {}
    const valuesToInsert = sizes.map((size, idx) => {
      const val = baseVal + (idx - (baseIndex >= 0 ? baseIndex : 0)) * step
      sizesMap[size] = val
      return {
        pom_id: pom.id,
        size_code: size,
        value_cm: val
      }
    })

    await supabaseAdmin.from('design_measurement_values').insert(valuesToInsert)

    revalidatePath('/design')
    revalidatePath('/design/grading-matrix')

    const createdPom: PointOfMeasure = {
      pom_code: payload.pom_code.trim().toUpperCase(),
      pom_name: payload.pom_name.trim(),
      tolerance_cm: Number(payload.tolerance_cm),
      grade_step_cm: Number(payload.grade_step_cm),
      base_value_cm: Number(payload.base_value_cm),
      sizes: sizesMap
    }

    return { success: true, data: createdPom }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create grading POM.' }
  }
}

export const createPomAction = createGradingSchemeAction

export async function updateGradingSchemeAction(
  pomId: string,
  payload: {
    pom_name?: string
    tolerance_cm?: number
    grade_step_cm?: number
    base_value_cm?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, any> = {}
    if (payload.pom_name) updates.pom_name = payload.pom_name.trim()
    if (payload.tolerance_cm !== undefined) updates.tolerance_cm = Number(payload.tolerance_cm)
    if (payload.grade_step_cm !== undefined) updates.grade_step_cm = Number(payload.grade_step_cm)
    if (payload.base_value_cm !== undefined) updates.base_value_cm = Number(payload.base_value_cm)

    const { error } = await supabaseAdmin
      .from('design_poms')
      .update(updates)
      .eq('id', pomId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/design')
    revalidatePath('/design/grading-matrix')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update POM.' }
  }
}

export async function deletePomAction(pomIdOrTechPackId: string, pomCode?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (pomCode) {
      const { data: pom } = await supabaseAdmin
        .from('design_poms')
        .select('id')
        .eq('tech_pack_id', pomIdOrTechPackId)
        .eq('pom_code', pomCode)
        .maybeSingle()

      if (pom) {
        await supabaseAdmin.from('design_measurement_values').delete().eq('pom_id', pom.id)
        await supabaseAdmin.from('design_poms').delete().eq('id', pom.id)
      }
    } else {
      await supabaseAdmin.from('design_measurement_values').delete().eq('pom_id', pomIdOrTechPackId)
      const { error } = await supabaseAdmin.from('design_poms').delete().eq('id', pomIdOrTechPackId)
      if (error) return { success: false, error: error.message }
    }
    revalidatePath('/design')
    revalidatePath('/design/grading-matrix')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete POM.' }
  }
}

// -----------------------------------------------------------------------------
// 10. MATERIALS & FABRICS LIBRARY
// -----------------------------------------------------------------------------

export async function fetchMaterialsLibraryAction(_companyName?: string): Promise<MaterialItem[]> {
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
      let type: 'FABRIC' | 'TRIM' | 'THREAD' = 'FABRIC'
      if (row.material_type?.includes('TRIM')) type = 'TRIM'
      if (row.material_type?.includes('THREAD')) type = 'THREAD'

      return {
        id: row.id,
        material_code: row.material_code,
        material_name: row.material_name,
        type,
        construction: row.material_type || 'Single Jersey',
        composition: row.composition || '100% Cotton',
        weight_gsm: row.nominal_gsm ? Number(row.nominal_gsm) : undefined,
        shrinkage_length_pct: Number(row.length_shrinkage_pct) || 0,
        shrinkage_width_pct: Number(row.width_shrinkage_pct) || 0,
        spirality_pct: Number(row.spirality_pct) || 0,
        recommended_needle: row.recommended_needle || 'Ball Point 75/11',
        supplier_mill: row.supplier_mill || 'Standard Mill Partner',
        lead_time_days: 14,
        status: (row.is_active ? 'CERTIFIED' : 'DEPRECATED') as 'CERTIFIED' | 'DEPRECATED'
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

export async function deleteMaterialAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('design_materials_library')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/design')
    revalidatePath('/design/materials-library')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete material.' }
  }
}

// -----------------------------------------------------------------------------
// 11. BRANDS LIST
// -----------------------------------------------------------------------------

export async function fetchBrandsAction(_companyName?: string): Promise<{ id: string; brand_name: string; brand_code: string }[]> {
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
