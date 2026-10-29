import { z } from "zod";

export const MAX_RESUME_CHARACTERS = 30_000;
export const MAX_JOB_DESCRIPTION_CHARACTERS = 12_000;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MIN_RESUME_CHARACTERS = 100;

export const analysisModeSchema = z.enum(["general", "job-match", "career-paths"]);

export const categorySchema = z.enum([
  "skills",
  "projects",
  "experience",
  "impact",
  "structure",
  "education",
]);

export const analysisRequestSchema = z
  .object({
    mode: analysisModeSchema,
    resumeText: z
      .string()
      .trim()
      .min(MIN_RESUME_CHARACTERS, "Add at least 100 characters of resume text.")
      .max(MAX_RESUME_CHARACTERS, "Resume text exceeds the 30,000 character limit."),
    targetRole: z.string().trim().max(120).optional().default(""),
    jobDescription: z
      .string()
      .trim()
      .max(MAX_JOB_DESCRIPTION_CHARACTERS, "Job description exceeds the 12,000 character limit.")
      .optional()
      .default(""),
  })
  .strict()
  .superRefine((request, context) => {
    if (request.mode === "job-match" && request.jobDescription.length < 50) {
      context.addIssue({
        code: "custom",
        message: "Add a job description of at least 50 characters for a job match.",
        path: ["jobDescription"],
      });
    }
  });

export const categoryAssessmentSchema = z.object({
  category: categorySchema,
  score: z.number().int().min(0).max(100),
  explanation: z.string().min(10).max(500),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  evidence: z.string().min(1).max(300),
  match: z.enum(["found", "partial", "not_found"]),
});

export const suggestionSchema = z.object({
  title: z.string().min(3).max(140),
  explanation: z.string().min(10).max(500),
  priority: z.enum(["high", "medium", "low"]),
  original: z.string().max(500).optional(),
  improved: z.string().max(500).optional(),
  missingMetricNote: z.string().max(300).optional(),
});

export const roleRecommendationSchema = z.object({
  title: z.string().min(2).max(100),
  whyItFits: z.string().min(10).max(400),
  relevantSkills: z.array(z.string().max(80)).max(12),
  skillGaps: z.array(z.string().max(80)).max(12),
});

export const learningStepSchema = z.object({
  topic: z.string().min(2).max(120),
  reason: z.string().min(10).max(300),
  priority: z.enum(["high", "medium", "low"]),
  estimatedHours: z.number().int().min(1).max(200),
  projectIdea: z.string().min(5).max(300),
  resourceName: z.string().min(2).max(120),
  resourceUrl: z.string().url(),
});

export const aiAnalysisSchema = z.object({
  categories: z.array(categoryAssessmentSchema).length(6),
  summary: z.string().min(30).max(1_000),
  skills: z.array(skillSchema).max(40),
  strengths: z.array(z.string().min(5).max(300)).min(1).max(8),
  weaknesses: z.array(z.string().min(5).max(300)).max(8),
  suggestions: z.array(suggestionSchema).max(12),
  recommendations: z.array(roleRecommendationSchema).max(6),
  jobMatch: z
    .object({
      score: z.number().int().min(0).max(100),
      matchingSkills: z.array(z.string().max(80)).max(20),
      partialSkills: z.array(z.string().max(80)).max(20),
      missingSkills: z.array(z.string().max(80)).max(20),
      explanation: z.string().min(10).max(600),
    })
    .nullable(),
  learningRoadmap: z.array(learningStepSchema).max(8),
  nextActions: z.array(z.string().min(5).max(250)).min(1).max(6),
});

export const analysisResultSchema = aiAnalysisSchema.extend({
  id: z.string().uuid(),
  overallScore: z.number().int().min(0).max(100),
  categories: z.array(
    categoryAssessmentSchema.extend({
      weight: z.number().positive().max(1),
    }),
  ),
  source: z.enum(["ai", "local-demo", "sample-demo"]),
  createdAt: z.string().datetime(),
  rubricNotice: z.string().min(10).max(300),
});

export const savedAnalysisSchema = z.object({
  title: z.string().min(1).max(140),
  report: analysisResultSchema,
});

export type AnalysisMode = z.infer<typeof analysisModeSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type CategoryAssessment = z.infer<typeof categoryAssessmentSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
