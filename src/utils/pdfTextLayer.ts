import type { jsPDF } from "jspdf";

/**
 * Characters that ATS text extractors frequently mis-read are downgraded to plain ASCII,
 * so the hidden PDF text layer never contains mojibake (e.g. box glyphs) or dangling symbols.
 */
const PDF_TEXT_REPLACEMENTS: Record<string, string> = {
  "\u2014": "-",
  "\u2013": "-",
  "\u2012": "-",
  "\u2011": "-",
  "\u2022": "|",
  "\u00b7": "|",
  "\u2023": "|",
  "\u25aa": "|",
  "\u25cf": "|",
  "\u2192": "->",
  "\u2026": "...",
  "\u2019": "'",
  "\u2018": "'",
  "\u201c": '"',
  "\u201d": '"',
  "\u00a0": " ",
  "\u200b": "",
  "\u200e": "",
  "\u200f": "",
  "\ufeff": "",
};

export function toPdfSafeText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, (ch) => PDF_TEXT_REPLACEMENTS[ch] ?? "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface TextFragment {
  text: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  fontPx: number;
}

/** One visual line of text, already merged from every inline span / bold run on that line. */
export interface PdfTextLine {
  text: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  fontPx: number;
}

function isTextSkipped(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return true;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return true;
  return parseFloat(style.opacity || "1") === 0;
}

function pushFragment(
  frags: TextFragment[],
  text: string,
  rect: DOMRect,
  fontPx: number
): void {
  const clean = toPdfSafeText(text);
  if (!clean || rect.width <= 0 || rect.height <= 0) return;
  frags.push({
    text: clean,
    left: rect.left,
    right: rect.left + rect.width,
    top: rect.top,
    bottom: rect.top + rect.height,
    fontPx,
  });
}

/**
 * Walks the rendered resume and returns its text as visual lines, in reading order.
 *
 * Why not emit one PDF text object per DOM text node (the old behaviour)? Because inline
 * runs ("Wo" + "rk Experience", "**CAC** by", "Angular 17" + "with SSR") end up as separate
 * objects at slightly different x positions: extractors then either glue them together
 * ("CACby", "17with SSRand") or split real words ("Wo rk"), which breaks ATS keyword
 * matching. Grouping fragments by their visual line and joining them with the real
 * geometric gap produces clean, human-readable text in the PDF content stream.
 */
/**
 * Splits a word that CSS broke across two visual lines into one fragment per line.
 */
function pushWordAcrossLines(
  frags: TextFragment[],
  node: Text,
  token: string,
  startOffset: number,
  fontPx: number
): void {
  let runText = "";
  let runTop = Number.NaN;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  const flush = () => {
    if (runText) {
      pushFragment(frags, runText, new DOMRect(left, runTop, right - left, bottom - runTop), fontPx);
    }
    runText = "";
    runTop = Number.NaN;
    left = Number.POSITIVE_INFINITY;
    right = Number.NEGATIVE_INFINITY;
    bottom = Number.NEGATIVE_INFINITY;
  };

  for (let i = 0; i < token.length; i++) {
    const charRange = document.createRange();
    charRange.setStart(node, startOffset + i);
    charRange.setEnd(node, startOffset + i + 1);
    const rect = charRange.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      runText += token[i];
      continue;
    }

    if (!Number.isNaN(runTop) && Math.abs(rect.top - runTop) > 1) flush();
    if (Number.isNaN(runTop)) runTop = rect.top;

    runText += token[i];
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  flush();
}

