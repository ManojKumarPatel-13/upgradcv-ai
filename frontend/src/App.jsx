import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import UploadPage from "./components/UploadPage";
import AnalysisDashboard from "./components/AnalysisDashboard";
import TailoringStudio from "./components/TailoringStudio";
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
  const [appState, setAppState] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAnalyze = ({ file, jobDescription }) => {
    setAnalysisData(MOCK_ANALYSIS_DATA);
    setAppState("analysis");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-7xl mx-auto relative animate-in fade-in duration-500 ease-out">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md active:scale-95 transition-all z-50 text-primary"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div
        key={appState}
        className="animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-both"
      >
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
          <PdfExportPage
            onBack={() => setAppState("tailoring")}
            onRestart={() => {
              setAnalysisData(null);
              setAppState("upload");
            }}
          />
        )}
      </div>
    </div>
  );
}
