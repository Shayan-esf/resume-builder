import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { DEFAULT_RESUME_DATA, ResumeData } from "@/types/resume";
import { MASTER_RESUME_CONTENT, TailoredResumeContent } from "@/types/tailoring";

const CANONICAL_EXPERIENCE_META: Record<
  string,
  { company: string; period: string; location: string }
> = {
  tums: {
    company: "TUMS Health Innoversity",
    period: "Jul 2026 - Present",
    location: "Iran | Advisory",
  },
  mci: {
    company: "Hamrahe Aval (MCI) — Delband",
    period: "Apr 2025 - Present",
    location: "Tehran, Iran | Full-time",
  },
  uxcel: {
    company: "Uxcel (500K+ Users Worldwide)",
    period: "Sep 2025 - Present",
    location: "West Palm Beach, FL | Remote",
  },
  ofoq: {
    company: "Ofogh Dadeha Iranian",
    period: "Jun 2022 - May 2025",
    location: "Tehran, Iran | Hybrid",
  },
};

const CANONICAL_PROJECT_URLS: Record<string, { label: string; url: string }> = {
  rokhnama: {
    label: "rokhnama.vercel.app",
    url: "https://rokhnama.vercel.app",
  },
  biopad: {
    label: "biopad.vercel.app",
    url: "https://biopad.vercel.app",
  },
  indora: { label: "indoora.net", url: "https://indoora.net" },
  "stakeholder-portal": {
    label: "investor.delbandcare.com",
    url: "https://investor.delbandcare.com",
  },
};

const FONT_FAMILY = "Calibri";
const TEXT_PRIMARY = "0F172A";
const TEXT_BODY = "1E293B";
const TEXT_MUTED = "475569";
const ACCENT_HEX = "0369A1";

function parseMarkdownRuns(
  text: string,
  options?: { size?: number; color?: string; italics?: boolean }
): TextRun[] {
  const size = options?.size ?? 20; // 10pt in half-points
  const color = options?.color ?? TEXT_BODY;
  const italics = options?.italics ?? false;

  const segments = (text || "").split(/(\*\*.*?\*\*)/g);
  const runs: TextRun[] = [];

  for (const segment of segments) {
    if (!segment) continue;
    if (segment.startsWith("**") && segment.endsWith("**") && segment.length > 4) {
      runs.push(
        new TextRun({
          text: segment.slice(2, -2),
          bold: true,
          italics,
          size,
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: segment,
          italics,
          size,
          color,
          font: FONT_FAMILY,
        })
      );
    }
  }

  return runs;
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: {
        color: "CBD5E1",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 21, // 10.5pt
        color: ACCENT_HEX,
        font: FONT_FAMILY,
      }),
    ],
  });
}

function safeExternalUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export async function exportResumeToDocx(
  data: ResumeData,
  tailoredContent: TailoredResumeContent | null,
  filenameSlug?: string
): Promise<void> {
  const content = tailoredContent || MASTER_RESUME_CONTENT;
  const fullName = `${data.profile.firstName} ${data.profile.lastName}`.trim() || "Shayan Esfahanizadeh";
  const educationList = data.education.length > 0 ? data.education : DEFAULT_RESUME_DATA.education;

  const contactChildren: (TextRun | ExternalHyperlink)[] = [];
  const pushSep = () => {
    if (contactChildren.length > 0) {
      contactChildren.push(
        new TextRun({
          text: "  |  ",
          size: 18,
          color: "94A3B8",
          font: FONT_FAMILY,
        })
      );
    }
  };

  if (data.contact.location) {
    contactChildren.push(
      new TextRun({ text: data.contact.location, size: 18, color: TEXT_MUTED, font: FONT_FAMILY })
    );
  }
  if (data.contact.email) {
    pushSep();
    contactChildren.push(
      new ExternalHyperlink({
        link: `mailto:${data.contact.email}`,
        children: [
          new TextRun({
            text: data.contact.email,
            size: 18,
            color: ACCENT_HEX,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }
  if (data.contact.phone) {
    pushSep();
    contactChildren.push(
      new TextRun({ text: data.contact.phone, size: 18, color: TEXT_MUTED, font: FONT_FAMILY })
    );
  }
  const linkedinUrl = safeExternalUrl(data.contact.linkedin.url);
  if (linkedinUrl) {
    pushSep();
    contactChildren.push(
      new ExternalHyperlink({
        link: linkedinUrl,
        children: [
          new TextRun({
            text: `LinkedIn (${data.contact.linkedin.handle})`,
            size: 18,
            color: ACCENT_HEX,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }
  const websiteUrl = safeExternalUrl(data.contact.website.url);
  if (websiteUrl) {
    pushSep();
    contactChildren.push(
      new ExternalHyperlink({
        link: websiteUrl,
        children: [
          new TextRun({
            text: data.contact.website.handle,
            size: 18,
            color: ACCENT_HEX,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  const children: Paragraph[] = [
    // Candidate Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: fullName,
          bold: true,
          size: 36, // 18pt
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        }),
      ],
    }),
    // Headline Role & Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: content.headlineRole,
          bold: true,
          size: 22, // 11pt
          color: ACCENT_HEX,
          font: FONT_FAMILY,
        }),
        ...(content.headlineSubtitle
          ? [
              new TextRun({
                text: `  |  ${content.headlineSubtitle}`,
                size: 20,
                color: TEXT_MUTED,
                font: FONT_FAMILY,
              }),
            ]
          : []),
      ],
    }),
    // Contact Row
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: contactChildren,
    }),

    // Professional Summary
    sectionHeading("Professional Summary"),
    new Paragraph({
      spacing: { after: 100, line: 276 },
      children: parseMarkdownRuns(content.summary, { size: 20, color: TEXT_BODY }),
    }),

    // Core Competencies / Skills
    sectionHeading("Core Competencies & Technical Skills"),
    ...content.skillGroups.map(
      (group) =>
        new Paragraph({
          spacing: { after: 55, line: 260 },
          children: [
            new TextRun({
              text: `${group.category}: `,
              bold: true,
              size: 19,
              color: TEXT_PRIMARY,
              font: FONT_FAMILY,
            }),
            new TextRun({
              text: group.items.join(" • "),
              size: 19,
              color: TEXT_BODY,
              font: FONT_FAMILY,
            }),
          ],
        })
    ),

    // Professional Experience
    sectionHeading("Professional Experience"),
  ];

  for (const exp of content.experiences) {
    const canonical = CANONICAL_EXPERIENCE_META[exp.id];
    const fallback = data.experiences.find((item) => item.id === exp.id);
    const company = canonical?.company || fallback?.company || exp.id.toUpperCase();
    const period = canonical?.period || fallback?.period || "";
    const location = canonical?.location || fallback?.location || "";

    // Role + Right-aligned Period
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: exp.role,
            bold: true,
            size: 21, // 10.5pt
            color: TEXT_PRIMARY,
            font: FONT_FAMILY,
          }),
          new TextRun({
            text: `  —  ${company}`,
            bold: true,
            size: 20,
            color: ACCENT_HEX,
            font: FONT_FAMILY,
          }),
          ...(period
            ? [
                new TextRun({
                  text: `\t${period}`,
                  bold: true,
                  size: 19,
                  color: TEXT_MUTED,
                  font: FONT_FAMILY,
                }),
              ]
            : []),
        ],
      })
    );

    if (location) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: location,
              italics: true,
              size: 18,
              color: TEXT_MUTED,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    if (exp.intro?.trim()) {
      children.push(
        new Paragraph({
          spacing: { after: 55, line: 260 },
          children: parseMarkdownRuns(exp.intro, { size: 19, color: TEXT_MUTED, italics: true }),
        })
      );
    }

    for (const bullet of exp.bullets) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 45, line: 264 },
          children: parseMarkdownRuns(bullet, { size: 19, color: TEXT_BODY }),
        })
      );
    }
  }

  // Selected Projects
  if (content.projects.length > 0) {
    children.push(sectionHeading("Selected Projects & Initiatives"));
    for (const proj of content.projects) {
      const linkMeta = CANONICAL_PROJECT_URLS[proj.id];
      const fallbackProj = data.projects.find((p) => p.id === proj.id);
      const projUrl = safeExternalUrl(linkMeta?.url || fallbackProj?.url);
      const projLabel = linkMeta?.label || fallbackProj?.url || "";

      const projChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: proj.title,
          bold: true,
          size: 19,
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        }),
      ];

      if (projUrl && projLabel) {
        projChildren.push(
          new TextRun({ text: " (", size: 18, color: TEXT_MUTED, font: FONT_FAMILY }),
          new ExternalHyperlink({
            link: projUrl,
            children: [
              new TextRun({
                text: projLabel,
                size: 18,
                color: ACCENT_HEX,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new TextRun({ text: ")", size: 18, color: TEXT_MUTED, font: FONT_FAMILY })
        );
      }

      projChildren.push(
        new TextRun({ text: " — ", size: 19, color: TEXT_MUTED, font: FONT_FAMILY }),
        ...parseMarkdownRuns(proj.description, { size: 19, color: TEXT_BODY })
      );

      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 55, line: 260 },
          children: projChildren,
        })
      );
    }
  }

  // Education
  children.push(sectionHeading("Education"));
  for (const edu of educationList) {
    children.push(
      new Paragraph({
        spacing: { before: 60, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: edu.school,
            bold: true,
            size: 20,
            color: TEXT_PRIMARY,
            font: FONT_FAMILY,
          }),
          ...(edu.period
            ? [
                new TextRun({
                  text: `\t${edu.period}`,
                  bold: true,
                  size: 19,
                  color: TEXT_MUTED,
                  font: FONT_FAMILY,
                }),
              ]
            : []),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({
            text: edu.degree,
            size: 19,
            color: TEXT_BODY,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  }

  // Certifications & Honors
  children.push(sectionHeading("Certifications & Honors"));
  children.push(
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "Top Award Winner — ",
          bold: true,
          size: 19,
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        }),
        new TextRun({
          text: "6th International Digital Health Congress (Delband Medicine 3.0 Wearable Ecosystem)",
          size: 19,
          color: TEXT_BODY,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "Knowledge-Based Enterprise & Presidential Innovation Fund Backing — ",
          bold: true,
          size: 19,
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        }),
        new TextRun({
          text: "Accredited startup scale-up leading to strategic acquisition by Hamrahe Aval (MCI)",
          size: 19,
          color: TEXT_BODY,
          font: FONT_FAMILY,
        }),
      ],
    }),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "Product Management & UX Certifications — ",
          bold: true,
          size: 19,
          color: TEXT_PRIMARY,
          font: FONT_FAMILY,
        }),
        new TextRun({
          text: "Uxcel Top 10 Global PM Mentor · Product Discovery, Agile & Analytics Foundations",
          size: 19,
          color: TEXT_BODY,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  const doc = new Document({
    creator: fullName,
    title: `${fullName} - Resume`,
    description: "ATS-Friendly Resume exported in standard single-column DOCX format",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const safeSlug = (filenameSlug || "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 42);
  const fileName = safeSlug
    ? `Shayan_Esfahanizadeh_Resume_${safeSlug}_ATS.docx`
    : "Shayan_Esfahanizadeh_Resume_ATS.docx";

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