export function collectPdfTextLines(root: HTMLElement): PdfTextLine[] {
  const frags: TextFragment[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      return isTextSkipped(parent) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text;
    const raw = textNode.nodeValue ?? "";
    if (!raw.trim()) continue;
    const parent = textNode.parentElement;
    if (!parent) continue;

    const fontPx = parseFloat(window.getComputedStyle(parent).fontSize) || 12;

    if (fontPx < 3) {
      // Deliberately clipped 1px keyword banks: word rects are unmeasurable at that size
      // (all gaps round to 0), so keep the whole run as one line and let the exporter wrap it.
      const hiddenRange = document.createRange();
      hiddenRange.selectNodeContents(textNode);
      pushFragment(frags, raw, hiddenRange.getBoundingClientRect(), fontPx);
      continue;
    }

    // Measure word by word, even inside a single-line node: a whole-node rect includes the
    // trailing/leading spaces, which would hide the real gap to the next inline run
    // ("**CAC** by" then exports as "CACby").
    const tokens = raw.split(/(\s+)/);
    let offset = 0;
    for (const token of tokens) {
      if (token.trim().length > 0) {
        try {
          const wordRange = document.createRange();
          wordRange.setStart(textNode, offset);
          wordRange.setEnd(textNode, offset + token.length);
          const rect = wordRange.getBoundingClientRect();

          if (rect.height > fontPx * 1.7) {
            // The word is broken across two visual lines (hyphenation): a single union rect
            // would land between both lines and scramble the reading order, so measure it
            // character by character and emit one fragment per visual line.
            pushWordAcrossLines(frags, textNode, token, offset, fontPx);
          } else {
            pushFragment(frags, token, rect, fontPx);
          }
        } catch {
          // Ignore a single unmeasurable token; the rest of the line still exports.
        }
      }
      offset += token.length;
    }
  }

  if (frags.length === 0) return [];

  frags.sort((a, b) => a.top - b.top || a.left - b.left);

  const clusters: TextFragment[][] = [];
  for (const frag of frags) {
    const current = clusters[clusters.length - 1];
    if (current && current.length > 0) {
      const centerY =
        current.reduce((sum, f) => sum + (f.top + f.bottom) / 2, 0) / current.length;
      const tol = Math.max(2, 0.35 * Math.max(frag.fontPx, current[current.length - 1].fontPx));
      if (Math.abs((frag.top + frag.bottom) / 2 - centerY) <= tol) {
        current.push(frag);
        continue;
      }
    }
    clusters.push([frag]);
  }

  // Split every visual line at wide gutters (side-by-side cards/columns) so two unrelated
  // sentences are never glued into one PDF text run.
  const segments: TextFragment[][] = [];
  for (const cluster of clusters) {
    const ordered = [...cluster].sort((a, b) => a.left - b.left);
    let current: TextFragment[] = [];
    let prev: TextFragment | null = null;

    for (const frag of ordered) {
      if (prev && frag.left - prev.right > Math.max(frag.fontPx, prev.fontPx)) {
        segments.push(current);
        current = [];
      }
      current.push(frag);
      prev = frag;
    }
    if (current.length > 0) segments.push(current);
  }

  return segments
    .map((segment) => {
      const ordered = segment;
      let text = "";
      let prevRight: number | null = null;
      let prevFont = ordered[0].fontPx;

      for (const frag of ordered) {
        if (prevRight !== null) {
          const gap = frag.left - prevRight;
          // A real word space is ~0.2–0.3em wide; runs split mid-word (coloured spans,
          // <strong> boundaries without whitespace) sit flush against each other.
          if (gap > 0.12 * Math.max(frag.fontPx, prevFont)) text += " ";
        }
        text += frag.text;
        prevRight = frag.right;
        prevFont = frag.fontPx;
      }

      const left = Math.min(...ordered.map((f) => f.left));
      const right = Math.max(...ordered.map((f) => f.right));
      const top = Math.min(...ordered.map((f) => f.top));
      const bottom = Math.max(...ordered.map((f) => f.bottom));
      const fontPx = Math.max(...ordered.map((f) => f.fontPx));

      return {
        text: toPdfSafeText(text),
        left,
        right,
        top,
        bottom,
        fontPx,
      } satisfies PdfTextLine;
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.top - b.top || a.left - b.left);
}

export interface TextLayerOptions {
  /** 1-based page holding the top of `el`; omit to paginate by vertical overflow. */
  pageIndex?: number;
  pageCount: number;
  pageWidthMm: number;
  pageHeightMm: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Draws the searchable/selectable text layer for `el` onto the current jsPDF document.
 * Text is emitted line by line in reading order, so parsers that trust the content stream
 * get the same sequence a human reads.
 */
export function drawPdfTextLayer(pdf: jsPDF, el: HTMLElement, opts: TextLayerOptions): void {
  const lines = collectPdfTextLines(el);
  if (lines.length === 0) return;

  const rootRect = el.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0) return;

  const { pageIndex, pageCount, pageWidthMm, pageHeightMm, scaleX, scaleY } = opts;
  const maxWidth = pageWidthMm - 4;

  for (const line of lines) {
    const x = (line.left - rootRect.left) * scaleX;
    const topMm = (line.top - rootRect.top) * scaleY;
    const heightMm = Math.max(0.8, (line.bottom - line.top) * scaleY);
    const baselineY = topMm + heightMm * 0.8;

    const page = pageIndex ?? Math.floor(baselineY / pageHeightMm) + 1;
    if (page < 1 || page > pageCount) continue;

    const yOnPage = pageIndex ? baselineY : baselineY - (page - 1) * pageHeightMm;
    if (yOnPage < 0 || yOnPage > pageHeightMm) continue;

    pdf.setPage(page);

    const startX = Math.min(Math.max(x, 0), pageWidthMm - 2);
    let fontPt = Math.max(3, line.fontPx * scaleY * (72 / 25.4));
    pdf.setFontSize(fontPt);

    if (line.fontPx < 3) {
      // Clipped 1px keyword bank: keep it on a single line inside the page instead of
      // wrapping it into the resume body, where it would interleave with real content.
      const naturalWidth = pdf.getTextWidth(line.text);
      if (naturalWidth > maxWidth) {
        fontPt = Math.max(0.8, fontPt * (maxWidth / naturalWidth));
        pdf.setFontSize(fontPt);
      }
      pdf.text(line.text, startX, yOnPage, { renderingMode: "invisible" });
      continue;
    }

    // Slightly tighten the type size first; only wrap when the run still cannot fit the page.
    while (fontPt > 4 && pdf.getTextWidth(line.text) > maxWidth) {
      fontPt *= 0.94;
      pdf.setFontSize(fontPt);
    }

    const chunks = wrapToWidth(pdf, line.text, maxWidth);
    const stepMm = Math.max(2.4, fontPt * 0.3528 * 1.6);

    chunks.forEach((chunk, index) => {
      const chunkY = yOnPage + index * stepMm;
      // Keep every glyph inside the MediaBox: extractors drop text drawn past the page edge.
      if (chunkY > pageHeightMm - 1) return;
      pdf.text(chunk, startX, chunkY, { renderingMode: "invisible" });
    });
  }
}

function wrapToWidth(pdf: jsPDF, text: string, maxWidth: number): string[] {
  if (pdf.getTextWidth(text) <= maxWidth) return [text];

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || pdf.getTextWidth(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
