import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  ArrowRight,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Search,
  Activity,
} from "lucide-react";

export default function UploadPage({ onAnalyze }) {
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const fileInputRef = useRef(null);

  const wordCount = jobDescription
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const isJdValid = wordCount >= 30;

  const processSteps = [
    { text: "Extracting document text...", icon: FileText },
    { text: "Cross-referencing JD requirements...", icon: Search },
    { text: "Generating tailored bullets...", icon: Wand2 },
    { text: "Calculating final match score...", icon: Activity },
  ];

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessStep((prev) => {
          if (prev >= processSteps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDemoData = () => {
    setJobDescription(
      "Looking for a Senior Frontend Engineer with 5+ years of React experience, strong UI/UX sensibilities, and a track record of building scalable web applications. Experience with Next.js and Tailwind CSS is a major plus.",
    );
    setFile({ name: "demo_resume_alex_chen.pdf", size: 1250000 });
  };

  const startAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAnalyze({ file, jobDescription });
    }, 3500);
  };

  if (isProcessing) {
    const CurrentIcon = processSteps[processStep].icon;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center gap-8 z-10">
          <div className="relative w-32 h-40 bg-surface border border-border rounded-xl shadow-2xl flex items-center justify-center overflow-hidden">
            <CurrentIcon
              key={`large-${processStep}`}
              className="w-12 h-12 text-accent opacity-50 animate-in zoom-in duration-300"
            />
            <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_15px_3px_rgba(36,138,84,0.5)] animate-[bounce_2s_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-50"></div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-primary font-medium text-lg h-8">
              <CurrentIcon
                key={`small-${processStep}`}
                className="w-5 h-5 text-accent animate-in spin-in-12 duration-300"
              />
              {processSteps[processStep].text}
            </div>
            <div className="w-64 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-700 ease-out"
                style={{
                  width: `${((processStep + 1) / processSteps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            1. Upload Resume
          </h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center h-72 rounded-2xl transition-all duration-300 ${
              isDragging
                ? "border-2 border-accent bg-accent/5 scale-[1.02] shadow-lg"
                : file
                  ? "border border-border bg-surface shadow-linear"
                  : "border-2 border-dashed border-border bg-surface hover:border-accent/50"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center w-full h-full">
                <div className="relative">
                  <FileCheck2 className="w-12 h-12 text-accent" />
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div>
                  <p className="text-primary font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="mt-4 text-xs font-medium text-secondary hover:text-accent transition-colors"
                >
                  Replace File
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                  <UploadCloud
                    className={`w-8 h-8 transition-colors ${isDragging ? "text-accent" : "text-secondary"}`}
                  />
                </div>
                <p className="text-primary font-medium mb-1">
                  Drag & drop your PDF here
                </p>
                <p className="text-sm text-secondary mb-6">
                  or click to browse files
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-border/50 active:scale-95 transition-all duration-150 shadow-sm"
                >
                  Select File
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            2. Paste Job Description
          </h2>
          <div className="relative h-72">
            <textarea
              className={`w-full h-full p-5 rounded-2xl border bg-surface text-primary placeholder:text-secondary resize-none focus:outline-none transition-all shadow-linear ${
                wordCount > 0 && !isJdValid
                  ? "border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                  : "border-border focus:ring-2 focus:ring-accent/20"
              }`}
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full shadow-sm">
              <span className="text-xs font-medium text-secondary">
                {wordCount} words
              </span>
              {wordCount === 0 ? null : isJdValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface border border-border rounded-2xl shadow-linear z-10">
        <div className="flex flex-col text-center sm:text-left">
          <h3 className="font-semibold text-primary">Ready to optimize?</h3>
          <p className="text-sm text-secondary mt-1">
            Our AI will analyze your match and suggest improvements.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDemoData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-primary hover:bg-background active:scale-95 transition-all duration-150 font-medium text-sm shadow-sm"
          >
            <Wand2 className="w-4 h-4" />
            Try Demo Data
          </button>

          <button
            onClick={startAnalysis}
            disabled={!file || !jobDescription || !isJdValid}
            className="group relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-accent text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-95 transition-all duration-150 hover:bg-accent/90 shadow-[0_4px_14px_0_rgba(36,138,84,0.39)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Analyze Match
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            {!(!file || !jobDescription || !isJdValid) && (
              <div className="absolute inset-0 -translate-x-full animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 z-0 group-hover:animate-none"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
