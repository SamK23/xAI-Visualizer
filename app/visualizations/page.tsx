"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { BarChart } from "@/components/visualizations/bar-chart"
import { TornadoChart } from "@/components/visualizations/tornado-chart"
import { ForceFieldChart } from "@/components/visualizations/force-field-chart"
import { TornadoChartVariant } from "@/components/visualizations/tornado-chart-variant" // Added import
import { AIAssistant, clearChatHistory } from "@/components/ai-assistant"
import { toast } from "@/hooks/use-toast"

const visualizationTabs = [
  { id: "feature-importance", label: "Bar Chart", component: BarChart },
  { id: "tornado", label: "Tornado Chart (Variant 1)", component: TornadoChart },
  { id: "tornado-variant", label: "Tornado Chart (Variant 2)", component: TornadoChartVariant },
  { id: "force-field", label: "Force Field Plot", component: ForceFieldChart },
]

function VisualizationsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("feature-importance")
  const [showAssistant, setShowAssistant] = useState(false)
  const [datasetData, setDatasetData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null)
  const [overallChartMetrics, setOverallChartMetrics] = useState({
    maxAbsImpact: 0,
    minImpact: 0,
    maxImpact: 0,
  })

  const datasetName = searchParams.get("dataset")
  const displayName = searchParams.get("name") || datasetName
  const isSample = searchParams.get("sample") === "true"

  const handleChangeDataset = useCallback(() => {
    clearChatHistory()
    router.push("/data-selection")
  }, [router])

  useEffect(() => {
    const loadDataset = async () => {
      try {
        setLoading(true)
        const endpoint = isSample ? `/api/sample-datasets/${datasetName}` : `/api/datasets/${datasetName}`

        console.log(
          `[Visualizations Page] Attempting to load dataset. Dataset Name: "${datasetName}", Is Sample: ${isSample}, Endpoint: "${endpoint}"`,
        )

        const response = await fetch(endpoint)
        if (response.ok) {
          const data = await response.json()
          console.log("[Visualizations Page] Loaded dataset:", data)

          // Add type to metadata based on how it was loaded
          const processedData = {
            ...data,
            metadata: {
              ...data.metadata,
              type: isSample ? "sample" : "custom",
            },
          }
          setDatasetData(processedData)

          // Calculate overall max/min impact from the *entire* dataset for consistent scaling
          if (processedData?.features && processedData.features.length > 0) {
            const allImpactValues = processedData.features.map((f: any) => f.value)
            const allAbsoluteImpactValues = processedData.features.map((f: any) => Math.abs(f.value))

            const overallMaxAbs = Math.max(...allAbsoluteImpactValues)
            const overallMin = Math.min(...allImpactValues)
            const overallMax = Math.max(...allImpactValues)

            setOverallChartMetrics({
              maxAbsImpact: overallMaxAbs,
              minImpact: overallMin,
              maxImpact: overallMax,
            })
          } else {
            setOverallChartMetrics({ maxAbsImpact: 0, minImpact: 0, maxImpact: 0 })
          }

          if (processedData?.id && processedData.id !== currentDatasetId) {
            clearChatHistory()
            setCurrentDatasetId(processedData.id)
          } else if (!processedData?.id && datasetName !== currentDatasetId) {
            clearChatHistory()
            setCurrentDatasetId(datasetName)
          }
        } else {
          let errorDetails = `Status: ${response.status} ${response.statusText}`
          let errorMessageForUser = "Failed to load dataset."
          try {
            const errorJson = await response.json()
            if (errorJson.error) {
              errorDetails += ` | API Error: ${errorJson.error}`
              errorMessageForUser = errorJson.error
            } else {
              errorDetails += ` | API Response: ${JSON.stringify(errorJson)}`
            }
          } catch (jsonError) {
            errorDetails += ` | No JSON error details available.`
          }
          console.error("[Visualizations Page] API response error:", errorDetails)
          throw new Error(errorMessageForUser)
        }
      } catch (error: any) {
        console.error("[Visualizations Page] Dataset loading error:", error)
        toast({
          title: "Error loading dataset",
          description: error.message || "Please try uploading your data again",
          variant: "destructive",
        })
        handleChangeDataset()
      } finally {
        setLoading(false)
      }
    }

    if (datasetName) {
      if (!currentDatasetId || datasetName !== currentDatasetId) {
        loadDataset()
      }
    } else {
      handleChangeDataset()
    }
  }, [datasetName, isSample, currentDatasetId, handleChangeDataset])

  const ActiveVisualization = visualizationTabs.find((tab) => tab.id === activeTab)?.component

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dataset...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showAssistant ? "mr-96" : ""}`}>
        {/* Header */}
        <header className="backdrop-blur-md bg-white/70 border-b border-white/20 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleChangeDataset} className="hover:bg-white/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Dataset
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-auto h-10 flex items-center justify-center">
                    <img src="/logo.png" alt="XAI Visualizer Logo" className="h-full w-auto object-contain" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">XAI Visualizations</h1>
                    <p className="text-sm text-gray-600">Dataset: {displayName}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowAssistant(!showAssistant)}
                className={`${showAssistant
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  } text-white`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showAssistant ? "Hide Assistant" : "Ask Assistant"}
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Visualization Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 p-2 backdrop-blur-md bg-white/60 rounded-xl border border-white/20">
              {visualizationTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "hover:bg-white/50 text-gray-700"
                  }
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Visualization Content */}
          <Card className="backdrop-blur-md bg-white/60 border-white/20">
            <CardContent className="p-8">
              {ActiveVisualization && datasetData ? (
                <ActiveVisualization
                  data={datasetData}
                  isAssistantOpen={showAssistant}
                  overallMaxAbsImpact={overallChartMetrics.maxAbsImpact}
                  overallMinImpact={overallChartMetrics.minImpact}
                  overallMaxImpact={overallChartMetrics.maxImpact}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No visualization component or data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      {showAssistant && (
        <AIAssistant
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
          datasetData={datasetData}
          currentVisualization={activeTab}
        />
      )}
    </div>
  )
}

export default function VisualizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <VisualizationsContent />
    </Suspense>
  )
}
