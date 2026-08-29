import React, { useState } from "react";
import UploadPage from "./components/UploadPage";
import AnalysisDashboard from "./components/AnalysisDashboard";
import TailoringStudio from "./components/TailoringStudio";
import PdfExportPage from "./components/PdfExportPage";

// Mock data acting as our AI backend response
const MOCK_ANALYSIS_DATA = {
  matchScore: 78,
  standoutFeatures: [
    "Strong React fundamentals",
    "Leadership background",
    "Agile methodology",
  ],
  areasToImprove: [
    "Missing Next.js keywords",
    "Tailwind CSS not explicitly mentioned",
  ],
  skillMatrix: {
    matched: ["React", "JavaScript", "Frontend", "UI/UX"],
    missing: ["Next.js", "Tailwind CSS", "Server Components"],
  },
  bulletDiffs: [
    {
      id: 1,
      original: "Built web applications using React and CSS.",
      suggested:
        "Engineered scalable web applications using React and Tailwind CSS, improving UI consistency.",
      status: "pending",
    },
    {
      id: 2,
      original: "Managed a team of developers.",
      suggested:
        "Directed a cross-functional team of 5 developers using Agile methodologies to deliver features 20% faster.",
      status: "pending",
    },
  ],
};

export default function MainApp() {
  // App States: 'upload' | 'analysis' | 'tailoring' | 'export'
  const [appState, setAppState] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = ({ file, jobDescription }) => {
    // Simulated API call
    setAnalysisData(MOCK_ANALYSIS_DATA);
    setAppState("analysis");
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-200 selection:bg-accent/20">
      {/* Global Theme Toggle */}
      <button
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium border border-border rounded-lg bg-surface hover:bg-border/50 z-50 shadow-sm"
      >
        Toggle Theme
      </button>

      {appState === "upload" && <UploadPage onAnalyze={handleAnalyze} />}

      {appState === "analysis" && (
        <AnalysisDashboard
          data={analysisData}
          onBack={() => setAppState("upload")}
          onNext={() => setAppState("tailoring")}
        />
      )}

      {appState === "tailoring" && (
        <TailoringStudio
          data={analysisData}
          onBack={() => setAppState("analysis")}
          onNext={() => setAppState("export")}
        />
      )}

      {appState === "export" && (
        <PdfExportPage onBack={() => setAppState("tailoring")} />
      )}
    </div>
  );
}
