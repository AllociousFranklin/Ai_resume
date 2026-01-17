# 🎯 SkillSnap AI - Judge Q&A Preparation Guide

**Purpose:** Hackathon/Presentation Defense  
**Last Updated:** January 18, 2026  
**Preparation Time:** 15-minute read for complete mastery

---

## Quick Answer Cheat Sheet

| Question # | Topic | One-Line Answer |
|------------|-------|-----------------|
| 1 | Workflow | Upload → Parse → AI Extract → GitHub Verify → Score → Predict → Display |
| 2 | Skill Extraction | Gemini AI with structured JSON prompt returns categorized skills |
| 3 | GitHub Detection | Regex patterns detect github.com/username in resume text |
| 4 | Proof Classification | Direct = GitHub language match, Inferred = related language, Missing = no evidence |
| 5 | Proof Index | (proven + inferred×0.5) / total × 100 |
| 6 | GitHub Scoring | 40% originals + 30% activity + 20% stars + 10% diversity |
| 7 | Fork Detection | Count forked repos, penalize if forks > originals |
| 8 | ATS Calculation | Skill match + Tool match + Soft match + Experience fit |
| 9 | Final Score | ATS×30% + GitHub×25% + Proof×20% + Quality×15% + Experience×10% |
| 10 | Gap Analysis | Critical = JD required skills, Nice-to-have = preferred skills |
| 11 | No GitHub | GitHub score = 0, rely on ATS + Quality scores |
| 12 | Bias Mitigation | Regex-based PII redaction before analysis |
| 13 | Heuristic vs AI | AI: skill extraction, explanation. Heuristic: scoring, verification |
| 14 | Limitations | GitHub-dependent, heuristic ML, no database |
| 15 | 6-Hour MVP | Parser + Gemini + Basic Scoring + Simple UI |

---

## Detailed Answers

---

### 1. "Explain the complete end-to-end workflow of SkillSnap AI in simple terms, from resume upload to final score generation."

#### The Simple Answer (30 seconds):
> "A recruiter uploads a resume and job description. Our system parses the resume, uses AI to extract skills, fetches the candidate's GitHub profile for verification, calculates multiple scores including a 'Proof Index' showing what percentage of claimed skills are backed by real code, runs ML predictions for success probability, and displays everything in a beautiful dashboard - all in under 30 seconds."

#### The Technical Flow (For Follow-ups):

```
┌─────────────────────────────────────────────────────────────────┐
│                    SkillSnap AI Workflow                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: UPLOAD (Client)
├── User drags PDF/DOCX resume
├── User pastes Job Description text
└── Form validation (Zod schemas)
         │
         ▼
Step 2: INGESTION (Server - ingestion.ts)
├── Detect file type (PDF or DOCX)
├── Extract raw text (pdf-parse or mammoth)
├── Find links via regex:
│   └── GitHub: /github\.com\/[\w-]+/
└── Return: { text, links, wordCount }
         │
         ▼
Step 3: AI EXTRACTION (Server - gemini.ts)
├── Construct prompt with resume + JD
├── Send to Gemini 2.5 Flash
├── Parse JSON response:
│   ├── resume.technical_skills
│   ├── resume.tools
│   ├── resume.soft_skills
│   ├── jd.required_skills
│   └── quality scores
└── Handle rate limits with retry
         │
         ▼
Step 4: GITHUB ANALYSIS (Server - github.ts)
├── Extract username from detected link
├── Fetch profile via Octokit
├── Fetch repositories (up to 100)
├── Calculate metrics:
│   ├── Original vs Fork ratio
│   ├── Language distribution
│   ├── Star count
│   └── Activity recency
└── Return: { score, stats, proof, risks }
         │
         ▼
Step 5: VERIFICATION (Server - analysis.ts)
├── Compare resume skills → GitHub languages
├── Apply skill mappings (React → JavaScript)
├── Categorize each skill:
│   ├── Proven (direct match)
│   ├── Inferred (related match)
│   └── Missing (no evidence)
└── Calculate Proof Index
         │
         ▼
Step 6: SCORING (Server - scoring.ts)
├── ATS Score (JD match)
├── GitHub Score (code quality)
├── Proof Score (verification %)
├── Quality Score (resume presentation)
├── Final Fit Score (weighted combo)
└── Hiring Recommendation
         │
         ▼
Step 7: PREDICTIONS (Server - predictions.ts)
├── Success probability
├── 2-year retention likelihood
├── Growth potential
└── Ramp-up time estimate
         │
         ▼
Step 8: RESPONSE (Client - Dashboard.tsx)
├── Animate score reveal
├── Display skill breakdown
├── Show predictions
├── Render gap analysis
└── Present recommendation
```

