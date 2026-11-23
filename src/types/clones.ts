import { ResumeData } from "./resume";
import { TailoredResumeContent } from "./tailoring";
import { BaseTemplateType, TemplateCustomization, TemplateId } from "./templates";

export type CloneGroupKey =
  | "job-application"
  | "role-variant"
  | "language-region"
  | "experiment"
  | "archived";

export type CloneStatusBadge =
  | "draft"
  | "ready"
  | "sent"
  | "interview"
  | "favorite";

export interface CloneChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  changesSummaryFa?: string[];
  previousSnapshot?: {
    tailoredSnapshot?: TailoredResumeContent;
    resumeData?: ResumeData;
  };
  reverted?: boolean;
}

export type CloneChangelogAction =
  | "created"
  | "inline-edit"
  | "chat-edit"
  | "manual-save"
  | "meta-edit"
  | "restored";

export interface CloneChangelogSnapshot {
  name: string;
  group: string;
  status: CloneStatusBadge;
  badges: string[];
  notes?: string;
  baseType: BaseTemplateType;
  customization: TemplateCustomization;
  customHtml?: string;
  resumeData: ResumeData;
  tailoredSnapshot?: TailoredResumeContent;
}

export interface CloneChangelogEntry {
  id: string;
  revision: number;
  action: CloneChangelogAction;
  titleFa: string;
  detailsFa?: string[];
  timestamp: number;
  snapshot: CloneChangelogSnapshot;
}

export interface ResumeClone {
  id: string;
  name: string;
  notes?: string;
  group: string; // Built-in CloneGroupKey or user-defined custom group name
  status: CloneStatusBadge;
  badges: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: number;
  updatedAt: number;
  sourceTemplateId: TemplateId;
  sourceTemplateName: string;
  baseType: BaseTemplateType;
  customization: TemplateCustomization;
  customHtml?: string;
  resumeData: ResumeData;
  tailoredSnapshot?: TailoredResumeContent;
  targetCompany?: string;
  targetRole?: string;
  jobUrl?: string;
  appliedAt?: string;
  followUpDate?: string;
  interviewNotes?: string;
  atsScore?: number;
  chatHistory?: CloneChatMessage[];
  changelog?: CloneChangelogEntry[];
}

export interface CloneGroupMeta {
  key: CloneGroupKey;
  labelFa: string;
  shortFa: string;
  badgeClass: string;
  dotColor: string;
}

export const BUILT_IN_CLONE_GROUPS: CloneGroupMeta[] = [
  {
    key: "job-application",
    labelFa: "ارسال شغلی و شرکت‌ها",
    shortFa: "ارسال شغلی",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    dotColor: "#0284c7",
  },
  {
    key: "role-variant",
    labelFa: "نسخه نقش و سمت",
    shortFa: "نسخه نقش",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dotColor: "#4f46e5",
  },
  {
    key: "language-region",
    labelFa: "بین‌المللی و منطقه‌ای",
    shortFa: "بین‌المللی",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    dotColor: "#0d9488",
  },
  {
    key: "experiment",
    labelFa: "تست و طراحی آزمایشی",
    shortFa: "آزمایشی",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    dotColor: "#d97706",
  },
  {
    key: "archived",
    labelFa: "بایگانی‌شده",
    shortFa: "بایگانی",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "#64748b",
  },
];

export const CLONE_STATUS_META: Record<
  CloneStatusBadge,
  { labelFa: string; badgeClass: string; accentHex: string }
> = {
  draft: {
    labelFa: "پیش‌نویس",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    accentHex: "#64748b",
  },
  ready: {
    labelFa: "آماده ارسال",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentHex: "#059669",
  },
  sent: {
    labelFa: "ارسال‌شده",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    accentHex: "#0284c7",
  },
  interview: {
    labelFa: "دعوت به مصاحبه",
    badgeClass: "bg-violet-50 text-violet-800 border-violet-200",
    accentHex: "#7c3aed",
  },
  favorite: {
    labelFa: "نسخه مرجع",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    accentHex: "#d97706",
  },
};

export const SUGGESTED_CLONE_BADGES: string[] = [
  "Remote",
  "B2B SaaS",
  "FinTech",
  "Senior PM",
  "Product Lead",
  "ATS Optimized",
  "۱ صفحه",
  "۲ صفحه",
  "بین‌المللی",
  "فوری",
];

export function getCloneGroupMeta(groupKey: string): {
  key: string;
  labelFa: string;
  shortFa: string;
  badgeClass: string;
  dotColor: string;
} {
  const found = BUILT_IN_CLONE_GROUPS.find((g) => g.key === groupKey);
  if (found) return found;
  return {
    key: groupKey,
    labelFa: groupKey,
    shortFa: groupKey,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "#475569",
  };
}
