import { z } from "zod";

/**
 * Resume upload validation
 */
export const ResumeUploadSchema = z.object({
    resume: z.instanceof(File).refine(
        (file) => file.size <= 10 * 1024 * 1024, // 10MB max
        "File size must be less than 10MB"
    ).refine(
        (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
        "File must be PDF or DOCX"
    ),
    jd: z.string().min(50, "Job description must be at least 50 characters").max(50000, "Job description is too long"),
});

/**
 * User registration validation
 */
export const SignUpSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/**
 * Sign in validation
 */
export const SignInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

/**
 * Analysis response validation
 */
export const AnalysisResponseSchema = z.object({
    final_score: z.number().min(0).max(100),
    recommendation: z.object({
        recommendation: z.enum(["strong_yes", "yes", "maybe", "no"]),
        label: z.string(),
        color: z.string(),
    }),
    ats: z.object({
        score: z.number(),
        breakdown: z.object({
            skillMatch: z.number(),
            toolMatch: z.number(),
            softMatch: z.number(),
            experienceMatch: z.number(),
            keywordDensity: z.number(),
        }),
        matched_skills: z.array(z.string()),
        missing_skills: z.array(z.string()),
    }),
    github: z.object({
        score: z.number(),
        username: z.string().nullable(),
        proof: z.array(z.string()),
        risks: z.array(z.string()),
    }),
    proof: z.object({
        score: z.number(),
        proven: z.array(z.string()),
        inferred: z.array(z.string()),
        missing: z.array(z.string()),
    }),
    quality: z.object({
        score: z.number(),
        formatting: z.number(),
        achievements: z.number(),
        clarity: z.number(),
        improvements: z.array(z.string()),
    }),
    cluster: z.object({
        type: z.enum(["specialist", "generalist", "career_switcher", "early_career", "senior_leader"]),
        confidence: z.number(),
        traits: z.array(z.string()),
    }),
    explanation: z.string(),
});

export type ResumeUpload = z.infer<typeof ResumeUploadSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
