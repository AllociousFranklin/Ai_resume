/**
 * Webhook System
 * 
 * This module handles incoming and outgoing webhooks for integrations.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export type WebhookEventType =
    | "candidate.analyzed"
    | "candidate.qualified"
    | "candidate.rejected"
    | "interview.scheduled"
    | "interview.cancelled"
    | "background_check.completed"
    | "background_check.failed";

export interface WebhookPayload {
    event: WebhookEventType;
    timestamp: string;
    data: Record<string, any>;
}

export interface WebhookSubscription {
    id: string;
    url: string;
    events: WebhookEventType[];
    secret: string;
    active: boolean;
    createdAt: Date;
}

// In-memory storage (would be database in production)
const subscriptions: Map<string, WebhookSubscription> = new Map();

/**
 * Register a new webhook subscription
 */
export function registerWebhook(
    url: string,
    events: WebhookEventType[]
): WebhookSubscription {
    const id = `wh_${crypto.randomBytes(16).toString("hex")}`;
    const secret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

    const subscription: WebhookSubscription = {
        id,
        url,
        events,
        secret,
        active: true,
        createdAt: new Date()
    };

    subscriptions.set(id, subscription);

    console.log(`[Webhook] Registered new webhook: ${id} for ${url}`);

    return subscription;
}

/**
 * Send webhook to all subscribers for an event
 */
export async function triggerWebhook(
    event: WebhookEventType,
    data: Record<string, any>
): Promise<{ success: number; failed: number }> {
    const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data
    };

    let success = 0;
    let failed = 0;

    for (const [id, sub] of subscriptions) {
        if (!sub.active || !sub.events.includes(event)) continue;

        try {
            const signature = generateSignature(payload, sub.secret);

            const response = await fetch(sub.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": event,
                    "X-Webhook-Id": id
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                success++;
                console.log(`[Webhook] Sent ${event} to ${sub.url}`);
            } else {
                failed++;
                console.error(`[Webhook] Failed to send ${event} to ${sub.url}: ${response.status}`);
            }
        } catch (error) {
            failed++;
            console.error(`[Webhook] Error sending ${event} to ${sub.url}:`, error);
        }
    }

    return { success, failed };
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest("hex")}`;
}

/**
 * Verify incoming webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature.replace("sha256=", "")),
        Buffer.from(expected)
    );
}

/**
 * List all webhook subscriptions
 */
export function listWebhooks(): WebhookSubscription[] {
    return Array.from(subscriptions.values());
}

/**
 * Delete a webhook subscription
 */
export function deleteWebhook(id: string): boolean {
    return subscriptions.delete(id);
}

/**
 * Update webhook subscription
 */
export function updateWebhook(
    id: string,
    updates: Partial<Pick<WebhookSubscription, "url" | "events" | "active">>
): WebhookSubscription | null {
    const sub = subscriptions.get(id);
    if (!sub) return null;

    const updated = { ...sub, ...updates };
    subscriptions.set(id, updated);
    return updated;
}

/**
 * Event helper functions
 */
export async function onCandidateAnalyzed(candidateData: any) {
    return triggerWebhook("candidate.analyzed", candidateData);
}

export async function onCandidateQualified(candidateData: any) {
    return triggerWebhook("candidate.qualified", candidateData);
}

export async function onInterviewScheduled(interviewData: any) {
    return triggerWebhook("interview.scheduled", interviewData);
}
