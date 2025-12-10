import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
    try {
        const { imageData, filename } = await req.json()

        if (!imageData || !filename) {
            return NextResponse.json(
                { error: "Missing image data or filename" },
                { status: 400 }
            )
        }

        // Remove header if present (data:image/png;base64,)
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
        const buffer = Buffer.from(base64Data, "base64")

        // Define the output directory
        const outputDir = path.join(process.cwd(), "generated-visuals")

        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        // Full file path
        const filePath = path.join(outputDir, filename)

        // Write file
        fs.writeFileSync(filePath, buffer)

        return NextResponse.json({ success: true, path: filePath })
    } catch (error: any) {
        console.error("Error saving chart image:", error)
        return NextResponse.json(
            { error: "Failed to save image", details: error.message },
            { status: 500 }
        )
    }
}
