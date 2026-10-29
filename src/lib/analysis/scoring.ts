import {
  categorySchema,
  type CategoryAssessment,
} from "./schema";

export const SCORE_WEIGHTS = {
  skills: 0.25,
  projects: 0.2,
  experience: 0.2,
  impact: 0.15,
  structure: 0.1,
  education: 0.1,
} as const satisfies Record<string, number>;

export const RUBRIC_NOTICE =
  "This advisory rubric reviews evidence visible in the supplied text; it is not a hiring decision or a guarantee of interview success.";

export function calculateResumeScore(
  categories: CategoryAssessment[],
): number {
  if (categories.length !== Object.keys(SCORE_WEIGHTS).length) {
    throw new Error("Provide exactly one score for every resume category.");
  }

  const scores = new Map<string, number>();
  for (const assessment of categories) {
    const category = categorySchema.parse(assessment.category);
    if (scores.has(category)) {
      throw new Error(`Duplicate score for category: ${category}.`);
    }
    if (!Number.isInteger(assessment.score) || assessment.score < 0 || assessment.score > 100) {
      throw new Error(`Invalid score for category: ${category}.`);
    }
    scores.set(category, assessment.score);
  }

  for (const category of Object.keys(SCORE_WEIGHTS)) {
    if (!scores.has(category)) {
      throw new Error(`Missing score for category: ${category}.`);
    }
  }

  const weightedScore = Object.entries(SCORE_WEIGHTS).reduce(
    (total, [category, weight]) => total + scores.get(category)! * weight,
    0,
  );
  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

const CATEGORY_LABELS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  impact: "Impact & achievements",
  structure: "Structure & readability",
  education: "Education",
};

const CATEGORY_EVIDENCE: Record<keyof typeof SCORE_WEIGHTS, string[]> = {
  skills: ["skill", "typescript", "python", "sql", "communication", "research"],
  projects: ["project", "built", "developed", "prototype", "repository"],
  experience: ["experience", "intern", "employment", "volunteer", "coursework"],
  impact: ["improved", "reduced", "increased", "delivered", "result", "%"],
  structure: ["summary", "skills", "education", "experience", "projects"],
  education: ["education", "university", "college", "bachelor", "degree", "coursework"],
};

const CATEGORY_GUIDANCE: Record<keyof typeof SCORE_WEIGHTS, string> = {
  skills: "List relevant skills and show where you applied them.",
  projects: "Add a project with your contribution, tools, and outcome.",
  experience: "Include internships, volunteering, coursework, or other relevant experience.",
  impact: "Describe the result of your work; add real measures only when you can support them.",
  structure: "Use clear, consistent section headings and concise bullets.",
  education: "Include relevant education, coursework, or training.",
};

export function scoreResumeLocally(
  resumeText: string,
): CategoryAssessment[] {
  const normalized = resumeText.toLowerCase();
  const sections = normalized.split(/\n{1,}/).filter((line) => line.trim().length > 2);

  return Object.entries(CATEGORY_EVIDENCE).map(([category, evidence]) => {
    const matches = evidence.filter((term) => normalized.includes(term));
    const score = Math.min(100, Math.round(25 + (matches.length / evidence.length) * 70));
    const label = CATEGORY_LABELS[category as keyof typeof SCORE_WEIGHTS];
    return {
      category: category as keyof typeof SCORE_WEIGHTS,
      score,
      explanation: matches.length
        ? `${label}: ${matches.length} of ${evidence.length} text cues were found across ${sections.length} non-empty lines. This local heuristic cannot verify the quality of that evidence. ${CATEGORY_GUIDANCE[category as keyof typeof SCORE_WEIGHTS]}`
        : `${label}: this text did not contain the simple cues used by the local preview. That is not proof the candidate lacks this experience. ${CATEGORY_GUIDANCE[category as keyof typeof SCORE_WEIGHTS]}`,
    };
  });
}

export function scoreJobMatch(
  resumeText: string,
  jobDescription: string,
): {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  explanation: string;
} {
  const stopWords = new Set([
    "about",
    "after",
    "also",
    "and",
    "are",
    "for",
    "from",
    "have",
    "into",
    "more",
    "must",
    "our",
    "that",
    "their",
    "this",
    "with",
    "will",
    "work",
    "years",
    "your",
  ]);
  const requirements = [...new Set(
    jobDescription
      .toLowerCase()
      .match(/[a-z][a-z+#.-]{2,}/g)
      ?.filter((word) => !stopWords.has(word)) ?? [],
  )].slice(0, 40);
  if (requirements.length === 0) {
    return {
      score: 0,
      matchingSkills: [],
      missingSkills: [],
      explanation: "There were no recognizable terms in the supplied job description.",
    };
  }

  const normalizedResume = resumeText.toLowerCase();
  const matchingSkills = requirements.filter((term) => normalizedResume.includes(term));
  const missingSkills = requirements.filter((term) => !normalizedResume.includes(term));
  const score = Math.round((matchingSkills.length / requirements.length) * 100);
  return {
    score,
    matchingSkills,
    missingSkills,
    explanation:
      "This simple local comparison checks for shared text terms only. It cannot assess proficiency, context, or actual job suitability.",
  };
}

export function attachWeights(
  categories: CategoryAssessment[],
): (CategoryAssessment & { weight: number })[] {
  return categories.map((assessment) => ({
    ...assessment,
    weight: SCORE_WEIGHTS[assessment.category],
  }));
}
