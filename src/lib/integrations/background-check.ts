/**
 * Background Verification - Manual Workflow
 * 
 * REALITY: There are NO free background check APIs.
 * All require business verification + payment (~$35-150/check).
 * 
 * This module implements a MANUAL verification workflow that:
 * 1. Generates verification request to candidate
 * 2. Tracks what documents are pending
 * 3. Allows recruiter to mark as verified
 */

export type VerificationStatus =
    | "not_started"
    | "pending_documents"
    | "under_review"
    | "verified"
    | "flagged"
    | "rejected";

export type DocumentType =
    | "government_id"
    | "education_certificate"
    | "employment_letter"
    | "address_proof"
    | "professional_license";

export interface VerificationRequest {
    id: string;
    candidateEmail: string;
    candidateName: string;
    requestedDocuments: DocumentType[];
    status: VerificationStatus;
    createdAt: Date;
    updatedAt: Date;
    notes: string[];
    verifiedBy?: string;
}

export interface DocumentSubmission {
    type: DocumentType;
    fileName: string;
    uploadedAt: Date;
    verified: boolean;
}

// In-memory storage (would be database in production)
const verifications: Map<string, VerificationRequest> = new Map();

/**
 * Create a new verification request
 */
export function createVerificationRequest(
    candidateEmail: string,
    candidateName: string,
    requestedDocuments: DocumentType[]
): VerificationRequest {
    const id = `ver-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const request: VerificationRequest = {
        id,
        candidateEmail,
        candidateName,
        requestedDocuments,
        status: "not_started",
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: [`Verification request created for ${candidateName}`]
    };

    verifications.set(id, request);

    return request;
}

/**
 * Generate email template to send to candidate
 */
export function generateVerificationEmail(request: VerificationRequest): {
    subject: string;
    body: string;
} {
    const documentList = request.requestedDocuments
        .map(doc => `• ${formatDocumentType(doc)}`)
        .join("\n");

    return {
        subject: `Document Verification Required - ${request.candidateName}`,
        body: `
Dear ${request.candidateName},

As part of our hiring process, we need to verify some documents. Please provide the following:

${documentList}

Please reply to this email with the requested documents attached.

Requirements:
- Clear, readable scans or photos
- All documents should be current and valid
- Government IDs should show your full legal name

Thank you for your cooperation.

Best regards,
Hiring Team

---
Verification ID: ${request.id}
        `.trim()
    };
}

/**
 * Update verification status
 */
export function updateVerificationStatus(
    id: string,
    status: VerificationStatus,
    note?: string,
    verifiedBy?: string
): VerificationRequest | null {
    const request = verifications.get(id);
    if (!request) return null;

    request.status = status;
    request.updatedAt = new Date();
    if (note) request.notes.push(`[${new Date().toISOString()}] ${note}`);
    if (verifiedBy) request.verifiedBy = verifiedBy;

    verifications.set(id, request);

    return request;
}

/**
 * Get verification by ID
 */
export function getVerification(id: string): VerificationRequest | null {
    return verifications.get(id) || null;
}

/**
 * List all verifications
 */
export function listVerifications(): VerificationRequest[] {
    return Array.from(verifications.values());
}

/**
 * Format document type for display
 */
function formatDocumentType(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
        government_id: "Government-issued ID (Passport, Driver's License, or National ID)",
        education_certificate: "Highest Education Certificate/Degree",
        employment_letter: "Employment Verification Letter from previous employer",
        address_proof: "Proof of Address (Utility bill, Bank statement)",
        professional_license: "Professional License/Certification"
    };
    return labels[type] || type;
}

/**
 * Get standard document packages
 */
export function getVerificationPackages(): {
    name: string;
    documents: DocumentType[];
    description: string;
}[] {
    return [
        {
            name: "Basic",
            documents: ["government_id"],
            description: "Identity verification only"
        },
        {
            name: "Standard",
            documents: ["government_id", "education_certificate", "employment_letter"],
            description: "Identity, education, and work history"
        },
        {
            name: "Comprehensive",
            documents: ["government_id", "education_certificate", "employment_letter", "address_proof", "professional_license"],
            description: "Full verification for senior roles"
        }
    ];
}

/**
 * PAID ALTERNATIVES (If budget allows later):
 * 
 * 1. Checkr (https://checkr.com)
 *    - Most popular API
 *    - ~$35-100 per check
 *    - Good documentation
 * 
 * 2. GoodHire (https://www.goodhire.com)
 *    - SMB focused
 *    - ~$30-80 per check
 * 
 * 3. Certn (https://certn.co)
 *    - Modern API
 *    - Pay-per-check pricing
 * 
 * All require: Business verification + billing setup
 */
