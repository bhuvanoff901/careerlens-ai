import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeResume } from "@/lib/analysis/service";
import { analysisRequestSchema } from "@/lib/analysis/schema";

export const maxDuration = 60;

const attempts = new Map<string, number[]>();
const maxRateLimitKeys = 10_000;
let lastRateLimitCleanup = 0;

function allowRequest(key: string): boolean {
  const now = Date.now();
  const cutoff = now - 60_000;
  if (now - lastRateLimitCleanup > 60_000) {
    for (const [address, times] of attempts) {
      if (!times.some((time) => time > cutoff)) attempts.delete(address);
    }
    lastRateLimitCleanup = now;
  }
  if (!attempts.has(key) && attempts.size >= maxRateLimitKeys) return false;

  const recent = (attempts.get(key) ?? []).filter((time) => time > cutoff);
  if (recent.length >= 5) {
    attempts.set(key, recent);
    return false;
  }
  attempts.set(key, [...recent, now]);
  return true;
}

async function readJsonBody(request: Request): Promise<
  { kind: "ok"; value: unknown } | { kind: "too-large" } | { kind: "invalid" }
> {
  const reader = request.body?.getReader();
  if (!reader) return { kind: "invalid" };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 200_000) {
        await reader.cancel().catch(() => undefined);
        return { kind: "too-large" };
      }
      chunks.push(value);
    }
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { kind: "ok", value: JSON.parse(new TextDecoder().decode(body)) as unknown };
  } catch {
    return { kind: "invalid" };
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 200_000) {
    return NextResponse.json({ error: "The analysis request exceeds the supported size." }, { status: 413 });
  }

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(address)) {
    return NextResponse.json(
      { error: "Too many analysis requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const body = await readJsonBody(request);
  if (body.kind === "too-large") {
    return NextResponse.json({ error: "The analysis request exceeds the supported size." }, { status: 413 });
  }
  if (body.kind === "invalid") {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const parsed = analysisRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the submitted resume details.", issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
      { status: 422 },
    );
  }

  try {
    const report = await analyzeResume(parsed.data);
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "The analysis could not be validated. Please try again with a clearer resume." },
        { status: 502 },
      );
    }
    if (error instanceof Error && error.name === "APIConnectionTimeoutError") {
      return NextResponse.json(
        { error: "Analysis timed out. Your resume text was not saved; try again." },
        { status: 504 },
      );
    }
    if (error instanceof Error && error.message === "The analysis provider returned no structured report.") {
      return NextResponse.json({ error: "The analysis provider did not return a report." }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Resume analysis is temporarily unavailable. Your resume text was not saved." },
      { status: 503 },
    );
  }
}
