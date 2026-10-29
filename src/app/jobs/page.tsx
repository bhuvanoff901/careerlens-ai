import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { careerCatalog } from "@/lib/analysis/catalog";

export const metadata: Metadata = {
  title: "Career paths",
  description: "Explore a curated catalog of career roles, skills, and project ideas.",
};

export default function JobsPage() {
  return (
    <main className="app-page">
      <div className="site-container">
        <SiteHeader />
        <section className="page-heading">
          <span className="eyebrow"><BriefcaseBusiness size={14} /> POSSIBILITIES, NOT PROMISES</span>
          <h1>Explore where your skills could take you.</h1>
          <p>Curated role examples help you discover transferable skills and learning topics. These are not verified vacancies.</p>
        </section>
        <div className="role-catalog">
          {careerCatalog.map((role, index) => (
            <article className="career-card" key={role.title}>
              <span className="career-index">{String(index + 1).padStart(2, "0")} / CAREER EXAMPLE</span>
              <h2>{role.title}</h2><p>{role.description}</p>
              <h3>Skills to explore</h3>
              <div className="tag-list">{role.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div>
              <h3>Try a small project</h3>
              <ul className="career-projects">{role.projects.map((project) => <li key={project}><CheckCircle2 size={15} />{project}</li>)}</ul>
              <a className="inline-link" href={role.resource.url} rel="noreferrer" target="_blank">{role.resource.name} <ArrowUpRight size={14} /></a>
            </article>
          ))}
        </div>
        <aside className="catalog-note"><strong>Not a live job board.</strong> Role examples are curated for career exploration. No employers, active vacancies, salaries, or job links are represented here.</aside>
        <div className="page-cta"><p>Want suggestions grounded in your own experience?</p><Link className="button button-dark" href="/analyze">Review my resume <ArrowUpRight size={15} /></Link></div>
      </div>
    </main>
  );
}