**Key Insight to Mention:**
> "What makes us different is Step 5 - we don't just trust resumes. We verify claims against actual code. If you say you know React but your GitHub shows no JavaScript, we flag that."

---

### 2. "How exactly are technical, tool, and soft skills extracted from resumes and job descriptions? What prompt structure is used and what format is returned?"

#### The Answer:

We use **Google Gemini 2.5 Flash** with a carefully engineered prompt that forces structured JSON output.

#### The Actual Prompt Structure:

```javascript
const prompt = `
You are an expert technical recruiter. Analyze the following resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Extract the following in JSON format:
{
  "resume": {
    "technical_skills": ["React", "Python", ...],
    "tools": ["Git", "Docker", ...],
    "soft_skills": ["Leadership", "Communication", ...],
    "experience_years": 5,
    "education_level": "bachelors"
  },
  "jd": {
    "technical_skills": [...],
    "tools": [...],
    "soft_skills": [...]
  },
  "quality": {
    "score": 75,
    "formatting": 80,
    "achievements": 70,
    "clarity": 75,
    "improvements": ["Add quantified achievements", ...]
  },
  "cluster": {
    "type": "specialist",  // or generalist, career_switcher, etc.
    "confidence": 0.85,
    "traits": ["Deep expertise in React ecosystem", ...]
  }
}

Rules:
- Remove duplicates (React and React.js are the same)
- Normalize technologies (Vue.js → Vue)
- Be conservative with experience estimates
- cluster.type must be one of: specialist, generalist, career_switcher, early_career, senior_leader
`;
```

#### Why This Works:
1. **Explicit JSON format** - No ambiguity in parsing
2. **Dual extraction** - Both resume AND JD skills for comparison
3. **Normalization rules** - AI handles synonyms
4. **Quality assessment** - Built into single request
5. **Clustering** - Candidate type in same call (efficient)

#### Sample Response:
```json
{
  "resume": {
    "technical_skills": ["JavaScript", "React", "Node.js", "Python"],
    "tools": ["Git", "Docker", "AWS", "PostgreSQL"],
    "soft_skills": ["Team Leadership", "Agile", "Communication"]
  },
  "jd": {
    "technical_skills": ["React", "TypeScript", "GraphQL"],
    "tools": ["AWS", "Kubernetes"],
    "soft_skills": ["Collaboration", "Problem Solving"]
  },
  "quality": {
    "score": 72,
    "formatting": 80,
    "achievements": 65,
    "clarity": 70,
    "improvements": [
      "Add quantified impact metrics",
      "Include specific project outcomes"
    ]
  },
  "cluster": {
    "type": "specialist",
    "confidence": 0.82,
    "traits": ["Frontend-focused", "React ecosystem expert"]
  }
}
```

---

### 3. "How does SkillSnap AI identify and verify a candidate's GitHub profile from a resume?"

#### The Answer:

**Two-step process: Detection → Verification**

#### Step 1: Detection (Regex-based)

```javascript
// In ingestion.ts
const patterns = {
  github: /github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)/gi,
  // Also catches:
  // - github.com/username
  // - www.github.com/username  
  // - https://github.com/username
};

function extractLinks(text: string) {
  const matches = text.match(patterns.github);
  if (matches) {
    // Extract just the username
    const username = matches[0].split('/').pop();
    return { github: username };
  }
  return { github: null };
}
```

#### Step 2: Verification (API-based)

```javascript
// In github.ts
async function analyzeGitHubProfile(username: string) {
  // 1. Verify user exists
  const user = await octokit.rest.users.getByUsername({ username });
  
  if (!user) return null; // Invalid profile
  
  // 2. Fetch repositories
  const repos = await octokit.rest.repos.listForUser({
    username,
    per_page: 100,
    sort: 'updated'
  });
  
  // 3. Extract and analyze...
}
```

