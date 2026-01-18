import { NextRequest, NextResponse } from "next/server";
import { processBatch } from "@/lib/batch-processor";
import { getCacheStats } from "@/lib/cache";

export const maxDuration = 300; // 5 minutes max for batch processing

/**
 * POST /api/batch - Process multiple resumes at once
 * 
 * Accepts:
 * - Multiple resume files (PDF/DOCX)
 * - Single job description text
 * 
 * Returns:
 * - Ranked list of candidates
 * - Full analysis for each (click to view)
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const formData = await req.formData();

        const jdText = formData.get("jd") as string;
        if (!jdText) {
            return NextResponse.json(
                { error: "Job Description is required" },
                { status: 400 }
            );
        }

        // Get all resume files
        const files: { buffer: Buffer; name: string }[] = [];

        // FormData can have multiple entries with same key
        const entries = formData.getAll("resumes");

        for (const entry of entries) {
            if (entry instanceof File) {
                const buffer = Buffer.from(await entry.arrayBuffer());
                files.push({
                    buffer,
                    name: entry.name
                });
            }
        }

        // Also check for numbered entries (resumes[0], resumes[1], etc.)
        for (let i = 0; i < 50; i++) {
            const file = formData.get(`resumes[${i}]`) as File | null;
            if (file instanceof File) {
                const buffer = Buffer.from(await file.arrayBuffer());
                files.push({
                    buffer,
                    name: file.name
                });
            }

            // Also try resume_0, resume_1 format
            const altFile = formData.get(`resume_${i}`) as File | null;
            if (altFile instanceof File) {
                const buffer = Buffer.from(await altFile.arrayBuffer());
                files.push({
                    buffer,
                    name: altFile.name
                });
            }
        }

        if (files.length === 0) {
            return NextResponse.json(
                { error: "At least one resume file is required" },
                { status: 400 }
            );
        }

        if (files.length > 50) {
            return NextResponse.json(
                { error: "Maximum 50 resumes per batch" },
                { status: 400 }
            );
        }

        console.log(`[Batch API] Processing ${files.length} resumes`);

        // Process the batch
        const result = await processBatch(files, jdText, 5);

        // Get cache stats
        const cacheStats = getCacheStats();

        console.log(`[Batch API] Complete. Total time: ${Date.now() - startTime}ms`);

        return NextResponse.json({
            success: true,
            batch: result,
            cache_stats: cacheStats,
            processing_time_ms: Date.now() - startTime
        });

    } catch (error: any) {
        console.error(`[Batch API] Error:`, error);
        return NextResponse.json(
            { error: error?.message || "Batch processing failed" },
            { status: 500 }
        );
    }
}
