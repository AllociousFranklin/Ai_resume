import { NextRequest, NextResponse } from "next/server";
import {
    registerWebhook,
    listWebhooks,
    deleteWebhook,
    WebhookEventType
} from "@/lib/integrations/webhooks";

/**
 * GET /api/webhooks - List all webhook subscriptions
 */
export async function GET() {
    const webhooks = listWebhooks();
    return NextResponse.json({ webhooks });
}

/**
 * POST /api/webhooks - Register a new webhook
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { url, events } = body as {
            url: string;
            events: WebhookEventType[];
        };

        if (!url || !events || !Array.isArray(events)) {
            return NextResponse.json(
                { error: "URL and events array are required" },
                { status: 400 }
            );
        }

        const webhook = registerWebhook(url, events);

        return NextResponse.json({
            message: "Webhook registered successfully",
            webhook: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
                // Secret is only shown once at creation
                secret: webhook.secret
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to register webhook" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/webhooks?id=xxx - Delete a webhook
 */
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Webhook ID is required" },
            { status: 400 }
        );
    }

    const deleted = deleteWebhook(id);

    if (!deleted) {
        return NextResponse.json(
            { error: "Webhook not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ message: "Webhook deleted successfully" });
}
