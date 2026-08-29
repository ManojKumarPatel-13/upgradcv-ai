import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Send,
  GitPullRequest,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function TailoringStudio({ data, onBack, onNext }) {
  const [diffs, setDiffs] = useState(data.bulletDiffs);
  const [prompts, setPrompts] = useState({});
  const [isRegenerating, setIsRegenerating] = useState({});

  const handleStatusChange = (id, newStatus) => {
    setDiffs(
      diffs.map((diff) =>
        diff.id === id ? { ...diff, status: newStatus } : diff,
      ),
    );
  };

  const handlePromptChange = (id, value) => {
    setPrompts({ ...prompts, [id]: value });
  };

  const handleRegenerate = (id) => {
    if (!prompts[id]) return;

    setIsRegenerating({ ...isRegenerating, [id]: true });

    setTimeout(() => {
      setDiffs(
        diffs.map((diff) => {
          if (diff.id === id) {
            return {
              ...diff,
              suggested: `(Customized for "${prompts[id]}"): Engineered scalable web applications using React and Tailwind CSS, achieving a 30% improvement in UI consistency and performance metrics.`,
            };
          }
          return diff;
        }),
      );
      setIsRegenerating({ ...isRegenerating, [id]: false });
      setPrompts({ ...prompts, [id]: "" });
    }, 1500);
  };

  const pendingCount = diffs.filter((d) => d.status === "pending").length;
  const isComplete = pendingCount === 0;

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-primary hover:bg-background active:scale-95 transition-all duration-150 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Analysis
        </button>
        <div className="flex items-center gap-3">
          <GitPullRequest className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Tailoring Studio</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">
            {pendingCount} Pending Fixes
          </span>
        </div>
        <button
          onClick={onNext}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all duration-150 active:scale-95 shadow-sm ${
            isComplete
              ? "bg-accent text-white hover:bg-accent/90 shadow-[0_0_15px_rgba(36,138,84,0.4)]"
              : "bg-surface border border-border text-primary hover:bg-background"
          }`}
        >
          {isComplete ? "Continue to Export" : "Skip to Export"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-8 flex-1 z-10">
        {diffs.map((diff, index) => (
          <div
            key={diff.id}
            className={`bg-surface rounded-2xl border transition-all duration-500 overflow-hidden animate-in slide-in-from-bottom-8 fade-in fill-mode-both spotlight-card ${
              diff.status === "accepted"
                ? "border-accent/50 shadow-[0_0_20px_rgba(36,138,84,0.1)]"
                : diff.status === "rejected"
                  ? "border-border opacity-60"
                  : "border-border shadow-linear"
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Experience Section
              </span>

              {diff.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(diff.id, "rejected")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-secondary hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all text-sm font-medium"
                  >
                    <X className="w-4 h-4" /> Ignore
                  </button>
                  <button
                    onClick={() => handleStatusChange(diff.id, "accepted")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all text-sm font-medium shadow-lg shadow-accent/20"
                  >
                    <Check className="w-4 h-4" /> Accept AI Suggestion
                  </button>
                </div>
              )}
              {diff.status === "accepted" && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
                  <CheckCircle2 className="w-4 h-4" /> Resolved
                </span>
              )}
              {diff.status === "rejected" && (
                <span className="text-sm font-medium text-secondary">
                  Skipped
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
              <div className="p-6 bg-red-500/5 dark:bg-red-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Original Text
                  </h3>
                </div>
                <p className="text-primary text-sm leading-relaxed line-through decoration-red-500/40 opacity-80">
                  {diff.original}
                </p>
              </div>

              <div className="p-6 bg-accent/5 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                    AI Optimization
                  </h3>
                </div>

                {isRegenerating[diff.id] ? (
                  <div className="flex items-center gap-3 text-accent text-sm font-medium h-[60px]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regenerating contextual bullet...
                  </div>
                ) : (
                  <p className="text-primary text-sm leading-relaxed">
                    {diff.suggested}
                  </p>
                )}

                {diff.status === "pending" && (
                  <div className="mt-6 flex items-center gap-2 relative">
                    <Sparkles className="w-4 h-4 text-accent absolute left-3" />
                    <input
                      type="text"
                      placeholder="E.g., Make it sound more leadership-focused..."
                      value={prompts[diff.id] || ""}
                      onChange={(e) =>
                        handlePromptChange(diff.id, e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRegenerate(diff.id)
                      }
                      className="w-full pl-9 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => handleRegenerate(diff.id)}
                      disabled={!prompts[diff.id] || isRegenerating[diff.id]}
                      className="absolute right-2 p-1.5 text-secondary hover:text-accent disabled:opacity-50 active:scale-90 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
