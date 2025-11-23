"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, TrendingUp, Upload, Database, GitBranch } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Bar Chart",
      description:
        "Horizontal bar charts showing which features have the most significant impact on predictions, with positive and negative contributions clearly distinguished",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Tornado Charts",
      description:
        "Bidirectional visualizations showing how features push predictions in opposite directions, making impact direction intuitive to understand",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Force Field Analysis",
      description:
        "Visualizes driving forces (positive contributions) and restraining forces (negative contributions) impacting a central decision or outcome.",
      color: "bg-indigo-100 text-indigo-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-auto h-12 flex items-center justify-center">
                <img src="/logo.png" alt="XAI Visualizer Logo" className="h-full w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">XAI Visualizer</h1>
                <p className="text-sm text-gray-600">Making AI Explainable</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Make AI Methods{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Accessible
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform complex AI explanations into intuitive visualizations. Upload your data, explore four different
            chart types, and chat with our AI assistant to understand your model's decisions.
          </p>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className={index === 2 ? "md:col-span-2 flex justify-center" : ""}>
                <Card
                  className={`backdrop-blur-md bg-white/60 border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105 ${index === 2 ? "w-full md:w-1/2" : "w-full"
                    }`}
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4 mx-auto`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push("/data-selection")}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Visualization Examples */}

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Three simple steps to understand your AI model's decisions</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Upload Data</h3>
            <p className="text-gray-600">Upload your CSV dataset or choose from our sample datasets to get started</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Explore Visualizations</h3>
            <p className="text-gray-600">
              Choose from 3 different chart types: Feature Importance, Tornado, and Force Field plots
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Ask Questions</h3>
            <p className="text-gray-600">Chat with our AI assistant to get explanations in plain language</p>
          </div>
        </div>
      </section>
    </div>
  )
}
