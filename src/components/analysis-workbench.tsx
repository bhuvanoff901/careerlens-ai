"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  ArrowRight,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  MAX_RESUME_CHARACTERS,
  MAX_UPLOAD_BYTES,
  MIN_RESUME_CHARACTERS,
  analysisModeSchema,
  analysisRequestSchema,
  analysisResultSchema,
  type AnalysisMode,
  type AnalysisResult,
} from "@/lib/analysis/schema";
import { Button } from "@/components/ui/button";
import { AnalysisReport } from "./analysis-report";

const modes: { id: AnalysisMode; title: string; description: string }[] = [
  { id: "general", title: "General review", description: "Get structured feedback on your resume." },
  { id: "job-match", title: "Match a role", description: "Compare resume terms to a job description." },
  { id: "career-paths", title: "Explore careers", description: "Explore role ideas and skill-building steps." },
];

type UploadInfo = { name: string; size: number };

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AnalysisWorkbench() {
  const [mode, setMode] = useState<AnalysisMode>("general");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [upload, setUpload] = useState<UploadInfo | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setReport(null);
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setError("Choose a PDF or DOCX file.");
      return;
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      setError("Choose a non-empty PDF or DOCX file smaller than 4 MB.");
      return;
    }
    setIsExtracting(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/resume/extract", { method: "POST", body });
      const result = await response.json() as { resumeText?: string; fileName?: string; fileSize?: number; error?: string };
      if (!response.ok || !result.resumeText) throw new Error(result.error ?? "The document could not be read.");
      setResumeText(result.resumeText);
      setUpload({ name: result.fileName ?? file.name, size: result.fileSize ?? file.size });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The document could not be read.");
    } finally {
      setIsExtracting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  async function submitAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReport(null);
    const parsedRequest = analysisRequestSchema.safeParse({
      mode,
      resumeText,
      targetRole,
      jobDescription,
    });
    if (!parsedRequest.success) {
      setError(parsedRequest.error.issues[0]?.message ?? "Check your resume details.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRequest.data),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const errorBody = body as { error?: string };
        throw new Error(errorBody.error ?? "The analysis could not be completed.");
      }
      setReport(analysisResultSchema.parse(body));
      window.setTimeout(
        () => document.getElementById("analysis-report")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="workbench-layout">
      <form className="workbench-form" onSubmit={submitAnalysis}>
        <div className="mode-selector" aria-label="Choose analysis type" role="group">
          {modes.map((item) => (
            <button
              aria-pressed={mode === item.id}
              className={mode === item.id ? "mode-card active" : "mode-card"}
              key={item.id}
              onClick={() => setMode(analysisModeSchema.parse(item.id))}
              type="button"
            >
              <span className="mode-radio" />
              <span><strong>{item.title}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </div>

        <section className="form-section" aria-labelledby="resume-heading">
          <div className="form-section-heading">
            <div><span className="section-kicker">01 / YOUR RESUME</span><h2 id="resume-heading">Start with your experience.</h2></div>
            <span className="character-count">{resumeText.length.toLocaleString()} / {MAX_RESUME_CHARACTERS.toLocaleString()}</span>
          </div>

          <label className="field-label" htmlFor="resume-text">Paste resume text</label>
          <textarea
            aria-describedby="resume-help"
            id="resume-text"
            maxLength={MAX_RESUME_CHARACTERS}
            onChange={(event) => {
              setResumeText(event.target.value);
              setUpload(null);
            }}
            placeholder={"Paste the text of your resume here…\n\nTip: include section headings so the review can follow your structure."}
            rows={10}
            value={resumeText}
          />
          <p className="field-help" id="resume-help">
            At least {MIN_RESUME_CHARACTERS} characters. Text is processed for this request and not saved by default.
          </p>

          <div
            className={isDragging ? "upload-zone dragging" : "upload-zone"}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <input
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              id="resume-file"
              onChange={onFileInput}
              ref={fileInput}
              type="file"
            />
            {upload ? (
              <div className="uploaded-file">
                <FileText size={19} />
                <span><strong>{upload.name}</strong><small>{formatBytes(upload.size)} · text extracted locally for this session</small></span>
                <button aria-label="Remove uploaded resume" className="icon-button" onClick={() => { setResumeText(""); setUpload(null); }} type="button"><X size={17} /></button>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon"><Upload size={19} /></span>
                <span><strong>{isExtracting ? "Reading your file…" : "Drop a PDF or DOCX here"}</strong><small>PDF or DOCX · up to 4 MB</small></span>
                <label className="button button-outline button-small upload-browse" htmlFor="resume-file">
                  {isExtracting ? <LoaderCircle className="spin" size={14} /> : "Browse files"}
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="form-section" aria-labelledby="target-heading">
          <div className="form-section-heading">
            <div><span className="section-kicker">02 / YOUR DIRECTION</span><h2 id="target-heading">Where do you want to go?</h2></div>
            <span className="optional-label">OPTIONAL</span>
          </div>
          <label className="field-label" htmlFor="target-role">Target role or career interest</label>
          <input
            id="target-role"
            maxLength={120}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="e.g. Product designer, data analyst"
            value={targetRole}
          />
          {mode === "job-match" && (
            <>
              <label className="field-label job-field-label" htmlFor="job-description">Job description <span>Required for a match</span></label>
              <textarea
                id="job-description"
                maxLength={12_000}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the role requirements you want to compare…"
                rows={6}
                value={jobDescription}
              />
              <p className="field-help">Minimum 50 characters. Job text is treated as untrusted input.</p>
            </>
          )}
        </section>

        <div className="privacy-notice">
          <LockKeyhole size={17} />
          <p><strong>Your resume stays yours.</strong> The file is not stored. Without an OpenAI key, this page uses a local text-cue preview; with a key, obvious email/phone identifiers are redacted before the resume is sent to OpenAI. Saved reports are opt-in and may contain information from your resume.</p>
        </div>

        {error && <p className="form-error" id="form-error" role="alert">{error}</p>}
        <Button className="analyze-submit" disabled={isAnalyzing || isExtracting} type="submit">
          {isAnalyzing ? <><LoaderCircle className="spin" size={16} /> Reviewing your resume…</> : <><Sparkles size={16} /> Analyze my resume <ArrowRight size={16} /></>}
        </Button>
      </form>

      <aside className="workbench-aside">
        <div className="aside-sticky">
          <span className="section-kicker">A THOUGHTFUL FIRST LOOK</span>
          <h2>Feedback you can act on.</h2>
          <p>Review the evidence, keep what is useful, and leave the rest. No score can tell your whole story.</p>
          <div className="aside-checks">
            <span><span className="check-dot" /> Skills and project evidence</span>
            <span><span className="check-dot" /> Structure and clarity</span>
            <span><span className="check-dot" /> Practical next steps</span>
          </div>
          <div className="aside-disclaimer">
            <strong>Not a hiring tool</strong>
            <p>This feedback is advisory and does not make employment decisions or guarantee results.</p>
          </div>
        </div>
      </aside>

      {report && <AnalysisReport report={report} />}
    </div>
  );
}
