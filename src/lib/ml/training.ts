/**
 * ML Training Module
 * 
 * This module uses the IBM HR Employee Attrition dataset to train
 * and improve prediction models for retention and performance.
 * 
 * Dataset columns used:
 * - Attrition: "Yes"/"No" (our retention target)
 * - PerformanceRating: 3-4 scale (our performance target)
 * - JobSatisfaction: 1-4 scale
 * - YearsAtCompany: tenure
 * - And more...
 */

import * as fs from "fs";
import * as path from "path";

export interface TrainingData {
    age: number;
    education: number; // 1-5
    experience_years: number;
    job_level: number; // 1-5
    performance_rating: number; // 3-4
    job_satisfaction: number; // 1-4
    work_life_balance: number; // 1-4
    years_at_company: number;
    years_in_role: number;
    stayed: boolean; // Attrition = "No"
    training_times: number;
    overtime: boolean;
    distance_from_home: number;
    num_companies_worked: number;
    monthly_income: number;
}

export interface ModelWeights {
    retentionFactors: Record<string, number>;
    performanceFactors: Record<string, number>;
    correlations: Record<string, number>;
}

/**
 * Parse the IBM HR Attrition dataset
 */
export function parseHRDataset(csvPath: string): TrainingData[] {
    const data: TrainingData[] = [];

    try {
        const content = fs.readFileSync(csvPath, "utf-8");
        const lines = content.split("\n").filter(l => l.trim());

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            if (cols.length < 30) continue;

            data.push({
                age: parseInt(cols[0]) || 0,
                education: parseInt(cols[6]) || 1, // 1-5 scale
                experience_years: parseInt(cols[28]) || 0, // TotalWorkingYears
                job_level: parseInt(cols[14]) || 1, // JobLevel
                performance_rating: parseInt(cols[24]) || 3, // PerformanceRating (3-4)
                job_satisfaction: parseInt(cols[16]) || 3, // JobSatisfaction (1-4)
                work_life_balance: parseInt(cols[30]) || 3, // WorkLifeBalance (1-4)
                years_at_company: parseInt(cols[31]) || 0, // YearsAtCompany
                years_in_role: parseInt(cols[32]) || 0, // YearsInCurrentRole
                stayed: cols[1] === "No", // Attrition "No" = stayed
                training_times: parseInt(cols[29]) || 0, // TrainingTimesLastYear
                overtime: cols[22] === "Yes", // OverTime
                distance_from_home: parseInt(cols[5]) || 0,
                num_companies_worked: parseInt(cols[20]) || 0,
                monthly_income: parseInt(cols[18]) || 0
            });
        }

        console.log(`[ML Training] Loaded ${data.length} records from HR dataset`);
    } catch (error) {
        console.error("[ML Training] Error loading dataset:", error);
    }

    return data;
}

/**
 * Calculate correlation coefficients for retention
 */
export function calculateRetentionCorrelations(data: TrainingData[]): Record<string, number> {
    const correlations: Record<string, number> = {};

    // Calculate mean retention rate
    const retentionRate = data.filter(d => d.stayed).length / data.length;

    // Calculate correlation for each factor
    const factors = [
        { name: "job_satisfaction", key: "job_satisfaction" },
        { name: "work_life_balance", key: "work_life_balance" },
        { name: "years_at_company", key: "years_at_company" },
        { name: "years_in_role", key: "years_in_role" },
        { name: "monthly_income", key: "monthly_income" },
        { name: "training_times", key: "training_times" },
        { name: "job_level", key: "job_level" },
        { name: "age", key: "age" },
    ];

    for (const factor of factors) {
        const stayers = data.filter(d => d.stayed);
        const leavers = data.filter(d => !d.stayed);

        const avgStayer = stayers.reduce((sum, d) => sum + (d as any)[factor.key], 0) / stayers.length;
        const avgLeaver = leavers.reduce((sum, d) => sum + (d as any)[factor.key], 0) / leavers.length;

        // Simple correlation: positive means factor is higher for stayers
        correlations[factor.name] = (avgStayer - avgLeaver) / avgStayer;
    }

    // Overtime has negative correlation (more overtime = less retention)
    const overtimeStayers = data.filter(d => d.stayed && d.overtime).length / data.filter(d => d.stayed).length;
    const overtimeLeavers = data.filter(d => !d.stayed && d.overtime).length / data.filter(d => !d.stayed).length;
    correlations["overtime"] = -(overtimeLeavers - overtimeStayers);

    // Job hopping correlation
    const avgCompaniesStayers = data.filter(d => d.stayed).reduce((s, d) => s + d.num_companies_worked, 0) / data.filter(d => d.stayed).length;
    const avgCompaniesLeavers = data.filter(d => !d.stayed).reduce((s, d) => s + d.num_companies_worked, 0) / data.filter(d => !d.stayed).length;
    correlations["job_hopping"] = -(avgCompaniesLeavers - avgCompaniesStayers) / avgCompaniesStayers;

    return correlations;
}

