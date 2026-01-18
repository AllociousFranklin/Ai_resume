/**
 * Rate Limiter for Gemini API
 * 
 * Free tier: 5 requests per minute
 * This ensures we don't exceed quota
 */

class RateLimiter {
    private lastCallTime: number = 0;
    private minDelayMs: number;

    constructor(requestsPerMinute: number = 5) {
        // Add buffer: if 5 requests/min, wait 15s between calls (60/5 = 12, +3s buffer)
        this.minDelayMs = Math.ceil((60 / requestsPerMinute) * 1000) + 3000;
    }

    async waitIfNeeded(): Promise<void> {
        const now = Date.now();
        const elapsed = now - this.lastCallTime;

        if (elapsed < this.minDelayMs && this.lastCallTime > 0) {
            const waitTime = this.minDelayMs - elapsed;
            console.log(`[RateLimiter] Waiting ${(waitTime / 1000).toFixed(1)}s to respect API limits...`);
            await this.sleep(waitTime);
        }

        this.lastCallTime = Date.now();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reset the timer (useful after errors)
     */
    reset(): void {
        this.lastCallTime = 0;
    }

    /**
     * Get time until next allowed call
     */
    getTimeUntilNextCall(): number {
        const elapsed = Date.now() - this.lastCallTime;
        return Math.max(0, this.minDelayMs - elapsed);
    }
}

// Global rate limiter instance
// Free tier = 5 requests/minute
export const geminiRateLimiter = new RateLimiter(5);

// For batch mode - even slower to be safe
export const batchRateLimiter = new RateLimiter(3);
