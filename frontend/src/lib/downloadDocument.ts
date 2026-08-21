import type { GeneratedDocument } from "./types";

function safeFilename(title: string, docType: string) {
  const base =
    title
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || docType;
  return `${base}.txt`;
}

export function downloadDocument(doc: GeneratedDocument) {
  const header = `${doc.title}\n${"=".repeat(Math.min(doc.title.length, 60))}\n\n${doc.disclaimer}\n\n`;
  const blob = new Blob([header + doc.body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeFilename(doc.title, doc.doc_type);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
