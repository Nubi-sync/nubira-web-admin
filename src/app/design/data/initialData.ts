import { TechPack, SampleApproval, GradingScheme, MaterialItem } from '../types/design'

export const INITIAL_TECH_PACKS: TechPack[] = [
  {
    id: 'tp-001',
    style_number: 'TP-2026-088',
    style_name: 'Heavyweight French Terry Hoodie',
    brand_name: 'OLLYPOP',
    category: 'Hoodie',
    size_system: 'ALPHA_ADULT',
    base_size: 'M',
    fabric_composition: '100% Combed Cotton Loopback Fleece',
    target_gsm: 420,
    embellishment_sequence: 'EMBROIDERY_FIRST_THEN_PRINT',
    spi: 12,
    seam_class: 'ISO 4915 Class 607 (Flatlock)',
    status: 'APPROVED_BULK',
    target_cut_date: '2026-09-18',
    version: 2,
    created_at: '2026-08-25T10:00:00Z',
    updated_at: '2026-09-04T15:30:00Z'
  },
  {
    id: 'tp-002',
    style_number: 'TP-2026-092',
    style_name: 'Relaxed Fit Cargo Jogger',
    brand_name: 'NUBIRA ESSENTIALS',
    category: 'Jogger',
    size_system: 'ALPHA_ADULT',
    base_size: 'L',
    fabric_composition: '98% Cotton 2% Elastane Twill',
    target_gsm: 280,
    embellishment_sequence: 'NONE',
    spi: 14,
    seam_class: 'ISO 4915 Class 401 (Chainstitch)',
    status: 'PPS_SUBMITTED',
    target_cut_date: '2026-09-22',
    version: 1,
    created_at: '2026-08-29T11:20:00Z',
    updated_at: '2026-09-08T09:45:00Z'
  },
  {
    id: 'tp-003',
    style_number: 'TP-2026-097',
    style_name: 'Mercerized Interlock Polo',
    brand_name: 'ZARA GLOBAL',
    category: 'Polo',
    size_system: 'ALPHA_ADULT',
    base_size: 'M',
    fabric_composition: '100% Egyptian Giza Cotton Interlock',
    target_gsm: 240,
    embellishment_sequence: 'EMBROIDERY_FIRST_THEN_PRINT',
    spi: 14,
    seam_class: 'ISO 4915 Class 504 (Overlock)',
    status: 'SAMPLE_DEV',
    target_cut_date: '2026-09-28',
    version: 1,
    created_at: '2026-09-02T14:10:00Z',
    updated_at: '2026-09-09T17:00:00Z'
  },
  {
    id: 'tp-004',
    style_number: 'TP-2026-104',
    style_name: 'Drop-Shoulder Boxy Streetwear Tee',
    brand_name: 'H&M BASICS',
    category: 'T-Shirt',
    size_system: 'ALPHA_ADULT',
    base_size: 'L',
    fabric_composition: '100% Organic Open-End Jersey',
    target_gsm: 260,
    embellishment_sequence: 'PRINT_FIRST_THEN_EMBROIDERY',
    spi: 12,
    seam_class: 'ISO 4915 Class 504 (Overlock)',
    status: 'APPROVED_BULK',
    target_cut_date: '2026-09-16',
    version: 1,
    created_at: '2026-08-20T08:30:00Z',
    updated_at: '2026-09-01T12:00:00Z'
  },
  {
    id: 'tp-005',
    style_number: 'TP-2026-110',
    style_name: 'Utility Windbreaker Coach Jacket',
    brand_name: 'NUBIRA ESSENTIALS',
    category: 'Jacket',
    size_system: 'ALPHA_ADULT',
    base_size: 'L',
    fabric_composition: '100% Water-Repellent Ripstop Nylon with Poly Taffeta Lining',
    target_gsm: 190,
    embellishment_sequence: 'NONE',
    spi: 10,
    seam_class: 'ISO 4915 Class 401 (Chainstitch)',
    status: 'REVISE_FIT',
    target_cut_date: '2026-10-05',
    version: 2,
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-09-07T14:15:00Z'
  },
  {
    id: 'tp-006',
    style_number: 'TP-2026-118',
    style_name: 'Organic Cotton Baby Rib Romper',
    brand_name: 'OLLYPOP',
    category: 'Kids Romper',
    size_system: 'KIDS_AGE',
    base_size: '4T',
    fabric_composition: '95% Organic Cotton 5% Spandex 2x2 Rib',
    target_gsm: 210,
    embellishment_sequence: 'NONE',
    spi: 14,
    seam_class: 'ISO 4915 Class 607 (Flatlock)',
    status: 'DRAFT',
    target_cut_date: '2026-10-12',
    version: 1,
    created_at: '2026-09-08T16:00:00Z',
    updated_at: '2026-09-08T16:00:00Z'
  }
]

