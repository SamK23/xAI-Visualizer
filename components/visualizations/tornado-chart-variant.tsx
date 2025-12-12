"use client"

import { useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { processChartFeatures } from "@/lib/chart-utils" // Assuming this utility exists
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TornadoChartVariantProps {
  data: any
}

/**
 * A tornado chart variant that displays factors influencing a prediction.
 * Positive impacts (green) and negative impacts (red) are grouped.
 * All bars extend to the right and are sorted by magnitude within their group.
 */
export function TornadoChartVariant({ data }: TornadoChartVariantProps) {
  const chartData = useMemo(() => {
    if (!data?.features || typeof data.features !== "object") {
      // Fallback sample data when primary data is missing or invalid
      return [
        { name: "TEMPERATURE", importance: 0.42, isPositive: true, value: 0.42, formattedValue: "+0.42" },
        { name: "HOUR OF DAY (PEAK)", importance: 0.38, isPositive: true, value: 0.38, formattedValue: "+0.38" },
        { name: "SEASON: SUMMER", importance: 0.28, isPositive: true, value: 0.28, formattedValue: "+0.28" },
        { name: "WEATHER: RAIN", importance: 0.35, isPositive: false, value: -0.35, formattedValue: "-0.35" },
        { name: "HUMIDITY", importance: 0.25, isPositive: false, value: -0.25, formattedValue: "-0.25" },
        { name: "WINDSPEED", importance: 0.18, isPositive: false, value: -0.18, formattedValue: "-0.18" },
      ]
    }

    const allProcessedFeatures = processChartFeatures(data.features)

    // Group positive and negative features separately
    // 1. Filter
    const positiveFeatures = allProcessedFeatures.filter((f) => f.isPositive)
    const negativeFeatures = allProcessedFeatures.filter((f) => !f.isPositive)

    // 2. Sort by importance (descending) to find the TOP impacts
    positiveFeatures.sort((a, b) => b.importance - a.importance)
    negativeFeatures.sort((a, b) => b.importance - a.importance)

    // 3. Select top 3
    const topPositive = positiveFeatures.slice(0, 3)
    const topNegative = negativeFeatures.slice(0, 3)

    // 4. Sort for display (Positive: High to Low, Negative: Low to High)
    // Positive is already High to Low from step 2.
    // Negative needs to be Low to High (ascending importance)
    topNegative.sort((a, b) => a.importance - b.importance)

    // Combine positives first then negatives
    return [...topPositive, ...topNegative].map((f) => ({
      name: f.name,
      importance: f.importance,
      isPositive: f.isPositive,
      value: f.value,
      formattedValue: (f.isPositive ? "+" : "-") + Math.abs(f.value).toFixed(2)
    }))
  }, [data])

  // Determine max importance value to scale bar widths
  const maxAbsImpact = useMemo(() => (chartData.length > 0 ? Math.max(...chartData.map((d) => d.importance)) : 1), [chartData])
  const effectiveMaxValue = Math.max(maxAbsImpact, 0.01) // Avoid zero division

  // Generate X-axis ticks
  const generateTicks = (maxVal: number, numTicks: number) => {
    const ticks = []
    const interval = maxVal / (numTicks - 1)
    for (let i = 0; i < numTicks; i++) {
      ticks.push(i * interval)
    }
    return ticks
  }

  const numTicks = 5
  const xAxisTicks = useMemo(() => generateTicks(effectiveMaxValue, numTicks), [effectiveMaxValue])

  const chartRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!chartRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#1e293b", // Match the dark background
      })
      const imageData = canvas.toDataURL("image/png")
      const filename = `tornado-chart-variant-${Date.now()}.png`

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tornado Chart (Variant 2)</h2>
          <p className="text-gray-600">
            This chart displays the top positive and negative features influencing the model&apos;s prediction, sorted by their absolute impact.
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
            <CardTitle className="text-lg text-gray-100">Feature Impact Comparison</CardTitle>
            <p className="text-sm text-gray-300">Positive contributions (blue) increase the likelihood, negative contributions (red) decrease it.</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Chart Body */}
            <div className="space-y-2.5">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {/* Feature Label */}
                  <span className="text-sm font-medium text-gray-300 w-52 sm:w-60 text-right" title={item.name}>
                    {item.name}
                  </span>

                  {/* Bar Container */}
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${item.isPositive ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gradient-to-r from-red-500 to-red-600"} flex items-center justify-end pr-3`}
                      style={{ width: `${(item.importance / effectiveMaxValue) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{item.formattedValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis Area */}
            <div className="pl-56 sm:pl-64">
              {/* SVG for Axis line and Ticks */}
              <div className="relative w-full h-8 mt-2">
                <svg className="w-full h-full overflow-visible">
                  <line x1="0%" y1="0" x2="100%" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                  {xAxisTicks.map((tick, i) => {
                    const xPos = (tick / effectiveMaxValue) * 100
                    return (
                      <g key={i}>
                        <line x1={`${xPos}%`} y1="0" x2={`${xPos}%`} y2="5" stroke="#cbd5e1" strokeWidth="1" />
                        <text x={`${xPos}%`} y="20" textAnchor={i === 0 ? "start" : i === xAxisTicks.length - 1 ? "end" : "middle"} fontSize="12" fill="#cbd5e1" className="font-medium">
                          {tick.toFixed(2)}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              {/* Axis Label */}
              <p className="text-center text-xs sm:text-sm text-gray-300 mt-3">SHAP Value</p>
            </div>

            {/* Legend */}
            <div className="flex justify-center items-center mt-6 space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-gray-300">Positive Impact</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300">Negative Impact</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-md bg-green-50/60 border-green-200/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">📊</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Understanding Tornado Chart (Variant 2)</h4>
              <p className="text-blue-700 text-sm">
                This chart groups positive and negative impacts, showing their magnitudes. It&apos;s useful for quickly identifying the most influential features and their overall direction of impact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
