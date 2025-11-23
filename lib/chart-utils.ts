interface FeatureData {
  name: string
  importance: number // Absolute importance for sorting
  value: number // Original value for display (can be positive or negative)
  isPositive: boolean
}

/**
 * Processes raw feature data. It now returns ALL processed features,
 * sorted by absolute importance. The selection of top N features
 * is moved to the individual chart components.
 * @param features - The raw array of feature objects from the dataset.
 * @returns An array of processed FeatureData objects, sorted by importance.
 */
export function processChartFeatures(features: any[]): FeatureData[] {
  if (!features || !Array.isArray(features) || features.length === 0) {
    return []
  }

  const processed = features
    .map((f) => {
      // Ensure 'value' is used for the actual signed impact
      const rawValue = typeof f.value === "number" ? f.value : 0
      // Use the existing isPositive flag if available, otherwise derive from rawValue
      const isPositiveFlag = typeof f.isPositive === "boolean" ? f.isPositive : rawValue >= 0

      return {
        name: (f.name || "Unknown Feature").charAt(0).toUpperCase() + (f.name || "Unknown Feature").slice(1),
        importance: Math.abs(rawValue), // Importance is always absolute
        value: rawValue, // Keep original value for display (positive/negative)
        isPositive: isPositiveFlag,
      }
    })
    .filter((f) => f.name && typeof f.value === "number" && f.importance > 0) // Filter out features with 0 importance

  // Sort all features by absolute importance
  return processed.sort((a, b) => b.importance - a.importance)
}
