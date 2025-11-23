import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error("GEMINI_API_KEY is not set.");
      return NextResponse.json(
        { error: "Server configuration error: GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const { message, datasetData, currentVisualization, conversationHistory } = await request.json();

    console.log("[Chat API] Received message:", message);
    console.log("[Chat API] Current Visualization:", currentVisualization);
    console.log("[Chat API] Dataset Data (metadata only):", datasetData?.metadata);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const datasetType = datasetData?.metadata?.type || "unknown";
    const datasetName = datasetData?.metadata?.name || "User Dataset";
    const targetVariable = datasetData?.metadata?.target || "Unknown";
    const datasetFeatures =
      datasetData?.features?.map((f: any) => `${f.name} (${f.importance || f.value})`).join(", ") || "None";

    let aiInstructions = "";
    if (datasetType === "sample") {
      aiInstructions = `
This is a well-known open-source dataset. You can leverage your foundational knowledge about ${datasetName} (e.g., Bike Sharing, Diabetes, Wine Quality) to provide richer context and insights. Explain concepts related to this specific domain where appropriate.
`;
    } else {
      aiInstructions = `
This is a custom dataset with limited metadata. Your responses must strictly adhere to the provided 'Dataset Features' and 'Target Variable' information. Do not introduce external knowledge or make assumptions beyond the given data. Focus on interpreting the provided feature attributions.
`;
    }

    // Create comprehensive context
    const context = `
You are an AI assistant specializing in Explainable AI (XAI) and data visualization. You help users understand machine learning model interpretability through various visualization techniques.

${aiInstructions}

CURRENT CONTEXT:
- Dataset Name: ${datasetName}
- Current Visualization: ${currentVisualization}
- Dataset Features: ${datasetFeatures}
- Target Variable: ${targetVariable}

AVAILABLE VISUALIZATIONS:
1. **Feature Importance**: Horizontal bar chart showing feature impact strength with positive/negative contributions
2. **Tornado Chart**: Bidirectional bars showing positive/negative feature impacts with directional arrows
3. **Force Field Analysis**: Visualizes driving forces (positive contributions) and restraining forces (negative contributions) impacting a central decision or outcome.

YOUR ROLE:
- Explain XAI concepts in simple, accessible language
- Help interpret visualization patterns and insights
- Answer questions about feature importance and model behavior
- Provide context about why certain features matter
- Compare different visualization approaches when relevant
- Use markdown formatting for clear, structured responses

RESPONSE STYLE:
- Use **bold** for key terms and concepts
- Use bullet points for lists and explanations
- Include specific feature names and values when relevant
- Keep explanations concise but comprehensive
- Format responses like ChatGPT/Claude with proper structure

Previous conversation context:
${
  conversationHistory
    ?.slice(-5)
    .map((msg: any) => `${msg.role}: ${msg.content}`)
    .join("\n") || ""
}

User question: ${message}

Provide a helpful, well-formatted response about XAI, the data, or visualizations.
`;
    console.log("[Chat API] Generated context:", context.substring(0, 500) + "..."); // Log first 500 chars of context

    const result = await model.generateContent(context);
    const response = result.response.text();

    console.log("[Chat API] Generated AI response (first 200 chars):", response.substring(0, 200) + "...");
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("[Chat API] General chat error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response from AI assistant" }, { status: 500 });
  }
}
