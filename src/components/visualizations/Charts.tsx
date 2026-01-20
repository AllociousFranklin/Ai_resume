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
        md: { width: 120, stroke: 8, fontSize: "text-3xl" },
        lg: { width: 160, stroke: 10, fontSize: "text-4xl" },
    };

    const { width, stroke, fontSize } = sizes[size];
    const radius = (width - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const getColor = (score: number) => {
        if (score >= 80) return "#16A34A"; // Green 600
        if (score >= 60) return "#2563EB"; // Blue 600
        if (score >= 40) return "#D97706"; // Amber 600
        return "#DC2626"; // Red 600
    };

    const color = getColor(score);

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
                        stroke="#E2E8F0" // Slate 200
                        strokeWidth={stroke}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
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
                        className={`${fontSize} font-bold text-gray-900`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}
                    </motion.span>
                </div>
            </div>
            {showLabel && (
                <span className="text-sm text-gray-600 font-medium">{label}</span>
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
        primary: "bg-blue-600",
        success: "bg-green-600",
        warning: "bg-amber-500",
        danger: "bg-red-600",
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                {showValue && (
                    <span className="text-gray-500 font-medium">{value}%</span>
                )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
    const radius = (size - 80) / 2;
    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (item.value / 100) * radius;

        const labelRadius = radius + 25;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);

        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            label: item.name,
            labelX,
            labelY,
            angle,
        };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
        <svg width={size} height={size} className="mx-auto block">
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
                    fill={i % 2 === 0 ? "#F8FAFC" : "#FFFFFF"} // Alternating ring fill
                    stroke="#E2E8F0"
                    strokeWidth={1}
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
                        stroke="#E2E8F0"
                        strokeWidth={1}
                    />
                );
            })}

            {/* Data polygon */}
            <motion.path
                d={pathD}
                fill="rgba(37, 99, 235, 0.2)" // Blue-600 with opacity
                stroke="#2563EB" // Blue-600
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Labels */}
            {points.map((p, i) => {
                const angleDeg = (p.angle * 180) / Math.PI;
                let textAnchor: "start" | "middle" | "end" = "middle";
                if (angleDeg > -70 && angleDeg < 70) textAnchor = "start";
                else if (angleDeg > 110 || angleDeg < -110) textAnchor = "end";

                return (
                    <text
                        key={i}
                        x={p.labelX}
                        y={p.labelY}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-[10px] font-medium fill-gray-500 uppercase tracking-wide"
                    >
                        {p.label}
                    </text>
                );
            })}
        </svg>
    );
}
