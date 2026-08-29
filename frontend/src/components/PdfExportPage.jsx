import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  RefreshCw,
  Copy,
  ArrowRight,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";
import html2pdf from "html2pdf.js";

export default function PdfExportPage({ data, onBack, onRestart }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadState, setDownloadState] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const [scanPos, setScanPos] = useState(-100);

  const targetScore = data?.matchScore || 94;
  const initialScore = Math.max(0, targetScore - 16);
  const [rollingScore, setRollingScore] = useState(initialScore);

  const coverLetterText =
    data?.coverLetterSnippet ||
    "Dear Hiring Team,\n\nWith over 5 years of experience engineering scalable web applications using React and Tailwind CSS, I am excited to apply for the position. My recent focus on improving UI consistency directly aligns with your current roadmap...";

  const mergedResumeData = useMemo(() => {
    if (!data?.resumeData) return null;

    const clonedData = JSON.parse(JSON.stringify(data.resumeData));
    const acceptedDiffs = (data.bulletDiffs || []).filter(
      (d) => d.status === "accepted",
    );

    const applyDiffs = (sections) => {
      if (!sections) return;
      sections.forEach((sec) => {
        if (sec.bullets) {
          sec.bullets.forEach((b) => {
            const match = acceptedDiffs.find((d) => d.id === b.id);
            if (match) b.text = match.suggested;
          });
        }
      });
    };

    applyDiffs(clonedData.experience);
    applyDiffs(clonedData.projects);

    return clonedData;
  }, [data]);

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
      let current = initialScore;
      const interval = setInterval(() => {
        if (current >= targetScore) {
          clearInterval(interval);
        } else {
          current += 1;
          setRollingScore(current);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isGenerating, initialScore, targetScore]);

  const handleDownload = () => {
    setDownloadState("success");

    const element = document.getElementById("resume-preview");
    const opt = {
      margin: 0.4,
      filename: "UpgradCV_Tailored_Resume.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: "avoid-all", before: ".page-break" },
    };

    html2pdf().set(opt).from(element).save();

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
    navigator.clipboard.writeText(coverLetterText);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = async () => {
    const shareText = `I just tailored my resume using UpgradCV and hit a ${targetScore}% match score! 🚀`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "UpgradCV Match Score",
          text: shareText,
        });
      } catch (err) {
        console.error("User canceled share", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Score text copied to clipboard!");
    }
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
          className="lg:col-span-2 bg-gradient-to-br from-surface to-background rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-start p-8 relative overflow-hidden spotlight-card animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500 max-h-[85vh] overflow-y-auto"
          style={{ animationDelay: "100ms" }}
        >
          <div className="w-full max-w-[8.5in] min-h-[11in] bg-white text-black shadow-2xl relative p-8">
            {isGenerating ? (
              <div className="absolute inset-0 z-20 overflow-hidden bg-white">
                <div
                  className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-accent/20 to-transparent blur-md pointer-events-none"
                  style={{ top: `${scanPos}%` }}
                >
                  <div className="absolute bottom-1/2 w-full h-px bg-accent shadow-[0_0_8px_2px_rgba(36,138,84,0.8)]"></div>
                </div>
                <div className="flex flex-col gap-4 p-8 opacity-50">
                  <div className="h-8 w-1/3 mx-auto rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-2/3 mx-auto rounded bg-gray-200 animate-pulse mb-8"></div>
                  <div className="h-6 w-1/4 rounded bg-gray-200 animate-pulse border-b pb-2"></div>
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse mt-2"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse mt-2"></div>
                </div>
              </div>
            ) : mergedResumeData ? (
              <div
                id="resume-preview"
                className="font-sans text-[10.5pt] leading-[1.4] text-gray-900 w-full"
              >
                <div className="text-center mb-5">
                  <h1 className="text-[22pt] font-bold uppercase tracking-wide text-black mb-1">
                    {mergedResumeData.header?.name}
                  </h1>
                  <div className="text-[10pt] flex flex-wrap justify-center items-center gap-x-2 text-gray-800">
                    {mergedResumeData.header?.email && (
                      <span>{mergedResumeData.header.email}</span>
                    )}
                    {mergedResumeData.header?.phone && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span>{mergedResumeData.header.phone}</span>
                      </>
                    )}
                    {mergedResumeData.header?.links?.map((link, i) => (
                      <React.Fragment key={i}>
                        <span className="text-gray-400">|</span>
                        <span>{link.replace(/^https?:\/\//, "")}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {mergedResumeData.summary && (
                  <div className="mb-4">
                    <p className="text-justify">{mergedResumeData.summary}</p>
                  </div>
                )}

                {mergedResumeData.skills &&
                  Object.keys(mergedResumeData.skills).length > 0 && (
                    <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
                      <h2 className="text-[12pt] font-bold uppercase border-b border-black text-black mb-2 pb-0.5 tracking-wider">
                        Skills Summary
                      </h2>
                      <div className="flex flex-col gap-1">
                        {Object.entries(mergedResumeData.skills).map(
                          ([category, items]) => {
                            if (!items || items.length === 0) return null;
                            return (
                              <div key={category} className="flex">
                                <span className="font-bold min-w-[100px]">
                                  {category}:
                                </span>
                                <span>{items.join(", ")}</span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                {mergedResumeData.experience &&
                  mergedResumeData.experience.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-[12pt] font-bold uppercase border-b border-black text-black mb-3 pb-0.5 tracking-wider">
                        Experience
                      </h2>
                      {mergedResumeData.experience.map((job, idx) => (
                        <div
                          key={idx}
                          className="mb-4"
                          style={{ pageBreakInside: "avoid" }}
                        >
                          <div className="flex justify-between items-baseline font-bold text-black mb-0.5">
                            <span>
                              {job.title}{" "}
                              <span className="font-normal text-gray-800 mx-1">
                                |
                              </span>{" "}
                              {job.company}
                            </span>
                            <span className="font-normal text-gray-800 text-[10pt]">
                              {job.date}
                            </span>
                          </div>
                          {job.location && (
                            <div className="text-[10pt] italic text-gray-700 mb-1">
                              {job.location}
                            </div>
                          )}
                          <ul className="list-disc pl-5 mt-1.5 flex flex-col gap-1 text-justify">
                            {job.bullets?.map((b, i) => (
                              <li key={i}>{b.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                {mergedResumeData.projects &&
                  mergedResumeData.projects.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-[12pt] font-bold uppercase border-b border-black text-black mb-3 pb-0.5 tracking-wider">
                        Projects
                      </h2>
                      {mergedResumeData.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="mb-4"
                          style={{ pageBreakInside: "avoid" }}
                        >
                          <div className="flex justify-between items-baseline font-bold text-black mb-0.5">
                            <span>
                              {proj.name}{" "}
                              {proj.role && (
                                <>
                                  <span className="font-normal text-gray-800 mx-1">
                                    |
                                  </span>{" "}
                                  {proj.role}
                                </>
                              )}
                            </span>
                            {proj.date && (
                              <span className="font-normal text-gray-800 text-[10pt]">
                                {proj.date}
                              </span>
                            )}
                          </div>
                          {proj.links && proj.links.length > 0 && (
                            <div className="text-[9pt] text-gray-600 mb-1">
                              {proj.links.join(" | ")}
                            </div>
                          )}
                          <ul className="list-disc pl-5 mt-1.5 flex flex-col gap-1 text-justify">
                            {proj.bullets?.map((b, i) => (
                              <li key={i}>{b.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                {mergedResumeData.education &&
                  mergedResumeData.education.length > 0 && (
                    <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
                      <h2 className="text-[12pt] font-bold uppercase border-b border-black text-black mb-3 pb-0.5 tracking-wider">
                        Education
                      </h2>
                      {mergedResumeData.education.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="flex justify-between items-baseline font-bold text-black mb-0.5">
                            <span>{edu.institution}</span>
                            <span className="font-normal text-gray-800 text-[10pt]">
                              {edu.date}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="italic">{edu.degree}</span>
                            {edu.location && (
                              <span className="text-[10pt] text-gray-700">
                                {edu.location}
                              </span>
                            )}
                          </div>
                          {edu.details && edu.details.length > 0 && (
                            <div className="mt-1 text-[9.5pt]">
                              {edu.details.join(" • ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {(mergedResumeData.certifications?.length > 0 ||
                  mergedResumeData.extracurriculars?.length > 0) && (
                  <div style={{ pageBreakInside: "avoid" }}>
                    <h2 className="text-[12pt] font-bold uppercase border-b border-black text-black mb-2 pb-0.5 tracking-wider">
                      Certifications & Extracurriculars
                    </h2>
                    <ul className="list-disc pl-5 mt-1.5 flex flex-col gap-1 text-justify">
                      {mergedResumeData.certifications?.map((cert, idx) => (
                        <li key={`cert-${idx}`}>{cert}</li>
                      ))}
                      {mergedResumeData.extracurriculars?.map((extra, idx) => (
                        <li key={`extra-${idx}`}>{extra}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary">
                Failed to generate document structure.
              </div>
            )}
          </div>

          {!isGenerating && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 scale-[0.95] bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-700 z-50">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                    Match Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary opacity-50 line-through">
                      {initialScore}%
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
                  Keywords Injected
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

            <div className="flex-1 bg-background/50 border border-border/50 rounded-xl p-4 mb-4 text-sm text-primary leading-relaxed relative z-10 whitespace-pre-wrap">
              {coverLetterText}
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
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#0A66C2]/20 text-[#0A66C2] bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 active:scale-95 transition-all duration-150 font-medium text-sm"
          >
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
