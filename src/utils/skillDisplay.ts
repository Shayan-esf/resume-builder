export interface CuratedSkillRow {
  category: string;
  visibleItems: string[];
}

export const BOLD_REPRESENTATIVE_AI_SKILLS = [
  "AI Rapid Prototyping",
  "Custom AI Agent & Skills",
] as const;

const BOLD_SKILL_SET = new Set<string>([
  "ai rapid prototyping",
  "ai prototyping",
  "custom ai agent & skills",
  "custom ai agent skills",
  "ai agent skills & workflows",
  "ai workflows & agent skills",
  "agent skills & ai workflows",
]);

const EXCLUDED_SKILLS = new Set<string>(["confluence"]);

export function isBoldHighlightSkill(skill: string): boolean {
  const normalized = skill.trim().toLowerCase();
  return BOLD_SKILL_SET.has(normalized);
}

export const DEFAULT_CURATED_SKILLS: CuratedSkillRow[] = [
  {
    category: "Product Strategy",
    visibleItems: [
      "Product Discovery",
      "Product Building",
      "Technical PRDs",
      "Roadmap Planning",
      "User Research",
      "OKRs",
    ],
  },
  {
    category: "Languages & Frameworks",
    visibleItems: [
      "Custom AI Agent & Skills",
      "TypeScript",
      "React",
      "Angular",
      "RESTful APIs",
      "SQL",
    ],
  },
  {
    category: "Analytics & Business",
    visibleItems: [
      "Funnel Optimization",
      "A/B Testing",
      "Google Analytics 4",
      "Microsoft Clarity",
    ],
  },
  {
    category: "Tools & Platforms",
    visibleItems: [
      "Jira",
      "Figma",
      "Notion",
      "Azure DevOps",
      "Git",
      "CI/CD",
    ],
  },
];

export const AI_WORKFLOW_ATS_KEYWORDS: string[] = [
  "Custom AI Agents",
  "Custom Agent Skills",
  "AI Agent Skills",
  "AI Workflows",
  "Markdown",
  "Markdown Specs",
  "Spec-Driven Development",
  "SKILL.md",
  "Agent Skills",
  "AI Skill Authoring",
  "Prompt Engineering",
  "Context Engineering",
  "AI Prototyping",
  "Rapid MVP Prototyping",
  "Vibe Coding",
  "AI-Assisted Development",
  "LLM Workflows",
  "AI Agents",
  "AI Product Building",
  "0-to-1 Startup Building",
  "0-to-1 Product Building",
  "Venture Building",
  "MCP",
  "Cursor",
  "Claude Code",
];

const CORE_HIDDEN_ATS_KEYWORDS: string[] = [
  "PRD Writing",
  "Agile/Scrum",
  "GTM Strategy",
  "User Research",
  "Jobs-to-be-Done",
  "JTBD",
  "Lean Validation",
  "Wizard of Oz",
  "Prioritization",
  "Growth Hacking",
  "Stakeholder Management",
  "JavaScript",
  "Tailwind CSS",
  "Bootstrap",
  "RxJS",
  "Service Workers",
  "Unit Testing",
  "Conversion Funnel Optimization",
  "Customer Acquisition Cost",
  "CAC",
  "CAC Reduction",
  "Internal Rate of Return",
  "IRR",
  "IRR Modeling",
  "Swagger",
  "GitLab",
  "Postman",
];

/**
 * Supplementary skills that the candidate genuinely has (see docs/Skills.md) but that
 * are deliberately kept OUT of the visible skill rows so the resume stays uncluttered.
 * They are rendered as a white, 1px, clipped text layer: an ATS / text parser reads
 * them, a human reader never sees them.
 */
