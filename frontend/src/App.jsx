import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import UploadPage from "./components/UploadPage";
import AnalysisDashboard from "./components/AnalysisDashboard";
import TailoringStudio from "./components/TailoringStudio";
import PdfExportPage from "./components/PdfExportPage";

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

  const handleAnalyze = async ({ file, jobDescription }) => {
    try {
      // 1. Pack the file and text into a FormData object
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      // 2. Send it to your local Node server
      const response = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server failed to process document");
      }

      // 3. Extract the real JSON from the AI
      const liveAiData = await response.json();

      // 4. Update the state to transition the page
      setAnalysisData(liveAiData);
      setAppState("analysis");
    } catch (error) {
      console.error("API Error:", error);
      alert(
        "Failed to connect to the backend. Make sure your server is running on port 4000.",
      );
      // Fallback to upload state so the UI doesn't get stuck on a loading screen
      setAppState("upload");
    }
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-200 relative">
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
