"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { processChartFeatures } from "@/lib/chart-utils" // Import the new utility

interface ForceFieldChartProps {
  data: any
  isAssistantOpen?: boolean // New prop for responsiveness
  overallMaxAbsImpact: number
}

export function ForceFieldChart({ data, isAssistantOpen = false, overallMaxAbsImpact }: ForceFieldChartProps) {
  const isSampleDataset = data?.metadata?.type === "sample"

  const chartData = useMemo(() => {
    console.log("Force Field Chart - Raw data:", data)

    const allProcessedFeatures = processChartFeatures(data?.features) // Get all features

    // Select top 5-7 features (e.g., 3 positive, 3 negative) for display
    const positiveFeatures = allProcessedFeatures
      .filter((f) => f.isPositive)
      .sort((a, b) => b.importance - a.importance)
    const negativeFeatures = allProcessedFeatures
      .filter((f) => !f.isPositive)
      .sort((a, b) => b.importance - a.importance)

    const topPositiveCount = Math.min(3, positiveFeatures.length) // Aim for up to 3 positive
    const topNegativeCount = Math.min(3, negativeFeatures.length) // Aim for up to 3 negative

    const selectedDrivingForces = positiveFeatures.slice(0, topPositiveCount)
    const selectedRestrainingForces = negativeFeatures.slice(0, topNegativeCount)

    // Map the selected features to driving/restraining forces
    const drivingForces = selectedDrivingForces
      .map((f: any) => ({
        name: f.name,
        strength: isSampleDataset ? Math.min(5, Math.max(1, Math.round(f.importance * 10))) : f.importance, // Use 1-5 for sample, raw importance for custom
        impact: f.value, // Original value
      }))
      .sort((a: any, b: any) => b.strength - a.strength) // Sort by strength/importance for display

    const restrainingForces = selectedRestrainingForces
      .map((f: any) => ({
        name: f.name,
        strength: isSampleDataset ? Math.min(5, Math.max(1, Math.round(f.importance * 10))) : f.importance, // Use 1-5 for sample, raw importance for custom
        impact: f.value, // Original value
      }))
      .sort((a: any, b: any) => b.strength - a.strength) // Sort by strength/importance for display

    const hasData = allProcessedFeatures.length > 0

    // Fallback data for Force Field Analysis if no valid features are processed
    const fallbackForces = {
      centralIdea: "Upgrade our IT systems",
      drivingForces: [
        { name: "Improved customer response time", strength: 5, impact: 0.42 },
        { name: "Higher margins", strength: 4, impact: 0.3 },
        { name: "Improved access", strength: 3, impact: 0.25 },
        { name: "Lower ongoing cost", strength: 2, impact: 0.2 },
      ],
      restrainingForces: [
        { name: "Difficult to transition", strength: 5, impact: -0.35 },
        { name: "New skills needed", strength: 4, impact: -0.3 },
        { name: "Impact on workload", strength: 3, impact: -0.25 },
        { name: "Time taken", strength: 2, impact: -0.2 },
        { name: "Cost", strength: 1, impact: -0.15 },
      ],
    }

    return {
      centralIdea: data.metadata?.target || "Model Prediction",
      drivingForces: hasData ? drivingForces : fallbackForces.drivingForces,
      restrainingForces: hasData ? restrainingForces : fallbackForces.restrainingForces,
    }
  }, [data, isSampleDataset])

  // Use overall max absolute impact for scaling for custom datasets, or chartData's max for samples
  // Ensure we consider the current chart data's max strength to prevent overflow
  const currentMaxStrength = Math.max(
    ...chartData.drivingForces.map((f) => f.strength),
    ...chartData.restrainingForces.map((f) => f.strength),
    0.01
  )

  const maxOverallStrengthForScaling = isSampleDataset
    ? currentMaxStrength
    : Math.max(overallMaxAbsImpact, currentMaxStrength)

  const maxBarPixelWidth = 300 // Increased maximum pixel width for the longest bar for custom data
  const baseBarWidth = 120 // Base width for a strength of 1 (for sample data)
  const strengthMultiplier = 30 // Additional width per strength unit (for sample data)
  const arrowHeadWidth = 15 // Width of the arrow head

  interface ArrowBarProps {
    name: string
    strength: number // This will be 1-5 for sample, or raw importance for custom
    impact: number
    type: "driving" | "restraining"
    maxOverallStrength: number // Passed for custom scaling
    isSample: boolean
  }

  const ArrowBar = ({ name, strength, impact, type, maxOverallStrength, isSample }: ArrowBarProps) => {
    let totalWidth: number
    if (isSample) {
      totalWidth = baseBarWidth + (strength - 1) * strengthMultiplier
    } else {
      // For custom, scale width based on actual importance relative to overall max importance
      totalWidth = (strength / Math.max(maxOverallStrength, 0.01)) * maxBarPixelWidth
      totalWidth = Math.max(totalWidth, arrowHeadWidth + 10) // Ensure a minimum visible width
    }

    const rectangleWidth = totalWidth - arrowHeadWidth

    const colorClass =
      type === "driving" ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gradient-to-l from-red-500 to-red-600"
    const textColor = "text-white"

    const formattedImpact = (type === "driving" ? "+" : "-") + Math.abs(impact).toFixed(2)

    return (
      <div
        className={`relative h-8 flex items-center rounded-full max-w-full flex-shrink-0`}
        style={{ width: `${totalWidth}px` }}
      >
        {/* Rectangular body */}
        <div
          className={`absolute top-0 bottom-0 ${colorClass} ${type === "driving" ? "left-0 rounded-l-full" : "right-0 rounded-r-full"}`}
          style={{ width: `${rectangleWidth}px` }}
        ></div>
        {/* Arrow head */}
        <div
          className={`absolute top-0 bottom-0 ${colorClass} ${type === "driving" ? "right-0" : "left-0"} `}
          style={{
            width: `${arrowHeadWidth}px`,
            clipPath: type === "driving" ? "polygon(0% 0%, 100% 50%, 0% 100%)" : "polygon(100% 0%, 0% 50%, 100% 100%)",
          }}
        ></div>

        {/* Content */}
        <div
          className={`absolute inset-0 flex items-center ${type === "driving" ? "justify-end pr-4" : "justify-start pl-4"} z-10`}
        >
          <span className={`text-xs font-bold ${textColor} whitespace-nowrap drop-shadow-md`}>
            {name} {formattedImpact}
          </span>
        </div>
      </div>
    )
  }

  const totalDriving = chartData.drivingForces.reduce((sum, force) => sum + force.strength, 0)
  const totalRestraining = chartData.restrainingForces.reduce((sum, force) => sum + force.strength, 0)

  // Generate ticks for the X-axis (strength/importance scale)
  const generateTicks = (maxVal: number, numTicks: number) => {
    const ticks = []
    const interval = maxVal / (numTicks - 1)
    for (let i = 0; i < numTicks; i++) {
      ticks.push(i * interval)
    }
    return ticks
  }

  const numTicks = 5 // Number of ticks for the X-axis
  const xAxisTicks = useMemo(() => {
    if (isSampleDataset) {
      return [1, 2, 3, 4, 5] // Fixed 1-5 scale for sample
    }
    return generateTicks(maxOverallStrengthForScaling, numTicks) // Dynamic scale for custom
  }, [maxOverallStrengthForScaling, isSampleDataset])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Force Field Plot</h2>
        <p className="text-gray-600">
          This chart visualizes the driving forces (positive contributions) and restraining forces (negative
          contributions) impacting a central decision or outcome. It helps understand the factors pushing for and
          against a particular prediction or change.
        </p>
      </div>

      <Card className="backdrop-blur-md bg-slate-800 border-white/20">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100">Forces Influencing: {chartData.centralIdea}</CardTitle>
          <p className="text-sm text-gray-300">
            Driving forces push towards the outcome, restraining forces pull away.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-center items-stretch py-8 relative space-x-4 lg:space-x-8">
            {/* Forces for change (Left) */}
            <div className="relative flex flex-col items-end pr-4 lg:pr-8 space-y-4 z-10 flex-1 min-w-[200px]">
              {/* Grid lines for Left Column */}
              <div className="absolute top-10 bottom-0 right-4 lg:right-8 w-full max-w-[300px] flex justify-between pointer-events-none z-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-px bg-white/5 h-full"></div>
                ))}
              </div>

              <div className="relative w-full max-w-[300px] h-6 mb-2 z-10">
                {xAxisTicks.map((num, i) => {
                  // Calculate position: 0 (right) to 100% (left) for reversed axis
                  const position = (i / (xAxisTicks.length - 1)) * 100
                  return (
                    <span
                      key={i}
                      className="absolute text-xs font-semibold text-gray-300 transform -translate-x-1/2"
                      style={{ right: `${position}%` }}
                    >
                      {isSampleDataset ? num : num.toFixed(2)}
                    </span>
                  )
                })}
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-4 z-10">Forces for change</h3>
              {chartData.drivingForces.map((force, index) => (
                <ArrowBar
                  key={index}
                  name={force.name}
                  strength={force.strength}
                  impact={force.impact}
                  type="driving"
                  maxOverallStrength={maxOverallStrengthForScaling}
                  isSample={isSampleDataset}
                />
              ))}
              <div className="mt-4 text-base font-bold text-blue-400 z-10">
                Total: +{isSampleDataset ? totalDriving : totalDriving.toFixed(2)}
              </div>
            </div>

            {/* Central Idea */}
            <div className="flex flex-col items-center justify-center mx-4 lg:mx-8 z-20 flex-shrink-0">
              <div className="bg-white/80 border border-gray-300 rounded-xl p-6 text-center shadow-lg min-w-[120px] max-w-[180px] h-[300px] flex items-center justify-center text-wrap overflow-hidden">
                <h3 className="text-xl font-bold text-gray-900">{chartData.centralIdea}</h3>
              </div>
            </div>

            {/* Forces against change (Right) */}
            <div className="relative flex flex-col items-start pl-4 lg:pl-8 space-y-4 z-10 flex-1 min-w-[200px]">
              {/* Grid lines for Right Column */}
              <div className="absolute top-10 bottom-0 left-4 lg:left-8 w-full max-w-[300px] flex justify-between pointer-events-none z-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-px bg-white/5 h-full"></div>
                ))}
              </div>

              <div className="relative w-full max-w-[300px] h-6 mb-2 z-10">
                {xAxisTicks.map((num, i) => {
                  // Calculate position: 0 (left) to 100% (right)
                  const position = (i / (xAxisTicks.length - 1)) * 100
                  return (
                    <span
                      key={i}
                      className="absolute text-xs font-semibold text-gray-300 transform -translate-x-1/2"
                      style={{ left: `${position}%` }}
                    >
                      {isSampleDataset ? num : num.toFixed(2)}
                    </span>
                  )
                })}
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-4 z-10">Forces against change</h3>
              {chartData.restrainingForces.map((force, index) => (
                <ArrowBar
                  key={index}
                  name={force.name}
                  strength={force.strength}
                  impact={force.impact}
                  type="restraining"
                  maxOverallStrength={maxOverallStrengthForScaling}
                  isSample={isSampleDataset}
                />
              ))}
              <div className="mt-4 text-base font-bold text-red-400 z-10">
                Total: -{isSampleDataset ? totalRestraining : totalRestraining.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-blue-50/60 border-blue-200/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">↑↓</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Understanding Force Field Plot</h4>
              <p className="text-blue-700 text-sm">
                Force Field Analysis helps in understanding the factors that either support (driving forces) or hinder
                (restraining forces) a particular outcome or decision. By visualizing these forces, you can identify
                areas to strengthen or weaken to achieve the desired result.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
