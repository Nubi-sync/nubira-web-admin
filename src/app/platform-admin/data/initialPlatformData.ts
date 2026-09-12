// ============================================================================
// Zigza MES Enterprise - Platform Super Admin Initial Seed Data
// Authentic Inquiries & Active Provisioned Factory Tenants
// ============================================================================

import {
  DemoRequestInquiry,
  TenantFactory,
  TenantDivisionConfig
} from '../types/platform'

export const ENTERPRISE_DIVISIONS_CATALOG: TenantDivisionConfig[] = [
  { id: 'div-01', code: '01', name: 'Design & Tech-Pack Studio', route: '/design', isActive: true },
  { id: 'div-02', code: '02', name: 'Merchandising & Sourcing Desk', route: '/merchandising', isActive: true },
  { id: 'div-03', code: '03', name: 'Cutting Floor & Spreading CAD', route: '/cutting', isActive: true },
  { id: 'div-04', code: '04', name: 'Screen & Digital Printing Studio', route: '/printing', isActive: true },
  { id: 'div-05', code: '05', name: 'Multi-Head Embroidery Studio', route: '/embroidery', isActive: true },
  { id: 'div-06', code: '06', name: 'Stitching & Sewing Assembly Line', route: '/stitching-sewing', isActive: true },
  { id: 'div-07', code: '07', name: 'Industrial Washing & Dyeing', route: '/washing', isActive: true },
  { id: 'div-08', code: '08', name: 'Steam Pressing & Ironing', route: '/iron', isActive: true },
  { id: 'div-09', code: '09', name: 'Ready Goods & Carton Packing', route: '/ready-goods', isActive: true },
  { id: 'div-10', code: '10', name: 'Alteration & Reclamation Clinic', route: '/alter', isActive: true },
  { id: 'div-11', code: '11', name: 'Central Store Godown & Finished Vault', route: '/store', isActive: true }
]

export const INITIAL_DEMO_REQUESTS: DemoRequestInquiry[] = [
  {
    id: 'demo-101',
    applicantName: 'Vikramaditya Rao',
    companyName: 'Apex Knits India Pvt. Ltd.',
    phone: '+91 98422 11900',
    email: 'vikram@apexknits.com',
    preferredPlan: 'FULL_PLANT_AI',
    cityState: 'Tirupur, Tamil Nadu',
    estimatedMachines: 180,
    submittedAt: '2026-09-12T08:30:00Z',
    status: 'NEW_LEAD',
    notes: 'Interested in cutting CAD lay yield matrix and sewing lineman piece-rate wage calculation.'
  },
  {
    id: 'demo-102',
    applicantName: 'Gurpreet Singh Dhillon',
    companyName: 'Ludhiana Woolens & Fleece Works',
    phone: '+91 98140 22450',
    email: 'gurpreet@dhillonwoolens.in',
    preferredPlan: 'FULL_PLANT_AI',
    cityState: 'Ludhiana, Punjab',
    estimatedMachines: 240,
    submittedAt: '2026-09-12T09:45:00Z',
    status: 'NEW_LEAD',
    notes: 'Exporting hoodies & sweatshirts to Germany. Needs ASTM D5430 4-point inspection and washing shrinkage audit.'
  },
  {
    id: 'demo-103',
    applicantName: 'Rohan Dalal',
    companyName: 'Surat Fast-Fashion Creators',
    phone: '+91 98251 99012',
    email: 'rohan@suratfashion.com',
    preferredPlan: 'MODULAR',
    cityState: 'Surat, Gujarat',
    estimatedMachines: 75,
    submittedAt: '2026-09-11T14:15:00Z',
    status: 'CONTACTED',
    contactedAt: '2026-09-11T16:00:00Z',
    notes: 'Wants Modular floor access for Printing, Embroidery, and Cutting Floor initially.'
  },
  {
    id: 'demo-104',
    applicantName: 'Meenakshi Sundaram',
    companyName: 'Bengaluru Silk & Garments Export',
    phone: '+91 99001 88432',
    email: 'meenakshi@bsgexports.in',
    preferredPlan: 'CUSTOM',
    cityState: 'Bengaluru, Karnataka',
    estimatedMachines: 420,
    submittedAt: '2026-09-11T11:20:00Z',
    status: 'DEMO_SCHEDULED',
    contactedAt: '2026-09-11T13:30:00Z',
    notes: 'Meeting scheduled on Google Meet for Monday 11:00 AM IST with COO & Plant Head.'
  },
  {
    id: 'demo-105',
    applicantName: 'Anil Agarwal',
    companyName: 'Noida Export Garments Hub',
    phone: '+91 98110 55430',
    email: 'anil@noidagarments.com',
    preferredPlan: 'FULL_PLANT_AI',
    cityState: 'Noida, Uttar Pradesh',
    estimatedMachines: 160,
    submittedAt: '2026-09-10T16:40:00Z',
    status: 'PROVISIONED_TENANT',
    contactedAt: '2026-09-10T17:15:00Z',
    provisionedTenantId: 'ten-03',
    notes: 'Super Admin credentials issued. Plant going live next week on Zara batch.'
  },
  {
    id: 'demo-106',
    applicantName: 'Kailash Rathore',
    companyName: 'Jaipur Block Prints & Apparel',
    phone: '+91 94140 77890',
    email: 'kailash@jaipurapparel.co',
    preferredPlan: 'MODULAR',
    cityState: 'Jaipur, Rajasthan',
    estimatedMachines: 60,
    submittedAt: '2026-09-10T10:00:00Z',
    status: 'ARCHIVED',
    notes: 'Follow-up requested in October after Diwali production rush.'
  }
]

