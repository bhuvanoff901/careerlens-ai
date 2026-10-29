import { describe, expect, it } from "vitest";
import { analysisRequestSchema, type CategoryAssessment } from "./schema";
import {
  attachWeights,
  calculateResumeScore,
  SCORE_WEIGHTS,
  scoreJobMatch,
  scoreResumeLocally,
} from "./scoring";

const fullCategoryScores = [
  { category: "skills", score: 80, explanation: "Evidence is clearly shown in the text." },
  { category: "projects", score: 60, explanation: "Project descriptions need additional context." },
  { category: "experience", score: 70, explanation: "Relevant experience is included." },
  { category: "impact", score: 50, explanation: "Outcomes could be explained more clearly." },
  { category: "structure", score: 90, explanation: "Section structure is easy to scan." },
  { category: "education", score: 100, explanation: "Education information is clearly stated." },
] as const;

describe("deterministic resume scoring", () => {
  it("calculates the documented category weights instead of accepting a supplied total", () => {
    expect(Object.values(SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0)).toBe(1);
    expect(calculateResumeScore([...fullCategoryScores])).toBe(73);
  });

  it("enforces scores from zero to one hundred", () => {
    const minimum = fullCategoryScores.map((item) => ({ ...item, score: 0 }));
    const maximum = fullCategoryScores.map((item) => ({ ...item, score: 100 }));
    expect(calculateResumeScore(minimum)).toBe(0);
    expect(calculateResumeScore(maximum)).toBe(100);
    expect(() => calculateResumeScore(fullCategoryScores.map((item, index) =>
      index === 0 ? { ...item, score: 101 } : item,
    ))).toThrow("Invalid score");
  });

  it("rejects incomplete or duplicate categories", () => {
    expect(() => calculateResumeScore([...fullCategoryScores.slice(1)])).toThrow("exactly one score");
    const duplicate: CategoryAssessment[] = [...fullCategoryScores];
    duplicate[5] = { ...fullCategoryScores[4], score: 50 };
    expect(() => calculateResumeScore(duplicate)).toThrow("Duplicate score");
  });

  it("returns transparent category weights", () => {
    expect(attachWeights([...fullCategoryScores])[0]?.weight).toBe(0.25);
  });

  it("uses a separate text-overlap score for job matching", () => {
    const result = scoreJobMatch(
      "Built a React and TypeScript project.",
      "React TypeScript SQL developer requirements.",
    );
    expect(result.matchingSkills).toContain("react");
    expect(result.missingSkills).toContain("sql");
    expect(result.score).toBeLessThan(100);
    expect(result.explanation).toContain("text terms only");
  });

  it("scores student project and coursework evidence without assuming paid experience", () => {
    const categories = scoreResumeLocally(
      "Education\nCoursework in Python\nProjects\nBuilt a research project",
    );
    expect(categories).toHaveLength(6);
    expect(categories.find((item) => item.category === "projects")?.score).toBeGreaterThan(25);
    expect(categories.find((item) => item.category === "experience")?.score).toBeGreaterThan(25);
  });
});

describe("analysis request validation", () => {
  const resumeText = "A sufficiently long synthetic resume text for validation testing. ".repeat(3);

  it("accepts general resume review input", () => {
    expect(analysisRequestSchema.safeParse({ mode: "general", resumeText }).success).toBe(true);
  });

  it("requires a job description in job-match mode", () => {
    const result = analysisRequestSchema.safeParse({ mode: "job-match", resumeText });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toContain("job description");
  });

  it("rejects extra fields, oversized resume text, and undersized content", () => {
    expect(analysisRequestSchema.safeParse({ mode: "general", resumeText, role: "admin" }).success).toBe(false);
    expect(analysisRequestSchema.safeParse({ mode: "general", resumeText: "short" }).success).toBe(false);
    expect(analysisRequestSchema.safeParse({ mode: "general", resumeText: "x".repeat(30_001) }).success).toBe(false);
  });
});
