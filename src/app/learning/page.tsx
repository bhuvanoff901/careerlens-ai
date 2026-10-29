import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, Clock3, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { careerCatalog } from "@/lib/analysis/catalog";

export const metadata: Metadata = {
  title: "Learning roadmap",
  description: "Curated learning resources and project ideas for career exploration.",
};

export default function LearningPage() {
  return (
    <main className="app-page">
      <div className="site-container">
        <SiteHeader />
        <section className="page-heading">
          <span className="eyebrow"><BookOpenCheck size={14} /> LEARNING, AT YOUR OWN PACE</span>
          <h1>Build one useful skill at a time.</h1>
          <p>A curated set of public documentation and approachable project starters—not endorsements or guaranteed outcomes.</p>
        </section>
        <div className="learning-catalog">
          {careerCatalog.map((role, index) => (
            <article className="learning-catalog-card" key={role.title}>
              <span className="learning-index">{String(index + 1).padStart(2, "0")}</span>
              <div><span className="section-kicker">EXPLORE {role.title.toUpperCase()}</span><h2>{role.skills[0]} foundations</h2><p>{role.description}</p>
                <div className="learning-meta"><span><Clock3 size={14} /> Self-paced</span><span><Lightbulb size={14} /> Project-based</span></div>
                <p className="learning-project"><strong>Project idea:</strong> {role.projects[0]}</p>
                <a className="inline-link" href={role.resource.url} rel="noreferrer" target="_blank">{role.resource.name} <ArrowUpRight size={14} /></a>
              </div>
            </article>
          ))}
        </div>
        <div className="page-cta"><p>Use your resume as a starting point for the next topic.</p><Link className="button button-dark" href="/analyze">Get personal suggestions <ArrowUpRight size={15} /></Link></div>
      </div>
    </main>
  );
}
