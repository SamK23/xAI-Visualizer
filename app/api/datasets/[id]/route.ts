import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`[API/datasets/[id]] Received request for dataset ID: "${params.id}"`); // Log the received ID
    const { data, error } = await supabase.from("datasets").select("*").eq("id", params.id);

    if (error) {
      console.error(`[API/datasets/[id]] Supabase query error for ID: "${params.id}". Error:`, error);
      return NextResponse.json({ error: error.message || "Failed to fetch dataset" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.error(`[API/datasets/[id]] Dataset not found for ID: "${params.id}". No data returned.`);
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    if (data.length > 1) {
      console.warn(`[API/datasets/[id]] Multiple datasets found for ID: "${params.id}". Returning the first one.`);
    }

    console.log(`[API/datasets/[id]] Successfully fetched dataset for ID: "${params.id}"`);
    console.log("[API/datasets/[id]] Fetched data content:", JSON.stringify(data[0].data).substring(0, 200) + "..."); // Log first 200 chars of the data content
    return NextResponse.json(data[0].data); // Return the first matching dataset's data
  } catch (error) {
    console.error("[API/datasets/[id]] Database error:", error)
    return NextResponse.json({ error: "Failed to fetch dataset" }, { status: 500 })
  }
}
