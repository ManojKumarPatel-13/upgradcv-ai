import React from "react";
import { Download, ArrowLeft, FileText } from "lucide-react";

export default function PdfExportPage({ onBack }) {
  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-linear">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-primary hover:bg-background transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>
        <h1 className="text-xl font-bold">Export Resume</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div className="flex-1 bg-surface rounded-xl border border-border shadow-linear flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-2xl aspect-[1/1.4] bg-background border border-border rounded-lg shadow-sm flex flex-col items-center justify-center gap-4">
          <FileText className="w-16 h-16 text-secondary opacity-50" />
          <p className="text-secondary font-medium">
            Your optimized resume preview will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
