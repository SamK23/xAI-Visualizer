import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Check for Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL; // Changed from NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Changed from NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Supabase environment variables are missing!");
      console.error("SUPABASE_URL:", supabaseUrl ? "Set" : "Not Set");
      console.error("SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "Not Set");
      console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "Set" : "Not Set");
      return NextResponse.json(
        {
          error:
            "Supabase credentials missing. Please ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set in your .env file (for local) or Vercel project environment variables (for deployment).",
        },
        { status: 500 },
      );
    }

    // Use the service_role key for server-side operations that bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    let processedData: any
    const fileContent = await file.text()

    console.log(`[Upload API] Received file: ${file.name}, size: ${file.size} bytes`)

    // Only accept JSON files
    if (file.name.endsWith(".json")) {
      const rawJson = JSON.parse(fileContent)
      console.log("[Upload API] Parsed raw JSON:", JSON.stringify(rawJson).substring(0, 200) + "...") // Log first 200 chars
      let featuresArray: any[] = []
      let metadata: any = {}

      // NEW CASE 1: rawJson has "columns" and "data" arrays with specific headers ["Feature", "Contribution", "Impact"]
      if (
        typeof rawJson === "object" &&
        rawJson !== null &&
        Array.isArray(rawJson.columns) &&
        Array.isArray(rawJson.data) &&
        rawJson.columns.includes("Feature") &&
        rawJson.columns.includes("Contribution") &&
        rawJson.columns.includes("Impact")
      ) {
        const featureIdx = rawJson.columns.indexOf("Feature")
        const contributionIdx = rawJson.columns.indexOf("Contribution")
        const impactIdx = rawJson.columns.indexOf("Impact")

        featuresArray = rawJson.data.map((row: any[]) => {
          const contribution = typeof row[contributionIdx] === "number" ? row[contributionIdx] : 0
          return {
            name: row[featureIdx] || "Unknown Feature",
            importance: Math.abs(contribution),
            value: contribution,
            isPositive: row[impactIdx] === "Positive",
          }
        })

        metadata = {
          name: file.name,
          description: "Feature contribution analysis",
          target: "Model Prediction",
          totalRows: featuresArray.length,
          totalFeatures: featuresArray.length,
        }
        console.log("[Upload API] Processed new JSON format (Feature/Contribution/Impact).")
      }
      // NEW CASE 2: rawJson has "columns" and "data" arrays (e.g., SHAP output for multiple instances)
      if (
        typeof rawJson === "object" &&
        rawJson !== null &&
        Array.isArray(rawJson.columns) &&
        Array.isArray(rawJson.data)
      ) {
        if (rawJson.columns.length === 0 || rawJson.data.length === 0) {
          console.error("[Upload API] JSON must contain non-empty 'columns' and 'data' arrays.")
          return NextResponse.json(
            { error: "JSON must contain non-empty 'columns' and 'data' arrays." },
            { status: 400 },
          )
        }

        // Calculate average SHAP value for each feature across all instances
        for (let i = 0; i < rawJson.columns.length; i++) {
          const featureName = rawJson.columns[i]
          let sumShap = 0
          let count = 0

          for (const instanceRow of rawJson.data) {
            if (Array.isArray(instanceRow) && instanceRow.length > i && typeof instanceRow[i] === "number") {
              sumShap += instanceRow[i]
              count++
            }
          }

          if (count > 0) {
            const averageShapValue = sumShap / count
            featuresArray.push({
              name: featureName,
              importance: Math.abs(averageShapValue), // Absolute value for importance
              value: averageShapValue, // Original value for display
              isPositive: averageShapValue >= 0,
            })
          }
        }
        // Default metadata for this format
        metadata = {
          name: file.name,
          description: "Aggregated SHAP values from multiple instances",
          target: "Model Prediction",
          totalRows: rawJson.data.length, // Number of instances
          totalFeatures: rawJson.columns.length,
        }
        console.log("[Upload API] Processed new JSON format (columns/data).")
      }
      // Existing Case 1: rawJson has "features" and "shap_values" arrays (previous custom format)
      else if (
        typeof rawJson === "object" &&
        rawJson !== null &&
        Array.isArray(rawJson.features) &&
        Array.isArray(rawJson.shap_values)
      ) {
        if (rawJson.features.length !== rawJson.shap_values.length) {
          console.error("[Upload API] Feature names and SHAP values arrays must have the same length.")
          return NextResponse.json(
            { error: "Feature names and SHAP values arrays must have the same length." },
            { status: 400 },
          )
        }
        featuresArray = rawJson.features.map((name: string, index: number) => {
          const contribution = typeof rawJson.shap_values[index] === "number" ? rawJson.shap_values[index] : 0
          return {
            name: name || "Unknown Feature",
            importance: Math.abs(contribution), // Absolute value for importance
            value: contribution, // Original value for display
            isPositive: contribution >= 0,
          }
        })
        if (rawJson.metadata && typeof rawJson.metadata === "object") {
          metadata = rawJson.metadata
        }
        console.log("[Upload API] Processed existing JSON format (features/shap_values).")
      }
      // Existing Case 2: rawJson is an array of feature objects like [{"Feature Name": "ABC", "Contribution": 0.5}]
      else if (Array.isArray(rawJson)) {
        featuresArray = rawJson
          .map((item: any) => {
            const contribution = typeof item.Contribution === "number" ? item.Contribution : 0
            return {
              name: item["Feature Name"] || item.name || "Unknown Feature",
              importance: Math.abs(contribution), // Absolute value for importance
              value: contribution, // Original value for display
              isPositive: contribution >= 0,
            }
          })
          .filter((f) => f.name && typeof f.value === "number") // Filter out invalid entries
        console.log("[Upload API] Processed existing JSON format (array of feature objects).")
      }
      // Existing Case 3: rawJson is an object that directly contains 'features' and 'metadata' (e.g., re-upload of a processed file)
      else if (typeof rawJson === "object" && rawJson !== null && rawJson.features && Array.isArray(rawJson.features)) {
        featuresArray = rawJson.features
          .map((item: any) => ({
            name: item.name || item["Feature Name"] || "Unknown Feature",
            importance:
              typeof item.importance === "number"
                ? Math.abs(item.importance)
                : typeof item.value === "number"
                  ? Math.abs(item.value)
                  : 0,
            value:
              typeof item.value === "number" ? item.value : typeof item.importance === "number" ? item.importance : 0,
            isPositive:
              typeof item.value === "number"
                ? item.value >= 0
                : typeof item.importance === "number"
                  ? item.importance >= 0
                  : false,
          }))
          .filter((f: any) => f.name && typeof f.importance === "number")
        if (rawJson.metadata && typeof rawJson.metadata === "object") {
          metadata = rawJson.metadata
        }
        console.log("[Upload API] Processed existing JSON format (features/metadata object).")
      }
      // Existing Case 4: rawJson is a single feature object like {"Feature Name": "ABC", "Contribution": 0.5}
      else if (
        typeof rawJson === "object" &&
        rawJson !== null &&
        rawJson["Feature Name"] &&
        typeof rawJson.Contribution === "number"
      ) {
        featuresArray = [
          {
            name: rawJson["Feature Name"],
            importance: Math.abs(rawJson.Contribution),
            value: rawJson.Contribution,
            isPositive: rawJson.Contribution >= 0,
          },
        ]
        console.log("[Upload API] Processed existing JSON format (single feature object).")
      } else {
        console.error("[Upload API] Invalid JSON structure detected.")
        return NextResponse.json(
          {
            error:
              "Invalid JSON structure. Expected an array of feature objects, an object with 'features' and 'shap_values' arrays, an object with 'columns' and 'data' arrays, or an object with 'features' and 'metadata'.",
          },
          { status: 400 },
        )
      }

      processedData = {
        features: featuresArray,
        metadata: {
          name: file.name, // Default name
          description: metadata.description || "Custom uploaded XAI output",
          target: metadata.target || "Unknown Target",
          totalRows: featuresArray.length, // Assuming each feature is a "row" for simplicity
          totalFeatures: featuresArray.length,
          ...metadata, // Merge any existing metadata from the uploaded JSON
          type: "custom", // Mark as custom
        },
      }
      console.log("[Upload API] Final processed data (features count):", processedData.features?.length)
    } else {
      console.error("[Upload API] Unsupported file type:", file.name)
      return NextResponse.json({ error: "Unsupported file type. Only JSON files are accepted." }, { status: 400 })
    }

    // Store in Supabase
    console.log("[Upload API] Attempting to insert data into Supabase...");

    // Generate a unique name for the dataset
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
    const randomString = Math.random().toString(36).substring(2, 8); // Short random string
    const originalFileName = file.name.replace(/\.json$/, "");
    const uniqueFileName = `${originalFileName}_${timestamp}_${randomString}.json`;

    console.log(`[Upload API] Inserting new dataset with unique name: "${uniqueFileName}"`);
    console.log("[Upload API] Processed Data Preview:", JSON.stringify(processedData).substring(0, 500));

    const { data, error: insertError } = await supabase
      .from("datasets")
      .insert({
        name: uniqueFileName, // Use the generated unique name
        data: processedData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error details:", JSON.stringify(insertError, null, 2));
      let userErrorMessage = "Failed to store dataset.";
      if (insertError.code === "23505") { // Unique violation
        userErrorMessage = "A dataset with this name already exists. Please rename your file or delete the existing one.";
      } else if (insertError.message.includes("not-null")) {
        userErrorMessage = "Missing required data fields for storage.";
      }
      return NextResponse.json({ error: userErrorMessage + " " + insertError.message + " " + insertError.details }, { status: 500 });
    }

    if (!data || !data.id) {
      console.error("Supabase insert returned no data or no ID despite no error.");
      return NextResponse.json({ error: "Failed to retrieve inserted dataset ID." }, { status: 500 });
    }

    console.log(`[Upload API] Dataset uploaded successfully with ID: ${data.id}`);
    return NextResponse.json({
      id: data.id,
      features: processedData.features?.length || 0,
      message: "Dataset uploaded successfully",
    });
  } catch (error: any) {
    console.error("[Upload API] General upload error:", error)
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        { error: "Invalid JSON format. Please ensure your file is valid JSON." },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: error.message || "Failed to process file" }, { status: 500 })
  }
}
