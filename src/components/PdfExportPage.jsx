import React, { useState, useEffect } from "react";
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PdfExportPage({ onBack, onRestart }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadState, setDownloadState] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const [scanPos, setScanPos] = useState(-100);
  const [rollingScore, setRollingScore] = useState(78);

  useEffect(() => {
    let scanInterval;
    if (isGenerating) {
      scanInterval = setInterval(() => {
        setScanPos((prev) => (prev >= 200 ? -100 : prev + 5));
      }, 50);
    }

    const timer = setTimeout(() => {
      setIsGenerating(false);
      clearInterval(scanInterval);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(scanInterval);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      let current = 78;
      const interval = setInterval(() => {
        if (current >= 94) {
          clearInterval(interval);
        } else {
          current += 1;
          setRollingScore(current);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleDownload = () => {
    setDownloadState("success");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#248A54", "#ffffff", "#E2E8E4"],
    });
    setTimeout(() => setDownloadState("idle"), 3000);
  };

  const handleCopy = () => {
    setShowToast(true);
    navigator.clipboard.writeText(
      "Dear Hiring Team,\n\nWith over 5 years of experience engineering scalable web applications using React and Tailwind CSS, I am excited to apply for the Senior Frontend Engineer position. My recent focus on improving UI consistency directly aligns with your current roadmap...",
    );
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex justify-between items-center bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm z-10 animate-in slide-in-from-top-4 fade-in duration-500">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-primary hover:bg-background active:scale-95 transition-all duration-150 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Studio
        </button>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Final Output</h1>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating || downloadState === "success"}
          className={`group relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm active:scale-95 transition-all overflow-hidden ${
            downloadState === "success"
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : "bg-accent text-white hover:bg-accent/90 shadow-[0_4px_14px_0_rgba(36,138,84,0.39)]"
          }`}
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 z-0"></div>
          <span className="relative z-10 flex items-center gap-2">
            {downloadState === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Download PDF
              </>
            )}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10">
        <div
          className="lg:col-span-2 bg-gradient-to-br from-surface to-background rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center p-8 relative overflow-hidden spotlight-card animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500"
          style={{ animationDelay: "100ms" }}
        >
          <div className="w-full max-w-[500px] aspect-[1/1.4] bg-white dark:bg-[#0D0E10] border border-border/30 rounded-lg shadow-2xl relative overflow-hidden p-8 flex flex-col gap-6">
            {isGenerating && (
              <div
                className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-accent/20 to-transparent blur-md z-20 pointer-events-none"
                style={{ top: `${scanPos}%` }}
              >
                <div className="absolute bottom-1/2 w-full h-px bg-accent shadow-[0_0_8px_2px_rgba(36,138,84,0.8)]"></div>
              </div>
            )}

            <div className="flex flex-col gap-2 border-b border-border/40 pb-4">
              <div
                className={`h-6 w-1/2 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/80"}`}
              ></div>
              <div
                className={`h-3 w-1/3 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-secondary/60"}`}
              ></div>
              <div
                className={`h-3 w-1/4 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-secondary/60"}`}
              ></div>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className={`h-4 w-1/4 rounded mb-2 ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/70"}`}
              ></div>
              {[1, 2, 3].map((i) => (
                <div key={`exp1-${i}`} className="flex gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isGenerating ? "bg-border/40 animate-pulse" : "bg-accent/80"}`}
                  ></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div
                      className={`h-2.5 w-full rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/60"}`}
                    ></div>
                    {i !== 3 && (
                      <div
                        className={`h-2.5 w-5/6 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/60"}`}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div
                className={`h-4 w-1/4 rounded mb-2 ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/70"}`}
              ></div>
              {[1, 2].map((i) => (
                <div key={`exp2-${i}`} className="flex gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isGenerating ? "bg-border/40 animate-pulse" : "bg-accent/80"}`}
                  ></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div
                      className={`h-2.5 w-11/12 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/60"}`}
                    ></div>
                    <div
                      className={`h-2.5 w-4/5 rounded ${isGenerating ? "bg-border/40 animate-pulse" : "bg-primary/60"}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isGenerating && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 scale-[0.95] bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-700 z-30">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                    Match Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary opacity-50 line-through">
                      78%
                    </span>
                    <ArrowRight className="w-3 h-3 text-secondary" />
                    <span className="text-lg font-bold text-accent">
                      {rollingScore}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent/10 rounded-full">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-semibold text-primary">
                  +3 Keywords Injected
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div
            className="bg-gradient-to-br from-surface to-background p-6 rounded-2xl border border-border/50 shadow-sm flex-1 flex flex-col relative overflow-hidden group spotlight-card animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500"
            style={{ animationDelay: "200ms" }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-24 h-24 text-accent" />
            </div>

            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="w-5 h-5 text-accent" />
              Smart Cover Letter
            </h3>
            <p className="text-sm text-secondary mb-6 relative z-10">
              We generated a highly tailored cover letter snippet based on your
              improved resume and the job description.
            </p>

            <div className="flex-1 bg-background/50 border border-border/50 rounded-xl p-4 mb-4 text-sm text-primary leading-relaxed relative z-10">
              Dear Hiring Team,
              <br />
              <br />
              With over 5 years of experience engineering scalable web
              applications using React and Tailwind CSS, I am excited to apply
              for the Senior Frontend Engineer position. My recent focus on
              improving UI consistency directly aligns with your current
              roadmap...
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-primary hover:bg-background active:scale-95 transition-all duration-150 font-medium text-sm relative z-10"
            >
              <Copy className="w-4 h-4" />
              Copy Snippet
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-between p-6 bg-surface border border-border/50 rounded-2xl shadow-sm z-10 animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-sm font-medium text-secondary">
            All processes completed successfully.
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#0A66C2]/20 text-[#0A66C2] bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 active:scale-95 transition-all duration-150 font-medium text-sm">
            <Share2 className="w-4 h-4" />
            Share Score
          </button>
          <button
            onClick={onRestart}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-primary hover:bg-background active:scale-95 transition-all duration-150 font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface text-primary border border-border shadow-xl px-5 py-3 rounded-full transition-all duration-300 z-50 ${
          showToast
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <CheckCircle2 className="w-5 h-5 text-accent" />
        <span className="text-sm font-medium">
          Cover letter copied to clipboard
        </span>
      </div>
    </div>
  );
}
