import {
  ACCENT_PRESETS,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_SECTION_VISIBILITY,
  FONT_PAIRING_OPTIONS,
  FontPairingId,
  ResumeTemplate,
  TemplateCustomization,
} from "@/types/templates";
import { atsOnlyBulletsEqual, normalizeAtsOnlyBulletsMap } from "./experienceBullets";

export function cloneCustomization(c?: Partial<TemplateCustomization>): TemplateCustomization {
  return {
    accentColor: c?.accentColor || DEFAULT_CUSTOMIZATION.accentColor,
    fontPairing: c?.fontPairing || DEFAULT_CUSTOMIZATION.fontPairing,
    density: c?.density || DEFAULT_CUSTOMIZATION.density,
    fontSizeScale: typeof c?.fontSizeScale === "number" ? c.fontSizeScale : DEFAULT_CUSTOMIZATION.fontSizeScale,
    headerAlign: c?.headerAlign || DEFAULT_CUSTOMIZATION.headerAlign,
    topAccentBar: typeof c?.topAccentBar === "boolean" ? c.topAccentBar : DEFAULT_CUSTOMIZATION.topAccentBar,
    showLogos: typeof c?.showLogos === "boolean" ? c.showLogos : DEFAULT_CUSTOMIZATION.showLogos,
    showTags: typeof c?.showTags === "boolean" ? c.showTags : DEFAULT_CUSTOMIZATION.showTags,
    sections: {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(c?.sections || {}),
    },
    atsOnlyExperienceBullets: normalizeAtsOnlyBulletsMap(c?.atsOnlyExperienceBullets),
    customCss: typeof c?.customCss === "string" ? c.customCss : "",
  };
}

export function customizationsEqual(a: TemplateCustomization, b: TemplateCustomization): boolean {
  return (
    a.accentColor.toLowerCase() === b.accentColor.toLowerCase() &&
    a.fontPairing === b.fontPairing &&
    a.density === b.density &&
    Math.abs(a.fontSizeScale - b.fontSizeScale) < 0.001 &&
    a.headerAlign === b.headerAlign &&
    a.topAccentBar === b.topAccentBar &&
    a.showLogos === b.showLogos &&
    a.showTags === b.showTags &&
    (a.customCss || "").trim() === (b.customCss || "").trim() &&
    a.sections.summary === b.sections.summary &&
    a.sections.skills === b.sections.skills &&
    a.sections.experience === b.sections.experience &&
    a.sections.education === b.sections.education &&
    a.sections.projects === b.sections.projects &&
    a.sections.certifications === b.sections.certifications &&
    a.sections.honors === b.sections.honors &&
    atsOnlyBulletsEqual(a.atsOnlyExperienceBullets, b.atsOnlyExperienceBullets)
  );
}

export function getFontPairing(id: FontPairingId) {
  return FONT_PAIRING_OPTIONS.find((f) => f.id === id) || FONT_PAIRING_OPTIONS[0];
}

export function getGradientForAccent(hex: string): string {
  const matched = ACCENT_PRESETS.find((p) => p.hex.toLowerCase() === hex.toLowerCase());
  if (matched) return matched.gradient;
  return "from-slate-800 to-slate-950";
}

export function computeNextVersion(baseVersion: string, existingTemplates: ResumeTemplate[], parentId?: string): string {
  const match = baseVersion.match(/v?(\d+)\.(\d+)/i);
  const major = match ? parseInt(match[1], 10) : 1;
  let minor = match ? parseInt(match[2], 10) + 1 : 1;

  const siblingVersions = new Set(
    existingTemplates
      .filter((t) => (parentId ? t.parentTemplateId === parentId || t.id === parentId : true))
      .map((t) => t.version.toLowerCase())
  );

  let candidate = `v${major}.${minor}`;
  while (siblingVersions.has(candidate.toLowerCase())) {
    minor += 1;
    candidate = `v${major}.${minor}`;
  }
  return candidate;
}

/**
 * Generates a light tint background color from a hex color (approx 10% alpha)
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return `rgba(2, 132, 199, ${alpha})`;
  }
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Strip dangerous script tags, event handlers, and javascript: URLs from imported HTML
 */
export function sanitizeImportedHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  let cleaned = rawHtml
    // Remove script, iframe, object, embed, form tags with contents
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    // Remove inline event handlers like onclick="..."
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Neutralize javascript: URLs
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');

  // If full HTML document was imported, keep its <style> blocks + <body> inner HTML
  const hasBody = /<body[^>]*>([\s\S]*?)<\/body>/i.test(cleaned);
  if (hasBody) {
    const styles = Array.from(cleaned.matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi))
      .map((m) => m[0])
      .join("\n");
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyInner = bodyMatch ? bodyMatch[1] : cleaned;
    cleaned = `${styles}\n${bodyInner}`.trim();
  }

  return cleaned;
}

/**
 * Strip CSS expressions or @import of external unsafe protocols from custom CSS
 */
export function sanitizeCustomCss(rawCss?: string): string {
  if (!rawCss) return "";
  return rawCss
    .replace(/@import\b[^;]+;/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript:/gi, "");
}
