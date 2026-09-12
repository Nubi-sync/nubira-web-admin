// ============================================================================
// Zigza MES Enterprise - Platform Super Admin & Infrastructure Provisioning
// Data Models & Domain Types for Client Onboarding & Tenant Management
// ============================================================================

export type DemoRequestStatus = 'NEW_LEAD' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'PROVISIONED_TENANT' | 'ARCHIVED'

export type SubscriptionPlanTier = 'MODULAR' | 'FULL_PLANT_AI' | 'CUSTOM'

export type TenantStatus = 'ACTIVE' | 'PENDING_SETUP' | 'SUSPENDED'

export interface DemoRequestInquiry {
  id: string
  applicantName: string
  companyName: string
  phone: string
  email: string
  preferredPlan: SubscriptionPlanTier
  cityState?: string
  estimatedMachines?: number
  submittedAt: string
  status: DemoRequestStatus
  notes?: string
  contactedAt?: string
  provisionedTenantId?: string
}

export interface TenantDivisionConfig {
  id: string
  code: string
  name: string
  route: string
  isActive: boolean
}

export interface TenantFactory {
  id: string
  companyName: string
  plantSlug: string
  adminEmail: string
  adminName: string
  phone: string
  cityState: string
  subscriptionTier: SubscriptionPlanTier
  monthlyBillingInr: number
  activeDivisionsCount: number
  provisionedAt: string
  status: TenantStatus
  allowedDivisions: string[] // division routes e.g. ['/design', '/merchandising', '/cutting', ...]
  lastActiveAt?: string
}

export interface ProvisionTenantPayload {
  companyName: string
  adminName: string
  adminEmail: string
  initialPassword: string
  phone: string
  cityState: string
  subscriptionTier: SubscriptionPlanTier
  monthlyBillingInr: number
  selectedDivisions: string[]
  demoRequestId?: string
}

export interface PlatformMetrics {
  totalDemoLeads: number
  pendingReviewCount: number
  provisionedFactoriesCount: number
  activeTenantsCount: number
  conversionRatePercent: number
  totalProjectedMrrInr: number
}
