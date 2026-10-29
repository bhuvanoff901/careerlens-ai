import { NextResponse } from "next/server";
import { extractResumeText } from "@/lib/analysis/upload";
import { MAX_UPLOAD_BYTES } from "@/lib/analysis/schema";

export const maxDuration = 30;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES + 100_000) {
    return NextResponse.json({ error: "The document exceeds the 4 MB upload limit." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Send a valid PDF or DOCX document." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a PDF or DOCX document first." }, { status: 400 });
  }

  try {
    const resumeText = await extractResumeText(file);
    return NextResponse.json(
      { resumeText, fileName: file.name.slice(0, 160), fileSize: file.size },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The document could not be read." },
      { status: 422 },
    );
  }
}
