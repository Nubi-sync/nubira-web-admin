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

export const INITIAL_DEMO_REQUESTS: DemoRequestInquiry[] = []

export const INITIAL_TENANT_FACTORIES: TenantFactory[] = []

