import { type NextRequest, NextResponse } from "next/server"

const sampleDatasets = {
  "bike-operations": {
    features: [
      { name: "Hour of Day (Peak)", importance: 0.42, value: 0.42, isPositive: true },
      { name: "Season: Summer", importance: 0.3, value: 0.3, isPositive: true },
      { name: "Working Day", importance: 0.25, value: 0.25, isPositive: true },
      { name: "Year", importance: 0.2, value: 0.2, isPositive: true },
      { name: "Month: June", importance: 0.15, value: 0.15, isPositive: true },
      { name: "Weekday", importance: 0.1, value: 0.1, isPositive: true },
      { name: "Windspeed", importance: 0.18, value: -0.18, isPositive: false },
      { name: "Humidity", importance: 0.25, value: -0.25, isPositive: false },
      { name: "Weather: Rain", importance: 0.35, value: -0.35, isPositive: false },
    ],
    metadata: {
      name: "Bike Operations Dataset",
      description: "Bike sharing rental prediction data",
      target: "Rental Likelihood",
      type: "sample",
    },
  },
  diabetes: {
    features: [
      { name: "Glucose", importance: 0.42, value: 0.42, isPositive: true },
      { name: "BMI", importance: 0.3, value: 0.3, isPositive: true },
      { name: "Age", importance: 0.25, value: 0.25, isPositive: true },
      { name: "Blood Pressure", importance: 0.2, value: 0.2, isPositive: true },
      { name: "Insulin", importance: 0.18, value: -0.18, isPositive: false },
      { name: "Diabetes Pedigree", importance: 0.15, value: 0.15, isPositive: true },
      { name: "Skin Thickness", importance: 0.1, value: -0.1, isPositive: false },
    ],
    metadata: {
      name: "Diabetes Dataset",
      description: "Diabetes prediction based on health metrics",
      target: "Diabetes Risk",
      type: "sample",
    },
  },
  "wine-quality": {
    features: [
      { name: "Alcohol", importance: 0.45, value: 0.45, isPositive: true },
      { name: "Sulphates", importance: 0.38, value: 0.38, isPositive: true },
      { name: "Volatile Acidity", importance: 0.3, value: -0.3, isPositive: false },
      { name: "Citric Acid", importance: 0.25, value: 0.25, isPositive: true },
      { name: "Total Sulfur Dioxide", importance: 0.22, value: -0.22, isPositive: false },
      { name: "Density", importance: 0.15, value: -0.15, isPositive: false },
      { name: "pH", importance: 0.1, value: 0.1, isPositive: true },
    ],
    metadata: {
      name: "Wine Quality Dataset",
      description: "Predicting wine quality based on physicochemical properties",
      target: "Wine Quality Score",
      type: "sample",
    },
  },
}

export async function GET(request: NextRequest, { params }: { params: { dataset: string } }) {
  try {
    const requestedDatasetKey = params.dataset
    console.log(`[Sample API] Received request for dataset key: "${requestedDatasetKey}"`)
    console.log(`[Sample API] Available keys in sampleDatasets: ${Object.keys(sampleDatasets).join(", ")}`)

    const dataset = sampleDatasets[requestedDatasetKey as keyof typeof sampleDatasets]

    if (!dataset) {
      console.error(
        `[Sample API] Dataset NOT FOUND for key: "${requestedDatasetKey}". This key does not exist in the sampleDatasets object.`,
      )
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    console.log(`[Sample API] Successfully found and serving dataset: "${requestedDatasetKey}"`)
    return NextResponse.json(dataset)
  } catch (error) {
    console.error("[Sample API] Internal server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
