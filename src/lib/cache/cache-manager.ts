/**
 * Universal Multi-Tenant Cache Engine
 * 
 * Features:
 * - L1 In-Memory RAM Cache: Sub-millisecond (<1ms) instant access, zero external dependencies.
 * - L2 Distributed Redis Cache: Plug-and-play support for Upstash Redis (REST) or standard Redis.
 * - Multi-Tenant Scoping: Isolated keys per company/tenant (`company:[slug]:[module]:[key]`).
 * - Tag-Based Invalidation: Easily invalidate all cached data for a company or specific module on updates.
 * - Fail-Safe Graceful Fallback: If Redis is unconfigured or unreachable, silently falls back to L1 RAM.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
  tags: string[]
}

interface CacheStore {
  l1Map: Map<string, CacheEntry<any>>
  tagIndex: Map<string, Set<string>> // tag -> set of keys
}

// Persist L1 cache on globalThis across Next.js dev server hot-reloads
const GLOBAL_CACHE_KEY = Symbol.for('nubira.global.cache')

const globalState = globalThis as unknown as {
  [GLOBAL_CACHE_KEY]?: CacheStore
}

if (!globalState[GLOBAL_CACHE_KEY]) {
  globalState[GLOBAL_CACHE_KEY] = {
    l1Map: new Map(),
    tagIndex: new Map(),
  }
}

const cacheStore: CacheStore = globalState[GLOBAL_CACHE_KEY]!

// Maximum items in L1 memory to prevent memory bloat in long-running processes
const MAX_L1_ENTRIES = 2000

function cleanupExpiredL1() {
  const now = Date.now()
  if (cacheStore.l1Map.size < MAX_L1_ENTRIES) return

  for (const [key, entry] of cacheStore.l1Map.entries()) {
    if (entry.expiresAt <= now) {
      cacheStore.l1Map.delete(key)
    }
  }

  // If still over limit, drop oldest 20%
  if (cacheStore.l1Map.size >= MAX_L1_ENTRIES) {
    const keysToDelete = Array.from(cacheStore.l1Map.keys()).slice(0, Math.floor(MAX_L1_ENTRIES * 0.2))
    for (const k of keysToDelete) {
      cacheStore.l1Map.delete(k)
    }
  }
}

/**
 * Upstash Redis REST API Helper (zero extra dependencies, native fetch)
 */
async function upstashCommand(command: string[]): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  try {
    const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const json = await res.json()
    return json?.result ?? null
  } catch (err) {
    // Fail silently to L1 cache
    return null
  }
}

export const CacheManager = {
  /**
   * Get value from L1 (Memory) or L2 (Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now()

    // 1. Check L1 Memory Cache (<1ms)
    const l1Entry = cacheStore.l1Map.get(key)
    if (l1Entry) {
      if (l1Entry.expiresAt > now) {
        return l1Entry.value as T
      }
      // Expired in L1
      cacheStore.l1Map.delete(key)
    }

    // 2. Check L2 Redis (if configured)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const raw = await upstashCommand(['GET', key])
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          // Backfill into L1 with remaining TTL
          if (parsed && parsed.value !== undefined) {
            const remainingTtl = Math.max(10, Math.floor((parsed.expiresAt - now) / 1000))
            if (remainingTtl > 0) {
              this.set(key, parsed.value, remainingTtl, parsed.tags || [])
            }
            return parsed.value as T
          }
        }
      } catch (_) {}
    }

    return null
  },

  /**
   * Set value in L1 (Memory) and L2 (Redis)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 60, tags: string[] = []): Promise<void> {
    cleanupExpiredL1()
    const now = Date.now()
    const expiresAt = now + ttlSeconds * 1000

    // 1. Write to L1 Memory Cache
    cacheStore.l1Map.set(key, {
      value,
      expiresAt,
      tags,
    })

    // Index tags for quick invalidation
    for (const tag of tags) {
      if (!cacheStore.tagIndex.has(tag)) {
        cacheStore.tagIndex.set(tag, new Set())
      }
      cacheStore.tagIndex.get(tag)!.add(key)
    }

    // 2. Write to L2 Redis (if configured)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const payload = JSON.stringify({ value, expiresAt, tags })
        await upstashCommand(['SETEX', key, String(ttlSeconds), payload])
      } catch (_) {}
    }
  },

  /**
   * Delete a specific cache key
   */
  async delete(key: string): Promise<void> {
    cacheStore.l1Map.delete(key)

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        await upstashCommand(['DEL', key])
      } catch (_) {}
    }
  },

  /**
   * Invalidate all keys associated with a specific tag (e.g. 'company:demo_industries', 'module:cutting')
   */
  async invalidateTag(tag: string): Promise<void> {
    const keys = cacheStore.tagIndex.get(tag)
    if (keys) {
      for (const k of keys) {
        cacheStore.l1Map.delete(k)
      }
      cacheStore.tagIndex.delete(tag)
    }

    // Also invalidate in Redis if configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        // Tag invalidation key pattern delete
        const matchedKeys = await upstashCommand(['KEYS', `*${tag}*`])
        if (Array.isArray(matchedKeys) && matchedKeys.length > 0) {
          for (const mk of matchedKeys) {
            await upstashCommand(['DEL', mk])
          }
        }
      } catch (_) {}
    }
  },

  /**
   * Invalidate company module cache
   */
  async invalidateCompanyModule(companyName: string, moduleName?: string): Promise<void> {
    const normalizedCompany = (companyName || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')
    if (moduleName) {
      const normalizedModule = moduleName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      await this.invalidateTag(`company:${normalizedCompany}:${normalizedModule}`)
    } else {
      await this.invalidateTag(`company:${normalizedCompany}`)
    }
  },

  /**
   * Utility helper to get cached data or compute & store if missing
   */
  async fetchOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 60,
    tags: string[] = []
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null && cached !== undefined) {
      return cached
    }

    const fresh = await fetcher()
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds, tags)
    }
    return fresh
  }
}