#### Edge Cases Handled:
| Scenario | How We Handle It |
|----------|------------------|
| No GitHub link | github_score = 0, note "No GitHub found" |
| Invalid username | Graceful fallback, mark as unverified |
| Private profile | Can only analyze public repos |
| Organization link | Extract username if embedded |

---

### 4. "How does the system decide whether a claimed skill is proven, inferred, or missing?"

#### The Answer:

This is the **core differentiator** of SkillSnap AI. Here's the exact logic:

```javascript
// In analysis.ts

function verifySkills(resumeSkills: string[], githubLanguages: string[]) {
  const results = {
    proven: [],
    inferred: [],
    missing: []
  };
  
  // Skill inference mappings
  const skillMappings = {
    "React": ["JavaScript", "TypeScript"],
    "Next.js": ["JavaScript", "TypeScript", "React"],
    "Vue": ["JavaScript", "TypeScript"],
    "Angular": ["TypeScript"],
    "Django": ["Python"],
    "Flask": ["Python"],
    "FastAPI": ["Python"],
    "Rails": ["Ruby"],
    "Spring Boot": ["Java", "Kotlin"],
    "Express": ["JavaScript", "TypeScript"],
    "TensorFlow": ["Python"],
    "PyTorch": ["Python"],
    // ... 30+ mappings
  };
  
  for (const skill of resumeSkills) {
    const normalizedSkill = skill.toLowerCase();
    const normalizedGithub = githubLanguages.map(l => l.toLowerCase());
    
    // PROVEN: Direct match
    if (normalizedGithub.includes(normalizedSkill)) {
      results.proven.push(skill);
    }
    // INFERRED: Related language found
    else if (skillMappings[skill]) {
      const relatedLangs = skillMappings[skill].map(l => l.toLowerCase());
      const hasEvidence = relatedLangs.some(lang => 
        normalizedGithub.includes(lang)
      );
      if (hasEvidence) {
        results.inferred.push(skill);
      } else {
        results.missing.push(skill);
      }
    }
    // MISSING: No evidence
    else {
      results.missing.push(skill);
    }
  }
  
  return results;
}
```

#### Visual Example:

```
Resume Claims: ["React", "Python", "Kubernetes", "AWS"]
GitHub Languages: ["JavaScript", "TypeScript", "Python", "HTML", "CSS"]

Analysis:
┌─────────────┬────────────┬─────────────────────────────────────┐
│ Skill       │ Category   │ Reason                              │
├─────────────┼────────────┼─────────────────────────────────────┤
│ React       │ INFERRED   │ JavaScript found (React requires JS)│
│ Python      │ PROVEN     │ Python directly found in repos      │
│ Kubernetes  │ MISSING    │ No k8s-related code found           │
│ AWS         │ MISSING    │ No infrastructure code visible      │
└─────────────┴────────────┴─────────────────────────────────────┘
```

**Key Nuance:** Inferred skills get **50% credit** in Proof Index. We acknowledge the signal without fully trusting it.

---

### 5. "What is the exact formula used to calculate the Proof Index, and why was this weighting chosen?"

#### The Formula:

```
Proof Index = (Proven + Inferred × 0.5) / Total Skills × 100
```

#### Example Calculation:

```
Proven Skills: 4
Inferred Skills: 3
Missing Skills: 2
Total Skills: 9

Proof Index = (4 + 3×0.5) / 9 × 100
            = (4 + 1.5) / 9 × 100
            = 5.5 / 9 × 100
            = 61.1%
```

#### Why These Weights?

| Weight | Reasoning |
|--------|-----------|
| **Proven = 100%** | Direct GitHub evidence is strong signal |
| **Inferred = 50%** | Related evidence is partial validation |
| **Missing = 0%** | No evidence means unverified claim |

#### Alternative Weights Considered:

| Option | Weights | Why Rejected |
|--------|---------|--------------|
| Binary | 100/0/0 | Too harsh, penalizes framework users |
| Generous | 100/80/0 | Over-credits indirect evidence |
| **Chosen** | 100/50/0 | Balanced - acknowledges skill ecosystems |

