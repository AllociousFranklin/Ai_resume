/**
 * Calendar Integration - Cal.com (Free Alternative)
 * 
 * Cal.com is a free, open-source Calendly alternative.
 * Sign up at: https://cal.com
 * 
 * API Docs: https://developer.cal.com/api
 */

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    meetingLink?: string;
}

export interface AvailableSlot {
    start: Date;
    end: Date;
}

// Cal.com API configuration
const CAL_API_KEY = process.env.CAL_COM_API_KEY;
const CAL_API_URL = "https://api.cal.com/v1";

/**
 * Get available time slots from Cal.com
 */
export async function getAvailableSlots(
    eventTypeId: string,
    startDate: Date,
    endDate: Date
): Promise<AvailableSlot[]> {
    if (!CAL_API_KEY) {
        console.log("[Calendar] Cal.com API key not configured - returning mock slots");
        return generateMockSlots(startDate, endDate);
    }

    try {
        const response = await fetch(
            `${CAL_API_URL}/availability?apiKey=${CAL_API_KEY}&eventTypeId=${eventTypeId}&startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
        );

        const data = await response.json();

        return data.slots?.map((slot: any) => ({
            start: new Date(slot.time),
            end: new Date(new Date(slot.time).getTime() + 60 * 60000) // 1 hour default
        })) || [];
    } catch (error) {
        console.error("[Calendar] Error fetching slots:", error);
        return generateMockSlots(startDate, endDate);
    }
}

/**
 * Create a booking via Cal.com
 */
export async function scheduleInterview(
    candidateEmail: string,
    candidateName: string,
    eventTypeId: string,
    startTime: Date,
    jobTitle: string
): Promise<{ bookingId: string; meetingLink: string } | null> {
    if (!CAL_API_KEY) {
        console.log("[Calendar] Cal.com API key not configured");
        // Return a mock booking for demo purposes
        return {
            bookingId: `mock-${Date.now()}`,
            meetingLink: `https://cal.com/your-username/interview?date=${startTime.toISOString()}`
        };
    }

    try {
        const response = await fetch(`${CAL_API_URL}/bookings?apiKey=${CAL_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                eventTypeId: parseInt(eventTypeId),
                start: startTime.toISOString(),
                responses: {
                    name: candidateName,
                    email: candidateEmail,
                    notes: `Interview for ${jobTitle} position`
                },
                timeZone: "Asia/Kolkata",
                language: "en"
            })
        });

        const data = await response.json();

        return {
            bookingId: data.id,
            meetingLink: data.metadata?.videoCallUrl || data.references?.[0]?.meetingUrl
        };
    } catch (error) {
        console.error("[Calendar] Error creating booking:", error);
        return null;
    }
}

/**
 * Cancel a booking
 */
export async function cancelInterview(bookingId: string): Promise<boolean> {
    if (!CAL_API_KEY) return true;

    try {
        const response = await fetch(
            `${CAL_API_URL}/bookings/${bookingId}?apiKey=${CAL_API_KEY}`,
            { method: "DELETE" }
        );
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Generate mock slots for demo when API key is not available
 */
function generateMockSlots(startDate: Date, endDate: Date): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const current = new Date(startDate);

    while (current < endDate) {
        // Skip weekends
        if (current.getDay() !== 0 && current.getDay() !== 6) {
            // 9 AM slot
            const morning = new Date(current);
            morning.setHours(9, 0, 0, 0);
            slots.push({
                start: new Date(morning),
                end: new Date(morning.getTime() + 60 * 60000)
            });

            // 2 PM slot
            const afternoon = new Date(current);
            afternoon.setHours(14, 0, 0, 0);
            slots.push({
                start: new Date(afternoon),
                end: new Date(afternoon.getTime() + 60 * 60000)
            });

            // 4 PM slot
            const evening = new Date(current);
            evening.setHours(16, 0, 0, 0);
            slots.push({
                start: new Date(evening),
                end: new Date(evening.getTime() + 60 * 60000)
            });
        }

        current.setDate(current.getDate() + 1);
    }

    return slots;
}

/**
 * HOW TO SET UP CAL.COM (FREE):
 * 
 * 1. Go to https://cal.com and sign up (FREE)
 * 2. Create an "Event Type" (e.g., "Technical Interview - 60 min")
 * 3. Go to Settings → Developer → API Keys
 * 4. Create a new API key
 * 5. Add to your .env: CAL_COM_API_KEY=your_key_here
 * 
 * That's it! No credit card required.
 */
