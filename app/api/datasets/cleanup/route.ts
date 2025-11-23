import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase environment variables are missing for cleanup!");
      return NextResponse.json(
        {
          error:
            "Supabase credentials missing. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Delete all datasets marked as 'custom'
    const { error } = await supabase
      .from("datasets")
      .delete()
      .eq("data->metadata->>type", "custom"); // Target the 'type' field within the 'metadata' object inside 'data'

    if (error) {
      console.error("[Cleanup API] Supabase delete error:", error);
      return NextResponse.json({ error: error.message || "Failed to clean up datasets" }, { status: 500 });
    }

    console.log("[Cleanup API] Successfully deleted temporary custom datasets.");
    return NextResponse.json({ message: "Temporary custom datasets cleaned up successfully." });
  } catch (error: any) {
    console.error("[Cleanup API] General cleanup error:", error);
    return NextResponse.json({ error: error.message || "Failed to clean up datasets" }, { status: 500 });
  }
}