**The Key Insight:**
> "If you claim React but only have JavaScript in GitHub, that's not worthless - React IS JavaScript. But it's not proof either. 50% captures this nuance."

---

### 6. "How does the GitHub scoring system work? What factors influence the score the most?"

#### The Formula:

```javascript
function calculateGitHubScore(stats) {
  let score = 0;
  
  // 1. ORIGINAL WORK (40% weight)
  const originalRatio = stats.originalRepos / stats.totalRepos;
  score += originalRatio * 40;  // Max 40 points
  
  // 2. RECENT ACTIVITY (30% weight)
  const activeRepos = stats.activeReposLast6Months;
  const activityScore = Math.min(activeRepos / 5, 1) * 30;  // 5+ active = full marks
  score += activityScore;  // Max 30 points
  
  // 3. COMMUNITY VALIDATION (20% weight)
  const starScore = Math.min(stats.totalStars / 50, 1) * 20;  // 50+ stars = full marks
  score += starScore;  // Max 20 points
  
  // 4. LANGUAGE DIVERSITY (10% weight)
  const languages = Object.keys(stats.languages).length;
  const diversityScore = Math.min(languages / 5, 1) * 10;  // 5+ languages = full marks
  score += diversityScore;  // Max 10 points
  
  return Math.round(score);
}
```

#### Breakdown:

| Factor | Weight | Max Points | What Earns Full Marks |
|--------|--------|------------|----------------------|
| Original Work | 40% | 40 | All repos are original (not forked) |
| Recent Activity | 30% | 30 | 5+ repos with commits in last 6 months |
| Stars | 20% | 20 | 50+ total stars across repos |
| Language Diversity | 10% | 10 | 5+ programming languages used |

#### Score Interpretation:

| Score | Label | Meaning |
|-------|-------|---------|
| 80-100 | Excellent | Active developer with proven impact |
| 60-79 | Good | Regular contributor, some traction |
| 40-59 | Moderate | Some activity, needs more proof |
| 0-39 | Weak | Inactive or fork-heavy profile |

---

### 7. "How does SkillSnap AI distinguish between original projects and tutorial/forked repositories?"

#### The Answer:

We use **three signals** to detect tutorial/forked code:

```javascript
function analyzeRepoQuality(repos) {
  let originalCount = 0;
  let forkCount = 0;
  let tutorialRisk = 0;
  
  for (const repo of repos) {
    // Signal 1: GitHub's fork flag
    if (repo.fork) {
      forkCount++;
      continue;
    }
    
    // Signal 2: Common tutorial names
    const tutorialPatterns = [
      /todo[-_]?app/i,
      /weather[-_]?app/i,
      /calculator/i,
      /hello[-_]?world/i,
      /tutorial/i,
      /course[-_]?project/i,
      /bootcamp/i,
      /learning[-_]/i,
      /practice/i
    ];
    
    const isTutorial = tutorialPatterns.some(p => p.test(repo.name));
    if (isTutorial) tutorialRisk++;
    
    // Signal 3: Low-effort repos (no stars, minimal commits)
    const isSubstantial = repo.stargazers_count > 0 || 
                          repo.size > 100;  // KB
    
    if (!isTutorial && isSubstantial) {
      originalCount++;
    }
  }
  
  return {
    originalCount,
    forkCount,
    tutorialRisk,
    // Warning if forks > originals
    risks: forkCount > originalCount ? ["High fork ratio - verify originality"] : []
  };
}
```

#### Risk Flags Generated:

| Condition | Risk Flag |
|-----------|-----------|
| Forks > Originals | "High fork ratio - may indicate learning stage" |
| 3+ tutorial-named repos | "Tutorial-heavy portfolio detected" |
| < 3 original repos | "Limited original work evidence" |
| All repos < 6 months old | "Recent GitHub activity only" |

**Why This Matters:**
> "A portfolio of 20 forked repositories tells us nothing. We want to see what YOU built, not what you cloned."

---

### 8. "How is ATS alignment calculated between a resume and job description?"

#### The Formula:

```javascript
function calculateATSScore(resumeSkills, jdSkills) {
  // Extract skill sets
  const resumeTech = new Set(resumeSkills.technical.map(s => s.toLowerCase()));
  const resumeTools = new Set(resumeSkills.tools.map(s => s.toLowerCase()));
  const resumeSoft = new Set(resumeSkills.soft.map(s => s.toLowerCase()));
  
  const jdTech = new Set(jdSkills.technical.map(s => s.toLowerCase()));
  const jdTools = new Set(jdSkills.tools.map(s => s.toLowerCase()));
  const jdSoft = new Set(jdSkills.soft.map(s => s.toLowerCase()));
  
  // Calculate matches
  const techMatch = intersection(resumeTech, jdTech).size / jdTech.size;
  const toolMatch = intersection(resumeTools, jdTools).size / jdTools.size;
  const softMatch = intersection(resumeSoft, jdSoft).size / jdSoft.size;
  
  // Experience fit
  const expMatch = Math.min(resumeSkills.experience / jdSkills.minExperience, 1);
  
  // Weighted combination
  const atsScore = (
    techMatch * 40 +    // 40% weight
    toolMatch * 25 +    // 25% weight
    softMatch * 15 +    // 15% weight
    expMatch * 20       // 20% weight
  );
  
  return {
    score: Math.round(atsScore),
    breakdown: {
      technicalMatch: Math.round(techMatch * 100),
      toolMatch: Math.round(toolMatch * 100),
      softMatch: Math.round(softMatch * 100),
      experienceMatch: Math.round(expMatch * 100)
    }
  };
}
```

#### Weight Justification:

| Component | Weight | Why |
|-----------|--------|-----|
| Technical Skills | 40% | Core job requirements |
| Tools | 25% | Day-one productivity |
| Soft Skills | 15% | Team fit (harder to verify) |
| Experience | 20% | Ramp-up time indicator |

#### Example:

```
JD Requires: React, TypeScript, Node.js, Docker, AWS, Leadership
Resume Has: React, JavaScript, Python, Docker, Communication

Technical Match: 1/3 = 33% (React matches, missing TS, Node.js)
Tool Match: 1/2 = 50% (Docker matches, missing AWS)
Soft Match: 0/1 = 0% (Communication ≠ Leadership)
Experience: 100% (meets requirement)

ATS Score = (33×0.4) + (50×0.25) + (0×0.15) + (100×0.2)
          = 13.2 + 12.5 + 0 + 20
          = 45.7 → 46
```

---

### 9. "What is the Final Fit Score formula, and why were these weightings selected?"

#### The Formula:

```javascript
function calculateFinalScore(scores) {
  const finalScore = (
    scores.ats * 0.30 +      // Job alignment
    scores.github * 0.25 +   // Technical proof
    scores.proof * 0.20 +    // Skill verification
    scores.quality * 0.15 +  // Resume quality
    scores.experience * 0.10 // Years of experience
  );
  
  return Math.round(finalScore);
}
```

#### Weight Distribution:

```
┌────────────────────────────────────────────────────────┐
│                 Final Fit Score                         │
├──────────────────┬─────────────────────────────────────┤
│ ATS Alignment    │ ████████████████████████ 30%        │
│ GitHub Impact    │ ████████████████████ 25%            │
│ Proof Index      │ ████████████████ 20%                │
│ Resume Quality   │ ████████████ 15%                    │
│ Experience       │ ████████ 10%                        │
└──────────────────┴─────────────────────────────────────┘
```

#### Why These Weights?

| Component | Weight | Rationale |
|-----------|--------|-----------|
| **ATS (30%)** | Highest | Must match job requirements first |
| **GitHub (25%)** | High | Actual coding ability matters |
| **Proof (20%)** | Medium-High | Verification is our differentiator |
| **Quality (15%)** | Medium | Good communication, but less critical |
| **Experience (10%)** | Lowest | Can be misleading (years ≠ expertise) |

**Key Design Decision:**
> "We intentionally weighted Experience lowest. 5 years at a boring job is worth less than 2 years of active GitHub contributions."

---

### 10. "How does the system perform skill gap analysis, and how are 'critical' vs 'nice-to-have' skills determined?"

#### The Logic:

```javascript
function analyzeSkillGaps(resumeSkills, jdSkills, jdText) {
  const gaps = {
    critical: [],
    niceToHave: []
  };
  
  // Keywords indicating critical skills
  const criticalIndicators = [
    "required",
    "must have",
    "essential",
    "mandatory",
    "minimum",
    "need",
    "core"
  ];
  
  // Keywords indicating nice-to-have
  const niceToHaveIndicators = [
    "preferred",
    "bonus",
    "plus",
    "nice to have",
    "ideally",
    "advantageous",
    "desirable"
  ];
  
  const jdLower = jdText.toLowerCase();
  const missingSkills = jdSkills.filter(s => 
    !resumeSkills.includes(s.toLowerCase())
  );
  
  for (const skill of missingSkills) {
    // Check context around skill mention
    const skillPos = jdLower.indexOf(skill.toLowerCase());
    const context = jdLower.substring(
      Math.max(0, skillPos - 50), 
      Math.min(jdLower.length, skillPos + 50)
    );
    
    const isCritical = criticalIndicators.some(ind => 
      context.includes(ind)
    );
    const isNice = niceToHaveIndicators.some(ind => 
      context.includes(ind)
    );
    
    if (isCritical || (!isNice && skillPos < 500)) {
      // Early in JD or marked required = critical
      gaps.critical.push(skill);
    } else {
      gaps.niceToHave.push(skill);
    }
  }
  
  return gaps;
}
```

#### Classification Rules:

| Rule | Classification |
|------|----------------|
| Appears with "required", "must have", etc. | Critical |
| Appears in first 500 characters of JD | Critical (usually requirements) |
| Appears with "preferred", "bonus", etc. | Nice-to-have |
| Appears later in JD without qualifiers | Nice-to-have |

#### Example Output:

```json
{
  "critical": ["Kubernetes", "TypeScript"],
  "niceToHave": ["GraphQL", "Redis"],
  "matchPercentage": 65,
  "recommendation": "Strong candidate but needs K8s/TS training"
}
```

---

### 11. "How does SkillSnap AI handle resumes without GitHub links?"

#### The Answer:

If no GitHub is found, we **gracefully degrade** while maintaining utility:

```javascript
function handleNoGitHub(analysisResult) {
  return {
    github: {
      score: 0,
      username: null,
      message: "No GitHub profile detected in resume",
      stats: null,
      // Clear indicators this is missing
      proof: [],
      risks: ["Skill verification unavailable - no GitHub linked"]
    },
    
    // Proof Index becomes binary
    proof: {
      score: 0,  // Cannot verify without evidence
      proven: [],
      inferred: [],
      missing: analysisResult.resumeSkills  // All skills unverified
    },
    
    // Adjust final score weights
    finalScore: recalculateWithoutGitHub(analysisResult),
    
    // Add to recommendation
    recommendation: {
      ...analysisResult.recommendation,
      notes: ["⚠️ Skills not verified - no GitHub profile found"]
    }
  };
}

function recalculateWithoutGitHub(result) {
  // Redistribute weights when GitHub is missing
  // Original: ATS 30%, GitHub 25%, Proof 20%, Quality 15%, Exp 10%
  // New: ATS 45%, Quality 30%, Experience 25%
  
  return (
    result.ats * 0.45 +
    result.quality * 0.30 +
    result.experience * 0.25
  );
}
```

#### What the User Sees:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ LIMITED VERIFICATION                                    │
│                                                             │
│  No GitHub profile was found in this resume. Skill          │
│  verification is unavailable.                               │
│                                                             │
│  Recommendation: Request portfolio or coding test.          │
└─────────────────────────────────────────────────────────────┘
```

**Key Point:**
> "We don't penalize candidates without GitHub. We just clearly indicate that verification isn't possible. The recruiter can then request a coding test or portfolio."

---

### 12. "How does the bias mitigation / blind screening feature work technically?"

#### The Technical Implementation:

```javascript
// In blind-screening.ts

const PATTERNS = {
  email: /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/gi,
  phone: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  address: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|boulevard|blvd)[\w\s,]*\d{5}/gi,
  linkedin: /linkedin\.com\/in\/[\w-]+/gi,
  // Name detection: first line if matches pattern
  name: /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/m,
  // Age indicators
  age: /\b(age[:\s]*\d{2}|born[:\s]*\d{4}|\d{2}\s*years?\s*old)\b/gi,
  // Gender indicators
  gender: /\b(he|she|him|her|his|hers|mr\.|mrs\.|ms\.)\b/gi,
  // Photo indicators
  photo: /\[?photo\]?|\[?image\]?|headshot/gi
};