export const INITIAL_SAMPLE_APPROVALS: SampleApproval[] = [
  {
    id: 'sa-001',
    tech_pack_id: 'tp-001',
    style_number: 'TP-2026-088',
    style_name: 'Heavyweight French Terry Hoodie',
    brand_name: 'OLLYPOP',
    sample_stage: 'PPS',
    measured_chest: 53.2,
    target_chest: 53.0,
    measured_length: 72.1,
    target_length: 72.0,
    measured_sleeve: 87.0,
    target_sleeve: 87.0,
    variance_status: 'WITHIN_TOLERANCE',
    fit_comments: 'Drape and shoulder drop verified against golden mannequin. Seam tension on kangaroo pocket verified.',
    buyer_reviewer_email: 'qa.auditor@ollypop.com',
    approval_status: 'APPROVED',
    submitted_date: '2026-09-02',
    audit_date: '2026-09-04'
  },
  {
    id: 'sa-002',
    tech_pack_id: 'tp-002',
    style_number: 'TP-2026-092',
    style_name: 'Relaxed Fit Cargo Jogger',
    brand_name: 'NUBIRA ESSENTIALS',
    sample_stage: 'PPS',
    measured_chest: 44.0,
    target_chest: 44.0,
    measured_length: 104.2,
    target_length: 104.0,
    measured_sleeve: 0,
    target_sleeve: 0,
    variance_status: 'WITHIN_TOLERANCE',
    fit_comments: 'Inseam length within ±0.5cm. Awaiting buyer colorway sign-off on cargo pocket flaps.',
    buyer_reviewer_email: 'production@nubira.com',
    approval_status: 'PENDING_REVIEW',
    submitted_date: '2026-09-08'
  },
  {
    id: 'sa-003',
    tech_pack_id: 'tp-003',
    style_number: 'TP-2026-097',
    style_name: 'Mercerized Interlock Polo',
    brand_name: 'ZARA GLOBAL',
    sample_stage: 'SIZE_SET',
    measured_chest: 52.8,
    target_chest: 53.0,
    measured_length: 71.8,
    target_length: 72.0,
    measured_sleeve: 24.5,
    target_sleeve: 24.5,
    variance_status: 'WITHIN_TOLERANCE',
    fit_comments: 'Collar ribbing contours cleanly around neck band. Size set across S-XL submitted to buyer desk.',
    buyer_reviewer_email: 'zara.sampling@inditex.com',
    approval_status: 'PENDING_REVIEW',
    submitted_date: '2026-09-09'
  },
  {
    id: 'sa-004',
    tech_pack_id: 'tp-005',
    style_number: 'TP-2026-110',
    style_name: 'Utility Windbreaker Coach Jacket',
    brand_name: 'NUBIRA ESSENTIALS',
    sample_stage: 'PROTO',
    measured_chest: 61.2,
    target_chest: 59.5,
    measured_length: 75.5,
    target_length: 74.0,
    measured_sleeve: 91.0,
    target_sleeve: 89.0,
    variance_status: 'OUT_OF_TOLERANCE',
    fit_comments: 'Chest width +1.7cm exceeds ±0.5cm tolerance. Pattern armhole depth requires 1.5cm reduction.',
    buyer_reviewer_email: 'fit.specialist@nubira.com',
    approval_status: 'REVISE_FIT',
    submitted_date: '2026-09-05',
    audit_date: '2026-09-07'
  }
]

