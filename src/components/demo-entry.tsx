import Link from "next/link";
import { ArrowRight, BarChart3, LockKeyhole, Sparkles } from "lucide-react";
import { demoAnalysis } from "@/lib/analysis/demo";
import { ScoreVisual } from "./score-visual";

export function DemoEntry() {
  return (
    <article className="demo-preview-card">
      <div className="demo-card-top">
        <span className="demo-stamp"><Sparkles size={13} /> FICTIONAL DEMO</span>
        <span className="demo-lock"><LockKeyhole size={14} /> No account needed</span>
      </div>
      <div className="demo-card-main">
        <div>
          <span className="section-kicker">SAMPLE RESUME REVIEW</span>
          <h3>From experience to evidence.</h3>
          <p>Explore a complete example report using a fictional early-career profile.</p>
          <Link className="text-button" href="/analysis/demo">Explore the sample report <ArrowRight size={15} /></Link>
        </div>
        <div className="demo-score">
          <ScoreVisual score={demoAnalysis.overallScore} size="small" />
          <span>Example score</span>
        </div>
      </div>
      <div className="demo-card-footer">
        <span><BarChart3 size={14} /> Six weighted categories</span>
        <span>Not live AI output</span>
      </div>
    </article>
  );
}
