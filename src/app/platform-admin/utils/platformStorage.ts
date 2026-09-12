'use client'

// ============================================================================
// Zigza MES Enterprise - Platform Super Admin Reactive Client Storage
// Manages Demo Inquiries, Tenant Factories & Access Provisioning
// ============================================================================

import {
  DemoRequestInquiry,
  DemoRequestStatus,
  TenantFactory,
  ProvisionTenantPayload,
  PlatformMetrics
} from '../types/platform'
import {
  INITIAL_DEMO_REQUESTS,
  INITIAL_TENANT_FACTORIES,
  ENTERPRISE_DIVISIONS_CATALOG
} from '../data/initialPlatformData'

export const PLATFORM_UPDATE_EVENT = 'zigza:platform_admin_updated'

const STORAGE_KEYS = {
  DEMO_REQUESTS: 'zigza_platform_demo_requests_v1',
  TENANTS: 'zigza_platform_tenants_v1'
}

function broadcastUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLATFORM_UPDATE_EVENT))
  }
}

// ----------------------------------------------------------------------------
// 1. DEMO INQUIRIES CRUD
// ----------------------------------------------------------------------------
export function getDemoRequests(): DemoRequestInquiry[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_REQUESTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEMO_REQUESTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEMO_REQUESTS, JSON.stringify(INITIAL_DEMO_REQUESTS))
      return INITIAL_DEMO_REQUESTS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load demo requests from localStorage:', e)
    return INITIAL_DEMO_REQUESTS
  }
}

export function saveDemoRequest(inquiry: Omit<DemoRequestInquiry, 'id' | 'submittedAt' | 'status'> & { id?: string }): DemoRequestInquiry {
  const current = getDemoRequests()
  const newInquiry: DemoRequestInquiry = {
    id: inquiry.id || `demo-${Date.now()}`,
    applicantName: inquiry.applicantName,
    companyName: inquiry.companyName,
    phone: inquiry.phone,
    email: inquiry.email,
    preferredPlan: inquiry.preferredPlan || 'FULL_PLANT_AI',
    cityState: inquiry.cityState,
    estimatedMachines: inquiry.estimatedMachines,
    submittedAt: new Date().toISOString(),
    status: 'NEW_LEAD',
    notes: inquiry.notes
  }

  const updated = [newInquiry, ...current]
  try {
    localStorage.setItem(STORAGE_KEYS.DEMO_REQUESTS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save demo request:', e)
  }
  return newInquiry
}

export function updateDemoRequestStatus(
  id: string,
  status: DemoRequestStatus,
  notes?: string
): DemoRequestInquiry | null {
  const current = getDemoRequests()
  const item = current.find(d => d.id === id)
  if (!item) return null

  const updatedItem: DemoRequestInquiry = {
    ...item,
    status,
    notes: notes !== undefined ? notes : item.notes,
    contactedAt: (status === 'CONTACTED' || status === 'DEMO_SCHEDULED' || status === 'PROVISIONED_TENANT') && !item.contactedAt
      ? new Date().toISOString()
      : item.contactedAt
  }

  const updatedList = current.map(d => (d.id === id ? updatedItem : d))
  try {
    localStorage.setItem(STORAGE_KEYS.DEMO_REQUESTS, JSON.stringify(updatedList))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to update demo request status:', e)
  }
  return updatedItem
}

// ----------------------------------------------------------------------------
// 2. TENANT FACTORIES & INFRASTRUCTURE PROVISIONING
// ----------------------------------------------------------------------------
export function getTenantFactories(): TenantFactory[] {
  if (typeof window === 'undefined') return INITIAL_TENANT_FACTORIES
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TENANTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANT_FACTORIES))
      return INITIAL_TENANT_FACTORIES
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load tenants from localStorage:', e)
    return INITIAL_TENANT_FACTORIES
  }
}

export function provisionNewTenant(payload: ProvisionTenantPayload): TenantFactory {
  const currentTenants = getTenantFactories()
  
  const plantSlug = payload.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const newTenant: TenantFactory = {
    id: `ten-${Date.now().toString().slice(-4)}`,
    companyName: payload.companyName,
    plantSlug: plantSlug || `factory-${Date.now()}`,
    adminEmail: payload.adminEmail,
    adminName: payload.adminName,
    phone: payload.phone,
    cityState: payload.cityState || 'India',
    subscriptionTier: payload.subscriptionTier,
    monthlyBillingInr: payload.monthlyBillingInr || (payload.subscriptionTier === 'FULL_PLANT_AI' ? 4999 : 1999),
    activeDivisionsCount: payload.selectedDivisions.length,
    provisionedAt: new Date().toISOString(),
    status: 'ACTIVE',
    allowedDivisions: payload.selectedDivisions,
    lastActiveAt: new Date().toISOString()
  }

  const updatedTenants = [newTenant, ...currentTenants]
  try {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants))
  } catch (e) {
    console.error('Failed to save tenant:', e)
  }

  // If this was converted from a demo request, update that inquiry record
  if (payload.demoRequestId) {
    const currentDemos = getDemoRequests()
    const updatedDemos = currentDemos.map(d => {
      if (d.id === payload.demoRequestId) {
        return {
          ...d,
          status: 'PROVISIONED_TENANT' as const,
          provisionedTenantId: newTenant.id,
          contactedAt: d.contactedAt || new Date().toISOString()
        }
      }
      return d
    })
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_REQUESTS, JSON.stringify(updatedDemos))
    } catch (_) {}
  }

  broadcastUpdate()
  return newTenant
}

// ----------------------------------------------------------------------------
// 3. PLATFORM METRICS
// ----------------------------------------------------------------------------
export function getPlatformMetrics(): PlatformMetrics {
  const demos = getDemoRequests()
  const tenants = getTenantFactories()

  const totalDemos = demos.length
  const pendingReview = demos.filter(d => d.status === 'NEW_LEAD').length
  const provisionedCount = tenants.length
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length
  const mrr = tenants.reduce((acc, t) => acc + (t.monthlyBillingInr || 0), 0)

  const conversion = totalDemos > 0 ? Math.round((provisionedCount / totalDemos) * 1000) / 10 : 50.0

  return {
    totalDemoLeads: totalDemos,
    pendingReviewCount: pendingReview,
    provisionedFactoriesCount: provisionedCount,
    activeTenantsCount: activeTenants,
    conversionRatePercent: conversion,
    totalProjectedMrrInr: mrr
  }
}