function redactResume(text, options = {}) {
  const defaults = {
    redactEmail: true,
    redactPhone: true,
    redactAddress: true,
    redactName: true,
    redactAge: true,
    redactGender: true,
    redactLinkedIn: true
  };
  
  const opts = { ...defaults, ...options };
  let redacted = text;
  const redactions = [];
  
  if (opts.redactEmail) {
    const matches = redacted.match(PATTERNS.email) || [];
    redacted = redacted.replace(PATTERNS.email, "[EMAIL]");
    if (matches.length) redactions.push({ type: "email", count: matches.length });
  }
  
  if (opts.redactPhone) {
    const matches = redacted.match(PATTERNS.phone) || [];
    redacted = redacted.replace(PATTERNS.phone, "[PHONE]");
    if (matches.length) redactions.push({ type: "phone", count: matches.length });
  }
  
  if (opts.redactName) {
    const firstLine = redacted.split('\n')[0];
    if (PATTERNS.name.test(firstLine)) {
      redacted = redacted.replace(firstLine, "[CANDIDATE NAME]");
      redactions.push({ type: "name", count: 1 });
    }
  }
  
  // ... more redactions
  
  return {
    text: redacted,
    redactions,
    biasRisk: calculateBiasRisk(redactions)
  };
}

function calculateBiasRisk(redactions) {
  const highRiskTypes = ["name", "gender", "age", "photo"];
  const mediumRiskTypes = ["email", "address", "linkedin"];
  
  let score = 0;
  
  for (const r of redactions) {
    if (highRiskTypes.includes(r.type)) score += 25;
    else if (mediumRiskTypes.includes(r.type)) score += 10;
    else score += 5;
  }
  
  return {
    score: Math.min(100, score),
    level: score >= 50 ? "high" : score >= 25 ? "medium" : "low"
  };
}
```

#### Output Example:

```
Original: "John Smith | john.smith@email.com | (555) 123-4567"
Redacted: "[CANDIDATE NAME] | [EMAIL] | [PHONE]"

Bias Risk: Medium
Redactions: name(1), email(1), phone(1)
```

---

### 13. "What parts of the system are heuristic-based vs AI-based?"

#### The Breakdown:

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI vs HEURISTIC BREAKDOWN                      │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    🤖 AI-POWERED (Gemini)                        │
├─────────────────────────────────────────────────────────────────┤
│  • Skill Extraction from resume text                            │
│  • Skill Extraction from job description                        │
│  • Resume Quality Assessment                                    │
│  • Candidate Clustering (Specialist, Generalist, etc.)          │
│  • Natural Language Understanding (React = React.js)            │
│  • Ranking Explanation Generation                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    📐 HEURISTIC-BASED (Code)                     │
├─────────────────────────────────────────────────────────────────┤
│  • PDF/DOCX Parsing                                             │
│  • GitHub Link Detection (regex)                                │
│  • GitHub Score Calculation (weighted formula)                  │
│  • Proof Index Calculation (mathematical formula)               │
│  • ATS Score Calculation (set intersection)                     │
│  • Final Fit Score (weighted average)                           │
│  • Skill Verification (mapping tables)                          │
│  • Bias Risk Scoring (point-based system)                       │
│  • ML Predictions (weighted heuristics, not trained models)     │
│  • Gap Analysis (keyword context detection)                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Why This Split?

| AI-Powered | Heuristic | Reason |
|------------|-----------|--------|
| Skill extraction | ❌ | Requires semantic understanding |
| Quality assessment | ❌ | Subjective, needs language model |
| Scoring | ✅ | Deterministic, repeatable |
| Verification | ✅ | Exact matching, no ambiguity |
| Predictions | ✅* | Could be ML, but heuristics work for MVP |

**Honest Note:**
> "Our predictions are heuristic-based, not trained ML models. They use correlations from the IBM HR dataset but aren't deep learning. This is disclosure-worthy."

---

### 14. "What are the biggest limitations of SkillSnap AI right now?"

#### The Honest Answer:

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **GitHub-Dependent** | Candidates without GitHub can't be fully verified | Fallback scoring, flag for manual review |
| **Heuristic ML** | Predictions are weighted formulas, not trained models | 65% confidence disclosed, dataset-informed weights |
| **No Database** | Analysis results aren't persisted | Each analysis is stateless |
| **Public Repos Only** | Private code not visible | Limited to public contributions |
| **English Only** | Non-English resumes may parse poorly | Gemini handles basics, but edge cases exist |
| **Rate Limits** | Gemini API has quotas | Built-in retry with backoff |
| **No ATS Integrations** | Can't pull from Greenhouse, Lever, etc. | Manual upload required |
| **Single Resume** | Can't batch process | One-at-a-time analysis |
| **No Interview Prep** | Doesn't generate interview questions | Future feature |

#### Limitations We're Honest About:

```
"Our ML predictions show 65% confidence - intentionally lower than real 
trained models would achieve. We use research-backed heuristics from 
the IBM HR dataset, but we're not claiming neural network accuracy."
```

**Why Honesty Works:**
> "Judges respect transparency. Claiming 95% accuracy with heuristics will get destroyed. Saying 'we use weighted formulas informed by research' is defensible."

---

### 15. "If you had only 6 hours to build SkillSnap AI from scratch, which features would you prioritize and why?"

#### The 6-Hour MVP:

```
⏱️ Time Allocation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hour 1-1.5: FOUNDATION
├── Next.js project setup
├── Basic upload form UI
└── File handling (PDF only)

