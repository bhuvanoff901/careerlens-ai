import {
  analysisResultSchema,
  type AnalysisResult,
  type CategoryAssessment,
} from "./schema";
import { attachWeights, calculateResumeScore } from "./scoring";

const categories = [
  { category: "skills", score: 78, explanation: "The sample clearly groups web-development tools and links several to project work." },
  { category: "projects", score: 84, explanation: "Two sample projects describe the goal, tools, and individual contribution." },
  { category: "experience", score: 62, explanation: "Coursework and a short internship provide relevant early-career experience." },
  { category: "impact", score: 56, explanation: "The sample describes delivered work but has limited verified outcome detail." },
  { category: "structure", score: 80, explanation: "The document uses concise bullets and recognizable resume sections." },
  { category: "education", score: 76, explanation: "Relevant degree coursework is included in the sample." },
] as const;

export const demoAnalysis: AnalysisResult = analysisResultSchema.parse({
  id: "00000000-0000-4000-8000-000000000001",
  overallScore: calculateResumeScore([...categories]),
  categories: attachWeights([...categories]),
  source: "sample-demo",
  createdAt: "2026-01-15T12:00:00.000Z",
  rubricNotice:
    "Fictional example content for demonstration. This advisory rubric is not a hiring decision or a guarantee of interview success.",
  summary:
    "Fictional early-career web developer with academic project experience in TypeScript, React, and accessible interface development. The sample resume shows a clear technical direction; its impact statements could explain outcomes more precisely without inventing metrics.",
  skills: [
    { name: "TypeScript", category: "Programming", evidence: "Used in the fictional campus planner project.", match: "found" },
    { name: "React", category: "Frontend", evidence: "Listed alongside an academic interface project.", match: "found" },
    { name: "Accessibility", category: "Product quality", evidence: "The sample mentions keyboard navigation improvements.", match: "found" },
    { name: "Automated testing", category: "Quality", evidence: "The sample does not provide specific testing examples.", match: "partial" },
    { name: "SQL", category: "Data", evidence: "Not mentioned in this fictional resume sample.", match: "not_found" },
  ],
  strengths: [
    "Projects make the candidate's technical direction easy to understand.",
    "Academic work provides relevant evidence for an early-career candidate.",
    "Section headings make the resume straightforward to scan.",
  ],
  weaknesses: [
    "Project bullets could clarify individual contributions.",
    "Impact statements could give more context about outcomes.",
    "Skills would be stronger when connected to specific examples.",
  ],
  suggestions: [
    {
      title: "Clarify project ownership",
      explanation: "State what you personally designed, implemented, or tested in each project.",
      priority: "high",
      original: "Worked on a campus planner using React.",
      improved: "Implemented the planner's search and schedule views with React and TypeScript.",
      missingMetricNote: "Add a usage or performance result only if you measured it and can substantiate it.",
    },
    {
      title: "Add evidence to skills",
      explanation: "Connect each key skill to a project, coursework, or internship example.",
      priority: "medium",
    },
    {
      title: "Review formatting consistency",
      explanation: "Use consistent date formats and align the tense of past and current experience.",
      priority: "low",
    },
  ],
  recommendations: [
    {
      title: "Frontend developer",
      whyItFits: "The fictional project evidence aligns with building interactive web interfaces.",
      relevantSkills: ["React", "TypeScript", "accessibility"],
      skillGaps: ["Automated testing"],
    },
    {
      title: "QA automation engineer",
      whyItFits: "The sample's attention to keyboard behavior could grow into a quality-engineering path.",
      relevantSkills: ["accessibility", "JavaScript"],
      skillGaps: ["Browser test automation"],
    },
  ],
  jobMatch: null,
  learningRoadmap: [
    {
      topic: "Browser test automation",
      reason: "Testing evidence can strengthen frontend and quality-engineering applications.",
      priority: "high",
      estimatedHours: 8,
      projectIdea: "Add keyboard and form-submission tests to a small web app.",
      resourceName: "Playwright documentation",
      resourceUrl: "https://playwright.dev/docs/intro",
    },
    {
      topic: "SQL foundations",
      reason: "Relational data skills broaden the types of product work you can explore.",
      priority: "medium",
      estimatedHours: 10,
      projectIdea: "Query a small, public dataset and explain the decisions you made.",
      resourceName: "Kaggle Learn: Intro to SQL",
      resourceUrl: "https://www.kaggle.com/learn/intro-to-sql",
    },
  ],
  nextActions: [
    "Choose one project and make your individual contribution explicit.",
    "Check that every result or metric is accurate and can be supported.",
    "Try a keyboard-only pass through a project interface.",
  ],
});

export function makeLocalAnalysis(
  report: Omit<AnalysisResult, "id" | "createdAt" | "source" | "overallScore" | "rubricNotice" | "categories"> & {
    categories: CategoryAssessment[];
  },
): AnalysisResult {
  const weightedCategories = attachWeights(report.categories);
  return analysisResultSchema.parse({
    ...report,
    id: globalThis.crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: "local-demo",
    overallScore: calculateResumeScore(report.categories),
    categories: weightedCategories,
    rubricNotice:
      "Local text-cue preview only. It does not use AI, verify claims, or determine hiring suitability.",
  });
}
