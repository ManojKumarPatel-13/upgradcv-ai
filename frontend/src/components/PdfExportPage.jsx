import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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

// Pure presentational component — renders the resume body only (no wrapper div,
// no id, no positioning). Used in TWO places:
//   1. Inside the scrollable on-screen studio preview.
//   2. Inside a plain, statically-flowing print-only twin (see PdfExportPage below).
// Keeping a single source of truth means the on-screen preview and the printed
// output can never drift apart, and the print copy never inherits any of the
// screen-only scroll/height/positioning constraints.
function ResumeDocument({ resumeData }) {
  if (!resumeData) return null;

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-[24pt] font-extrabold uppercase tracking-widest text-black mb-2">
          {resumeData.header?.name}
        </h1>
        <div className="text-[10pt] flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-gray-800">
          {resumeData.header?.email && <span>{resumeData.header.email}</span>}
          {resumeData.header?.phone && (
            <>
              <span className="text-gray-400 font-light">|</span>
              <span>{resumeData.header.phone}</span>
            </>
          )}
          {resumeData.header?.links?.map((link, i) => (
            <React.Fragment key={i}>
              <span className="text-gray-400 font-light">|</span>
              <span className="text-black">
                {link.replace(/^https?:\/\//, "")}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {resumeData.summary && (
        <div className="mb-5">
          <p className="text-justify">{resumeData.summary}</p>
        </div>
      )}

      {resumeData.skills && Object.keys(resumeData.skills).length > 0 && (
        <div className="mt-5 mb-5 print-no-break">
          <h2 className="text-[13pt] font-bold uppercase border-b-2 border-black text-black mb-3 pb-1 tracking-wider">
            Skills Summary
          </h2>
          <div className="flex flex-col gap-1.5">
            {Object.entries(resumeData.skills).map(([category, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div
                  key={category}
                  className="grid grid-cols-[120px_1fr] gap-x-2"
                >
                  <span className="font-bold text-black">{category}:</span>
                  <span>{items.join(", ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mt-6 mb-5">
          <h2 className="text-[13pt] font-bold uppercase border-b-2 border-black text-black mb-4 pb-1 tracking-wider">
            Experience
          </h2>
          {resumeData.experience.map((job, idx) => (
            <div key={idx} className="mb-5 print-no-break">
              <div className="flex justify-between items-baseline font-bold text-black mb-1">
                <span>
                  {job.title}{" "}
                  {job.company && (
                    <>
                      <span className="font-normal text-gray-400 mx-1">|</span>{" "}
                      {job.company}
                    </>
                  )}
                </span>
                <span className="font-normal text-gray-800 text-[10pt]">
                  {job.date}
                </span>
              </div>
              {job.location && (
                <div className="text-[10pt] italic text-gray-700 mb-1.5">
                  {job.location}
                </div>
              )}
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-justify">
                {job.bullets?.map((b, i) => (
                  <li key={i}>{b.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {resumeData.projects && resumeData.projects.length > 0 && (
        <div className="mt-6 mb-5">
          <h2 className="text-[13pt] font-bold uppercase border-b-2 border-black text-black mb-4 pb-1 tracking-wider">
            Projects
          </h2>
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="mb-5 print-no-break">
              <div className="flex justify-between items-baseline font-bold text-black mb-1">
                <span>
                  {proj.name}{" "}
                  {proj.role && (
                    <>
                      <span className="font-normal text-gray-400 mx-1">|</span>{" "}
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
                <div className="text-[9pt] text-gray-600 mb-1.5">
                  {proj.links.join(" | ")}
                </div>
              )}
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-justify">
                {proj.bullets?.map((b, i) => (
                  <li key={i}>{b.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {resumeData.education && resumeData.education.length > 0 && (
        <div className="mt-6 mb-5 print-no-break">
          <h2 className="text-[13pt] font-bold uppercase border-b-2 border-black text-black mb-4 pb-1 tracking-wider">
            Education
          </h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline font-bold text-black mb-1">
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
                <div className="mt-1.5 text-[9.5pt] text-gray-800">
                  {edu.details.join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(resumeData.certifications?.length > 0 ||
        resumeData.extracurriculars?.length > 0) && (
        <div className="mt-6 print-no-break">
          <h2 className="text-[13pt] font-bold uppercase border-b-2 border-black text-black mb-4 pb-1 tracking-wider">
            Certifications & Extracurriculars
          </h2>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-justify">
            {resumeData.certifications?.map((cert, idx) => (
              <li key={`cert-${idx}`}>{cert}</li>
            ))}
            {resumeData.extracurriculars?.map((extra, idx) => (
              <li key={`extra-${idx}`}>{extra}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default function PdfExportPage({ data, onBack, onRestart }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadState, setDownloadState] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const [scanPos, setScanPos] = useState(-100);

  const originalScore = data?.matchScore || 74;
  const acceptedDiffs = (data?.bulletDiffs || []).filter(
    (d) => d.status === "accepted",
  );

  const improvedScore = Math.min(99, originalScore + acceptedDiffs.length * 6);
  const [rollingScore, setRollingScore] = useState(originalScore);

  const coverLetterText =
    data?.coverLetterSnippet ||
    "Dear Hiring Team,\n\nWith over 5 years of experience engineering scalable web applications using React and Tailwind CSS, I am excited to apply for the position. My recent focus on improving UI consistency directly aligns with your current roadmap...";

  const mergedResumeData = useMemo(() => {
    if (!data?.resumeData) return null;

    const clonedData = JSON.parse(JSON.stringify(data.resumeData));

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
  }, [data, acceptedDiffs]);

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
    if (!isGenerating && originalScore !== improvedScore) {
      let current = originalScore;
      const interval = setInterval(() => {
        if (current >= improvedScore) {
          clearInterval(interval);
        } else {
          current += 1;
          setRollingScore(current);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isGenerating, originalScore, improvedScore]);

  const handleDownload = () => {
    setDownloadState("success");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#248A54", "#ffffff", "#E2E8E4"],
    });

    setTimeout(() => {
      // canvas-confetti appends its own <canvas> directly to document.body
      // (outside React's tree entirely) and only removes it once the burst
      // has fully finished animating/fading. A flat 800ms delay isn't a
      // guarantee that's happened yet, and a still-animating canvas showed
      // up as scattered colored shapes on an otherwise-blank first printed
      // page. confetti.reset() instantly clears all active particles and
      // removes the canvas, so we call it right before printing no matter
      // how far along the animation actually is.
      confetti.reset();
      window.print();
      setDownloadState("idle");
    }, 800);
  };

  const handleCopy = () => {
    setShowToast(true);
    navigator.clipboard.writeText(coverLetterText);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = async () => {
    const shareText = `I just tailored my resume using UpgradCV and hit a ${improvedScore}% match score! 🚀`;
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
    <>
      <div
        id="app-shell"
        className="min-h-screen p-6 flex flex-col gap-6 max-w-7xl mx-auto relative overflow-hidden"
      >
        {/* Bulletproof Print CSS */}
        <style type="text/css">
          {`
          /*
            PRINT STRATEGY (rewritten):
            The previous approach tried to reuse the on-screen preview element for
            print by hiding everything else with visibility:hidden and then forcing
            the preview to position:absolute. That fails in two visible ways:
              1. Blank page — the preview sat inside a scrollable, fixed-height,
                 overflow-hidden wrapper chain. Repositioning a deeply-nested element
                 to position:absolute does not "hoist" it out of an ancestor that
                 clips or hides content; browsers frequently render it off-page.
              2. Garbled / interleaved text on multi-page resumes — an absolutely
                 positioned box is taken OUT of normal document flow, and normal flow
                 is exactly what the browser's print engine uses to decide where to
                 break content across pages. Out-of-flow content doesn't paginate
                 the same way, which is what produced scrambled, overlapping text
                 on longer resumes.

            The fix: print from a SEPARATE, plain, statically-flowing copy of the
            resume (see the "print-only-resume" element below in the JSX) that has
            no scroll container, no fixed height, and no position:absolute. Normal
            block content paginates correctly and predictably every time.
          */
          .print-only-resume {
            display: none;
          }

          @media print {
            @page {
              size: portrait;
              margin: 0.5in;
            }

            html, body {
              height: auto !important;
              overflow: visible !important;
              background: white !important;
            }

            /*
              Hide EVERY direct child of <body> except the portaled print twin.
              This is broader than just hiding #app-shell on purpose: #app-shell
              only covers what PdfExportPage itself renders, but the page also
              has things living outside that tree entirely —
                - App.jsx's dark/light toggle button (a sibling of #app-shell,
                  not a descendant of it)
                - the canvas-confetti library's <canvas>, which the library
                  appends directly to document.body when the download button
                  is clicked, completely outside React's own tree
              Both were still showing up (a stray moon icon + drifting confetti
              dots) on an otherwise-blank first printed page, because neither
              was inside #app-shell for the old rule to catch. Targeting every
              direct child of body — except our own portaled node, which is
              ALSO appended as a direct child of body — catches all of it in
              one rule instead of chasing individual stray elements.
            */
            body > *:not(.print-only-resume) {
              display: none !important;
            }

            /* Belt-and-suspenders: the resume markup itself never uses
               <canvas>, so it's always safe to hard-hide any canvas element
               at print time. Covers canvas-confetti's element even if
               confetti.reset() somehow didn't run in time. */
            canvas {
              display: none !important;
            }

            /* Reveal the dedicated print twin — a plain block, so it paginates
               naturally instead of being clipped or scrambled. */
            .print-only-resume {
              display: block !important;
              position: static !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              box-shadow: none !important;
              font-size: 9.5pt !important;
              line-height: 1.4 !important;
            }

            /* Slightly tighter headings/spacing than the on-screen preview so a
               typical one-to-two-page resume has the best chance of landing on
               a single printed page — falls through to a clean 2nd page for
               anything that genuinely doesn't fit, rather than being cut off. */
            .print-only-resume h1 {
              font-size: 19pt !important;
              margin-bottom: 4px !important;
            }
            .print-only-resume h2 {
              font-size: 11pt !important;
              margin-bottom: 6px !important;
              padding-bottom: 2px !important;
            }
            .print-only-resume .mb-6,
            .print-only-resume .mt-6 {
              margin-top: 10px !important;
              margin-bottom: 8px !important;
            }
            .print-only-resume .mb-5,
            .print-only-resume .mt-5 {
              margin-top: 8px !important;
              margin-bottom: 8px !important;
            }
            .print-only-resume .gap-1\.5 {
              gap: 3px !important;
            }

            /* Avoid splitting a job/project/section awkwardly across a page break */
            .print-no-break {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
        </style>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden"></div>

        <div className="flex justify-between items-center bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm z-10 animate-in slide-in-from-top-4 fade-in duration-500 print:hidden">
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
            id="resume-print-wrapper"
            className="lg:col-span-2 bg-gradient-to-br from-surface to-background rounded-2xl border border-border/50 shadow-sm flex flex-col relative overflow-hidden spotlight-card animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500"
            style={{ animationDelay: "100ms" }}
          >
            {/* Scrollable Web Viewport */}
            <div
              id="resume-scroll-viewport"
              className="w-full h-[75vh] overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-black/5 dark:bg-white/5 rounded-2xl"
            >
              {/* The Document Canvas */}
              <div
                id="resume-canvas"
                className="w-full max-w-[800px] min-h-[1056px] bg-white text-black shadow-2xl relative p-8 sm:p-12 shrink-0"
              >
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
                  <div className="font-sans text-[10.5pt] leading-[1.5] text-gray-900 w-full bg-white">
                    <ResumeDocument resumeData={mergedResumeData} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                    Failed to generate document structure.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 print:hidden">
            {!isGenerating && (
              <div className="bg-surface/95 backdrop-blur-xl border border-border shadow-md rounded-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-right-8 fade-in duration-700">
                <h3 className="text-xs uppercase tracking-wider text-secondary font-bold flex items-center justify-between">
                  Transformation Impact
                  <Sparkles className="w-4 h-4 text-accent" />
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-secondary">
                      Original Score
                    </span>
                    <span className="text-2xl font-bold text-primary opacity-60 line-through decoration-red-500/50">
                      {originalScore}%
                    </span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-border" />
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-accent">
                      Tailored Score
                    </span>
                    <span className="text-4xl font-extrabold text-accent">
                      {rollingScore}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-background rounded-full h-2 mt-2 border border-border overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-1000 ease-out"
                    style={{ width: `${rollingScore}%` }}
                  ></div>
                </div>
              </div>
            )}

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
                We generated a highly tailored cover letter snippet based on
                your improved resume and the job description.
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
          className="flex flex-col sm:flex-row items-center justify-between p-6 bg-surface border border-border/50 rounded-2xl shadow-sm z-10 animate-in slide-in-from-bottom-8 fade-in fill-mode-both duration-500 print:hidden"
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
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface text-primary border border-border shadow-xl px-5 py-3 rounded-full transition-all duration-300 z-50 print:hidden ${
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

      {/*
      Print-only twin, rendered via a PORTAL directly into document.body.
      WHY A PORTAL: App.jsx wraps every page (including this one) in a div with
      "animate-in zoom-in-95 ... fill-mode-both". "fill-mode-both" permanently
      locks in that animation's final transform (scale) on the wrapper — it
      never goes back to "none". Chromium has a long-standing print bug where
      ANY ancestor with a non-"none" transform forces everything inside it to
      be hard-clipped to a single printed page, no matter what CSS the
      descendant itself has. That is what was cutting off Education/
      Certifications even after the resume markup itself was fixed — the real
      blocker was one level up, in App.jsx, outside this file entirely.
      Portaling straight to document.body sidesteps that ancestor completely,
      without touching App.jsx or its animations at all.
    */}
      {mergedResumeData &&
        createPortal(
          <div
            id="resume-preview"
            className="print-only-resume font-sans text-gray-900 bg-white p-8"
          >
            <ResumeDocument resumeData={mergedResumeData} />
          </div>,
          document.body,
        )}
    </>
  );
}
