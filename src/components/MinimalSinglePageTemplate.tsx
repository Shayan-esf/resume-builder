import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { MASTER_RESUME_CONTENT } from "@/types/tailoring";
import { DEFAULT_RESUME_DATA } from "@/types/resume";
import { KNTULogo } from "./CompanyLogos";
import { RichText } from "./RichText";
import { getFontPairing, sanitizeCustomCss } from "@/utils/templateTheme";
import { isBoldHighlightSkill, partitionTailoredSkills } from "@/utils/skillDisplay";
import { partitionExperienceBullets, stripMarkdownBold } from "@/utils/experienceBullets";

export type ClassicSinglePageFitMode = "full-autofit" | "strict-concise";

export interface ClassicSinglePageMetrics {
  fillPercent: number;
  appliedScale: number;
  isOverflowing: boolean;
  wordCount: number;
  visibleSections: number;
}

interface MinimalSinglePageTemplateProps {
  fitMode?: ClassicSinglePageFitMode;
  onMetricsChange?: (metrics: ClassicSinglePageMetrics) => void;
}

interface ExperienceMeta {
  company: string;
  period: string;
  location: string;
  url?: string;
}

const CANONICAL_EXPERIENCE_META: Record<string, ExperienceMeta> = {
  tums: {
    company: "TUMS Health Innoversity",
    period: "Jul 2026 – Present",
    location: "Iran | Advisory",
  },
  mci: {
    company: "Hamrahe Aval (MCI) — Delband",
    period: "Apr 2025 – Present",
    location: "Tehran, Iran | Full-time",
    url: "https://delbandcare.com",
  },
  uxcel: {
    company: "Uxcel (500K+ Users Worldwide)",
    period: "Sep 2025 – Present",
    location: "West Palm Beach, FL | Remote",
    url: "https://uxcel.com",
  },
  ofoq: {
    company: "Ofogh Dadeha Iranian",
    period: "Jun 2022 – May 2025",
    location: "Tehran, Iran | Hybrid",
    url: "https://cafebazaar.ir/app/com.ofoghdadeha.venus",
  },
};

const CANONICAL_PROJECT_URLS: Record<string, { label: string; url: string }> = {
  rokhnama: { label: "rokhnama.vercel.app", url: "https://rokhnama.vercel.app" },
  biopad: { label: "biopad.vercel.app", url: "https://biopad.vercel.app" },
  indora: { label: "indoora.net", url: "https://indoora.net" },
  "stakeholder-portal": { label: "investor.delbandcare.com", url: "https://investor.delbandcare.com" },
};

const CONCISE_BULLET_LIMITS: Record<string, number> = {
  mci: 4,
  tums: 2,
  uxcel: 2,
  ofoq: 2,
};

const MIN_READABLE_SCALE = 0.72;
const MAX_ADJUST_PASSES = 8;