export const INITIAL_TENANT_FACTORIES: TenantFactory[] = [
  {
    id: 'ten-01',
    companyName: 'Vardhman Apparels Ltd.',
    plantSlug: 'vardhman-knits',
    adminEmail: 'plant.admin@vardhman.com',
    adminName: 'Ashok Singhania',
    phone: '+91 98140 00112',
    cityState: 'Baddi, Himachal Pradesh',
    subscriptionTier: 'FULL_PLANT_AI',
    monthlyBillingInr: 4999,
    activeDivisionsCount: 11,
    provisionedAt: '2026-08-15T10:00:00Z',
    status: 'ACTIVE',
    allowedDivisions: ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route),
    lastActiveAt: '2026-09-12T14:30:00Z'
  },
  {
    id: 'ten-02',
    companyName: 'Classic Polo Garments',
    plantSlug: 'classic-polo',
    adminEmail: 'head.ops@classicpolo.in',
    adminName: 'R. K. Swaminathan',
    phone: '+91 98420 55441',
    cityState: 'Tirupur, Tamil Nadu',
    subscriptionTier: 'FULL_PLANT_AI',
    monthlyBillingInr: 4999,
    activeDivisionsCount: 11,
    provisionedAt: '2026-08-20T12:00:00Z',
    status: 'ACTIVE',
    allowedDivisions: ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route),
    lastActiveAt: '2026-09-12T15:10:00Z'
  },
  {
    id: 'ten-03',
    companyName: 'Noida Export Garments Hub',
    plantSlug: 'noida-exports',
    adminEmail: 'anil@noidagarments.com',
    adminName: 'Anil Agarwal',
    phone: '+91 98110 55430',
    cityState: 'Noida, Uttar Pradesh',
    subscriptionTier: 'FULL_PLANT_AI',
    monthlyBillingInr: 4999,
    activeDivisionsCount: 11,
    provisionedAt: '2026-09-10T18:00:00Z',
    status: 'PENDING_SETUP',
    allowedDivisions: ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route),
    lastActiveAt: '2026-09-11T09:00:00Z'
  },
  {
    id: 'ten-04',
    companyName: 'Heritage Indigo Works',
    plantSlug: 'heritage-indigo',
    adminEmail: 'admin@heritageindigo.com',
    adminName: 'Pravin Mehta',
    phone: '+91 97250 88990',
    cityState: 'Ahmedabad, Gujarat',
    subscriptionTier: 'MODULAR',
    monthlyBillingInr: 1999,
    activeDivisionsCount: 3,
    provisionedAt: '2026-09-01T11:00:00Z',
    status: 'ACTIVE',
    allowedDivisions: ['/cutting', '/printing', '/stitching-sewing'],
    lastActiveAt: '2026-09-12T13:45:00Z'
  }
]