export const SUPPLEMENTARY_ATS_KEYWORDS: string[] = [
  // Product, strategy & delivery
  "Product Management",
  "Product Strategy",
  "Product Development",
  "Product Delivery",
  "Product Roadmap",
  "Product Requirements Document",
  "PRD",
  "Product Analytics",
  "Product Marketing",
  "Root Cause Analysis",
  "User Story Mapping",
  "Value Propositions",
  "Project Management",
  "Objectives and Key Results",
  "Agile",
  "Scrum",
  "Problem Solving",
  "Design Thinking",
  "Go-to-Market",
  "GTM",
  "MVP",
  "Product Vision",
  "Product Discovery & Dev Handoff",
  // UX & research
  "UX Research",
  "User Experience",
  "User Interface Design",
  "Wireframing",
  "Prototyping",
  "User Journey Mapping",
  // Domain
  "Digital Health",
  "Health-Tech",
  "Wearables",
  "B2B",
  "B2C",
  "Freemium",
  "Subscription",
  "Gamification",
  "Design System",
  "User-Generated Content",
  "UGC",
  "Mini-App",
  "Telegram Bot",
  "Messaging Bot",
  // Engineering
  "Front-End Development",
  "Frontend Development",
  "React.js",
  "React",
  "Angular",
  "REST APIs",
  "RESTful APIs",
  "Sass",
  "SCSS",
  "Angular Material",
  "HTML5",
  "CSS3",
  "OOP",
  "Software Architecture",
  "Clean Code",
  "Computer Science",
  "Test-Driven Development",
  "TDD",
  "Code Review",
  "SQL",
  "MongoDB",
  "Node.js",
  "Express.js",
  "Progressive Web Applications",
  "PWA",
  "CI/CD",
  "Git",
  "Azure DevOps",
  "Jira",
  "Notion",
  // Analytics, growth & business
  "Google Analytics",
  "Google Analytics 4",
  "Microsoft Clarity",
  "Looker Studio",
  "A/B Testing",
  "Conversion Rate Optimization",
  "CRO",
  "Funnel Optimization",
  "KPI",
  "SEO",
  "On-Page SEO",
  "Performance Marketing",
  // AI
  "AI Agents",
  "AI Workflows",
  "AI Product Management",
  "LLM",
  "MCP",
  "Prompt Engineering",
  "Spec-Driven Development",
  "Markdown",
  "Vibe Coding",
  "AI Prototyping",
  "Custom Agents",
  "Agent Skills",
];

const VISIBLE_SKILL_SET = new Set(
  DEFAULT_CURATED_SKILLS.flatMap((row) => row.visibleItems.map((item) => item.toLowerCase()))
);

export const DEFAULT_HIDDEN_ATS_KEYWORDS: string[] = (() => {
  const collected: string[] = [];
  const seen = new Set<string>();
  for (const keyword of [
    ...AI_WORKFLOW_ATS_KEYWORDS,
    ...CORE_HIDDEN_ATS_KEYWORDS,
    ...SUPPLEMENTARY_ATS_KEYWORDS,
  ]) {
    const lower = keyword.toLowerCase();
    if (seen.has(lower) || VISIBLE_SKILL_SET.has(lower) || EXCLUDED_SKILLS.has(lower)) continue;
    seen.add(lower);
    collected.push(keyword);
  }
  return collected;
})();
const CURATED_PRIORITY_SKILLS = new Set(
  DEFAULT_CURATED_SKILLS.flatMap((row) =>
    row.visibleItems.map((item) => item.toLowerCase())
  )
);

function getMaxVisibleForCategory(category: string): number {
  const lower = category.toLowerCase();
  if (lower.includes("analytics") || lower.includes("business") || lower.includes("data")) return 4;
  if (lower.includes("tool") || lower.includes("platform")) return 6;
  return 6;
}

function ensureVisibleSkill(
  row: CuratedSkillRow,
  skill: string,
  maxVisible: number,
  hiddenSet: Set<string>,
  insertIndex = 0
): void {
  const targetLower = skill.toLowerCase();
  if (row.visibleItems.some((item) => item.toLowerCase() === targetLower)) {
    return;
  }

  // If full, move the last non-bold, non-essential item to the white ATS layer
  if (row.visibleItems.length >= maxVisible) {
    for (let i = row.visibleItems.length - 1; i >= 0; i--) {
      const candidate = row.visibleItems[i];
      const candLower = candidate.toLowerCase();
      if (
        !isBoldHighlightSkill(candidate) &&
        candLower !== "startup building" &&
        candLower !== "product building" &&
        candLower !== "product discovery"
      ) {
        row.visibleItems.splice(i, 1);
        hiddenSet.add(candidate);
        break;
      }
    }
  }

  const clampedIdx = Math.min(Math.max(0, insertIndex), row.visibleItems.length);
  row.visibleItems.splice(clampedIdx, 0, skill);
}

