/**
 * In-Memory Cache Module
 * 
 * Caches GitHub profiles and resume analyses to avoid redundant API calls.
 * Can be upgraded to Redis for persistence.
 */

import { createHash } from 'crypto';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

// TTL Constants (in milliseconds)
export const TTL = {
    GITHUB_PROFILE: 24 * 60 * 60 * 1000,    // 24 hours
    RESUME_ANALYSIS: 24 * 60 * 60 * 1000,   // 24 hours
    SEMANTIC_MATCH: 1 * 60 * 60 * 1000,     // 1 hour (JD-specific)
};

// In-memory caches
const githubCache = new Map<string, CacheEntry<any>>();
const resumeCache = new Map<string, CacheEntry<any>>();
const semanticCache = new Map<string, CacheEntry<any>>();

/**
 * Generate unique ID from file buffer
 */
export function generateCandidateId(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

/**
 * Generate cache key for resume + JD combination
 */
export function generateAnalysisCacheKey(resumeId: string, jdHash: string): string {
    return `${resumeId}:${jdHash}`;
}

/**
 * Generate hash from JD text
 */
export function generateJdHash(jdText: string): string {
    return createHash('sha256').update(jdText).digest('hex').slice(0, 8);
}

/**
 * Get from cache if valid
 */
function getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

/**
 * Set in cache
 */
function setInCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl: number): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
    });
}

// GitHub Profile Cache
export const githubProfileCache = {
    get: (username: string) => getFromCache(githubCache, username.toLowerCase()),
    set: (username: string, data: any) => setInCache(githubCache, username.toLowerCase(), data, TTL.GITHUB_PROFILE),
    has: (username: string) => {
        const cached = getFromCache(githubCache, username.toLowerCase());
        return cached !== null;
    }
};

// Resume Analysis Cache
export const resumeAnalysisCache = {
    get: (cacheKey: string) => getFromCache(resumeCache, cacheKey),
    set: (cacheKey: string, data: any) => setInCache(resumeCache, cacheKey, data, TTL.RESUME_ANALYSIS),
    has: (cacheKey: string) => {
        const cached = getFromCache(resumeCache, cacheKey);
        return cached !== null;
    }
};

// Semantic Match Cache (JD-specific)
export const semanticMatchCache = {
    get: (cacheKey: string) => getFromCache(semanticCache, cacheKey),
    set: (cacheKey: string, data: any) => setInCache(semanticCache, cacheKey, data, TTL.SEMANTIC_MATCH),
};

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
    githubCache.clear();
    resumeCache.clear();
    semanticCache.clear();
    console.log('[Cache] All caches cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
    github: number;
    resume: number;
    semantic: number;
} {
    return {
        github: githubCache.size,
        resume: resumeCache.size,
        semantic: semanticCache.size
    };
}
