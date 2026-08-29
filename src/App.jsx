import React, { useState } from "react";
import UploadPage from "./components/UploadPage";
import AnalysisDashboard from "./components/AnalysisDashboard";
import PdfExportPage from "./components/PdfExportPage";

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
  ],
};

export default function MainApp() {
  const [appState, setAppState] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = ({ file, jobDescription }) => {
    setAnalysisData(MOCK_ANALYSIS_DATA);
    setAppState("analysis");
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-200">
      <button
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium border border-border rounded bg-surface hover:bg-border/50 z-50"
      >
        Toggle Theme
      </button>

      {appState === "upload" && <UploadPage onAnalyze={handleAnalyze} />}

      {appState === "analysis" && (
        <AnalysisDashboard
          data={analysisData}
          onBack={() => setAppState("upload")}
          onNext={() => setAppState("export")}
        />
      )}

      {appState === "export" && (
        <PdfExportPage onBack={() => setAppState("analysis")} />
      )}
    </div>
  );
}
