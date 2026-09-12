import {
  PrintingScreen,
  PrintingProductionRun,
  StrikeOffTest,
  InkRecipe,
  CuringOvenLog
} from '../types/printing'

export const INITIAL_PRINTING_RUNS: PrintingProductionRun[] = [
  {
    id: 'run-0842',
    run_number: 'PRN-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    table_or_machine: 'Octopus Carousel 01 (12 Color Auto)',
    operator_name: 'R. Veeramani (Master Printer)',
    technique: 'PLASTISOL',
    pantone_codes: ['Pantone 19-4052 TCX', 'Pantone 11-0601 TCX'],
    total_panels_issued: 75,
    panels_completed: 74,
    panels_rejected: 1,
    defect_reason: 'PINHOLE',
    curing_temp_c: 162,
    curing_temp_verified: true,
    stroke_speed_cpm: 28,
    status: 'PRINTING',
    started_at: '2026-09-12T07:30:00Z',
    created_at: '2026-09-12T07:00:00Z'
  }
]

export const INITIAL_SCREENS: PrintingScreen[] = [
  {
    id: 'scr-0842-a',
    screen_code: 'SCR-HD-160-A',
    artwork_ref: 'ART-HD-8821-CHEST-CREST',
    color_separation: 'Optical White Underbase',
    mesh_count: 160,
    tension_newtons: 26.5,
    emulsion_type: 'Murakami One-Pot SBQ Photopolymer',
    frame_material: 'ALUMINUM',
    rack_location: 'Rack P-01 / Slot 02',
    status: 'READY_FOR_PRINT',
    exposures_count: 800,
    last_exposure_date: '2026-09-12T06:00:00Z',
    created_at: '2026-09-11T14:00:00Z'
  },
  {
    id: 'scr-0842-b',
    screen_code: 'SCR-HD-230-B',
    artwork_ref: 'ART-HD-8821-CHEST-CREST',
    color_separation: 'Classic Navy Top Coat',
    mesh_count: 230,
    tension_newtons: 24.0,
    emulsion_type: 'Murakami One-Pot SBQ Photopolymer',
    frame_material: 'ALUMINUM',
    rack_location: 'Rack P-01 / Slot 03',
    status: 'IN_USE',
    exposures_count: 800,
    last_exposure_date: '2026-09-12T07:30:00Z',
    created_at: '2026-09-11T14:30:00Z'
  }
]

export const INITIAL_STRIKE_OFFS: StrikeOffTest[] = [
  {
    id: 'sto-0842',
    test_number: 'SO-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    pantone_target: 'Pantone 19-4052 TCX (Classic Navy), Pantone 11-0601 TCX',
    technique: 'PLASTISOL',
    spectro_delta_e: 0.38,
    curing_temp_c: 162,
    stretch_test_pass: true,
    wash_fastness_rating: 4.5,
    crocking_test_pass: true,
    approval_status: 'APPROVED',
    auditor_name: 'S. Mehra (Buyer Technical QA)',
    remarks: 'Approved for bulk print. Excellent opacity and sharp edge resolution on 380 GSM French Terry.',
    tested_at: '2026-09-11T16:00:00Z'
  }
]

export const INITIAL_INK_RECIPES: InkRecipe[] = [
  {
    id: 'rcp-01',
    recipe_code: 'RCP-PL-NAVY-01',
    color_name: 'Classic Navy High-Density Plastisol',
    pantone_code: 'Pantone 19-4052 TCX',
    technique: 'PLASTISOL',
    base_binder_grams: 820,
    pigment_concentrate_grams: 140,
    fixer_crosslinker_grams: 30,
    retarder_grams: 10,
    viscosity_cps: 18500,
    eco_compliance: 'OEKO-TEX Standard 100',
    prepared_by: 'A. Gurunathan (Ink Chemist)',
    batch_volume_kg: 25.0,
    created_at: '2026-09-12T06:00:00Z'
  },
  {
    id: 'rcp-02',
    recipe_code: 'RCP-PL-WHITE-02',
    color_name: 'Optical White Opaque Underbase',
    pantone_code: 'Pantone 11-0601 TCX',
    technique: 'PLASTISOL',
    base_binder_grams: 780,
    pigment_concentrate_grams: 180,
    fixer_crosslinker_grams: 30,
    retarder_grams: 10,
    viscosity_cps: 19200,
    eco_compliance: 'OEKO-TEX Standard 100',
    prepared_by: 'A. Gurunathan (Ink Chemist)',
    batch_volume_kg: 30.0,
    created_at: '2026-09-12T06:15:00Z'
  }
]

export const INITIAL_CURING_LOGS: CuringOvenLog[] = [
  {
    id: 'ovn-0842',
    log_number: 'OVEN-2026-0842',
    oven_id: 'Tunnel Dryer Conveyor 01',
    target_temp_c: 160,
    probe_temp_c: 162.4,
    conveyor_speed_mpm: 2.4,
    dwell_time_minutes: 2.0,
    po_number: 'PO-ZIG-8901',
    wash_test_cycles: 50,
    fastness_rating: 4.5,
    auditor_name: 'K. Balaji (QA Inspector)',
    status: 'OPTIMAL',
    logged_at: '2026-09-12T09:00:00Z'
  }
]
