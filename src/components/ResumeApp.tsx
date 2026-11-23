import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Component4 from "@/imports/روزمه02/index";
import ExecutiveTwoPageTemplate from "@/components/ExecutiveTwoPageTemplate";
import MinimalSinglePageTemplate, {
  ClassicSinglePageFitMode,
  ClassicSinglePageMetrics,
} from "@/components/MinimalSinglePageTemplate";
import CustomHtmlTemplate from "@/components/CustomHtmlTemplate";
import Toolbar, { LayoutMode, TemplateManagerTab } from "@/components/Toolbar";
import PrintGuideModal from "@/components/PrintGuideModal";
import ATSInspectorModal from "@/components/ATSInspectorModal";
import TemplateManagerModal from "@/components/TemplateManagerModal";
import ResumeEditorPanel, { EditorPanelTab } from "@/components/ResumeEditorPanel";
import TailorJobModal from "@/components/TailorJobModal";
import CloneArchiveModal from "@/components/CloneArchiveModal";
import InlineTextEditModal from "@/components/InlineTextEditModal";
import CloneChatDrawer from "@/components/CloneChatDrawer";
import CareerToolsModal, { CareerToolsTab } from "@/components/CareerToolsModal";
import SaveVersionModal, { SaveVersionPayload } from "@/components/SaveVersionModal";
import { useResume } from "@/context/ResumeContext";
import { BASE_TYPE_LABELS } from "@/types/templates";
import { CLONE_STATUS_META, getCloneGroupMeta } from "@/types/clones";
import { getFontPairing, sanitizeCustomCss } from "@/utils/templateTheme";
import { matchClickedElementToField } from "@/utils/resumeFieldMatcher";
import { exportResumeToDocx } from "@/utils/docxExporter";
import {
  Archive,
  Award,
  Briefcase,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  FolderKanban,
  History,
  Layers,
  MessageSquareText,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";

// Standard Dimensions
const A4_W = 794; // A4 width at 96 DPI (px)
const DOC_W = 594; // Figma design native width (px)
const DEFAULT_DOC_H = 1100; // Baseline natural height without empty void (px)

// Characters that ATS text extractors frequently mis-read are downgraded to plain ASCII,
// so the hidden PDF text layer never contains mojibake (e.g. box glyphs) or dangling symbols.
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

function toPdfSafeText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, (ch) => PDF_TEXT_REPLACEMENTS[ch] ?? "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Renders one resume sheet to an image.
 * We first try with the real webfonts embedded (skipFonts: false). Without them the SVG is
 * rendered with system fallback fonts, which is what makes individual glyphs – typically a
 * capital “I” – look heavier / more serif-like than the rest of the line.
 * If that takes too long or fails, we fall back to system fonts so the export still completes.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("render-timeout")), ms)),
  ]);
}

async function renderSheetImage(node: HTMLElement, compressed: boolean): Promise<string> {
  const base = { cacheBust: false, backgroundColor: "#ffffff" } as const;
  const options = compressed
    ? { ...base, quality: 0.75, pixelRatio: 1.5 }
    : { ...base, pixelRatio: 2 };
  const render = (extra: { skipFonts?: boolean }) =>
    compressed ? toJpeg(node, { ...options, ...extra }) : toPng(node, { ...options, ...extra });

  try {
    return await withTimeout(render({ skipFonts: false }), 20000);
  } catch (err) {
    console.warn("[export] webfont render failed or timed out; retrying with system fonts", err);
    return await render({ skipFonts: true });
  }
}

