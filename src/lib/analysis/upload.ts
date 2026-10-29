import "server-only";

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import {
  MAX_RESUME_CHARACTERS,
  MAX_UPLOAD_BYTES,
  MIN_RESUME_CHARACTERS,
} from "./schema";

export type ResumeFileType = "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractResumeText(file: File): Promise<string> {
  if (file.size === 0) throw new Error("The selected document is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("The document exceeds the 4 MB upload limit.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (
    file.type === "application/pdf"
    && new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-"
  ) {
    const parser = new PDFParse({ data: bytes, isEvalSupported: false });
    try {
      const extracted = await parser.getText({ first: 20 });
      text = extracted.text;
    } finally {
      await parser.destroy();
    }
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    && bytes[0] === 0x50
    && bytes[1] === 0x4b
    && bytes[2] === 0x03
    && bytes[3] === 0x04
  ) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    text = result.value;
  } else {
    throw new Error("Upload a valid PDF or DOCX document.");
  }

  const normalized = text.replace(/\u0000/g, "").trim();
  if (normalized.length < MIN_RESUME_CHARACTERS) {
    throw new Error("The document contains too little readable text. Try another file or paste the text.");
  }
  if (normalized.length > MAX_RESUME_CHARACTERS) {
    throw new Error("Extracted text exceeds the 30,000 character limit.");
  }
  return normalized;
}
