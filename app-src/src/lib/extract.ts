// Menu text from a PDF (text layer, pdf.js) or a photo (OCR, tesseract.js).
// Both run in the browser; libraries load only when a file is chosen.

export type Progress = (p: number, label: string) => void;

export async function textFromPdf(file: File, onProgress: Progress): Promise<string> {
  onProgress(0.05, "Opening PDF");
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress(0.1 + (0.85 * i) / doc.numPages, `Reading page ${i} of ${doc.numPages}`);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // group text runs into lines by their baseline (y), then left-to-right (x)
    const lines = new Map<number, { x: number; s: string }[]>();
    for (const it of content.items as { str: string; transform: number[] }[]) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5] / 3) * 3;
      const x = it.transform[4];
      const k = [...lines.keys()].find((ky) => Math.abs(ky - y) <= 3) ?? y;
      const arr = lines.get(k) ?? [];
      arr.push({ x, s: it.str });
      lines.set(k, arr);
    }
    const sorted = [...lines.entries()].sort((a, b) => b[0] - a[0]);
    pages.push(sorted.map(([, runs]) => runs.sort((a, b) => a.x - b.x).map((r) => r.s.trim()).join(" ").replace(/\s+/g, " ")).join("\n"));
  }
  onProgress(1, "Done");
  const text = pages.join("\n").trim();
  if (text.replace(/\s/g, "").length < 20) throw new Error("This PDF has no readable text layer (it is probably a scanned image). Export a page as a photo and upload that, or paste the text.");
  return text;
}

export async function textFromImage(file: File, onProgress: Progress): Promise<string> {
  onProgress(0.02, "Loading the reader (first time takes a few seconds)");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress(0.3 + m.progress * 0.68, "Reading the menu");
      else onProgress(Math.min(0.3, 0.05 + m.progress * 0.25), m.status.replace(/^\w/, (c) => c.toUpperCase()));
    },
  });
  try {
    const { data } = await worker.recognize(file);
    onProgress(1, "Done");
    return data.text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  } finally {
    await worker.terminate();
  }
}

export function extractText(file: File, onProgress: Progress): Promise<string> {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return textFromPdf(file, onProgress);
  if (file.type.startsWith("image/")) return textFromImage(file, onProgress);
  return Promise.reject(new Error("Upload a PDF, JPG or PNG."));
}
