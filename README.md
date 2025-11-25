# XAI Visualizer

**Making AI Explainable**

XAI Visualizer is a modern web application designed to transform complex AI explanations into intuitive, interactive visualizations. It helps users understand their model's decisions through various chart types and an AI-powered assistant.

![XAI Visualizer Preview](/public/OVGU logo - white.png)

## Features

- **📊 Interactive Visualizations**:
  - **Bar Chart**: View feature importance with clear positive and negative contributions.
  - **Tornado Charts**: Bidirectional visualizations showing how features push predictions in opposite directions.
  - **Force Field Analysis**: Visualize driving and restraining forces impacting decisions.
- **📁 Data Upload**: Easily upload your own JSON datasets or use sample data to get started immediately.

- **🤖 AI Assistant**: Chat with an integrated AI assistant (powered by Google Generative AI) to get plain-language explanations of your data and model behavior.
- **✨ Modern UI**: Built with a premium, responsive design using Tailwind CSS and Radix UI components.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI Integration**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
- **Backend/Auth**: [Supabase](https://supabase.com/) (Client included)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/SamK23/xAI-Visualizer.git
   cd xAI-Visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (or use the existing one) and add your API keys:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Upload Data**: Click "Get Started" and upload a JSON file containing your dataset and model predictions.

2. **Select Visualization**: Choose between Bar Chart, Tornado Chart, or Force Field Analysis to visualize the impact of different features.
3. **Analyze**: Hover over chart elements for detailed values.
4. **Ask AI**: Use the chat interface to ask specific questions about the data or request an explanation of a specific prediction.

## Data Format

The application requires a JSON file with a specific structure. Here is an example:

```json
{
  "columns": ["Feature", "Contribution", "Impact"],
  "data": [
    ["alcohol", 1.5712558031, "Positive"],
    ["sulphates", 0.9624174833, "Positive"],
    ["total sulfur dioxide", 0.6518693566, "Negative"],
    ["volatile acidity", 0.5169388652, "Negative"],
    ["chlorides", 0.5033429861, "Positive"],
    ["pH", 0.371339947, "Negative"],
    ["density", 0.3486789465, "Negative"],
    ["fixed acidity", 0.337703079, "Negative"],
    ["free sulfur dioxide", 0.3049920797, "Negative"],
    ["citric acid", 0.2762276828, "Positive"],
    ["residual sugar", 0.2197407633, "Positive"]
  ]
}
```


## Project Structure

- `/app`: Next.js app router pages and layouts.
- `/components`: Reusable UI components (buttons, cards, charts).
- `/lib`: Utility functions and helper code.
- `/public`: Static assets like images and logos.
- `/styles`: Global styles.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