export default function MinimalSinglePageTemplate({
  fitMode = "full-autofit",
  onMetricsChange,
}: MinimalSinglePageTemplateProps) {
  const { data, effectiveTailoredContent, liveCustomization } = useResume();

  // Always pull from the live master content (or active clone / AI tailored overlay)
  const content = effectiveTailoredContent || MASTER_RESUME_CONTENT;

  const accent = liveCustomization.accentColor || "#0f172a";
  const fontPairing = getFontPairing(liveCustomization.fontPairing);
  const customCss = sanitizeCustomCss(liveCustomization.customCss);
  const { sections, showLogos, showTags, topAccentBar, fontSizeScale, headerAlign, density } = liveCustomization;

  const sheetPadding =
    density === "compact"
      ? "8mm 11mm"
      : density === "relaxed"
        ? "12mm 14mm"
        : "9.5mm 12.5mm";

  const sheetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const userCeilingScale = Math.max(MIN_READABLE_SCALE, Math.min(1.12, fontSizeScale || 1));
  const [appliedScale, setAppliedScale] = useState<number>(userCeilingScale);
  const passCountRef = useRef<number>(0);
  const lastReportedRef = useRef<string>("");

  // Build normalized experiences directly from master content
  const experiences = useMemo(() => {
    const isConcise = fitMode === "strict-concise";
    return content.experiences.map((exp) => {
      const canonical = CANONICAL_EXPERIENCE_META[exp.id];
      const fallbackDataExp = data.experiences.find((item) => item.id === exp.id);
      const company = canonical?.company || fallbackDataExp?.company || exp.id.toUpperCase();
      const period = canonical?.period || fallbackDataExp?.period || "";
      const location = canonical?.location || fallbackDataExp?.location || "";
      const url = canonical?.url;
      const { visibleBullets: humanBullets, atsOnlyBullets } = partitionExperienceBullets(
        exp.bullets,
        exp.id,
        liveCustomization.atsOnlyExperienceBullets
      );
      const limit = isConcise ? CONCISE_BULLET_LIMITS[exp.id] ?? 2 : humanBullets.length;
      const shown = humanBullets.slice(0, limit).map((b) => b.text);
      const hiddenOverflow = humanBullets.slice(limit).map((b) => b.text);
      const hiddenAtsTexts = [
        ...atsOnlyBullets.map((b) => b.text),
        ...hiddenOverflow,
      ];
      return {
        ...exp,
        company,
        period,
        location,
        url,
        visibleBullets: shown,
        atsOnlyBullets: hiddenAtsTexts,
        showIntro: !isConcise && Boolean(exp.intro?.trim()),
      };
    });
  }, [content.experiences, data.experiences, fitMode, liveCustomization.atsOnlyExperienceBullets]);

  // Build normalized projects directly from master content
  const projects = useMemo(() => {
    const limit = fitMode === "strict-concise" ? 3 : 4;
    return content.projects.slice(0, limit).map((proj) => {
      const canonicalLink = CANONICAL_PROJECT_URLS[proj.id];
      const dataProj = data.projects.find((p) => p.id === proj.id);
      const rawUrl = canonicalLink?.url || (dataProj?.url ? (dataProj.url.startsWith("http") ? dataProj.url : `https://${dataProj.url}`) : undefined);
      const label = canonicalLink?.label || dataProj?.url;
      return {
        ...proj,
        url: rawUrl,
        urlLabel: label,
      };
    });
  }, [content.projects, data.projects, fitMode]);

  // Build normalized education from master resume data
  const educationList = useMemo(() => {
    if (Array.isArray(data.education) && data.education.length > 0) {
      return data.education;
    }
    return DEFAULT_RESUME_DATA.education;
  }, [data.education]);

  // Count visible sections & approximate word count
  const visibleSections = useMemo(() => {
    return Object.values(sections).filter(Boolean).length;
  }, [sections]);

  // Reset scale ceiling whenever content, customization, or fit mode changes
  const resetTriggerKey = useMemo(() => {
    return JSON.stringify({
      fitMode,
      density,
      userCeilingScale,
      headerAlign,
      showLogos,
      showTags,
      sections,
      fontPairing: liveCustomization.fontPairing,
      headline: content.headlineRole + content.headlineSubtitle,
      summaryLen: content.summary.length,
      skillsLen: content.skillGroups.map((g) => g.items.length).join(","),
      expLen: experiences.map((e) => e.visibleBullets.join("").length + (e.showIntro ? e.intro.length : 0)).join(","),
      projLen: projects.map((p) => p.title.length + p.description.length).join(","),
      eduLen: educationList.length,
    });
  }, [
    fitMode,
    density,
    userCeilingScale,
    headerAlign,
    showLogos,
    showTags,
    sections,
    liveCustomization.fontPairing,
    content.headlineRole,
    content.headlineSubtitle,
    content.summary,
    content.skillGroups,
    experiences,
    projects,
    educationList.length,
  ]);

  useLayoutEffect(() => {
    passCountRef.current = 0;
    setAppliedScale(userCeilingScale);
  }, [resetTriggerKey, userCeilingScale]);

  // Strict single-page A4 height enforcement loop
  useLayoutEffect(() => {
    const sheetEl = sheetRef.current;
    const innerEl = innerRef.current;
    if (!sheetEl || !innerEl) return;

    const measureAndFit = () => {
      const style = window.getComputedStyle(sheetEl);
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      const availableHeight = Math.max(100, sheetEl.clientHeight - padTop - padBottom);
      const naturalHeight = innerEl.scrollHeight;

      if (naturalHeight > availableHeight + 1 && appliedScale > MIN_READABLE_SCALE && passCountRef.current < MAX_ADJUST_PASSES) {
        const ratio = availableHeight / naturalHeight;
        // Proportional step with gentle damping so we converge in 1-3 passes without overshooting
        const candidate = Math.min(appliedScale - 0.012, appliedScale * Math.pow(ratio, 0.72));
        const nextScale = Math.max(MIN_READABLE_SCALE, Math.round(candidate * 1000) / 1000);
        if (nextScale < appliedScale - 0.002) {
          passCountRef.current += 1;
          setAppliedScale(nextScale);
          return;
        }
      }

      if (onMetricsChange) {
        const text = innerEl.innerText || "";
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const fillPercent = Math.round((naturalHeight / availableHeight) * 100);
        const metrics: ClassicSinglePageMetrics = {
          fillPercent,
          appliedScale: Math.round(appliedScale * 100),
          isOverflowing: naturalHeight > availableHeight + 3,
          wordCount,
          visibleSections,
        };
        const signature = `${metrics.fillPercent}|${metrics.appliedScale}|${metrics.isOverflowing}|${metrics.wordCount}|${metrics.visibleSections}`;
        if (signature !== lastReportedRef.current) {
          lastReportedRef.current = signature;
          onMetricsChange(metrics);
        }
      }
    };

    measureAndFit();

    const ro = new ResizeObserver(() => {
      measureAndFit();
    });
    ro.observe(innerEl);
    return () => ro.disconnect();
  }, [appliedScale, resetTriggerKey, onMetricsChange, visibleSections]);

  const phone = data.contact?.phone || DEFAULT_RESUME_DATA.contact.phone;
  const email = data.contact?.email || DEFAULT_RESUME_DATA.contact.email;
  const location = data.contact?.location || DEFAULT_RESUME_DATA.contact.location;
  const websiteUrl = data.contact?.website?.url || DEFAULT_RESUME_DATA.contact.website.url;
  const websiteHandle = data.contact?.website?.handle || DEFAULT_RESUME_DATA.contact.website.handle;
  const linkedinUrl = data.contact?.linkedin?.url || DEFAULT_RESUME_DATA.contact.linkedin.url;
  const linkedinHandle = (data.contact?.linkedin?.handle || "linkedin.com/in/shayan-esf").replace(/^@/, "linkedin.com/in/");

  return (
    <article
      ref={sheetRef}
      className="minimal-template classic-ats-sheet bg-white text-slate-900 flex flex-col justify-start relative overflow-hidden transition-shadow"
      style={
        {
          width: "210mm",
          minHeight: "297mm",
          height: "297mm",
          maxHeight: "297mm",
          padding: sheetPadding,
          boxSizing: "border-box",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
          fontFamily: fontPairing.body,
          "--tpl-accent": accent,
          "--tpl-font-heading": fontPairing.heading,
          "--tpl-font-body": fontPairing.body,
          "--cs": String(appliedScale),
        } as React.CSSProperties
      }
    >
      <style>{`
        .classic-ats-sheet {
          font-family: var(--tpl-font-body);
          color: #111827;
        }
        .classic-ats-sheet h1,
        .classic-ats-sheet h2,
        .classic-ats-sheet h3 {
          font-family: var(--tpl-font-heading) !important;
        }
        .classic-ats-sheet .classic-name {
          font-size: calc(18.5pt * var(--cs));
          line-height: 1.08;
          letter-spacing: -0.015em;
        }
        .classic-ats-sheet .classic-headline {
          font-size: calc(8.9pt * var(--cs));
          line-height: 1.25;
          color: var(--tpl-accent);
        }
        .classic-ats-sheet .classic-contact {
          font-size: calc(7.6pt * var(--cs));
          line-height: 1.3;
        }
        .classic-ats-sheet .classic-section {
          margin-bottom: calc(6.5px * var(--cs));
        }
        .classic-ats-sheet .classic-section:last-child {
          margin-bottom: 0;
        }
        .classic-ats-sheet .classic-h2 {
          font-size: calc(8.9pt * var(--cs));
          line-height: 1.2;
          letter-spacing: 0.06em;
          color: var(--tpl-accent);
          border-bottom: 1px solid var(--tpl-accent);
          padding-bottom: calc(1.5px * var(--cs));
          margin-bottom: calc(3.5px * var(--cs));
        }
        .classic-ats-sheet .classic-body {
          font-size: calc(7.85pt * var(--cs));
          line-height: 1.34;
        }
        .classic-ats-sheet .classic-role {
          font-size: calc(8.45pt * var(--cs));
          line-height: 1.24;
        }
        .classic-ats-sheet .classic-meta {
          font-size: calc(7.45pt * var(--cs));
          line-height: 1.24;
          font-variant-numeric: tabular-nums;
        }
        .classic-ats-sheet .classic-intro {
          font-size: calc(7.45pt * var(--cs));
          line-height: 1.28;
          margin-bottom: calc(1.5px * var(--cs));
        }
        .classic-ats-sheet .classic-bullets {
          font-size: calc(7.65pt * var(--cs));
          line-height: 1.31;
          padding-left: calc(13px * var(--cs));
          margin-top: calc(1px * var(--cs));
        }
        .classic-ats-sheet .classic-bullets li {
          margin-bottom: calc(1.5px * var(--cs));
        }
        .classic-ats-sheet .classic-bullets li:last-child {
          margin-bottom: 0;
        }
        .classic-ats-sheet .ats-white-keywords {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: transparent !important;
        }
        .classic-ats-sheet .classic-exp-item {
          margin-bottom: calc(5px * var(--cs));
        }
        .classic-ats-sheet .classic-exp-item:last-child {
          margin-bottom: 0;
        }
        .classic-ats-sheet .classic-small {
          font-size: calc(7.5pt * var(--cs));
          line-height: 1.31;
        }
        .classic-ats-sheet a {
          color: inherit;
          text-decoration: none;
        }
        .classic-ats-sheet a:hover {
          text-decoration: underline;
          color: var(--tpl-accent);
        }
        ${customCss}
      `}</style>

      {topAccentBar && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: accent }}
        />
      )}

      <div ref={innerRef} className="minimal-inner w-full flex flex-col justify-start">
        {/* ==================== 1. HEADER ==================== */}
        <header
          className={`border-b-[1.5px] pb-1.5 mb-2 ${
            headerAlign === "left"
              ? "flex flex-col items-start text-left gap-0.5"
              : headerAlign === "split"
                ? "flex justify-between items-end gap-3"
                : "flex flex-col items-center text-center gap-0.5"
          }`}
          style={{ borderColor: accent }}
        >
          <div className={headerAlign === "split" ? "min-w-0" : "w-full"}>
            <h1 className="classic-name font-bold text-slate-950 m-0">
              {data.profile.firstName} {data.profile.lastName}
            </h1>
            <div className="classic-headline font-semibold tracking-wide mt-0.5">
              {content.headlineRole}
              {content.headlineSubtitle ? ` | ${content.headlineSubtitle}` : ""}
            </div>
          </div>

          <div
            className={`classic-contact text-slate-700 font-normal ${
              headerAlign === "split" ? "text-right shrink-0" : ""
            }`}
          >
            <span>{location}</span>
            <span className="mx-1.5 text-slate-400" aria-hidden="true">|</span>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="tabular-nums">
              {phone}
            </a>
            <span className="mx-1.5 text-slate-400" aria-hidden="true">|</span>
            <a href={`mailto:${email}`}>{email}</a>
            <span className="mx-1.5 text-slate-400" aria-hidden="true">|</span>
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-slate-300 underline-offset-2">
              {websiteHandle}
            </a>
            <span className="mx-1.5 text-slate-400" aria-hidden="true">|</span>
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-slate-300 underline-offset-2">
              {linkedinHandle}
            </a>
          </div>
        </header>

        {/* ==================== 2. PROFESSIONAL SUMMARY ==================== */}
        {sections.summary && (
          <section className="classic-section">
            <h2 className="classic-h2 font-bold uppercase m-0">Professional Summary</h2>
            <p className="classic-body text-slate-800 m-0">
              <RichText text={content.summary} strongClassName="font-semibold text-slate-950" />
            </p>
          </section>
        )}

        {/* ==================== 3. CORE COMPETENCIES ==================== */}
        {sections.skills && content.skillGroups.length > 0 && (() => {
          const skillView = partitionTailoredSkills(content.skillGroups);
          return (
            <section className="classic-section">
              <h2 className="classic-h2 font-bold uppercase m-0">Core Competencies</h2>
              <div className="classic-small text-slate-800">
                <div className="space-y-0.5">
                  {skillView.rows.map((group) => (
                    <div key={group.category}>
                      <strong className="font-semibold text-slate-950">{group.category}:</strong>{" "}
                      <span>
                        {group.visibleItems.map((item, idx) => (
                          <React.Fragment key={item}>
                            {idx > 0 && ", "}
                            {item}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                {skillView.hiddenAtsKeywords.length > 0 && (
                  <div
                    className="ats-white-keywords block h-[1px] -mt-[1px] overflow-hidden whitespace-nowrap select-none pointer-events-none"
                    style={{
                      color: "#ffffff",
                      WebkitTextFillColor: "#ffffff",
                      fontSize: "1px",
                      lineHeight: "1px",
                    }}
                  >
                    {skillView.hiddenAtsKeywords.join(", ")}
                  </div>
                )}
              </div>
            </section>
          );
        })()}

        {/* ==================== 4. PROFESSIONAL EXPERIENCE ==================== */}
        {sections.experience && experiences.length > 0 && (
          <section className="classic-section">
            <h2 className="classic-h2 font-bold uppercase m-0">Professional Experience</h2>
            <div>
              {experiences.map((exp) => (
                <div key={exp.id} className="classic-exp-item">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="classic-role font-bold text-slate-950 m-0">
                      <span>{exp.role}</span>
                      <span className="font-normal text-slate-500"> — </span>
                      {exp.url ? (
                        <a
                          href={exp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-800"
                        >
                          {exp.company}
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-800">{exp.company}</span>
                      )}
                    </h3>
                    <div className="classic-meta text-slate-700 font-medium whitespace-nowrap shrink-0">
                      <span className="font-semibold text-slate-900">{exp.period}</span>
                      {exp.location ? ` | ${exp.location}` : ""}
                    </div>
                  </div>

                  {exp.showIntro && (
                    <p className="classic-intro italic text-slate-600 m-0">
                      <RichText text={exp.intro} strongClassName="font-semibold text-slate-800 not-italic" />
                    </p>
                  )}

                  {exp.visibleBullets.length > 0 && (
                    <ul className="classic-bullets list-disc text-slate-800 m-0">
                      {exp.visibleBullets.map((bullet, idx) => (
                        <li key={idx}>
                          <RichText text={bullet} strongClassName="font-semibold text-slate-950" />
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.atsOnlyBullets.length > 0 && (
                    <div
                      className="ats-white-keywords block h-[1px] -mt-[1px] overflow-hidden whitespace-nowrap select-none pointer-events-none"
                      style={{
                        color: "#ffffff",
                        WebkitTextFillColor: "#ffffff",
                        fontSize: "1px",
                        lineHeight: "1px",
                      }}
                    >
                      {exp.atsOnlyBullets.map((b) => stripMarkdownBold(b)).join(" | ")}
                    </div>
                  )}

                  {showTags && exp.tags && exp.tags.length > 0 && (
                    <div className="classic-meta text-slate-600 mt-0.5">
                      <span className="font-semibold text-slate-800">Keywords:</span>{" "}
                      {exp.tags.join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 5. SELECTED PROJECTS ==================== */}
        {sections.projects && projects.length > 0 && (
          <section className="classic-section">
            <h2 className="classic-h2 font-bold uppercase m-0">Selected Projects</h2>
            <ul className="classic-bullets list-disc text-slate-800 m-0">
              {projects.map((proj) => (
                <li key={proj.id}>
                  <strong className="font-semibold text-slate-950">{proj.title}</strong>
                  {proj.url && proj.urlLabel && (
                    <>
                      {" "}
                      (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-slate-300 underline-offset-2 font-medium text-slate-700"
                      >
                        {proj.urlLabel}
                      </a>
                      )
                    </>
                  )}
                  <span className="text-slate-600"> — </span>
                  <RichText text={proj.description} strongClassName="font-semibold text-slate-950" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ==================== 6. EDUCATION ==================== */}
        {sections.education && educationList.length > 0 && (
          <section className="classic-section">
            <h2 className="classic-h2 font-bold uppercase m-0">Education</h2>
            <div className="space-y-1">
              {educationList.map((edu) => (
                <div key={edu.id} className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {showLogos && <KNTULogo className="w-5 h-5 shrink-0" />}
                    <div className="classic-small text-slate-800">
                      <strong className="font-bold text-slate-950">{edu.school}</strong>
                      <span className="text-slate-500"> — </span>
                      <span>{edu.degree}</span>
                    </div>
                  </div>
                  <div className="classic-meta font-semibold text-slate-800 whitespace-nowrap shrink-0">
                    {edu.period}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 7. CERTIFICATIONS & HONORS ==================== */}
        {(sections.certifications || sections.honors) && (
          <section className="classic-section">
            <h2 className="classic-h2 font-bold uppercase m-0">
              {sections.certifications && sections.honors
                ? "Certifications, Honors & Speaking"
                : sections.certifications
                  ? "Certifications & Credentials"
                  : "Honors & Industry Recognition"}
            </h2>
            <div className="classic-small text-slate-800 space-y-0.5">
              {sections.certifications && (
                <div>
                  <strong className="font-semibold text-slate-950">Certifications:</strong>{" "}
                  <a href="https://www.coursera.org/account/accomplishments/specialization/1PWFQDILW4LV" target="_blank" rel="noopener noreferrer">
                    IBM AI Product Manager
                  </a>
                  {" · "}
                  <a href="https://www.coursera.org/account/accomplishments/specialization/D6QCPAALARSN" target="_blank" rel="noopener noreferrer">
                    Google Project Management
                  </a>
                  {" · "}
                  <a href="https://www.coursera.org/account/accomplishments/specialization/XGF7N6J2LI3F" target="_blank" rel="noopener noreferrer">
                    Microsoft Project Management
                  </a>
                  {" · "}
                  <a href="https://credentials.edx.org/credentials/60fe0e83174049868a543fd90620343c/" target="_blank" rel="noopener noreferrer">
                    Product Management — Univ. of Maryland
                  </a>
                  {" · "}
                  <a href="https://app.uxcel.com/ux/shayanesf" target="_blank" rel="noopener noreferrer">
                    Uxcel PM Certified
                  </a>
                  {" · "}
                  <a href="https://www.coursera.org/account/accomplishments/specialization/ZL5R4M4FLC9T" target="_blank" rel="noopener noreferrer">
                    Google &amp; Microsoft UX Design
                  </a>
                  {" · "}
                  <a href="https://www.coursera.org/account/accomplishments/specialization/GF67W73QMAZF" target="_blank" rel="noopener noreferrer">
                    Meta &amp; IBM Front-End Developer
                  </a>
                </div>
              )}

              {sections.honors && (
                <>
                  <div>
                    <strong className="font-semibold text-slate-950">Awards &amp; Recognition:</strong>{" "}
                    Award Winner, Sepino 2 Investment Event — Presidential Innovation Fund (Dec 2025) · Top Award Winner, 6th Int&apos;l Mobile Digital Health Congress, SUMS (Feb 2025) · Innovation Partnership, SRB IAU Technology Park (2023–2024)
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-950">Speaking &amp; Exhibitions:</strong>{" "}
                    Product Presenter at 6th Int&apos;l Smart City &amp; AI Conference (Nov 2025), 28th Int&apos;l Elecomp Exhibition (Sep 2025), and 25th Int&apos;l Telecom &amp; Digital Economy Exhibition (Dec 2024)
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