export const INITIAL_GRADING_SCHEMES: GradingScheme[] = [
  {
    id: 'scheme-adult-unisex',
    name: 'Adult Unisex Alpha (XS–3XL)',
    category: 'ALPHA_ADULT',
    base_size: 'M',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    poms: [
      {
        pom_code: 'CHEST_WIDTH',
        pom_name: 'Half Chest Width (1" below armhole)',
        tolerance_cm: 0.5,
        grade_step_cm: 2.5,
        base_value_cm: 53.0,
        sizes: { 'XS': 48.0, 'S': 50.5, 'M': 53.0, 'L': 55.5, 'XL': 58.0, '2XL': 60.5, '3XL': 63.0 }
      },
      {
        pom_code: 'BODY_LENGTH',
        pom_name: 'Body Length from High Point Shoulder (HPS)',
        tolerance_cm: 0.5,
        grade_step_cm: 2.0,
        base_value_cm: 72.0,
        sizes: { 'XS': 68.0, 'S': 70.0, 'M': 72.0, 'L': 74.0, 'XL': 76.0, '2XL': 78.0, '3XL': 80.0 }
      },
      {
        pom_code: 'SLEEVE_LENGTH',
        pom_name: 'Sleeve Length from Center Back (CB)',
        tolerance_cm: 0.5,
        grade_step_cm: 2.5,
        base_value_cm: 87.0,
        sizes: { 'XS': 82.0, 'S': 84.5, 'M': 87.0, 'L': 89.5, 'XL': 92.0, '2XL': 94.5, '3XL': 97.0 }
      },
      {
        pom_code: 'NECK_OPENING',
        pom_name: 'Neck Opening Width (seam to seam)',
        tolerance_cm: 0.25,
        grade_step_cm: 0.5,
        base_value_cm: 18.5,
        sizes: { 'XS': 17.5, 'S': 18.0, 'M': 18.5, 'L': 19.0, 'XL': 19.5, '2XL': 20.0, '3XL': 20.5 }
      },
      {
        pom_code: 'BOTTOM_SWEEP',
        pom_name: 'Bottom Sweep Hem Opening (relaxed)',
        tolerance_cm: 0.5,
        grade_step_cm: 2.5,
        base_value_cm: 49.0,
        sizes: { 'XS': 44.0, 'S': 46.5, 'M': 49.0, 'L': 51.5, 'XL': 54.0, '2XL': 56.5, '3XL': 59.0 }
      }
    ]
  },
  {
    id: 'scheme-kids',
    name: 'Toddler & Kids Sizing (2T–14)',
    category: 'KIDS_AGE',
    base_size: '4T',
    sizes: ['2T', '3T', '4T', '5', '6', '8', '10', '12', '14'],
    poms: [
      {
        pom_code: 'CHEST_WIDTH',
        pom_name: 'Half Chest Width',
        tolerance_cm: 0.5,
        grade_step_cm: 1.5,
        base_value_cm: 33.0,
        sizes: { '2T': 30.0, '3T': 31.5, '4T': 33.0, '5': 34.5, '6': 36.0, '8': 38.0, '10': 40.0, '12': 42.0, '14': 44.0 }
      },
      {
        pom_code: 'BODY_LENGTH',
        pom_name: 'Total Garment Length',
        tolerance_cm: 0.5,
        grade_step_cm: 2.5,
        base_value_cm: 42.0,
        sizes: { '2T': 37.0, '3T': 39.5, '4T': 42.0, '5': 44.5, '6': 47.0, '8': 51.0, '10': 55.0, '12': 59.0, '14': 63.0 }
      },
      {
        pom_code: 'SHOULDER_WIDTH',
        pom_name: 'Across Shoulder Width',
        tolerance_cm: 0.25,
        grade_step_cm: 1.0,
        base_value_cm: 26.0,
        sizes: { '2T': 24.0, '3T': 25.0, '4T': 26.0, '5': 27.0, '6': 28.0, '8': 29.5, '10': 31.0, '12': 32.5, '14': 34.0 }
      }
    ]
  },
  {
    id: 'scheme-numeric-waist',
    name: "Men's Tailored Pants / Jeans (28–42)",
    category: 'NUMERIC_WAIST',
    base_size: '32',
    sizes: ['28', '30', '32', '34', '36', '38', '40', '42'],
    poms: [
      {
        pom_code: 'WAIST_CIRC',
        pom_name: 'Waistband Circumference (relaxed)',
        tolerance_cm: 0.5,
        grade_step_cm: 5.0,
        base_value_cm: 82.0,
        sizes: { '28': 72.0, '30': 77.0, '32': 82.0, '34': 87.0, '36': 92.0, '38': 97.0, '40': 102.0, '42': 107.0 }
      },
      {
        pom_code: 'HIP_CIRC',
        pom_name: 'Hip Circumference (8" below waist)',
        tolerance_cm: 0.5,
        grade_step_cm: 5.0,
        base_value_cm: 104.0,
        sizes: { '28': 94.0, '30': 99.0, '32': 104.0, '34': 109.0, '36': 114.0, '38': 119.0, '40': 124.0, '42': 129.0 }
      },
      {
        pom_code: 'INSEAM_LENGTH',
        pom_name: 'Inseam Length (crotch to hem)',
        tolerance_cm: 0.5,
        grade_step_cm: 0.0,
        base_value_cm: 81.0,
        sizes: { '28': 81.0, '30': 81.0, '32': 81.0, '34': 81.0, '36': 81.0, '38': 81.0, '40': 81.0, '42': 81.0 }
      },
      {
        pom_code: 'THIGH_WIDTH',
        pom_name: 'Thigh Width (1" below crotch)',
        tolerance_cm: 0.25,
        grade_step_cm: 2.0,
        base_value_cm: 32.0,
        sizes: { '28': 28.0, '30': 30.0, '32': 32.0, '34': 34.0, '36': 36.0, '38': 38.0, '40': 40.0, '42': 42.0 }
      }
    ]
  },
  {
    id: 'scheme-plus-size',
    name: 'Plus Size Silhouette (1X–5X)',
    category: 'PLUS_SIZE',
    base_size: '2X',
    sizes: ['1X', '2X', '3X', '4X', '5X'],
    poms: [
      {
        pom_code: 'CHEST_WIDTH',
        pom_name: 'Half Chest Width',
        tolerance_cm: 0.75,
        grade_step_cm: 4.0,
        base_value_cm: 68.0,
        sizes: { '1X': 64.0, '2X': 68.0, '3X': 72.0, '4X': 76.0, '5X': 80.0 }
      },
      {
        pom_code: 'BODY_LENGTH',
        pom_name: 'Body Length HPS',
        tolerance_cm: 0.75,
        grade_step_cm: 2.0,
        base_value_cm: 80.0,
        sizes: { '1X': 78.0, '2X': 80.0, '3X': 82.0, '4X': 84.0, '5X': 86.0 }
      },
      {
        pom_code: 'UPPER_ARM',
        pom_name: 'Upper Arm Bicep Width',
        tolerance_cm: 0.5,
        grade_step_cm: 2.5,
        base_value_cm: 24.0,
        sizes: { '1X': 21.5, '2X': 24.0, '3X': 26.5, '4X': 29.0, '5X': 31.5 }
      }
    ]
  }
]

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-001',
    material_code: 'FAB-FT-420',
    material_name: 'Heavyweight Loopback French Terry',
    type: 'FABRIC',
    construction: '3-End Fleece Loopback Knit',
    composition: '100% Combed Compact Cotton',
    weight_gsm: 420,
    shrinkage_length_pct: 3.8,
    shrinkage_width_pct: 1.5,
    spirality_pct: 2.1,
    recommended_needle: 'Ball Point 80/12 (SES)',
    supplier_mill: 'Vardhman Textiles Ltd.',
    lead_time_days: 14,
    status: 'CERTIFIED'
  },
  {
    id: 'mat-002',
    material_code: 'FAB-SJ-220',
    material_name: 'Supercombed Single Jersey',
    type: 'FABRIC',
    construction: '24 Gauge Circular Knit Single Jersey',
    composition: '100% Cotton 30s Count Compact',
    weight_gsm: 220,
    shrinkage_length_pct: 4.2,
    shrinkage_width_pct: 2.0,
    spirality_pct: 2.8,
    recommended_needle: 'Ball Point 70/10 (SES)',
    supplier_mill: 'Arvind Mills Ltd.',
    lead_time_days: 10,
    status: 'CERTIFIED'
  },
  {
    id: 'mat-003',
    material_code: 'FAB-TW-280',
    material_name: 'Stretch Cotton Chino Twill',
    type: 'FABRIC',
    construction: '3/1 Right-Hand Twill Weave',
    composition: '98% Cotton 2% Spandex',
    weight_gsm: 280,
    shrinkage_length_pct: 2.2,
    shrinkage_width_pct: 3.5,
    spirality_pct: 0.8,
    recommended_needle: 'Sharp Jeans Needle 90/14',
    supplier_mill: 'Alok Industries',
    lead_time_days: 21,
    status: 'CERTIFIED'
  },
  {
    id: 'mat-004',
    material_code: 'THR-SP-402',
    material_name: 'Astra High-Tenacity Spun Poly 40/2',
    type: 'THREAD',
    construction: 'Core Spun Polyester Thread',
    composition: '100% Staple Spun Polyester',
    shrinkage_length_pct: 1.0,
    shrinkage_width_pct: 0.0,
    spirality_pct: 0.0,
    recommended_needle: 'Universal 75/11 to 90/14',
    supplier_mill: 'Coats India Ltd.',
    lead_time_days: 5,
    status: 'CERTIFIED'
  },
  {
    id: 'mat-005',
    material_code: 'TRM-ZIP-05M',
    material_name: 'YKK #5 Antique Brass Metal Zipper',
    type: 'TRIM',
    construction: 'Closed-End Stamped Brass Teeth with Cotton Tape',
    composition: 'Brass alloy + 100% Polyester Tape',
    shrinkage_length_pct: 0.5,
    shrinkage_width_pct: 0.0,
    spirality_pct: 0.0,
    recommended_needle: 'Zipper Presser Foot #E',
    supplier_mill: 'YKK India Pvt. Ltd.',
    lead_time_days: 18,
    status: 'CERTIFIED'
  },
  {
    id: 'mat-006',
    material_code: 'TRM-RIB-2X2',
    material_name: 'Heavy Duty 2x2 Spun Ribbing',
    type: 'TRIM',
    construction: '14 Gauge Flatbed Rib Knit Collar & Cuff',
    composition: '95% Cotton 5% Lycra',
    weight_gsm: 450,
    shrinkage_length_pct: 4.5,
    shrinkage_width_pct: 1.2,
    spirality_pct: 1.0,
    recommended_needle: 'Overlock 80/12 Ball Point',
    supplier_mill: 'Vardhman Textiles Ltd.',
    lead_time_days: 12,
    status: 'CERTIFIED'
  }
]
