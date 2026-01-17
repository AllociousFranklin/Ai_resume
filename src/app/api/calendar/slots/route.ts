import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, scheduleInterview } from "@/lib/integrations/calendar";

/**
 * GET /api/calendar/slots - Get available interview slots
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const eventTypeId = searchParams.get("eventTypeId") || "primary";
    const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : new Date();
    const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

    try {
        const slots = await getAvailableSlots(eventTypeId, startDate, endDate);

        return NextResponse.json({
            slots: slots.map(slot => ({
                start: slot.start.toISOString(),
                end: slot.end.toISOString()
            })),
            eventTypeId,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to fetch available slots" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/calendar/slots - Schedule an interview
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            candidateEmail,
            candidateName,
            eventTypeId,
            startTime,
            jobTitle
        } = body;

        if (!candidateEmail || !candidateName || !eventTypeId || !startTime || !jobTitle) {
            return NextResponse.json(
                { error: "All fields are required: candidateEmail, candidateName, eventTypeId, startTime, jobTitle" },
                { status: 400 }
            );
        }

        const event = await scheduleInterview(
            candidateEmail,
            candidateName,
            eventTypeId,
            new Date(startTime),
            jobTitle
        );

        if (!event) {
            return NextResponse.json(
                { error: "Failed to schedule interview" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Interview scheduled successfully",
            event: {
                bookingId: event.bookingId,
                meetingLink: event.meetingLink
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to schedule interview" },
            { status: 500 }
        );
    }
}
