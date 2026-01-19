"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
    score: number;
    label: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function ScoreGauge({ score, label, size = "md", showLabel = true }: ScoreGaugeProps) {
    const sizes = {
        sm: { width: 80, stroke: 6, fontSize: "text-lg" },
        md: { width: 120, stroke: 8, fontSize: "text-2xl" },
        lg: { width: 160, stroke: 10, fontSize: "text-4xl" },
    };

    const { width, stroke, fontSize } = sizes[size];
    const radius = (width - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const getColor = (score: number) => {
        if (score >= 80) return { stroke: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" }; // Green
        if (score >= 60) return { stroke: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" }; // Blue
        if (score >= 40) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }; // Amber
        return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }; // Red
    };

    const colors = getColor(score);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width, height: width }}>
                <svg width={width} height={width} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth={stroke}
                        opacity={0.3}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </svg>
                {/* Score text in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className={`${fontSize} font-bold`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        {score}
                    </motion.span>
                </div>
            </div>
            {showLabel && (
                <span className="text-sm text-muted-foreground font-medium">{label}</span>
            )}
        </div>
    );
}

interface ProgressBarProps {
    value: number;
    label: string;
    max?: number;
    showValue?: boolean;
    color?: "primary" | "success" | "warning" | "danger";
}

export function AnimatedProgressBar({
    value,
    label,
    max = 100,
    showValue = true,
    color = "primary"
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    const colors = {
        primary: "bg-primary",
        success: "bg-green-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{label}</span>
                {showValue && (
                    <span className="text-sm text-muted-foreground">{value}%</span>
                )}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${colors[color]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

interface SkillCategory {
    name: string;
    value: number;
}

interface RadarChartProps {
    data: SkillCategory[];
    size?: number;
}

export function SkillRadarChart({ data, size = 200 }: RadarChartProps) {
    const center = size / 2;
    const radius = (size - 80) / 2; // Reduced from -40 to -80 for more label space
    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (item.value / 100) * radius;

        // Calculate text anchor based on angle position
        const labelRadius = radius + 30; // Increased from +20 to +30
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);

        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            label: item.name,
            labelX,
            labelY,
            angle, // Store angle for text anchor calculation
        };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    // Grid circles
    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
        <svg width={size} height={size} className="mx-auto">
            {/* Grid */}
            {gridLevels.map((level, i) => (
                <polygon
                    key={i}
                    points={data
                        .map((_, j) => {
                            const angle = j * angleStep - Math.PI / 2;
                            const r = level * radius;
                            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                        })
                        .join(" ")}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1}
                    opacity={0.5}
                />
            ))}

            {/* Axes */}
            {data.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                return (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={center + radius * Math.cos(angle)}
                        y2={center + radius * Math.sin(angle)}
                        stroke="var(--border)"
                        strokeWidth={1}
                        opacity={0.3}
                    />
                );
            })}

            {/* Data polygon */}
            <motion.path
                d={pathD}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="rgb(99, 102, 241)"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ transformOrigin: "center" }}
            />

            {/* Labels */}
            {points.map((p, i) => {
                // Determine text anchor based on angle position
                const angleDeg = (p.angle * 180) / Math.PI;
                let textAnchor: "start" | "middle" | "end" = "middle";
                if (angleDeg > -60 && angleDeg < 60) textAnchor = "start";
                else if (angleDeg > 120 || angleDeg < -120) textAnchor = "end";

                return (
                    <text
                        key={i}
                        x={p.labelX}
                        y={p.labelY}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-xs fill-muted-foreground"
                    >
                        {p.label}
                    </text>
                );
            })}
        </svg>
    );
}
