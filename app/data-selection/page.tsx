"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react" // Added useCallback
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Database, ArrowLeft, FileText, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { clearChatHistory } from "@/components/ai-assistant" // Import clearChatHistory

export default function DataSelectionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Function to clean up temporary datasets
  const cleanupTemporaryDatasets = async () => {
    try {
      const response = await fetch("/api/datasets/cleanup", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to clean up temporary datasets:", errorData.error);
      } else {
        console.log("Temporary datasets cleaned up successfully.");
      }
    } catch (error) {
      console.error("Error during temporary dataset cleanup:", error);
    }
  };

  // Memoized navigation handlers to clear history
  const handleBackToHome = useCallback(() => {
    clearChatHistory()
    router.push("/")
  }, [router])

  const handleNavigateToVisualizations = useCallback(
    (datasetId: string, fileName: string, isSample = false) => {
      clearChatHistory()
      router.push(
        `/visualizations?dataset=${datasetId}&name=${encodeURIComponent(fileName)}${isSample ? "&sample=true" : ""}`,
      )
    },
    [router],
  )

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Only allow JSON files
    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      await cleanupTemporaryDatasets(); // Clean up previous datasets before uploading new one

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-dataset", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Dataset uploaded successfully",
          description: `${result.features} features detected`,
        })
        handleNavigateToVisualizations(result.id, file.name, false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Please try again with a valid dataset",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSampleDataset = async (datasetName: string) => {
    await cleanupTemporaryDatasets(); // Clean up previous datasets before selecting new one
    handleNavigateToVisualizations(datasetName, datasetName, true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBackToHome} className="hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-auto h-12 flex items-center justify-center">
                <img src="/logo.png" alt="XAI Visualizer Logo" className="h-full w-auto object-contain" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">XAI Visualizer</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Data</h1>
            <p className="text-xl text-gray-600">Choose how you'd like to get started with XAI visualizations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Dataset */}
            <Card className="backdrop-blur-md bg-white/60 border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Upload Your Dataset</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload a JSON file to analyze with our XAI visualizations.
                </p>

                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Select File
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-500 mt-3">Supported format: JSON (max 10MB)</p>
              </CardContent>
            </Card>

            {/* Sample Datasets */}
            <Card className="backdrop-blur-md bg-white/60 border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Sample Datasets</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explore our pre-loaded example datasets for demonstration and exploration
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleSampleDataset("bike-operations")}
                    variant="outline"
                    className="w-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 font-medium py-3 rounded-xl"
                  >
                    🚲 Bike Operations
                  </Button>

                  <Button
                    onClick={() => handleSampleDataset("diabetes")}
                    variant="outline"
                    className="w-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 font-medium py-3 rounded-xl"
                  >
                    🏥 Diabetes Dataset
                  </Button>

                  <Button
                    onClick={() => handleSampleDataset("wine-quality")}
                    variant="outline"
                    className="w-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 font-medium py-3 rounded-xl"
                  >
                    🍷 Wine Quality Dataset
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-4">Perfect for learning and experimentation</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <Card className="backdrop-blur-md bg-white/40 border-white/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                      1
                    </div>
                    <p className="text-gray-600">Upload your XAI output JSON</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                      2
                    </div>
                    <p className="text-gray-600">Generate intuitive visualizations</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                      3
                    </div>
                    <p className="text-gray-600">Chat with AI assistant for insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