Hour 1.5-2.5: PARSING + AI
├── pdf-parse integration
├── Gemini API connection
└── Skill extraction prompt

Hour 2.5-4: GITHUB VERIFICATION
├── Octokit setup
├── Profile fetch
├── Language extraction
└── Basic skill matching

Hour 4-5: SCORING
├── ATS score calculation
├── Proof Index calculation
└── Final score formula

Hour 5-6: UI + POLISH
├── Results display
├── Score visualization
└── Basic error handling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Features to SKIP in 6 Hours:

| Feature | Why Skip |
|---------|----------|
| DOCX support | PDF covers 80% of cases |
| ML predictions | Heuristic scores are enough |
| Bias mitigation | Nice-to-have, not core value |
| Authentication | Demo doesn't need login |
| Calendar integration | Post-analysis workflow |
| Webhooks | No external consumers yet |
| Dashboard animations | Plain text results work |

#### The Core MVP Formula:

```
Value = (Resume Parse) + (AI Skill Extract) + (GitHub Verify) + (Score)
      = Differentiated Product
```

**The 6-Hour Pitch:**
> "We built a working prototype that parses your resume, extracts skills using AI, verifies them against your GitHub, and gives you a trust score. The full version adds predictions, bias checking, and beautiful visualizations."

---

## 🎤 Presentation Tips

### Opening Hook (30 seconds):

> "85% of resumes contain exaggerations. We built a system that cross-references what you claim with what you've actually coded. It's lie detection for tech hiring."

### Demo Flow (3 minutes):

1. Show upload form
2. Paste a real JD (React developer)
3. Upload a sample resume
4. Watch the loading stages
5. Reveal the dashboard
6. Zoom in on Proof Index
7. Show verified vs missing skills
8. End on the recommendation

### Closing Statement:

> "SkillSnap AI doesn't replace recruiters. It gives them superpowers - the ability to verify claims in 30 seconds instead of a 60-minute technical interview. That's 120x efficiency."

---

## 🚨 Questions to Avoid Answering Badly

| Trap Question | Bad Answer | Good Answer |
|---------------|------------|-------------|
| "What's your accuracy?" | "95%!" | "Our scoring is deterministic, not ML. The formulas are consistent." |
| "Can you beat human recruiters?" | "Yes!" | "We augment recruiters with data they can't access manually." |
| "What about privacy?" | "We don't store anything" | "All processing is session-based. No resume data is persisted." |
| "Why not use ChatGPT?" | "Gemini is better" | "Gemini's structured output reduces parsing errors. It's a technical choice." |

---

**Document End**  
**Prepared for:** Hackathon Judging Defense  
**Confidence Level:** High - all answers are technically accurate and defensible
