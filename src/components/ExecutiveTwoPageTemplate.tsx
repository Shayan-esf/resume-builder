import React from "react";
import { useResume } from "@/context/ResumeContext";
import { ExternalLink, Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { TUMSLogo, MCILogo, UxcelLogo, OfoqDadeLogo, KNTULogo } from "./CompanyLogos";
import { RichText } from "./RichText";
import { getFontPairing, hexToRgba, sanitizeCustomCss } from "@/utils/templateTheme";
import {
  DEFAULT_CURATED_SKILLS,
  DEFAULT_HIDDEN_ATS_KEYWORDS,
  isBoldHighlightSkill,
  partitionTailoredSkills,
} from "@/utils/skillDisplay";
import { MASTER_RESUME_CONTENT } from "@/types/tailoring";
import { partitionExperienceBullets, stripMarkdownBold } from "@/utils/experienceBullets";

export default function ExecutiveTwoPageTemplate() {
  const { data, effectiveTailoredContent, liveCustomization } = useResume();
  const tailored = effectiveTailoredContent;
  const getTailoredExp = (id: string) => tailored?.experiences.find((e) => e.id === id);
  const getMasterExp = (id: string) => MASTER_RESUME_CONTENT.experiences.find((e) => e.id === id);
  const getTailoredProj = (id: string) => tailored?.projects.find((p) => p.id === id);
  const tumsExp = getTailoredExp("tums");
  const mciExp = getTailoredExp("mci");
  const uxcelExp = getTailoredExp("uxcel");
  const ofoqExp = getTailoredExp("ofoq");

  const renderExperienceBullets = (expId: string, bullets: string[], ulClassName: string) => {
    const { visibleBullets, atsOnlyBullets } = partitionExperienceBullets(
      bullets,
      expId,
      liveCustomization.atsOnlyExperienceBullets
    );
    return (
      <>
        {visibleBullets.length > 0 && (
          <ul className={ulClassName}>
            {visibleBullets.map((b) => (
              <li key={b.index}>
                <RichText text={b.text} />
              </li>
            ))}
          </ul>
        )}
        {atsOnlyBullets.length > 0 && (
          <div
            className="ats-white-keywords block h-[1px] -mt-[1px] overflow-hidden whitespace-nowrap select-none pointer-events-none"
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              fontSize: "1px",
              lineHeight: "1px",
            }}
          >
            {atsOnlyBullets.map((b) => stripMarkdownBold(b.text)).join(" | ")}
          </div>
        )}
      </>
    );
  };

  const accent = liveCustomization.accentColor || "#0284c7";
  const fontPairing = getFontPairing(liveCustomization.fontPairing);
  const customCss = sanitizeCustomCss(liveCustomization.customCss);
  const sheetPadding =
    liveCustomization.density === "compact"
      ? "8mm 11mm"
      : liveCustomization.density === "relaxed"
      ? "12mm 14mm"
      : "10mm 12.5mm";
  const headerAlign = liveCustomization.headerAlign;
  const { sections, showLogos, showTags, topAccentBar, fontSizeScale } = liveCustomization;

  return (
    <div
      className="executive-template w-full text-slate-800 flex flex-col gap-6 print:gap-0 print:block items-center"
      dir="ltr"
      style={
        {
          fontFamily: fontPairing.body,
          "--tpl-accent": accent,
          "--tpl-accent-soft": hexToRgba(accent, 0.08),
          "--tpl-accent-border": hexToRgba(accent, 0.28),
          "--tpl-font-heading": fontPairing.heading,
          "--tpl-font-body": fontPairing.body,
        } as React.CSSProperties
      }
    >
      <style>{`
        .executive-template { font-family: var(--tpl-font-body); }
        .executive-template h1, .executive-template h2, .executive-template h3 { font-family: var(--tpl-font-heading) !important; }
        .executive-template .text-sky-600, .executive-template .text-sky-700 { color: var(--tpl-accent) !important; }
        .executive-template .bg-sky-50 { background-color: var(--tpl-accent-soft) !important; }
        .executive-template .border-sky-200 { border-color: var(--tpl-accent-border) !important; }
        .executive-template a:hover { color: var(--tpl-accent) !important; }
        .executive-template .ats-white-keywords { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; background: transparent !important; }
        /* Page-1 density: all three roles on one sheet, page 2 back to its roomy default */
        #page-1 .p1-work article { margin-bottom: 3px !important; }
        #page-1 .p1-work article:last-of-type { margin-bottom: 0 !important; }
        #page-1 .p1-work p { line-height: 1.22 !important; }
        #page-1 .p1-work ul { line-height: 1.2 !important; }
        #page-1 .p1-work ul > li + li { margin-top: 0 !important; }
        #page-1 .p1-work .tpl-skill-tags { margin-top: 8px !important; }
        /* Guard: keep the role title and the company line from ever colliding when
           the print/export pipeline re-metrics the text with fallback fonts */
        #page-1 .p1-work h3 { line-height: 1.35 !important; }
        #page-1 .p1-work h3 + div { margin-top: 3px !important; line-height: 1.3 !important; }
        #page-1 .space-y-1 > * + * { margin-top: 1px !important; }
        #page-1 section > div:first-child { margin-top: 3px !important; margin-bottom: 1px !important; }
        ${!showLogos ? `.executive-template .tpl-company-logo { display: none !important; }` : ""}
        ${!showTags ? `.executive-template .tpl-skill-tags { display: none !important; }` : ""}
        ${fontSizeScale !== 1 ? `.executive-template .a4-sheet > div { zoom: ${fontSizeScale}; }` : ""}
        ${customCss}
      `}</style>
      {/* ==================== PAGE 1 (ORIGINAL BALANCED - FULL STANDARD A4) ==================== */}
      <main
        id="page-1"
        className="a4-sheet bg-white text-slate-800 flex flex-col justify-start relative overflow-hidden transition-shadow"
        style={{
          width: "210mm",
          minHeight: "297mm",
          height: "297mm",
          maxHeight: "297mm",
          padding: sheetPadding,
          boxSizing: "border-box",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
        }}
      >
        {topAccentBar && (
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: accent }}
          />
        )}
        <div className="w-full h-full flex flex-col justify-start">
          {/* HEADER */}
          <header
            className={`pb-2.5 mb-1.5 border-b border-slate-200 ${
              headerAlign === "left"
                ? "text-left"
                : headerAlign === "split"
                ? "flex items-end justify-between gap-4 text-left"
                : "text-center"
            }`}
          >
            <div>
              <h1 className="text-[20pt] font-extrabold text-slate-900 tracking-[-0.03em] leading-none mb-1 font-['Outfit',sans-serif]">
                {data.profile.firstName} {data.profile.lastName}
              </h1>
              <div className="text-[9.2pt] font-bold text-sky-700 tracking-[0.08em] uppercase mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                {tailored ? (
                  <>
                    {tailored.headlineRole} <span className="text-slate-300 font-normal px-1.5">|</span> {tailored.headlineSubtitle}
                  </>
                ) : (
                  <>
                    Technical Product Manager <span className="text-slate-300 font-normal px-1.5">|</span> Ex-Frontend Engineer
                  </>
                )}
              </div>
            </div>

            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[8.2pt] text-slate-600 font-medium ${
                headerAlign === "left"
                  ? "justify-start"
                  : headerAlign === "split"
                  ? "justify-end max-w-[52%]"
                  : "justify-center"
              }`}
            >
              <a href={`tel:${(data.contact?.phone || "+98 933 300 7274").replace(/\s+/g, "")}`} className="hover:text-sky-700 inline-flex items-center gap-1.5 transition font-medium">
                <Phone className="size-2.5 text-sky-600" /> {data.contact?.phone || "(+98) 933 300 7274"}
              </a>
              <span className="text-slate-300">&bull;</span>
              <a href={`mailto:${data.contact?.email || "esfahanizadeh81@gmail.com"}`} className="hover:text-sky-700 inline-flex items-center gap-1.5 transition font-medium">
                <Mail className="size-2.5 text-sky-600" /> {data.contact?.email || "esfahanizadeh81@gmail.com"}
              </a>
              <span className="text-slate-300">&bull;</span>
              <a href={data.contact?.website?.url || "https://esfahanizadeh.vercel.app"} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline inline-flex items-center gap-1.5 transition font-semibold">
                <Globe className="size-2.5 text-sky-600" /> {data.contact?.website?.handle || "esfahanizadeh.vercel.app"}
              </a>
              <span className="text-slate-300">&bull;</span>
              <a href={data.contact?.linkedin?.url || "https://linkedin.com/in/shayan-esf"} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline inline-flex items-center gap-1.5 transition font-semibold">
                <Linkedin className="size-2.5 text-sky-600" /> {data.contact?.linkedin?.handle || "in/shayan-esf"}
              </a>
            </div>
          </header>

          {/* SUMMARY */}
          {sections.summary && (
          <section className="mb-1.5">
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Su</span>mmary
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>
            <p className="text-[8.35pt] leading-[1.42] text-slate-700 text-justify mb-1 font-normal">
              {tailored ? (
                <RichText text={tailored.summary} />
              ) : (
                <>
                  Technical Product Manager specializing in <strong className="text-slate-900 font-semibold">Product Discovery & Dev Handoff</strong> with a solid software engineering foundation in modern frontend architecture. Led the <strong className="text-slate-900 font-semibold">Delband</strong> Medicine 3.0 digital health platform (wearables & AI ecosystem) from 0-to-1 startup to an accredited <strong className="text-slate-900 font-semibold">Knowledge-Based Enterprise</strong>, securing <strong className="text-slate-900 font-semibold">two institutional funding rounds</strong>, <strong className="text-slate-900 font-semibold">Presidential Innovation Fund</strong> backing, and strategic acquisition by <strong className="text-slate-900 font-semibold">Hamrahe Aval (MCI)</strong>. Expert in bridging engineering squads, clinical advisors, and C-suite stakeholders using <strong className="text-slate-900 font-semibold">Jobs-to-be-Done (JTBD)</strong>, <strong className="text-slate-900 font-semibold">Root Cause Analysis</strong>, and metric-driven execution to scale enterprise B2B offerings (e.g., <strong className="text-slate-900 font-semibold">Mobarakeh Steel Group</strong>).
                </>
              )}
            </p>
          </section>
          )}

          {/* SKILLS */}
          {sections.skills && (
          <section className="mb-2">
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Sk</span>ills
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>
            {(() => {
              const skillView = tailored
                ? partitionTailoredSkills(tailored.skillGroups)
                : { rows: DEFAULT_CURATED_SKILLS, hiddenAtsKeywords: DEFAULT_HIDDEN_ATS_KEYWORDS };

              return (
                <div className="text-[8.2pt] leading-[1.4] text-slate-700 mb-1">
                  <div className="space-y-1">
                    {skillView.rows.map((group) => (
                      <div key={group.category}>
                        <strong className="text-slate-900 font-bold font-['Plus_Jakarta_Sans',sans-serif]">{group.category}:</strong>{" "}
                        <span className="font-normal text-slate-700">
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
              );
            })()}
          </section>
          )}

          {/* WORK EXPERIENCE (PAGE 1) */}
          {sections.experience && (
          <section className="p1-work flex flex-col">
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Wo</span>rk Experience
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>

            {/* ROLE 1: TUMS Health Innoversity */}
            <article className="mb-5">
              <div className="flex items-start justify-between gap-2 mb-1 pt-1.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <TUMSLogo className="tpl-company-logo h-8 w-8 object-contain shrink-0" />
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="text-[9.2pt] font-bold text-slate-900 leading-snug font-['Outfit',sans-serif]">
                      {tumsExp ? tumsExp.role : "Technology & Product Advisor | Mentor Bootcamp"}
                    </h3>
                    <div className="text-[8.2pt] font-semibold text-slate-700 leading-tight mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                      TUMS Health Innoversity
                    </div>
                  </div>
                </div>
                <div className="text-[7.8pt] font-medium text-slate-600 text-right whitespace-nowrap shrink-0 pt-0.5">
                  <span className="font-semibold text-slate-800">Jul 2026 – Present</span> &bull; <MapPin className="inline size-2.5 text-sky-600" /> Iran &bull; Advisory
                </div>
              </div>

              {(() => {
                const exp = tumsExp || getMasterExp("tums");
                if (!exp) return null;
                return (
                  <>
                    <p className="text-[8.1pt] leading-[1.36] text-slate-600 mb-1 italic font-normal">
                      <RichText text={exp.intro} />
                    </p>
                    {renderExperienceBullets(
                      "tums",
                      exp.bullets,
                      "list-disc ml-4.5 space-y-1 text-[8.3pt] leading-[1.38] text-slate-700"
                    )}
                    <div className="tpl-skill-tags flex flex-wrap gap-1.5 mt-1.5">
                      {exp.tags.map((pill) => (
                        <span key={pill} className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[7.2pt] font-medium text-slate-600 leading-tight">
                          {pill}
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </article>

            {/* ROLE 2: Hamrahe Aval (MCI) */}
            <article className="mb-4">
              <div className="flex items-center justify-between gap-2 mb-1 pt-1.5">
                <div className="flex items-center gap-2.5">
                  <MCILogo className="tpl-company-logo h-7 w-auto shrink-0" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[9.4pt] font-bold text-slate-900 leading-tight font-['Outfit',sans-serif]">
                      {mciExp ? mciExp.role : "Technical Product Manager"}
                    </h3>
                    <div className="text-[8.2pt] font-semibold text-slate-700 leading-tight mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                      <a href="https://delbandcare.com" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 transition inline-flex items-center gap-1 font-bold">
                        Hamrahe Aval (MCI)
                        <ExternalLink className="size-2.5 text-sky-600" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-[7.9pt] font-medium text-slate-600 text-right whitespace-nowrap">
                  <span className="font-semibold text-slate-800">Apr 2025 – Present</span> &bull; <MapPin className="inline size-2.5 text-sky-600" /> Tehran, Iran &bull; Full-time
                </div>
              </div>

              {(() => {
                const exp = mciExp || getMasterExp("mci");
                if (!exp) return null;
                return (
                  <>
                    {renderExperienceBullets(
                      "mci",
                      exp.bullets,
                      "list-disc ml-4.5 space-y-1 text-[8.3pt] leading-[1.38] text-slate-700"
                    )}
                    <div className="tpl-skill-tags flex flex-wrap gap-1.5 mt-1.5">
                      {exp.tags.map((pill) => (
                        <span key={pill} className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[7.2pt] font-medium text-slate-600 leading-tight">
                          {pill}
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </article>

            {/* ROLE 3: Ofogh Dadeha Iranian */}
            <article className="mb-0">
              <div className="flex items-center justify-between gap-2 mb-1 pt-1.5">
                <div className="flex items-center gap-2.5">
                  <OfoqDadeLogo className="tpl-company-logo h-6 w-auto shrink-0" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[9.2pt] font-bold text-slate-900 leading-tight font-['Outfit',sans-serif]">
                      {ofoqExp ? ofoqExp.role : "Frontend Developer"}
                    </h3>
                    <div className="text-[7.9pt] font-semibold text-slate-700 leading-tight mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                      <a href="https://cafebazaar.ir/app/com.ofoghdadeha.venus" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 transition inline-flex items-center gap-1 font-bold">
                        Ofogh Dadeha Iranian
                        <ExternalLink className="size-2.5 text-sky-600" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-[7.6pt] font-medium text-slate-600 text-right whitespace-nowrap">
                  <span className="font-semibold text-slate-800">Jun 2022 – May 2025</span> &bull; <MapPin className="inline size-2.5 text-sky-600" /> Tehran, Iran &bull; Hybrid
                </div>
              </div>

              {(() => {
                const exp = ofoqExp || getMasterExp("ofoq");
                if (!exp) return null;
                return (
                  <>
                    <p className="text-[7.95pt] leading-[1.36] text-slate-600 mb-1 font-normal">
                      <RichText text={exp.intro} />
                    </p>
                    {renderExperienceBullets(
                      "ofoq",
                      exp.bullets,
                      "list-disc ml-4.5 space-y-0.5 text-[8.25pt] leading-[1.38] text-slate-700"
                    )}
                    <div className="tpl-skill-tags flex flex-wrap gap-1 mt-1.5">
                      {exp.tags.map((pill) => (
                        <span key={pill} className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[7.2pt] font-medium text-slate-600 leading-tight">
                          {pill}
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </article>
          </section>
          )}
        </div>
      </main>

      {/* ==================== PAGE 2 (BALANCED DECOMPRESSED - FULL STANDARD A4) ==================== */}
      <main
        id="page-2"
        className="a4-sheet bg-white text-slate-800 flex flex-col justify-start relative overflow-hidden transition-shadow"
        style={{
          width: "210mm",
          minHeight: "297mm",
          height: "297mm",
          maxHeight: "297mm",
          padding: sheetPadding,
          boxSizing: "border-box",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
        }}
      >
        {topAccentBar && (
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: accent }}
          />
        )}
        <div className="w-full h-full flex flex-col justify-start">
          {/* EDUCATION (WITH LOGO & 2ND LINE MAJOR) */}
          {sections.education && (
          <section className="mb-2">
            <div className="flex items-center gap-2 mt-1 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Ed</span>ucation
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>
            
            <article className="mb-0">
              <div className="flex items-start gap-2.5">
                <KNTULogo className="tpl-company-logo h-8 w-8 object-contain shrink-0" />
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-[9.2pt] font-bold text-slate-900 leading-tight font-['Outfit',sans-serif]">
                    K. N. Toosi University of Technology (KNTU)
                    <span className="font-semibold text-slate-600 text-[7.9pt]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {" "}— Jun 2020 – Sep 2025
                    </span>
                  </h3>
                  <div className="text-[8.1pt] font-medium text-slate-700 leading-tight mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    Bachelor's Degree, Computer Engineering, Computer Software Engineering
                  </div>
                </div>
              </div>
            </article>
          </section>
          )}

          {/* VOLUNTEERING */}
          <section className="mb-2">
            <div className="flex items-center gap-2 mt-1 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Vo</span>lunteering
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>

            <div className="space-y-1.5 text-[8pt] leading-[1.36] text-slate-700">
              {/* Volunteering 1: Uxcel */}
              <article>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <UxcelLogo className="tpl-company-logo h-4 w-4 object-contain shrink-0" />
                    <div className="leading-snug">
                      <strong className="text-[8.5pt] font-bold text-slate-900 font-['Outfit',sans-serif]">
                        {uxcelExp ? uxcelExp.role : "Product Management Mentor"}
                      </strong>
                      <span className="text-slate-400 mx-1.5">&bull;</span>
                      <a
                        href="https://uxcel.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 hover:text-sky-700 transition inline-flex items-center gap-0.5 font-semibold"
                      >
                        Uxcel
                        <ExternalLink className="size-2.5 text-sky-600" />
                      </a>
                    </div>
                  </div>
                  <div className="text-[7.5pt] font-medium text-slate-600 whitespace-nowrap shrink-0">
                    <span className="font-semibold text-slate-800">Aug 2025 – Present</span> &bull; Remote
                  </div>
                </div>
                <p className="text-[7.75pt] leading-[1.35] text-slate-600 mt-0.5 font-normal">
                  Ranked among <strong className="text-slate-900 font-semibold">Top 10 Global PM Mentors</strong> (500K+ learners, 150+ countries); reviewed <strong className="text-slate-900 font-semibold">170+ real product projects</strong> with structured execution feedback.
                </p>
              </article>

              {/* Volunteering 2: Hamsaz Accelerator */}
              <article>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MCILogo className="tpl-company-logo h-4 w-4 object-contain shrink-0" />
                    <div className="leading-snug">
                      <strong className="text-[8.5pt] font-bold text-slate-900 font-['Outfit',sans-serif]">
                        Program Collaborator — 42-Day &ldquo;Hamsaz&rdquo; Accelerator &amp; Bootcamp
                      </strong>
                      <span className="text-slate-400 mx-1.5">&bull;</span>
                      <a
                        href="https://mci.ir/web/rd/news/-/view/3721601"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 hover:text-sky-700 transition inline-flex items-center gap-0.5 font-semibold"
                      >
                        MCI Startup Studio
                        <ExternalLink className="size-2.5 text-sky-600" />
                      </a>
                    </div>
                  </div>
                  <div className="text-[7.5pt] font-medium text-slate-600 whitespace-nowrap shrink-0">
                    <span className="font-semibold text-slate-800">Aug 2025 – Sep 2025</span>
                  </div>
                </div>
                <p className="text-[7.75pt] leading-[1.35] text-slate-600 mt-0.5 font-normal">
                  Empowered startup teams in <strong className="text-slate-900 font-semibold">AI-powered product building</strong> and <strong className="text-slate-900 font-semibold">custom AI skills</strong>, coaching <strong className="text-slate-900 font-semibold">Design Thinking</strong>, problem-solving, and strategic prioritization.
                </p>
              </article>
            </div>
          </section>

          {/* LATEST PROJECTS */}
          {sections.projects && (
          <section className="mb-1.5">
            <div className="flex items-center gap-2 mt-1.5 mb-1.5">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">La</span>test Projects
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
              <a
                href="https://www.linkedin.com/in/shayan-esf/details/projects/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[7.2pt] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded hover:bg-sky-100 transition whitespace-nowrap font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <Linkedin className="size-2.5 text-sky-600" />
                <span>View All</span>
                <ExternalLink className="size-2" />
              </a>
            </div>

            <div className="p2-grid grid grid-cols-2 gap-2 text-[8pt] mb-1">
              {/* Card 1: Rokhnama */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("rokhnama")?.title || "Rokhnama — Founder & Product Builder"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("rokhnama") ? (
                      <RichText text={getTailoredProj("rokhnama")!.description} />
                    ) : (
                      <>
                        Built a lightweight <strong className="text-slate-900 font-semibold">digital storefront &amp; web catalog engine</strong> replacing static PDFs with mobile-first interactive showcases, including a live portal for <strong className="text-slate-900 font-semibold">KNTU International Student Affairs</strong>.
                      </>
                    )}
                  </div>
                </div>
                <a href="https://rokhnama.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[7.2pt] font-semibold text-sky-700 hover:underline">
                  <ExternalLink className="size-2.5" /> rokhnama.vercel.app
                </a>
              </div>

              {/* Card 2: BioPad */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("biopad")?.title || "BioPad — Founder & Product Builder"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("biopad") ? (
                      <RichText text={getTailoredProj("biopad")!.description} />
                    ) : (
                      <>
                        Independent <strong className="text-slate-900 font-semibold">multi-wearable fitness &amp; health product</strong> (Beta) turning raw biometric telemetry into workout/recovery insights via <strong className="text-slate-900 font-semibold">3D interactive mascots</strong> &amp; AI coaching loops.
                      </>
                    )}
                  </div>
                </div>
                <a href="https://biopad.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[7.2pt] font-semibold text-sky-700 hover:underline">
                  <ExternalLink className="size-2.5" /> biopad.vercel.app
                </a>
              </div>

              {/* Card 3: Mini-App & Messaging Bot Development */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("mini-app-bot")?.title || "Mini-App & Messaging Bot Development"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("mini-app-bot") ? (
                      <RichText text={getTailoredProj("mini-app-bot")!.description} />
                    ) : (
                      <>
                        Launched a native mini-app and bot across <strong className="text-slate-900 font-semibold">three domestic messaging platforms</strong> (Telegram, Bale, Rubika) with an <strong className="text-slate-900 font-semibold">AI reporting &amp; coaching assistant</strong> and UGC sharing; boosted brand awareness, drove organic acquisition of non-hardware users, and <strong className="text-slate-900 font-semibold">lowered CAC</strong>.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: Design System & Delband App Redesign */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("design-system-delband")?.title || "Design System & Delband App Redesign"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("design-system-delband") ? (
                      <RichText text={getTailoredProj("design-system-delband")!.description} />
                    ) : (
                      <>
                        Built Delband's <strong className="text-slate-900 font-semibold">design system</strong> and redesigned the mobile app with <strong className="text-slate-900 font-semibold">Uxcel and custom AI agents</strong> — saving <strong className="text-slate-900 font-semibold">three months</strong> of the product roadmap and cutting design costs by <strong className="text-slate-900 font-semibold">60%</strong>.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("indora")?.title || "Indora — Location Intelligence"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("indora") ? (
                      <RichText text={getTailoredProj("indora")!.description} />
                    ) : (
                      <>
                        Shipped location-intelligence platform driving data decisions. Authored PRDs, mapped user journeys, and executed initial GTM strategies to operationalize raw location data.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    {getTailoredProj("stakeholder-portal")?.title || "Stakeholder Portal"}
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    {getTailoredProj("stakeholder-portal") ? (
                      <RichText text={getTailoredProj("stakeholder-portal")!.description} />
                    ) : (
                      <>
                        Developed web management dashboard integrating <strong className="text-slate-900 font-semibold">Gantt scheduling, task boards, and OKR tracking</strong>, centralizing progress to provide transparency for leadership.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 7: Women's Health Add-on */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    Women's Health Add-on — Independent Build
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    Designed and shipped an <strong className="text-slate-900 font-semibold">independent women's-health add-on</strong> end-to-end as a solo builder — product definition, UX/UI, and full implementation.
                  </div>
                </div>
              </div>

              {/* Card 8: Mentorship Platform */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-between">
                <div>
                  <div className="text-[8.3pt] font-bold text-slate-900 mb-0.5 font-['Outfit',sans-serif]">
                    Mentorship Platform — 1:1 Coaching Product
                  </div>
                  <div className="text-[7.5pt] leading-[1.33] text-slate-600 mb-0.5 text-justify font-normal">
                    Launched a personalized <strong className="text-slate-900 font-semibold">1:1 mentorship platform</strong> on a customized pre-built foundation: session booking &amp; rescheduling dashboard, mentor reviews, real-time messaging, and <strong className="text-slate-900 font-semibold">automated email flows</strong> — improving engagement and long-term mentee progress.
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* CERTIFICATIONS */}
          {sections.certifications && (
          <section className="mb-1.5">
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Ce</span>rtifications & Credentials
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
              <a
                href="https://www.linkedin.com/in/shayan-esf/details/certifications/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[7.2pt] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded hover:bg-sky-100 transition whitespace-nowrap font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <Linkedin className="size-2.5 text-sky-600" />
                <span>Verify All</span>
                <ExternalLink className="size-2" />
              </a>
            </div>
            <div className="text-[7.9pt] leading-[1.36] text-slate-700 space-y-0.5 mb-0.5">
              <div>
                <strong className="text-slate-900 font-bold font-['Plus_Jakarta_Sans',sans-serif]">Product & Strategy:</strong>{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/1PWFQDILW4LV" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">IBM AI Product Manager <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/XGF7N6J2LI3F" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Microsoft Project Management <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/ZWNHGQWJ6PEF" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Univ. of Alberta Software Product Management <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://app.uxcel.com/ux/shayanesf" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Uxcel PM Certified <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/WAZ53KRA37WB" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">IBM Product Manager <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://credentials.edx.org/credentials/60fe0e83174049868a543fd90620343c/" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Product Management — University of Maryland <ExternalLink className="size-2 text-sky-600" /></a>
              </div>
              <div>
                <strong className="text-slate-900 font-bold font-['Plus_Jakarta_Sans',sans-serif]">Agile, Design & UX:</strong>{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/D6QCPAALARSN" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Google Project Management <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/F0R7XDBR61NT" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">AI Strategy & PM <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/ZL5R4M4FLC9T" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Google UX Design <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/6HA7ZJYS1FG4" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Microsoft UX Design <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/RSG720PJB84P" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">UI Design <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/S8LSLVED9JDK" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Gamification <ExternalLink className="size-2 text-sky-600" /></a>
              </div>
              <div>
                <strong className="text-slate-900 font-bold font-['Plus_Jakarta_Sans',sans-serif]">Engineering:</strong>{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/GF67W73QMAZF" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Meta Front-End Developer <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/TXTAF8SCN5BD" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">IBM Front-End Developer <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/VFX4VRUQSTRC" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Microsoft Front-End Developer <ExternalLink className="size-2 text-sky-600" /></a> &bull;{" "}
                <a href="https://www.coursera.org/account/accomplishments/specialization/P9TG58LPC5TE" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-sky-700 font-medium inline-flex items-center gap-0.5">Data Structures & Algorithms <ExternalLink className="size-2 text-sky-600" /></a>
              </div>
            </div>
          </section>
          )}

          {/* HONORS & RECOGNITION */}
          {sections.honors && (
          <section className="mb-0">
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <h2 className="text-[10.5pt] font-bold text-slate-900 tracking-[-0.02em] font-['Outfit',sans-serif] whitespace-nowrap m-0 p-0 uppercase">
                <span className="text-sky-600">Ho</span>nors & Industry Recognition
              </h2>
              <div className="flex-grow h-[1.5px] bg-slate-200 rounded-sm"></div>
            </div>

            {/* Speaking */}
            <div className="mb-1.5">
              <div className="flex items-center gap-1.5 mb-0.5 text-[8.1pt] font-bold tracking-wider text-slate-900 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-sky-600 font-extrabold">▌</span>SPEAKING & EXHIBITIONS
              </div>
              <ul className="list-disc ml-4.5 space-y-0.5 text-[8.1pt] leading-[1.36] text-slate-700">
                <li>
                  <strong className="text-slate-900 font-semibold">Product Presenter —</strong> 6th International Exhibition & Conference on Smart City and Artificial Intelligence, Iran <span className="text-slate-500 font-normal">(Nov 2025)</span>
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">Product Presenter —</strong> 28th International Elecomp Exhibition 2025 <span className="text-slate-500 font-normal">(Sep 2025)</span>
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">Product Presenter —</strong> 25th International Exhibition on Telecommunications, IT, and Digital Economy <span className="text-slate-500 font-normal">(Dec 2024)</span>
                </li>
              </ul>
            </div>

            {/* Awards */}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5 text-[8.1pt] font-bold tracking-wider text-slate-900 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-sky-600 font-extrabold">▌</span>AWARDS & RECOGNITION
              </div>
              <ul className="list-disc ml-4.5 space-y-0.5 text-[8.1pt] leading-[1.36] text-slate-700">
                <li>
                  <strong className="text-slate-900 font-semibold">Award Winner —</strong> Sepino 2 Investment Event, project selected for Presidential Innovation Fund <span className="text-slate-500 font-normal">(Dec 2025)</span>
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">Award Winner —</strong> 6th International Mobile Digital Health Congress, Shiraz University of Medical Sciences <span className="text-slate-500 font-normal">(Feb 2025)</span>
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">Collaboration —</strong> Innovation Partnership, SRB IAU Technology Park <span className="text-slate-500 font-normal">(2023–2024)</span>
                </li>
              </ul>
            </div>
          </section>
          )}
        </div>
      </main>
    </div>
  );
}
