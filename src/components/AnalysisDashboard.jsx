import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function AnalysisDashboard({ data, onBack, onNext }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = data.matchScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= data.matchScore) {
        setAnimatedScore(data.matchScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [data.matchScore]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent stroke-accent shadow-accent/20";
    if (score >= 50)
      return "text-yellow-500 stroke-yellow-500 shadow-yellow-500/20";
    return "text-red-500 stroke-red-500 shadow-red-500/20";
  };

  const scoreColorClass = getScoreColor(data.matchScore);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-7xl mx-auto relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex justify-between items-center bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-primary hover:bg-background transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Analysis Results</h1>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="bg-gradient-to-r from-accent/10 via-surface to-background p-6 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-accent/20 rounded-xl mt-1">
          <Zap className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary mb-1">
            AI Executive Summary
          </h2>
          <p className="text-secondary leading-relaxed">
            Your resume shows strong foundational alignment with this role,
            particularly in core frameworks and leadership. However, adding
            specific modern terminology and bridging a few technical gaps will
            push your match score into the highly competitive 90%+ tier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-surface to-background p-8 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-border fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`fill-none transition-all duration-300 ease-out ${scoreColorClass.split(" ")[1]}`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span
                  className={`text-4xl font-bold tracking-tighter ${scoreColorClass.split(" ")[0]}`}
                >
                  {animatedScore}%
                </span>
              </div>
            </div>
            <div className="text-center z-10">
              <h3 className="font-semibold text-lg">Overall Match</h3>
              <p className="text-sm text-secondary">
                Based on provided job description
              </p>
            </div>
            <div
              className={`absolute inset-0 opacity-20 blur-3xl rounded-full ${scoreColorClass.split(" ")[2]}`}
            ></div>
          </div>

          <div className="bg-gradient-to-br from-surface to-background p-6 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm flex-1">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Standout Features
            </h3>
            <ul className="flex flex-col gap-4">
              {data.standoutFeatures.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-primary bg-background/50 p-3 rounded-xl border border-border/30"
                >
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-surface to-background p-6 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm flex flex-col gap-8">
          <div>
            <h2 className="font-semibold text-lg mb-1">
              Comparative Skill Matrix
            </h2>
            <p className="text-sm text-secondary mb-6">
              Detailed breakdown of extracted keywords
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
                  Matched Requirements
                </h3>
                <div className="flex flex-col gap-4">
                  {data.skillMatrix.matched.map((skill, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-primary">
                          {skill}
                        </span>
                        <span className="text-accent font-medium">100%</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-accent w-full shadow-[0_0_10px_rgba(36,138,84,0.5)]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-border/50"></div>

              <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
                  Missing Keywords
                </h3>
                <div className="flex flex-col gap-4">
                  {data.skillMatrix.missing.map((skill, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-primary">
                          {skill}
                        </span>
                        <span className="text-red-500 font-medium">0%</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-dashed border-red-500/30">
                        <div className="h-full bg-red-500 w-0"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-surface to-background p-6 rounded-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Areas to Improve
            </h3>
            <ul className="flex flex-col gap-4">
              {data.areasToImprove.map((area, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-primary bg-background/50 p-3 rounded-xl border border-border/30"
                >
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="leading-tight">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-accent rounded-2xl p-8 shadow-[0_8px_30px_rgb(36,138,84,0.3)] relative overflow-hidden flex-1 flex flex-col justify-center text-white group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <h2 className="text-3xl font-bold mb-2">
              {data.bulletDiffs.length} Critical Fixes
            </h2>
            <p className="text-accent-foreground text-white/80 text-sm mb-8 leading-relaxed">
              Our AI has rewritten specific bullet points to bridge your skill
              gaps and align perfectly with the job description.
            </p>

            <button
              onClick={onNext}
              className="w-full flex items-center justify-between bg-white text-accent px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Tailoring Studio
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