export default function ResumeApp() {
  const {
    isPanelOpen,
    setIsPanelOpen,
    data,
    tailoredDrafts,
    activeDraft,
    selectTailoredDraft,
    deleteTailoredDraft,
    isTailorModalOpen,
    setIsTailorModalOpen,
    allTemplates,
    activeTemplateId,
    activeTemplate,
    liveBaseType,
    liveCustomization,
    liveCustomHtml,
    hasUnsavedCustomizations,
    effectiveTailoredContent,
    selectTemplate,
    resetLiveCustomizations,
    clones,
    activeClone,
    isCloneArchiveOpen,
    setIsCloneArchiveOpen,
    isCloneChatOpen,
    setIsCloneChatOpen,
    quickCloneCurrent,
    saveCurrentToActiveClone,
    exitActiveClone,
  } = useResume();

  const [savedCloneToast, setSavedCloneToast] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);
  const [quickSaveToast, setQuickSaveToast] = useState(false);
  const [isSaveVersionOpen, setIsSaveVersionOpen] = useState(false);
  const quickSaveTimerRef = useRef<number | null>(null);
  const [classicFitMode, setClassicFitMode] = useState<ClassicSinglePageFitMode>("full-autofit");
  const [classicMetrics, setClassicMetrics] = useState<ClassicSinglePageMetrics | null>(null);
  const [focusChangelogCloneId, setFocusChangelogCloneId] = useState<string | null>(null);
  const [careerToolsModal, setCareerToolsModal] = useState<{
    isOpen: boolean;
    tab: CareerToolsTab;
  }>({ isOpen: false, tab: "audit" });
  const [inlineEditModal, setInlineEditModal] = useState<{ isOpen: boolean; fieldKey: string | null }>({
    isOpen: false,
    fieldKey: null,
  });

  const handleResumeDoubleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;
      const matched = matchClickedElementToField(targetEl, effectiveTailoredContent, data);
      setInlineEditModal({
        isOpen: true,
        fieldKey: matched.key,
      });
    },
    [effectiveTailoredContent, data]
  );

  const handleQuickSave = useCallback(
    (payload?: SaveVersionPayload) => {
      quickCloneCurrent({
        switchToClone: true,
        name: payload?.name,
        commitMessage: payload?.commitMessage,
        notes: payload?.commitMessage,
      });
      setIsSaveVersionOpen(false);
      setQuickSaveToast(true);
      if (quickSaveTimerRef.current) window.clearTimeout(quickSaveTimerRef.current);
      quickSaveTimerRef.current = window.setTimeout(() => setQuickSaveToast(false), 2200);
    },
    [quickCloneCurrent]
  );

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("fit-width");
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState(false);
  const [isATSInspectorOpen, setIsATSInspectorOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [templateManagerTab, setTemplateManagerTab] = useState<TemplateManagerTab>("gallery");
  const [editorPanelInitialTab, setEditorPanelInitialTab] = useState<EditorPanelTab>("design");
  const [extractedText, setExtractedText] = useState("");
  const [copiedQuick, setCopiedQuick] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeInnerRef = useRef<HTMLDivElement>(null);
  const printableRef = useRef<HTMLDivElement>(null);
  const [docHeight, setDocHeight] = useState<number>(DEFAULT_DOC_H);

  const openTemplateManager = useCallback((tab: TemplateManagerTab = "gallery") => {
    setTemplateManagerTab(tab);
    setIsTemplateManagerOpen(true);
  }, []);

  const openCustomizePanel = useCallback(() => {
    setEditorPanelInitialTab("design");
    setIsPanelOpen(true);
  }, [setIsPanelOpen]);

  // Dynamically measure actual rendered height for Figma template
  useEffect(() => {
    const el = resumeInnerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight || el.scrollHeight;
      if (h > 200) {
        setDocHeight(h);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [liveBaseType, activeTemplateId, liveCustomization]);

  // Extract raw text for ATS Inspector & AI ATS Scorer
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (resumeRef.current) {
        setExtractedText(resumeRef.current.innerText || "");
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [activeTemplateId, liveBaseType, liveCustomization, liveCustomHtml, data, activeDraft]);

  // Handle highlighter cleanup for search terms
  useEffect(() => {
    if (!searchTerm || !resumeRef.current) {
      setMatchCount(0);
      const marks = resumeRef.current?.querySelectorAll("mark.highlight");
      marks?.forEach((mark) => {
        const parent = mark.parentNode;
        parent?.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent?.normalize();
      });
      return;
    }
  }, [searchTerm]);

  /**
   * Dynamic file name: ShayanEsfahanizade-01.pdf, -02 …
   * The number follows the saved-version history: the active clone keeps its own archive
   * number, otherwise we use the “next” version number.
   */
  const getResumeFileBase = useCallback(() => {
    const total = clones.length;
    let versionNumber = total + 1;
    if (activeClone) {
      const idx = clones.findIndex((c) => c.id === activeClone.id);
      if (idx >= 0) versionNumber = idx + 1;
    }
    return `ShayanEsfahanizade-${String(Math.max(versionNumber, 1)).padStart(2, "0")}`;
  }, [clones, activeClone]);

  const handlePrint = useCallback(() => {
    setIsPrintGuideOpen(false);
    // Browsers derive the printed file name from the document title.
    const previousTitle = document.title;
    const printTitle = getResumeFileBase();
    document.title = printTitle;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn("window.print blocked in iframe, opening in new tab", e);
        window.open(window.location.href, "_blank");
      } finally {
        window.setTimeout(restoreTitle, 2500);
      }
    }, 100);
  }, [getResumeFileBase]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleDownloadDocx = async () => {
    if (isDownloadingDocx) return;
    setIsDownloadingDocx(true);
    try {
      const slugSource =
        activeDraft?.targetCompany || activeClone?.targetCompany || activeClone?.name || activeTemplate.name;
      await exportResumeToDocx(data, effectiveTailoredContent, slugSource);
    } catch (err) {
      console.error("DOCX export failed:", err);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const getDraftFileSlug = () => {
    if (!activeDraft) return "";
    const raw = `${activeDraft.targetCompany}_${activeDraft.targetRole}`
      .replace(/[^a-zA-Z0-9\u0600-\u06FF_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 42);
    return raw ? `_${raw}` : "_Tailored";
  };

  const getTemplateFileSlug = () => {
    const raw = (activeTemplate.name || liveBaseType)
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 28);
    return raw ? `_${raw}` : "";
  };

  const handleDownloadPdf = async (compressed = false) => {
    const element = document.getElementById("resume-content");
    if (!element || isDownloading) return;

    const draftSlug = getDraftFileSlug();
    const tplSlug = getTemplateFileSlug();
    setIsDownloading(true);
    try {
      const originalTransform = element.style.transform;
      element.style.transform = "none";

      let dataUrl: string;
      let imgFormat: "PNG" | "JPEG" = "PNG";

      if (compressed) {
        imgFormat = "JPEG";
        dataUrl = await renderSheetImage(element, true);
      } else {
        imgFormat = "PNG";
        dataUrl = await renderSheetImage(element, false);
      }

      element.style.transform = originalTransform;

      const pdfWidth = 210; // 210mm standard width
      const elementWidth = element.offsetWidth || 594;
      const elementHeight = element.offsetHeight || 842;
      const imgHeight = (pdfWidth * elementHeight) / elementWidth;

      // For Modern UI (modern-figma) template: generate a single continuous long page PDF
      if (liveBaseType === "modern-figma") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [pdfWidth, imgHeight],
          compress: true,
        });

        pdf.addImage(dataUrl, imgFormat, 0, 0, pdfWidth, imgHeight, undefined, compressed ? "FAST" : "NONE");

        const elementRect = element.getBoundingClientRect();
        if (elementRect.width > 0 && elementRect.height > 0) {
          const scaleX = pdfWidth / elementRect.width;
          const scaleY = imgHeight / elementRect.height;

          // Add searchable & selectable invisible text layer
          try {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
              acceptNode: (node) => {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return NodeFilter.FILTER_REJECT;
                const style = window.getComputedStyle(parent);
                if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              },
            });

            const range = document.createRange();
            const textItems: { text: string; rect: DOMRect; fontPx: number }[] = [];

            while (walker.nextNode()) {
              const textNode = walker.currentNode as Text;
              const text = toPdfSafeText(textNode.nodeValue ?? "");
              if (!text) continue;

              const parent = textNode.parentElement;
              if (!parent) continue;

              const style = window.getComputedStyle(parent);
              const fontPx = parseFloat(style.fontSize) || 12;

              range.selectNodeContents(textNode);
              const rects = Array.from(range.getClientRects());

              if (rects.length <= 1) {
                if (rects.length === 1 && rects[0].width > 0 && rects[0].height > 0) {
                  textItems.push({ text, rect: rects[0], fontPx });
                }
              } else {
                const tokens = text.split(/(\s+)/);
                let charOffset = 0;
                for (const token of tokens) {
                  if (token.trim().length > 0) {
                    try {
                      const wordRange = document.createRange();
                      wordRange.setStart(textNode, charOffset);
                      wordRange.setEnd(textNode, charOffset + token.length);
                      const wRect = wordRange.getBoundingClientRect();
                      if (wRect.width > 0 && wRect.height > 0) {
                        textItems.push({ text: token, rect: wRect, fontPx });
                      }
                    } catch {
                      // fallback
                    }
                  }
                  charOffset += token.length;
                }
              }
            }

            if (textItems.length > 0) {
              textItems.forEach(({ text: itemText, rect, fontPx }) => {
                const x = (rect.left - elementRect.left) * scaleX;
                const y = (rect.top - elementRect.top) * scaleY;
                const h = rect.height * scaleY;
                const baselineY = y + h * 0.82;
                const fontPt = Math.max(3, fontPx * scaleY * (72 / 25.4));

                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(fontPt);
                pdf.text(itemText, x, baselineY, { renderingMode: "invisible" });
              });
            }
          } catch (err) {
            console.warn("Text overlay generation failed: ", err);
          }

          // Add clickable PDF link annotations
          const linkElements = element.querySelectorAll<HTMLAnchorElement>("a[href]");
          linkElements.forEach((linkEl) => {
            const href = linkEl.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

            const rect = linkEl.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = (rect.left - elementRect.left) * scaleX;
            const y = (rect.top - elementRect.top) * scaleY;
            const w = rect.width * scaleX;
            const h = rect.height * scaleY;

            pdf.link(x, y, w, h, { url: href });
          });
        }

        pdf.save(
          compressed
            ? `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}_Compressed.pdf`
            : `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}.pdf`
        );
      } else if (liveBaseType === "executive-ats-2page") {
        // Precise 2-page A4 generation for Executive template
        const page1El = document.getElementById("page-1");
        const page2El = document.getElementById("page-2");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pages = [page1El, page2El].filter(Boolean) as HTMLElement[];

        for (let pIdx = 0; pIdx < pages.length; pIdx++) {
          if (pIdx > 0) pdf.addPage();
          const pEl = pages[pIdx];

          const pDataUrl = await renderSheetImage(pEl, compressed);

          pdf.addImage(pDataUrl, compressed ? "JPEG" : "PNG", 0, 0, 210, 297, undefined, compressed ? "FAST" : "NONE");

          const pRect = pEl.getBoundingClientRect();
          if (pRect.width > 0 && pRect.height > 0) {
            const pScaleX = 210 / pRect.width;
            const pScaleY = 297 / pRect.height;

            // Searchable text overlay
            try {
              const walker = document.createTreeWalker(pEl, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => {
                  if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                  const parent = node.parentElement;
                  if (!parent) return NodeFilter.FILTER_REJECT;
                  const tag = parent.tagName.toLowerCase();
                  if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return NodeFilter.FILTER_REJECT;
                  const style = window.getComputedStyle(parent);
                  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                    return NodeFilter.FILTER_REJECT;
                  }
                  return NodeFilter.FILTER_ACCEPT;
                },
              });

              const range = document.createRange();
              const textItems: { text: string; rect: DOMRect; fontPx: number }[] = [];

              while (walker.nextNode()) {
                const textNode = walker.currentNode as Text;
                const text = toPdfSafeText(textNode.nodeValue ?? "");
                if (!text) continue;
                const parent = textNode.parentElement;
                if (!parent) continue;

                const style = window.getComputedStyle(parent);
                const fontPx = parseFloat(style.fontSize) || 12;

                range.selectNodeContents(textNode);
                const rects = Array.from(range.getClientRects());

                if (rects.length <= 1) {
                  if (rects.length === 1 && rects[0].width > 0 && rects[0].height > 0) {
                    textItems.push({ text, rect: rects[0], fontPx });
                  }
                } else {
                  const tokens = text.split(/(\s+)/);
                  let charOffset = 0;
                  for (const token of tokens) {
                    if (token.trim().length > 0) {
                      try {
                        const wordRange = document.createRange();
                        wordRange.setStart(textNode, charOffset);
                        wordRange.setEnd(textNode, charOffset + token.length);
                        const wRect = wordRange.getBoundingClientRect();
                        if (wRect.width > 0 && wRect.height > 0) {
                          textItems.push({ text: token, rect: wRect, fontPx });
                        }
                      } catch {
                        // fallback
                      }
                    }
                    charOffset += token.length;
                  }
                }
              }

              if (textItems.length > 0) {
                textItems.forEach(({ text: itemText, rect: r, fontPx }) => {
                  const x = (r.left - pRect.left) * pScaleX;
                  const y = (r.top - pRect.top) * pScaleY;
                  const h = r.height * pScaleY;
                  const baselineY = y + h * 0.82;
                  const fontPt = Math.max(3, fontPx * pScaleY * (72 / 25.4));

                  pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(fontPt);
                  pdf.text(itemText, x, baselineY, { renderingMode: "invisible" });
                });
              }
            } catch (err) {
              console.warn("Text overlay generation failed: ", err);
            }

            // Clickable links
            const linkElements = pEl.querySelectorAll<HTMLAnchorElement>("a[href]");
            linkElements.forEach((linkEl) => {
              const href = linkEl.getAttribute("href");
              if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

              const rect = linkEl.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return;

              const x = (rect.left - pRect.left) * pScaleX;
              const y = (rect.top - pRect.top) * pScaleY;
              const w = rect.width * pScaleX;
              const h = rect.height * pScaleY;

              pdf.link(x, y, w, h, { url: href });
            });
          }
        }

        pdf.save(
          compressed
            ? `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}_Compressed.pdf`
            : `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}.pdf`
        );
      } else if (liveBaseType === "minimal-ats") {
        // Strict single-page A4 generation for Classic ATS 1-Page template (never overflows to page 2)
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pageW = 210;
        const pageH = 297;
        pdf.addImage(dataUrl, imgFormat, 0, 0, pageW, pageH, undefined, compressed ? "FAST" : "NONE");

        const elementRect = element.getBoundingClientRect();
        if (elementRect.width > 0 && elementRect.height > 0) {
          const scaleX = pageW / elementRect.width;
          const scaleY = pageH / elementRect.height;

          try {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
              acceptNode: (node) => {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return NodeFilter.FILTER_REJECT;
                const style = window.getComputedStyle(parent);
                if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              },
            });

            const range = document.createRange();
            const textItems: { text: string; rect: DOMRect; fontPx: number }[] = [];

            while (walker.nextNode()) {
              const textNode = walker.currentNode as Text;
              const text = toPdfSafeText(textNode.nodeValue ?? "");
              if (!text) continue;

              const parent = textNode.parentElement;
              if (!parent) continue;

              const style = window.getComputedStyle(parent);
              const fontPx = parseFloat(style.fontSize) || 11;

              range.selectNodeContents(textNode);
              const rects = Array.from(range.getClientRects());

              if (rects.length <= 1) {
                if (rects.length === 1 && rects[0].width > 0 && rects[0].height > 0) {
                  textItems.push({ text, rect: rects[0], fontPx });
                }
              } else {
                const tokens = text.split(/(\s+)/);
                let charOffset = 0;
                for (const token of tokens) {
                  if (token.trim().length > 0) {
                    try {
                      const wordRange = document.createRange();
                      wordRange.setStart(textNode, charOffset);
                      wordRange.setEnd(textNode, charOffset + token.length);
                      const wRect = wordRange.getBoundingClientRect();
                      if (wRect.width > 0 && wRect.height > 0) {
                        textItems.push({ text: token, rect: wRect, fontPx });
                      }
                    } catch {
                      // fallback
                    }
                  }
                  charOffset += token.length;
                }
              }
            }

            if (textItems.length > 0) {
              textItems.forEach(({ text: itemText, rect, fontPx }) => {
                const x = (rect.left - elementRect.left) * scaleX;
                const y = (rect.top - elementRect.top) * scaleY;
                const h = rect.height * scaleY;
                const baselineY = y + h * 0.82;
                if (baselineY <= pageH) {
                  const fontPt = Math.max(3, fontPx * scaleY * (72 / 25.4));
                  pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(fontPt);
                  pdf.text(itemText, x, baselineY, { renderingMode: "invisible" });
                }
              });
            }
          } catch (err) {
            console.warn("Text overlay generation failed: ", err);
          }

          const linkElements = element.querySelectorAll<HTMLAnchorElement>("a[href]");
          linkElements.forEach((linkEl) => {
            const href = linkEl.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

            const rect = linkEl.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = (rect.left - elementRect.left) * scaleX;
            const y = (rect.top - elementRect.top) * scaleY;
            const w = rect.width * scaleX;
            const h = rect.height * scaleY;

            if (y < pageH) {
              pdf.link(x, y, w, h, { url: href });
            }
          });
        }

        pdf.save(
          compressed
            ? `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}_1Page_Compressed.pdf`
            : `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}_1Page.pdf`
        );
      } else {
        // Standard multi-page A4 format for custom HTML templates
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(dataUrl, imgFormat, 0, position, pdfWidth, imgHeight, undefined, compressed ? "FAST" : "NONE");
        heightLeft -= pdfHeight;

        while (heightLeft > 15) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, imgFormat, 0, position, pdfWidth, imgHeight, undefined, compressed ? "FAST" : "NONE");
          heightLeft -= pdfHeight;
        }

        const elementRect = element.getBoundingClientRect();
        if (elementRect.width > 0 && elementRect.height > 0) {
          const scaleX = pdfWidth / elementRect.width;
          const scaleY = imgHeight / elementRect.height;

          // Add searchable & selectable invisible text layer
          try {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
              acceptNode: (node) => {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return NodeFilter.FILTER_REJECT;
                const style = window.getComputedStyle(parent);
                if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              },
            });

            const range = document.createRange();
            const textItems: { text: string; rect: DOMRect; fontPx: number }[] = [];

            while (walker.nextNode()) {
              const textNode = walker.currentNode as Text;
              const text = toPdfSafeText(textNode.nodeValue ?? "");
              if (!text) continue;

              const parent = textNode.parentElement;
              if (!parent) continue;

              const style = window.getComputedStyle(parent);
              const fontPx = parseFloat(style.fontSize) || 12;

              range.selectNodeContents(textNode);
              const rects = Array.from(range.getClientRects());

              if (rects.length <= 1) {
                if (rects.length === 1 && rects[0].width > 0 && rects[0].height > 0) {
                  textItems.push({ text, rect: rects[0], fontPx });
                }
              } else {
                const tokens = text.split(/(\s+)/);
                let charOffset = 0;
                for (const token of tokens) {
                  if (token.trim().length > 0) {
                    try {
                      const wordRange = document.createRange();
                      wordRange.setStart(textNode, charOffset);
                      wordRange.setEnd(textNode, charOffset + token.length);
                      const wRect = wordRange.getBoundingClientRect();
                      if (wRect.width > 0 && wRect.height > 0) {
                        textItems.push({ text: token, rect: wRect, fontPx });
                      }
                    } catch {
                      // fallback
                    }
                  }
                  charOffset += token.length;
                }
              }
            }

            if (textItems.length > 0) {
              const totalPages = (pdf.internal as any).getNumberOfPages();
              textItems.forEach(({ text: itemText, rect, fontPx }) => {
                const x = (rect.left - elementRect.left) * scaleX;
                const y = (rect.top - elementRect.top) * scaleY;
                const h = rect.height * scaleY;
                const baselineY = y + h * 0.82;
                const fontPt = Math.max(3, fontPx * scaleY * (72 / 25.4));

                const pageIndex = Math.floor(baselineY / pdfHeight);
                const yOnPage = baselineY % pdfHeight;
                if (pageIndex + 1 <= totalPages) {
                  pdf.setPage(pageIndex + 1);
                  pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(fontPt);
                  pdf.text(itemText, x, yOnPage, { renderingMode: "invisible" });
                }
              });
            }
          } catch (err) {
            console.warn("Text overlay generation failed: ", err);
          }

          // Add clickable PDF link annotations for multi-page
          const linkElements = element.querySelectorAll<HTMLAnchorElement>("a[href]");
          linkElements.forEach((linkEl) => {
            const href = linkEl.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

            const rect = linkEl.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = (rect.left - elementRect.left) * scaleX;
            const y = (rect.top - elementRect.top) * scaleY;
            const w = rect.width * scaleX;
            const h = rect.height * scaleY;

            const pageIndex = Math.floor(y / pdfHeight);
            const yOnPage = y % pdfHeight;
            const totalPages = (pdf.internal as any).getNumberOfPages();
            if (pageIndex + 1 <= totalPages) {
              pdf.setPage(pageIndex + 1);
              pdf.link(x, yOnPage, w, h, { url: href });
            }
          });
        }

        pdf.save(
          compressed
            ? `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}_Compressed.pdf`
            : `Shayan_Esfahanizadeh_Resume${draftSlug}${tplSlug}.pdf`
        );
      }
    } catch {
      // Fallback cleanly to downloading the pre-rendered vector PDF file
      const link = document.createElement("a");
      link.href = "/Shayan_Resume.pdf";
      link.download = "Shayan_Esfahanizadeh_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyAll = async () => {
    if (resumeRef.current) {
      try {
        await navigator.clipboard.writeText(resumeRef.current.innerText);
        setCopiedQuick(true);
        setTimeout(() => setCopiedQuick(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, "_blank");
  };

  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    setZoom(1);
  };

  // Dynamic style overrides for the Modern Figma template when customized
  const figmaCustomStyles = useMemo(() => {
    if (liveBaseType !== "modern-figma") return "";
    const rules: string[] = [];
    const accent = liveCustomization.accentColor;
    if (accent && accent.toLowerCase() !== "#0585c0") {
      rules.push(`
        .modern-figma-custom .text-\\[\\#0284c7\\],
        .modern-figma-custom .text-\\[\\#0585c0\\],
        .modern-figma-custom .text-sky-600,
        .modern-figma-custom .text-sky-700 { color: ${accent} !important; }
        .modern-figma-custom .bg-clip-text {
          background-image: linear-gradient(90deg, ${accent} 0%, ${accent}cc 100%) !important;
        }
        .modern-figma-custom .border-sky-200,
        .modern-figma-custom .border-\\[\\#0585c0\\] { border-color: ${accent}55 !important; }
      `);
    }
    if (liveCustomization.fontPairing !== "modern-sans") {
      const pairing = getFontPairing(liveCustomization.fontPairing);
      rules.push(`
        .modern-figma-custom,
        .modern-figma-custom p,
        .modern-figma-custom span,
        .modern-figma-custom li,
        .modern-figma-custom a {
          font-family: ${pairing.body} !important;
        }
        .modern-figma-custom h1,
        .modern-figma-custom h2,
        .modern-figma-custom h3 {
          font-family: ${pairing.heading} !important;
        }
      `);
    }
    const extraCss = sanitizeCustomCss(liveCustomization.customCss || "");
    if (extraCss) {
      rules.push(extraCss);
    }
    return rules.join("\n");
  }, [liveBaseType, liveCustomization]);

  const isPrintMode = typeof window !== "undefined" && window.matchMedia && window.matchMedia("print").matches;

  const renderActiveTemplate = (forPrint = false) => {
    if (liveBaseType === "executive-ats-2page") {
      return <ExecutiveTwoPageTemplate />;
    }
    if (liveBaseType === "minimal-ats") {
      return (
        <MinimalSinglePageTemplate
          fitMode={classicFitMode}
          onMetricsChange={forPrint ? undefined : setClassicMetrics}
        />
      );
    }
    if (liveBaseType === "custom-html") {
      return <CustomHtmlTemplate />;
    }

    // Modern Figma template
    const scaleFactor = liveCustomization.fontSizeScale || 1;
    if (forPrint) {
      return (
        <div
          id="resume-content"
          className="figma-scaled modern-figma-custom bg-white"
          style={{
            width: DOC_W,
            transform: `scale(${A4_W / DOC_W})`,
            transformOrigin: "top left",
          }}
        >
          {figmaCustomStyles && <style>{figmaCustomStyles}</style>}
          {liveCustomization.topAccentBar && (
            <div className="h-1.5 w-full" style={{ backgroundColor: liveCustomization.accentColor }} />
          )}
          <div ref={resumeInnerRef} className="w-[594px]">
            <Component4 />
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative bg-white modern-figma-custom"
        style={{
          width: layoutMode === "fit-width" ? A4_W : DOC_W,
          height: layoutMode === "fit-width" ? docHeight * (A4_W / DOC_W) : docHeight,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08)",
          borderRadius: 2,
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        {figmaCustomStyles && <style>{figmaCustomStyles}</style>}
        {liveCustomization.topAccentBar && (
          <div
            className="h-1.5 w-full relative z-10"
            style={{ backgroundColor: liveCustomization.accentColor }}
          />
        )}
        <div
          style={{
            transform:
              layoutMode === "fit-width"
                ? `scale(${(A4_W / DOC_W) * (scaleFactor === 1 ? 1 : scaleFactor)})`
                : scaleFactor !== 1
                  ? `scale(${scaleFactor})`
                  : "none",
            transformOrigin: "top left",
            width: DOC_W,
            height: docHeight,
          }}
        >
          <div ref={resumeInnerRef} className="w-[594px]">
            <Component4 />
          </div>
        </div>
      </div>
    );
  };

  if (isPrintMode) {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center">
        <header className="w-full bg-slate-900 text-white px-6 py-4 flex justify-between items-center no-print shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Printer className="size-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">
                آماده‌سازی و ذخیره PDF برداری ({activeTemplate.nameFa})
              </h1>
              <p className="text-[11px] text-slate-400">
                پنجره چاپ آماده است. برای بهترین نتیجه:{" "}
                <span className="text-sky-300 font-medium">Margins: None</span> و{" "}
                <span className="text-sky-300 font-medium">Background graphics: فعال</span> باشد.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Printer className="size-3.5" />
              <span>پرینت مجدد (Ctrl + P)</span>
            </button>
            <button
              onClick={() => window.close()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center p-0 sm:p-6 w-full overflow-x-auto">
          <div className="printable-area relative shrink-0">
            {renderActiveTemplate(true)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* Prioritized Minimal Navigation & Toolbar */}
      <Toolbar
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2, Math.round((z + 0.15) * 100) / 100))}
        onZoomOut={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.15) * 100) / 100))}
        onResetZoom={() => setZoom(1)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        matchCount={matchCount}
        onOpenATSInspector={() => setIsATSInspectorOpen(true)}
        onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloading}
        onDownloadDocx={handleDownloadDocx}
        isDownloadingDocx={isDownloadingDocx}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        templates={allTemplates}
        activeTemplateId={activeTemplateId}
        hasUnsavedCustomizations={hasUnsavedCustomizations}
        onSelectTemplate={selectTemplate}
        onOpenTemplateManager={openTemplateManager}
        hasActiveDraft={!!activeDraft}
        onOpenTailorModal={() => setIsTailorModalOpen(true)}
        onOpenCareerTools={(tab = "audit") => setCareerToolsModal({ isOpen: true, tab })}
        clonesCount={clones.length}
        hasActiveClone={!!activeClone}
        onQuickClone={() => quickCloneCurrent({ switchToClone: true })}
        onOpenCloneArchive={() => {
          setFocusChangelogCloneId(null);
          setIsCloneArchiveOpen(true);
        }}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 overflow-x-auto">
        {/* Active Clone Context Bar (Screen Only) */}
        {activeClone && (
          <div
            className="w-full max-w-[794px] mb-3 bg-white border border-sky-200 rounded-xl px-3.5 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 no-print"
            dir="rtl"
          >
            <div className="flex items-center flex-wrap gap-2 text-xs min-w-0">
              <Archive className="size-3.5 text-sky-600 shrink-0" />
              <span className="font-bold text-slate-900 truncate max-w-[190px]">{activeClone.name}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${
                  CLONE_STATUS_META[activeClone.status].badgeClass
                }`}
              >
                {CLONE_STATUS_META[activeClone.status].labelFa}
              </span>
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                  getCloneGroupMeta(activeClone.group).badgeClass
                }`}
              >
                <FolderKanban className="size-2.5" />
                {getCloneGroupMeta(activeClone.group).shortFa}
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400">
                · دوبار کلیک روی هر متن برای ویرایش
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setInlineEditModal({ isOpen: true, fieldKey: "summary" })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
                title="باز کردن مودال ویرایش متن بخش‌های کلون (یا دوبار کلیک روی هر متن)"
              >
                <Edit3 className="size-3 text-sky-600" />
                <span>ویرایش متن</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusChangelogCloneId(activeClone.id);
                  setIsCloneArchiveOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
                title="مشاهده تاریخچه تغییرات و بازگشت به نسخه‌های قبلی این کلون"
              >
                <History className="size-3 text-sky-600" />
                <span>تاریخچه</span>
                <span className="font-mono tabular-nums text-[10px] text-slate-400">
                  ({(activeClone.changelog || []).length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsCloneChatOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isCloneChatOpen
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                }`}
                title="باز کردن چت هوشمند برای اعمال تغییرات و ذخیره روی این کلون"
              >
                <MessageSquareText className="size-3" />
                <span>چت ویرایش</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  saveCurrentToActiveClone();
                  setSavedCloneToast(true);
                  window.setTimeout(() => setSavedCloneToast(false), 1600);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  savedCloneToast
                    ? "bg-emerald-600 text-white"
                    : "bg-sky-600 hover:bg-sky-700 text-white"
                }`}
              >
                {savedCloneToast ? <Check className="size-3" /> : <Save className="size-3" />}
                <span>{savedCloneToast ? "ذخیره شد" : "ذخیره"}</span>
              </button>
              <button
                type="button"
                onClick={exitActiveClone}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
                title="خروج از حالت ویرایش این کلون"
              >
                <span>خروج</span>
              </button>
            </div>
          </div>
        )}
        {/* Live Customization Notice Bar (Screen Only) */}
        {hasUnsavedCustomizations && (
          <div
            className="w-full max-w-[794px] mb-3 bg-amber-50/90 border border-amber-200 rounded-xl px-3.5 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 no-print"
            dir="rtl"
          >
            <div className="flex items-center gap-2 text-xs text-amber-950">
              <SlidersHorizontal className="size-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">شخصی‌سازی زنده روی رزومه فعال است</span>
              <span className="text-amber-700/90 text-[11px] hidden sm:inline">
                ({activeTemplate.nameFa} · {BASE_TYPE_LABELS[liveBaseType].nameFa})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openTemplateManager("save")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Save className="size-3 text-sky-400" />
                <span>تبدیل به قالب / ورژن جدید</span>
              </button>
              <button
                type="button"
                onClick={resetLiveCustomizations}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/60 text-amber-900 text-[11px] font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
                title="بازگردانی ظاهر قالب به حالت ذخیره‌شده"
              >
                <RotateCcw className="size-3" />
                <span>بازنشانی</span>
              </button>
            </div>
          </div>
        )}

        {/* Master vs Temporary Tailored Mode Switcher Bar (Screen Only) */}
        {tailoredDrafts.length > 0 && (
          <div
            className="w-full max-w-[794px] mb-4 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 no-print"
            dir="rtl"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => selectTailoredDraft(null)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                  !activeDraft
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <RotateCcw className="size-3" />
                <span>رزومه اصلی (Master)</span>
              </button>

              {tailoredDrafts.map((draft) => {
                const isSelected = activeDraft?.id === draft.id;
                return (
                  <div
                    key={draft.id}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs"
                        : "bg-indigo-50/70 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectTailoredDraft(draft.id)}
                      className="inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="size-3 shrink-0" />
                      <span className="max-w-[170px] truncate">
                        {draft.targetCompany} — {draft.targetRole}
                      </span>
                      {typeof draft.atsScoreAfter === "number" && (
                        <span
                          className={`text-[10px] font-mono tabular-nums px-1 py-0.2 rounded ${
                            isSelected ? "bg-indigo-500 text-white" : "bg-indigo-200/70 text-indigo-900"
                          }`}
                        >
                          ATS {draft.atsScoreAfter}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTailoredDraft(draft.id)}
                      className={`p-0.5 rounded transition cursor-pointer ${
                        isSelected
                          ? "text-indigo-200 hover:text-white hover:bg-indigo-700"
                          : "text-indigo-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title="حذف نسخه بهینه‌شده"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              {activeDraft && (
                <button
                  type="button"
                  onClick={() => openTemplateManager("save")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
                  title="ذخیره این نسخه همراه با استایل فعلی به عنوان یک قالب دائم"
                >
                  <Save className="size-3 text-sky-600" />
                  <span>تبدیل به قالب</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTailorModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="size-3" />
                <span>{activeDraft ? "تحلیل ATS / ویرایش" : "تحلیل آگهی جدید"}</span>
              </button>
              {activeDraft && (
                <button
                  type="button"
                  onClick={() => setIsTailorModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
                  title="ایجاد نسخه بهینه‌شده جدید"
                >
                  <Plus className="size-3" />
                  <span>جدید</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Classic Single-Page ATS Constraint & Fit Control Bar (Screen Only) */}
        {liveBaseType === "minimal-ats" && (
          <div
            className="w-full max-w-[794px] mb-3 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 no-print"
            dir="rtl"
          >
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600">
              <ShieldCheck
                className={`size-4 shrink-0 ${
                  classicMetrics?.isOverflowing ? "text-amber-600" : "text-emerald-600"
                }`}
              />
              <span className="font-bold text-slate-900">محدودیت تک‌صفحه A4 (کلاسیک ATS)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              {classicMetrics ? (
                <>
                  <span
                    className={`font-mono tabular-nums text-[11px] font-semibold ${
                      classicMetrics.isOverflowing ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    {classicMetrics.isOverflowing
                      ? `سرریز محتوا (${classicMetrics.fillPercent}٪)`
                      : `پرشدگی ${Math.min(100, classicMetrics.fillPercent)}٪ · دقیقاً ۱ صفحه`}
                  </span>
                  {classicMetrics.appliedScale < 100 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono tabular-nums text-[11px] text-slate-500">
                        تطبیق خودکار {classicMetrics.appliedScale}٪
                      </span>
                    </>
                  )}
                  <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-500 hidden sm:inline">
                    {classicMetrics.wordCount} کلمه
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-slate-500">متصل به محتوای اصلی رزومه</span>
              )}
            </div>

            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => setClassicFitMode("full-autofit")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  classicFitMode === "full-autofit"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="نمایش کامل تمام سوابق و پروژه‌های محتوای اصلی با تنظیم خودکار مقیاس در ۱ صفحه A4"
              >
                کل محتوای اصلی (تطبیق خودکار)
              </button>
              <button
                type="button"
                onClick={() => setClassicFitMode("strict-concise")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  classicFitMode === "strict-concise"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="خلاصه‌سازی هوشمند بولت‌ها برای خوانایی حداکثری در ۱ صفحه"
              >
                خلاصه تک‌صفحه
              </button>
            </div>
          </div>
        )}

        {/* Template Render Container */}
        <div
          ref={printableRef}
          className="printable-area relative transition-all duration-200 shrink-0"
          style={{
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: "top center",
          }}
        >
          {/* Scaled resume wrapper — Double-click any text to edit in modal */}
          <div
            ref={resumeRef}
            id="resume-content"
            onDoubleClick={handleResumeDoubleClick}
            className="clone-dblclick-editable"
            title="برای ویرایش سریع هر بخش، روی متن آن دوبار کلیک کنید"
          >
            {renderActiveTemplate(false)}
          </div>
        </div>

        {/* Paper Footer Info (Screen Only) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 no-print select-none" dir="rtl">
          <span className="font-medium text-slate-700">
            {activeTemplate.nameFa} · {activeTemplate.version} · {BASE_TYPE_LABELS[liveBaseType].pages} صفحه
          </span>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={openCustomizePanel}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <SlidersHorizontal className="size-3" />
            <span>شخصی‌سازی ظاهر</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => openTemplateManager("gallery")}
            className="text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Layers className="size-3" />
            <span>استودیوی قالب‌ها</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-slate-600 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
            title="کپی متن جهت تست ATS"
          >
            {copiedQuick ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
            <span>{copiedQuick ? "متن کپی شد" : "کپی متن ATS"}</span>
          </button>
        </div>
      </main>

      {/* Floating Bottom Quick Actions (no-print) */}
      <aside className="fixed bottom-6 left-6 z-30 no-print flex items-end gap-2">
        <div
          className={`flex items-center gap-2 transition-all duration-300 origin-bottom-left ${
            isQuickActionsOpen
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-x-3 scale-95 pointer-events-none absolute left-0 bottom-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setCareerToolsModal({ isOpen: true, tab: "audit" })}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 border border-slate-200 font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="ممیزی کیفیت بولت‌ها، تولید کاور لتر و بسته آمادگی مصاحبه AI"
          >
            <Award className="size-4 text-sky-600" />
            <span className="hidden sm:inline">ابزارهای اپلای</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaveVersionOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border ${
              quickSaveToast
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-emerald-50 text-slate-800 border-slate-200"
            }`}
            title="ذخیره نسخه در تاریخچه همراه با پیام کامیت"
          >
            {quickSaveToast ? (
              <Check className="size-4 text-white" />
            ) : (
              <Save className="size-4 text-emerald-600" />
            )}
            <span>{quickSaveToast ? "ذخیره شد" : "ذخیره"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCloneChatOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border ${
              isCloneChatOpen
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white hover:bg-indigo-50 text-slate-800 border-slate-200"
            }`}
            title="چت هوشمند برای اعمال تغییرات روی کلون و ذخیره خودکار"
          >
            <MessageSquareText className={`size-4 ${isCloneChatOpen ? "text-white" : "text-indigo-600"}`} />
            <span>چت ویرایش رزومه</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer"
            title="پرینت مستقیم و ذخیره PDF برداری استاندارد (Ctrl + P)"
            id="floating-print-button"
          >
            <Printer className="size-4 text-sky-400" />
            <span>پرینت / ذخیره PDF</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-slate-200"
            title="باز کردن در تب مستقل تمام‌صفحه"
          >
            <ExternalLink className="size-4 text-sky-600" />
          </button>
        </div>

        {/* Toggle: collapses / expands the whole quick-action stack */}
        <button
          type="button"
          onClick={() => setIsQuickActionsOpen((prev) => !prev)}
          className="flex items-center justify-center size-11 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-lg hover:shadow-xl border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
          title={isQuickActionsOpen ? "بستن ابزارهای شناور" : "باز کردن ابزارهای شناور"}
          aria-expanded={isQuickActionsOpen}
          aria-label={isQuickActionsOpen ? "بستن ابزارهای شناور" : "باز کردن ابزارهای شناور"}
        >
          <Sparkles className={`size-4 text-sky-600 transition-transform duration-300 ${isQuickActionsOpen ? "rotate-90" : "rotate-0"}`} />
        </button>

        {!isQuickActionsOpen && (quickSaveToast || savedCloneToast) && (
          <span className="mb-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-md animate-pulse">
            <Check className="size-3" /> ذخیره شد
          </span>
        )}
      </aside>

      {/* Save-version-with-commit-message modal */}
      <SaveVersionModal
        isOpen={isSaveVersionOpen}
        defaultName={
          activeDraft
            ? `${activeDraft.targetCompany} — ${activeDraft.targetRole}`
            : `${activeTemplate.nameFa} · کلون #${clones.length + 1}`
        }
        existingCount={clones.length}
        onClose={() => setIsSaveVersionOpen(false)}
        onSave={handleQuickSave}
        onQuickSave={() => handleQuickSave()}
      />

      {/* Template Manager, Import & Save-as-Template Studio Modal */}
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        initialTab={templateManagerTab}
        onClose={() => setIsTemplateManagerOpen(false)}
        onPrint={handlePrint}
        onOpenCustomizePanel={openCustomizePanel}
      />

      {/* Right-side Resume Editor & Live Template Customizer Panel */}
      <ResumeEditorPanel
        onPrint={handlePrint}
        initialTab={editorPanelInitialTab}
        onSaveAsTemplate={() => openTemplateManager("save")}
        onOpenTemplateImport={() => openTemplateManager("import")}
      />

      {/* ATS Text Inspection Modal */}
      <ATSInspectorModal
        isOpen={isATSInspectorOpen}
        onClose={() => setIsATSInspectorOpen(false)}
        extractedText={extractedText}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        matchCount={matchCount}
      />

      {/* Print Settings Guide Modal */}
      <PrintGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
        onPrint={handlePrint}
      />

      {/* AI ATS Scorer, Personalization Recommender & Job Optimizer Modal */}
      <TailorJobModal
        isOpen={isTailorModalOpen}
        onClose={() => setIsTailorModalOpen(false)}
        currentResumeText={extractedText}
        onSaveAsTemplate={() => openTemplateManager("save")}
      />

      {/* Clone Archive Drawer with Grouping, Badges, Kanban Tracker, Diff & Changelog */}
      <CloneArchiveModal
        isOpen={isCloneArchiveOpen}
        focusChangelogCloneId={focusChangelogCloneId}
        onClose={() => {
          setIsCloneArchiveOpen(false);
          setFocusChangelogCloneId(null);
        }}
      />

      {/* Double-Click Inline Text Editor Modal */}
      <InlineTextEditModal
        isOpen={inlineEditModal.isOpen}
        initialFieldKey={inlineEditModal.fieldKey}
        onClose={() => setInlineEditModal((prev) => ({ ...prev, isOpen: false }))}
        onOpenChatEditor={() => setIsCloneChatOpen(true)}
      />

      {/* Conversational AI Clone Editor Chat Drawer */}
      <CloneChatDrawer
        isOpen={isCloneChatOpen}
        onClose={() => setIsCloneChatOpen(false)}
      />

      {/* Career Tools Studio Modal (Bullet Quality Audit, AI Cover Letter/Outreach & Interview Prep) */}
      <CareerToolsModal
        isOpen={careerToolsModal.isOpen}
        initialTab={careerToolsModal.tab}
        currentResumeText={extractedText}
        onClose={() => setCareerToolsModal((prev) => ({ ...prev, isOpen: false }))}
        onJumpToEditField={(fieldKey) => setInlineEditModal({ isOpen: true, fieldKey })}
        onOpenChatEditor={() => setIsCloneChatOpen(true)}
      />
    </div>
  );
}