export function partitionTailoredSkills(
  groups: { category: string; items: string[] }[]
): { rows: CuratedSkillRow[]; hiddenAtsKeywords: string[] } {
  const hiddenSet = new Set<string>();
  const visibleLowerSet = new Set<string>();

  const rows: CuratedSkillRow[] = groups.map((group) => {
    const cleanedEntries = group.items
      .map((raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        if (EXCLUDED_SKILLS.has(trimmed.toLowerCase())) return null;

        const parenMatches = Array.from(trimmed.matchAll(/\(([^)]+)\)/g))
          .map((m) => m[1].trim())
          .filter(Boolean);
        const withoutParens = trimmed
          .replace(/\s*\([^)]*\)/g, "")
          .replace(/\s{2,}/g, " ")
          .trim();

        if (EXCLUDED_SKILLS.has(withoutParens.toLowerCase())) return null;

        if (parenMatches.length > 0) {
          hiddenSet.add(trimmed);
          parenMatches.forEach((p) => hiddenSet.add(p));
        }

        let display = withoutParens || trimmed;
        // Normalize older label variants to the exact requested phrasing
        if (
          display.toLowerCase() === "custom ai agent skills" ||
          display.toLowerCase() === "ai agent skills & workflows"
        ) {
          display = "Custom AI Agent & Skills";
        }

        const isBold = isBoldHighlightSkill(display) || isBoldHighlightSkill(trimmed);
        const isPriority =
          isBold ||
          CURATED_PRIORITY_SKILLS.has(display.toLowerCase()) ||
          CURATED_PRIORITY_SKILLS.has(trimmed.toLowerCase());
        return { raw: trimmed, display, hasParens: parenMatches.length > 0, isPriority, isBold };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const maxVisible = getMaxVisibleForCategory(group.category);
    const sortedForDisplay = [...cleanedEntries].sort((a, b) => {
      if (a.isBold !== b.isBold) return a.isBold ? -1 : 1;
      if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
      if (a.hasParens !== b.hasParens) return a.hasParens ? 1 : -1;
      return 0;
    });

    const selectedDisplays = new Set(
      sortedForDisplay.slice(0, maxVisible).map((entry) => entry.display.toLowerCase())
    );

    const visibleItems: string[] = [];
    for (const entry of cleanedEntries) {
      const lower = entry.display.toLowerCase();
      if (
        selectedDisplays.has(lower) &&
        visibleItems.length < maxVisible &&
        !visibleItems.some((v) => v.toLowerCase() === lower)
      ) {
        visibleItems.push(entry.display);
      } else {
        hiddenSet.add(entry.display);
        if (entry.raw !== entry.display) hiddenSet.add(entry.raw);
      }
    }

    return {
      category: group.category,
      visibleItems,
    };
  });

  // Guarantee requested visible skills appear even on previously saved clones
  if (rows.length > 0) {
    const strategyRow =
      rows.find((r) => /product|strategy/i.test(r.category)) || rows[0];
    const techRow =
      rows.find((r) => /technical|architecture|engineering/i.test(r.category)) ||
      rows[1] ||
      rows[0];

    ensureVisibleSkill(
      techRow,
      "Custom AI Agent & Skills",
      getMaxVisibleForCategory(techRow.category),
      hiddenSet,
      0
    );
  }

  for (const row of rows) {
    for (const item of row.visibleItems) {
      visibleLowerSet.add(item.toLowerCase());
    }
  }

  // Always preserve the verified ATS keyword pool (AI workflows, Markdown, agents, engineering,
  // analytics, domain terms) invisibly so tailored clones keep full keyword coverage
  for (const kw of DEFAULT_HIDDEN_ATS_KEYWORDS) {
    if (!visibleLowerSet.has(kw.toLowerCase()) && !EXCLUDED_SKILLS.has(kw.toLowerCase())) {
      hiddenSet.add(kw);
    }
  }

  return {
    rows,
    hiddenAtsKeywords: Array.from(hiddenSet).filter(
      (kw) => !EXCLUDED_SKILLS.has(kw.toLowerCase()) && !visibleLowerSet.has(kw.toLowerCase())
    ),
  };
}
