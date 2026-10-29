"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import {
  ArrowDownToLine,
  Check,
  Clipboard,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis/schema";
import { CategoryChart, ScoreVisual } from "./score-visual";

type ReportTab = "overview" | "skills" | "match" | "improvements" | "learning";
const tabs: { id: ReportTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "match", label: "Job match" },
  { id: "improvements", label: "Improvements" },
  { id: "learning", label: "Learning" },
];

export function AnalysisReport({
  report,
  saved = false,
}: {
  report: AnalysisResult;
  saved?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [completed, setCompleted] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copied to clipboard.");
    } catch {
      setFeedback("Clipboard access is unavailable in this browser.");
    }
  }

  async function saveReport() {
    setSaving(true);
    setFeedback("");
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Resume review · ${new Date(report.createdAt).toLocaleDateString()}`,
          report,
        }),
      });
      const body = await response.json() as { id?: string; error?: string };
      if (!response.ok || !body.id) throw new Error(body.error ?? "The report could not be saved.");
      router.push(`/analysis/${body.id}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "The report could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function downloadReport() {
    window.print();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`tab-${nextTab.id}`)?.focus();
  }

  return (
    <section aria-labelledby="report-heading" className="report-shell" id="analysis-report">
      <div className="report-topline">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> {report.source === "ai" ? "AI-ASSISTED REVIEW" : report.source === "sample-demo" ? "FICTIONAL DEMO" : "LOCAL TEXT PREVIEW"}</span>
          <h2 id="report-heading">Your review, at a glance.</h2>
        </div>
        <div className="report-actions">
          <button className="button button-outline button-small" onClick={downloadReport} type="button">
            <ArrowDownToLine size={15} /> Print / save PDF
          </button>
          {!saved && (
            <button className="button button-dark button-small" onClick={saveReport} disabled={saving} type="button">
              <LockKeyhole size={14} /> {saving ? "Saving…" : "Save privately"}
            </button>
          )}
        </div>
      </div>

      <div className="report-source-note">{report.rubricNotice}</div>
      <div className="report-tablist" aria-label="Analysis report sections" role="tablist">
        {tabs.map((tab, index) => (
          <button
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "report-tab active" : "report-tab"}
            id={`tab-${tab.id}`}
            key={tab.id}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`tab-${activeTab}`}
        className="report-content"
        id={`panel-${activeTab}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === "overview" && (
          <>
            <div className="report-overview-grid">
              <article className="score-card">
                <span className="section-kicker">RESUME QUALITY</span>
                <ScoreVisual score={report.overallScore} />
                <span className="score-caption">Advisory score · not a hiring decision</span>
              </article>
              <article className="report-card summary-card">
                <span className="section-kicker">THE SHORT VERSION</span>
                <p className="report-summary">{report.summary}</p>
                <div className="strength-list">
                  {report.strengths.slice(0, 3).map((strength) => (
                    <p key={strength}><Check size={15} />{strength}</p>
                  ))}
                </div>
              </article>
            </div>
            <article className="report-card">
              <div className="card-title-row">
                <div><span className="section-kicker">WEIGHTED RUBRIC</span><h3>What contributed to your score</h3></div>
                <span className="weight-note">Weights shown</span>
              </div>
              <CategoryChart report={report} />
            </article>
            <article className="report-card">
              <span className="section-kicker">NEXT STEPS</span>
              <ol className="next-action-list">
                {report.nextActions.map((action) => <li key={action}>{action}</li>)}
              </ol>
            </article>
          </>
        )}

        {activeTab === "skills" && (
          <article className="report-card">
            <span className="section-kicker">EVIDENCE IN THE TEXT</span>
            <h3>Skills, with context</h3>
            <p className="muted-copy">Not found in the document does not mean you do not have a skill.</p>
            <div className="skill-list">
              {report.skills.length ? report.skills.map((skill) => (
                <div className="skill-item" key={`${skill.name}-${skill.category}`}>
                  <div className="skill-item-heading">
                    <strong>{skill.name}</strong>
                    <span className={`skill-state ${skill.match}`}>{skill.match.replace("_", " ")}</span>
                  </div>
                  <small>{skill.category}</small>
                  <p>{skill.evidence || "No supporting resume text was returned."}</p>
                </div>
              )) : <p className="empty-copy">No skills were extracted for this report.</p>}
            </div>
          </article>
        )}

        {activeTab === "match" && (
          <article className="report-card">
            <span className="section-kicker">CAREER EXPLORATION</span>
            <h3>{report.jobMatch ? "Resume-to-role text match" : "Roles to explore"}</h3>
            {report.jobMatch && (
              <>
                <div className="match-score"><strong>{report.jobMatch.score}%</strong><span>keyword overlap</span></div>
                <p>{report.jobMatch.explanation}</p>
                <div className="match-columns">
                  <div><h4>Terms found</h4><p>{report.jobMatch.matchingSkills.join(", ") || "No matching terms found."}</p></div>
                  <div><h4>Terms not found in text</h4><p>{report.jobMatch.missingSkills.join(", ") || "No unmatched terms in the sampled requirements."}</p></div>
                  {!!report.jobMatch.partialSkills.length && <div><h4>Needs context</h4><p>{report.jobMatch.partialSkills.join(", ")}</p></div>}
                </div>
              </>
            )}
            <div className="role-list">
              {report.recommendations.map((role) => (
                <div className="role-item" key={role.title}>
                  <h4>{role.title}</h4>
                  <p>{role.whyItFits}</p>
                  <p><strong>Evidence:</strong> {role.relevantSkills.join(", ") || "Explore the role catalog."}</p>
                  <p><strong>Topics to explore:</strong> {role.skillGaps.join(", ") || "Continue building project evidence."}</p>
                </div>
              ))}
            </div>
            <p className="muted-copy">Suggestions are not verified vacancies. No employer or open job is implied.</p>
          </article>
        )}

        {activeTab === "improvements" && (
          <article className="report-card">
            <span className="section-kicker">A PRACTICAL CHECKLIST</span>
            <h3>Small edits, stronger evidence</h3>
            <div className="suggestion-list">
              {report.suggestions.map((suggestion, index) => {
                const isDone = completed.includes(index);
                return (
                  <article className={isDone ? "suggestion-item completed" : "suggestion-item"} key={`${suggestion.title}-${index}`}>
                    <label className="suggestion-check">
                      <input
                        checked={isDone}
                        onChange={() => setCompleted((current) => isDone ? current.filter((value) => value !== index) : [...current, index])}
                        type="checkbox"
                      />
                      <span className="suggestion-checkbox" aria-hidden="true">{isDone && <Check size={13} />}</span>
                      <span className="priority-label">{suggestion.priority} priority</span>
                    </label>
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.explanation}</p>
                    {suggestion.original && <div className="bullet-compare"><p><small>Original</small>{suggestion.original}</p><p><small>Example rewrite</small>{suggestion.improved}</p></div>}
                    {suggestion.missingMetricNote && <p className="metric-note">{suggestion.missingMetricNote}</p>}
                    {suggestion.improved && <button className="text-button" onClick={() => copyText(suggestion.improved ?? "")} type="button"><Clipboard size={14} /> Copy example</button>}
                  </article>
                );
              })}
            </div>
          </article>
        )}

        {activeTab === "learning" && (
          <article className="report-card">
            <span className="section-kicker">CURATED STARTING POINTS</span>
            <h3>Build skills in a useful sequence</h3>
            <div className="learning-list">
              {report.learningRoadmap.map((step, index) => (
                <article className="learning-item" key={`${step.topic}-${index}`}>
                  <span className="learning-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="learning-title-row"><h4>{step.topic}</h4><span className={`priority-label ${step.priority}`}>{step.priority} priority</span></div>
                    <p>{step.reason}</p>
                    <p><strong>Try:</strong> {step.projectIdea}</p>
                    <p className="muted-copy">Estimated effort: {step.estimatedHours} hours · estimates are illustrative.</p>
                    <a className="inline-link" href={step.resourceUrl} rel="noreferrer" target="_blank">{step.resourceName} ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </article>
        )}
      </div>
      {feedback && <p aria-live="polite" className="inline-feedback" role="status">{feedback}</p>}
    </section>
  );
}
