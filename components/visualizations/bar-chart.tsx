"use client"

import { useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { processChartFeatures } from "@/lib/chart-utils" // Import the new utility
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BarChartProps {
    data: any
    overallMaxAbsImpact: number
    overallMinImpact: number
    overallMaxImpact: number
}

export function BarChart({
    data,
    overallMaxAbsImpact,
    overallMinImpact,
    overallMaxImpact,
}: BarChartProps) {
    const isSampleDataset = data?.metadata?.type === "sample"

    const chartData = useMemo(() => {
        console.log("Bar Chart - Raw data:", data)

        const allProcessedFeatures = processChartFeatures(data?.features)

        // Select top 5-7 features (e.g., 3 positive, 3 negative) for display
        const positiveFeatures = allProcessedFeatures
            .filter((f) => f.isPositive)
            .sort((a, b) => b.importance - a.importance)
        const negativeFeatures = allProcessedFeatures
            .filter((f) => !f.isPositive)
            .sort((a, b) => b.importance - a.importance)

        const topPositiveCount = Math.min(3, positiveFeatures.length) // Aim for up to 3 positive
        const topNegativeCount = Math.min(3, negativeFeatures.length) // Aim for up to 3 negative

        const selectedPositive = positiveFeatures.slice(0, topPositiveCount)
        const selectedNegative = negativeFeatures.slice(0, topNegativeCount)

        // Combine and sort by absolute importance for consistent display order across charts
        const combinedFeatures = [...selectedPositive, ...selectedNegative].sort((a, b) => b.importance - a.importance)

        // Fallback data if no valid features are processed
        const fallbackData = [
            { name: "Hour of Day (Peak)", importance: 0.42, impact: 0.42, isPositive: true },
            { name: "Season: Summer", importance: 0.3, impact: 0.3, isPositive: true },
            { name: "Working Day", importance: 0.25, impact: 0.25, isPositive: true },
            { name: "Weather: Rain", importance: 0.35, impact: -0.35, isPositive: false },
            { name: "Humidity", importance: 0.25, impact: -0.25, isPositive: false },
        ]

        return combinedFeatures.length > 0
            ? combinedFeatures.map((f) => ({
                name: f.name,
                importance: f.importance, // Absolute importance for bar length
                impact: f.value, // Original value for display
                isPositive: f.isPositive,
            }))
            : fallbackData
    }, [data])

    // Use overall metrics for scaling for custom datasets, or chartData's max for samples
    const maxAbsImpactForScaling = isSampleDataset ? Math.max(...chartData.map((d) => d.importance)) : overallMaxAbsImpact

    const minImpactForAxis = isSampleDataset ? Math.min(...chartData.map((d) => d.impact)) : overallMinImpact
    const maxImpactForAxis = isSampleDataset ? Math.max(...chartData.map((d) => d.impact)) : overallMaxImpact

    // Ensure a minimum scale if all impacts are zero or very small
    const effectiveMaxAbsImpactForScaling = Math.max(maxAbsImpactForScaling, 0.01)
    const effectiveRangeForAxis = Math.max(maxImpactForAxis - minImpactForAxis, 0.01)

    // Generate ticks for the X-axis
    const generateTicks = (min: number, max: number, numTicks: number) => {
        const ticks = []
        const range = max - min
        const interval = range / (numTicks - 1)
        for (let i = 0; i < numTicks; i++) {
            ticks.push(min + i * interval)
        }
        return ticks
    }

    const numTicks = 5 // Number of ticks for the X-axis
    const xAxisTicks = useMemo(
        () => generateTicks(minImpactForAxis, maxImpactForAxis, numTicks),
        [minImpactForAxis, maxImpactForAxis],
    )

    const chartRef = useRef<HTMLDivElement>(null)

    const handleExport = async () => {
        if (!chartRef.current) return

        try {
            const html2canvas = (await import("html2canvas")).default
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: "#1e293b", // Match the dark background
            })
            const imageData = canvas.toDataURL("image/png")
            const filename = `bar-chart-${Date.now()}.png`

            const response = await fetch("/api/save-chart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageData, filename }),
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Chart Exported",
                    description: `Saved to ${data.path}`,
                })
            } else {
                throw new Error("Failed to save chart")
            }
        } catch (error) {
            console.error("Export failed:", error)
            toast({
                title: "Export Failed",
                description: "Could not save the chart image.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bar Chart</h2>
                    <p className="text-gray-600">
                        This horizontal bar chart shows which features have the most significant impact on the model's predictions.
                        Longer bars indicate higher importance, making it easy to identify the most influential factors.
                    </p>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm" className="ml-4">
                    <Download className="w-4 h-4 mr-2" />
                    Export PNG
                </Button>
            </div>

            <div ref={chartRef} className="p-4 rounded-xl bg-slate-800">
                <Card className="bg-transparent border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-100">Factors Influencing {data?.metadata?.target || "Model Predictions"}</CardTitle>
                        <p className="text-sm text-gray-300">
                            Positive contributions increase the likelihood, negative contributions decrease it.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {chartData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-300 w-40 text-right pr-4">{item.name}</span>
                                        <div className="flex-1 flex items-center">
                                            <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out ${item.isPositive
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                                        : "bg-gradient-to-r from-red-500 to-red-600"
                                                        }`}
                                                    style={{
                                                        width: `${(item.importance / effectiveMaxAbsImpactForScaling) * 100}%`,
                                                    }}
                                                >
                                                    <span className="text-white text-xs font-medium">{(item.isPositive ? "+" : "-") + Math.abs(item.impact).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* X-axis for all datasets */}
                        <div className="relative w-full h-8 mt-6 pl-44">
                            <svg className="w-full h-full overflow-visible">
                                {/* Axis line */}
                                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="1" />
                                {/* Ticks and labels */}
                                {xAxisTicks.map((tick, i) => {
                                    const xPos = ((tick - minImpactForAxis) / effectiveRangeForAxis) * 100
                                    return (
                                        <g key={i}>
                                            <line x1={`${xPos}%`} y1="50%" x2={`${xPos}%`} y2="70%" stroke="#cbd5e1" strokeWidth="1" />
                                            <text
                                                x={`${xPos}%`}
                                                y="95%"
                                                textAnchor={i === 0 ? "start" : i === xAxisTicks.length - 1 ? "end" : "middle"}
                                                fontSize="10"
                                                fill="#cbd5e1"
                                                className="font-medium"
                                            >
                                                {tick.toFixed(2)}
                                            </text>
                                        </g>
                                    )
                                })}
                            </svg>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-300 pl-44">SHAP Value</div>
                        </div>

                        <div className="flex justify-center items-center mt-6 space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                                <span className="text-gray-300">Positive Impact</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                                <span className="text-gray-300">Negative Impact</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="backdrop-blur-md bg-blue-50/60 border-blue-200/50">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-1">Understanding Bar Chart</h4>
                            <p className="text-blue-700 text-sm">
                                This visualization uses bar length to represent feature strength - a highly effective encoding method.
                                Blue bars show positive impact, red bars show negative impact. The horizontal layout makes it easy to
                                compare feature names and their relative importance values.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
