import React, { useMemo } from "react";
import { useResume } from "@/context/ResumeContext";
import { getFontPairing, sanitizeCustomCss, sanitizeImportedHtml } from "@/utils/templateTheme";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markdownBoldToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function CustomHtmlTemplate() {
  const { data, liveCustomHtml, liveCustomization, effectiveTailoredContent } = useResume();
  const fontPairing = getFontPairing(liveCustomization.fontPairing);
  const customCss = sanitizeCustomCss(liveCustomization.customCss);

  const renderedHtml = useMemo(() => {
    const baseHtml = sanitizeImportedHtml(liveCustomHtml || "");
    const tailored = effectiveTailoredContent;

    const fullName = `${data.profile.firstName} ${data.profile.lastName}`.trim();
    const role = tailored?.headlineRole || data.profile.role;
    const subtitle = tailored?.headlineSubtitle || data.profile.subtitle;
    const summary = tailored?.summary || data.profile.about;

    const skillsStr = tailored
      ? tailored.skillGroups
          .map((g) => `<div><strong>${escapeHtml(g.category)}:</strong> ${escapeHtml(g.items.join(", "))}</div>`)
          .join("")
      : escapeHtml(data.skills.join(" · "));

    const experiencesHtml = data.experiences
      .map((exp) => {
        const bulletsHtml = exp.bullets.map((b) => `<li>${markdownBoldToHtml(b)}</li>`).join("");
        return `
          <div class="exp-block">
            <div class="exp-head">
              <span>${escapeHtml(exp.role)} — ${escapeHtml(exp.company)}</span>
              <span class="exp-meta">${escapeHtml(exp.period)} · ${escapeHtml(exp.location)}</span>
            </div>
            ${exp.intro ? `<p>${markdownBoldToHtml(exp.intro)}</p>` : ""}
            <ul>${bulletsHtml}</ul>
          </div>
        `;
      })
      .join("");

    const educationHtml = data.education
      .map(
        (ed) => `
        <div class="exp-block">
          <div class="exp-head">
            <span>${escapeHtml(ed.school)}</span>
            <span class="exp-meta">${escapeHtml(ed.period)}</span>
          </div>
          <p>${escapeHtml(ed.degree)}</p>
        </div>
      `
      )
      .join("");

    const projectsHtml = data.projects
      .map(
        (p) => `
        <div class="exp-block">
          <div class="exp-head">
            <span>${escapeHtml(p.title)}</span>
            ${p.url ? `<span class="exp-meta">${escapeHtml(p.url)}</span>` : ""}
          </div>
          <p>${markdownBoldToHtml(p.description)}</p>
        </div>
      `
      )
      .join("");

    const replacements: Record<string, string> = {
      "{{fullName}}": escapeHtml(fullName),
      "{{firstName}}": escapeHtml(data.profile.firstName),
      "{{lastName}}": escapeHtml(data.profile.lastName),
      "{{role}}": escapeHtml(role),
      "{{subtitle}}": escapeHtml(subtitle),
      "{{summary}}": markdownBoldToHtml(summary),
      "{{email}}": escapeHtml(data.contact.email),
      "{{phone}}": escapeHtml(data.contact.phone),
      "{{location}}": escapeHtml(data.contact.location),
      "{{website}}": escapeHtml(data.contact.website?.handle || ""),
      "{{linkedin}}": escapeHtml(data.contact.linkedin?.handle || ""),
      "{{skills}}": skillsStr,
      "{{experiences}}": experiencesHtml,
      "{{education}}": educationHtml,
      "{{projects}}": projectsHtml,
    };

    let output = baseHtml;
    for (const [token, val] of Object.entries(replacements)) {
      output = output.split(token).join(val);
    }
    return output;
  }, [liveCustomHtml, data, effectiveTailoredContent]);

  return (
    <div
      className="custom-html-template bg-white text-slate-900 relative overflow-hidden"
      style={
        {
          width: "210mm",
          minHeight: "297mm",
          boxSizing: "border-box",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
          fontFamily: fontPairing.body,
          "--resume-accent": liveCustomization.accentColor,
          "--resume-font-heading": fontPairing.heading,
          "--resume-font-body": fontPairing.body,
          "--resume-scale": String(liveCustomization.fontSizeScale),
        } as React.CSSProperties
      }
    >
      {liveCustomization.topAccentBar && (
        <div className="w-full h-1.5" style={{ backgroundColor: liveCustomization.accentColor }} />
      )}
      {customCss && <style>{customCss}</style>}
      <div
        style={{
          fontSize: `${liveCustomization.fontSizeScale * 100}%`,
        }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}
