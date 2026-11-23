import { ResumeData } from "@/types/resume";
import { MASTER_RESUME_CONTENT, TailoredResumeContent } from "@/types/tailoring";

export type EditableFieldTarget =
  | { kind: "headlineRole" }
  | { kind: "headlineSubtitle" }
  | { kind: "summary" }
  | { kind: "profileName" }
  | { kind: "contact"; field: "email" | "phone" | "location" | "website" | "linkedin" }
  | { kind: "skillGroup"; groupIndex: number }
  | { kind: "experienceRole"; expId: string }
  | { kind: "experienceIntro"; expId: string }
  | { kind: "experienceBullet"; expId: string; bulletIndex: number }
  | { kind: "experienceTags"; expId: string }
  | { kind: "projectTitle"; projectId: string }
  | { kind: "projectDescription"; projectId: string };

export interface EditableFieldDescriptor {
  target: EditableFieldTarget;
  labelFa: string;
  groupLabelFa: string;
  value: string;
  multiline: boolean;
  supportsBoldMarkdown?: boolean;
  key: string;
}

export function stripMarkdownBold(text: string): string {
  return (text || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function normalizeForMatch(text: string): string {
  return stripMarkdownBold(text)
    .toLowerCase()
    .replace(/[•·|—–\-:,.;!?()[\]{}"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlapScore(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (b.includes(a) && a.length >= 6) return 85 + Math.min(12, a.length / Math.max(b.length, 1) * 12);
  if (a.includes(b) && b.length >= 6) return 80 + Math.min(12, b.length / Math.max(a.length, 1) * 12);

  const tokensA = new Set(a.split(" ").filter((t) => t.length >= 2));
  const tokensB = new Set(b.split(" ").filter((t) => t.length >= 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let shared = 0;
  tokensA.forEach((t) => {
    if (tokensB.has(t)) shared++;
  });
  if (shared === 0) return 0;

  const precision = shared / tokensA.size;
  const recall = shared / tokensB.size;
  return Math.round(((2 * precision * recall) / (precision + recall)) * 75);
}

const EXP_COMPANY_LABELS: Record<string, string> = {
  tums: "TUMS (دانشگاه علوم پزشکی تهران)",
  mci: "MCI — Delband (همراه اول / دل‌بند)",
  uxcel: "Uxcel",
  ofoq: "Ofoq Dade (افق داده)",
};

export function getEditableFieldsList(
  content: TailoredResumeContent | null,
  data: ResumeData
): EditableFieldDescriptor[] {
  const c = content || MASTER_RESUME_CONTENT;
  const list: EditableFieldDescriptor[] = [];

  list.push({
    key: "profileName",
    target: { kind: "profileName" },
    labelFa: "نام و نام خانوادگی",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: `${data.profile.firstName} ${data.profile.lastName}`.trim(),
    multiline: false,
  });

  list.push({
    key: "headlineRole",
    target: { kind: "headlineRole" },
    labelFa: "عنوان شغلی اصلی (Headline Role)",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: c.headlineRole,
    multiline: false,
  });

  list.push({
    key: "headlineSubtitle",
    target: { kind: "headlineSubtitle" },
    labelFa: "زیرعنوان تخصصی (Subtitle)",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: c.headlineSubtitle,
    multiline: false,
  });

  list.push({
    key: "contact:email",
    target: { kind: "contact", field: "email" },
    labelFa: "ایمیل تماس",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: data.contact.email,
    multiline: false,
  });

  list.push({
    key: "contact:phone",
    target: { kind: "contact", field: "phone" },
    labelFa: "شماره تماس",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: data.contact.phone,
    multiline: false,
  });

  list.push({
    key: "contact:location",
    target: { kind: "contact", field: "location" },
    labelFa: "موقعیت مکانی",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: data.contact.location,
    multiline: false,
  });

  list.push({
    key: "contact:website",
    target: { kind: "contact", field: "website" },
    labelFa: "وب‌سایت / پورتفولیو",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: data.contact.website.handle,
    multiline: false,
  });

  list.push({
    key: "contact:linkedin",
    target: { kind: "contact", field: "linkedin" },
    labelFa: "لینکدین",
    groupLabelFa: "هدر و اطلاعات پایه",
    value: data.contact.linkedin.handle,
    multiline: false,
  });

  list.push({
    key: "summary",
    target: { kind: "summary" },
    labelFa: "خلاصه اجرایی (Summary / About)",
    groupLabelFa: "خلاصه پروفایل",
    value: c.summary,
    multiline: true,
    supportsBoldMarkdown: true,
  });

  c.skillGroups.forEach((group, groupIndex) => {
    list.push({
      key: `skillGroup:${groupIndex}`,
      target: { kind: "skillGroup", groupIndex },
      labelFa: `مهارت‌ها — ${group.category}`,
      groupLabelFa: "مهارت‌ها (Skills)",
      value: group.items.join(", "),
      multiline: true,
    });
  });

  c.experiences.forEach((exp) => {
    const compLabel = EXP_COMPANY_LABELS[exp.id] || exp.id;
    list.push({
      key: `expRole:${exp.id}`,
      target: { kind: "experienceRole", expId: exp.id },
      labelFa: `سمت شغلی — ${compLabel}`,
      groupLabelFa: `تجربه کاری: ${compLabel}`,
      value: exp.role,
      multiline: false,
    });
    list.push({
      key: `expIntro:${exp.id}`,
      target: { kind: "experienceIntro", expId: exp.id },
      labelFa: `توضیح کوتاه نقش — ${compLabel}`,
      groupLabelFa: `تجربه کاری: ${compLabel}`,
      value: exp.intro,
      multiline: true,
      supportsBoldMarkdown: true,
    });
    exp.bullets.forEach((bullet, bulletIndex) => {
      list.push({
        key: `expBullet:${exp.id}:${bulletIndex}`,
        target: { kind: "experienceBullet", expId: exp.id, bulletIndex },
        labelFa: `بولت ${bulletIndex + 1} — ${compLabel}`,
        groupLabelFa: `تجربه کاری: ${compLabel}`,
        value: bullet,
        multiline: true,
        supportsBoldMarkdown: true,
      });
    });
    list.push({
      key: `expTags:${exp.id}`,
      target: { kind: "experienceTags", expId: exp.id },
      labelFa: `تگ‌های کلیدی — ${compLabel}`,
      groupLabelFa: `تجربه کاری: ${compLabel}`,
      value: exp.tags.join(", "),
      multiline: false,
    });
  });

  c.projects.forEach((proj) => {
    list.push({
      key: `projTitle:${proj.id}`,
      target: { kind: "projectTitle", projectId: proj.id },
      labelFa: `عنوان پروژه — ${proj.title}`,
      groupLabelFa: "پروژه‌ها",
      value: proj.title,
      multiline: false,
    });
    list.push({
      key: `projDesc:${proj.id}`,
      target: { kind: "projectDescription", projectId: proj.id },
      labelFa: `توضیحات پروژه — ${proj.title}`,
      groupLabelFa: "پروژه‌ها",
      value: proj.description,
      multiline: true,
      supportsBoldMarkdown: true,
    });
  });

  return list;
}

/**
 * Matches a double-clicked DOM element inside `#resume-content` to the closest
 * structured field in the active resume so users can edit any text in a modal.
 */
export function matchClickedElementToField(
  clickedEl: HTMLElement,
  content: TailoredResumeContent | null,
  data: ResumeData
): EditableFieldDescriptor {
  const fields = getEditableFieldsList(content, data);

  // Gather candidate text strings from the clicked element up to its block container (li, p, header, div)
  const candidates: string[] = [];
  let cursor: HTMLElement | null = clickedEl;
  let depth = 0;

  while (cursor && depth < 5 && cursor.id !== "resume-content") {
    const raw = (cursor.innerText || cursor.textContent || "").trim();
    if (raw && raw.length <= 1600) {
      candidates.push(raw);
    }
    const tag = cursor.tagName.toLowerCase();
    if (tag === "li" || tag === "p" || tag === "h1" || tag === "h2" || tag === "h3") {
      // Stop right after capturing the semantic text block so we don't match the whole section
      break;
    }
    cursor = cursor.parentElement;
    depth++;
  }

  let bestField = fields.find((f) => f.key === "summary") || fields[0];
  let bestScore = -1;

  for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
    const normCand = normalizeForMatch(candidates[cIdx]);
    if (!normCand || normCand.length < 2) continue;

    // Slight preference for the tightest semantic block (later if inline <strong> inside <li>)
    const blockBonus = cIdx === candidates.length - 1 ? 3 : 0;

    for (const field of fields) {
      const normVal = normalizeForMatch(field.value);
      if (!normVal) continue;

      let score = tokenOverlapScore(normCand, normVal);

      // Extra boost if matching a skill group where the label prefix is rendered alongside skills
      if (field.target.kind === "skillGroup") {
        const c = content || MASTER_RESUME_CONTENT;
        const cat = c.skillGroups[field.target.groupIndex]?.category || "";
        const combined = normalizeForMatch(`${cat} ${field.value}`);
        score = Math.max(score, tokenOverlapScore(normCand, combined));
      }

      // Extra boost for combined role | subtitle header line
      if (field.target.kind === "headlineRole" || field.target.kind === "headlineSubtitle") {
        if (normCand.includes(normVal) && normVal.length >= 4) {
          score = Math.max(score, 88);
        }
      }

      const finalScore = score + blockBonus;
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestField = field;
      }
    }
  }

  return bestField;
}