/**
 * Generate model weights from training data
 */
export function trainModels(data: TrainingData[]): ModelWeights {
    const retentionCorrelations = calculateRetentionCorrelations(data);

    // Normalize weights
    const sum = Object.values(retentionCorrelations).reduce((s, v) => s + Math.abs(v), 0);
    const retentionFactors: Record<string, number> = {};
    for (const [key, value] of Object.entries(retentionCorrelations)) {
        retentionFactors[key] = value / sum;
    }

    // Calculate performance correlations
    const performanceFactors: Record<string, number> = {};
    const highPerformers = data.filter(d => d.performance_rating >= 4);
    const allWorkers = data;

    // Training correlation
    const avgTrainingHigh = highPerformers.reduce((s, d) => s + d.training_times, 0) / highPerformers.length;
    const avgTrainingAll = allWorkers.reduce((s, d) => s + d.training_times, 0) / allWorkers.length;
    performanceFactors["training"] = (avgTrainingHigh - avgTrainingAll) / avgTrainingAll;

    // Job satisfaction correlation
    const avgSatHigh = highPerformers.reduce((s, d) => s + d.job_satisfaction, 0) / highPerformers.length;
    const avgSatAll = allWorkers.reduce((s, d) => s + d.job_satisfaction, 0) / allWorkers.length;
    performanceFactors["satisfaction"] = (avgSatHigh - avgSatAll) / avgSatAll;

    // Years in role correlation
    const avgYearsHigh = highPerformers.reduce((s, d) => s + d.years_in_role, 0) / highPerformers.length;
    const avgYearsAll = allWorkers.reduce((s, d) => s + d.years_in_role, 0) / allWorkers.length;
    performanceFactors["experience"] = (avgYearsHigh - avgYearsAll) / avgYearsAll;

    return {
        retentionFactors,
        performanceFactors,
        correlations: retentionCorrelations
    };
}

/**
 * Get summary statistics from the dataset
 */
export function getDatasetStats(data: TrainingData[]): {
    totalRecords: number;
    retentionRate: number;
    avgTenure: number;
    avgPerformance: number;
    overtimeAttritionRate: number;
    highSatisfactionRetention: number;
} {
    const stayed = data.filter(d => d.stayed);
    const left = data.filter(d => !d.stayed);

    return {
        totalRecords: data.length,
        retentionRate: (stayed.length / data.length) * 100,
        avgTenure: data.reduce((s, d) => s + d.years_at_company, 0) / data.length,
        avgPerformance: data.reduce((s, d) => s + d.performance_rating, 0) / data.length,
        overtimeAttritionRate: (left.filter(d => d.overtime).length / left.length) * 100,
        highSatisfactionRetention: (stayed.filter(d => d.job_satisfaction >= 3).length / stayed.length) * 100
    };
}

/**
 * Initialize training with the IBM HR dataset
 */
export function initializeTraining(): {
    weights: ModelWeights;
    stats: ReturnType<typeof getDatasetStats>;
} | null {
    const dataPath = path.join(process.cwd(), "data", "hr_attrition.csv");

    if (!fs.existsSync(dataPath)) {
        console.log("[ML Training] Dataset not found at:", dataPath);
        return null;
    }

    const data = parseHRDataset(dataPath);
    if (data.length === 0) return null;

    const weights = trainModels(data);
    const stats = getDatasetStats(data);

    console.log("[ML Training] Model trained with insights:");
    console.log(`  - Retention rate: ${stats.retentionRate.toFixed(1)}%`);
    console.log(`  - Avg tenure: ${stats.avgTenure.toFixed(1)} years`);
    console.log(`  - Overtime attrition: ${stats.overtimeAttritionRate.toFixed(1)}%`);

    return { weights, stats };
}

/**
 * KEY INSIGHTS FROM IBM HR DATASET:
 * 
 * Based on the 1,470 employee records:
 * 
 * 1. RETENTION FACTORS (what makes people stay):
 *    - Higher job satisfaction (3-4 vs 1-2)
 *    - Better work-life balance
 *    - Higher monthly income
 *    - More training opportunities
 *    - Longer tenure = more likely to stay
 * 
 * 2. ATTRITION RISK FACTORS:
 *    - Overtime workers leave at higher rates
 *    - More companies worked = higher flight risk
 *    - Distance from home correlates with attrition
 *    - Lower job level employees leave more
 * 
 * 3. PERFORMANCE INSIGHTS:
 *    - High performers tend to have more training
 *    - Job satisfaction correlates with performance
 *    - Years in role shows mastery
 * 
 * These insights are now used to improve our predictions!
 */
