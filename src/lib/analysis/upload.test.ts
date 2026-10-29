import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES } from "./schema";
import { extractResumeText } from "./upload";

function makeSimplePdf(text: string): ArrayBuffer {
  const stream = `BT /F1 12 Tf 40 700 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(document, "binary"));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const crossReferenceOffset = Buffer.byteLength(document, "binary");
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  document += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;
  const bytes = Buffer.from(document, "binary");
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

describe("resume document extraction", () => {
  it("extracts readable text from a synthetic PDF with a real PDF header", async () => {
    const source = "Synthetic resume: software development projects, accessible interfaces, React, TypeScript, Python, coursework, and responsibilities described for document-parser testing only.";
    const file = new File([makeSimplePdf(source)], "synthetic-resume.pdf", { type: "application/pdf" });
    await expect(extractResumeText(file)).resolves.toContain("Synthetic resume");
  });

  it("rejects empty documents and files above the upload limit", async () => {
    await expect(extractResumeText(new File([], "empty.pdf", { type: "application/pdf" })))
      .rejects.toThrow("empty");
    const oversized = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "large.pdf", { type: "application/pdf" });
    await expect(extractResumeText(oversized)).rejects.toThrow("4 MB");
  });

  it("rejects unsupported types and documents without matching signatures", async () => {
    const textFile = new File(["not a resume document"], "resume.txt", { type: "text/plain" });
    const disguisedPdf = new File(["not a PDF file"], "resume.pdf", { type: "application/pdf" });
    await expect(extractResumeText(textFile)).rejects.toThrow("valid PDF or DOCX");
    await expect(extractResumeText(disguisedPdf)).rejects.toThrow("valid PDF or DOCX");
  });

  it("reports when a document contains too little readable text", async () => {
    const shortFile = new File([makeSimplePdf("Tiny sample")], "short.pdf", { type: "application/pdf" });
    await expect(extractResumeText(shortFile)).rejects.toThrow("too little readable text");
  });
});
