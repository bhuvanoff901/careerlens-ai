import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AnalysisWorkbench } from "@/components/analysis-workbench";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Analyze your resume",
  description: "Get private, evidence-based resume feedback and practical next steps.",
};

export default function AnalyzePage() {
  return (
    <main className="app-page">
      <div className="site-container">
        <SiteHeader compact />
        <div className="page-heading analyze-heading">
          <Link className="breadcrumb-link" href="/"><ArrowLeft size={14} /> Home</Link>
          <span className="eyebrow"><ShieldCheck size={14} /> PRIVATE BY DEFAULT</span>
          <h1>Find the story in your experience.</h1>
          <p>Share resume text or a document for a thoughtful review. Nothing is saved unless you choose to save the finished report.</p>
        </div>
        <AnalysisWorkbench />
      </div>
    </main>
  );
}
