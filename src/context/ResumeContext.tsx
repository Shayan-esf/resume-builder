import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_RESUME_DATA, ExperienceItem, ProjectItem, ResumeData } from "@/types/resume";
import { MASTER_RESUME_CONTENT, TailoredDraft, TailoredResumeContent } from "@/types/tailoring";
import {
  CloneChangelogAction,
  CloneChangelogEntry,
  CloneChangelogSnapshot,
  CloneChatMessage,
  CloneStatusBadge,
  ResumeClone,
} from "@/types/clones";
import {
  BASE_TYPE_LABELS,
  BaseTemplateType,
  BUILT_IN_TEMPLATES,
  DEFAULT_CUSTOMIZATION,
  ResumeTemplate,
  STARTER_CUSTOM_HTML_TEMPLATE,
  TemplateChangelogEntry,
  TemplateCustomization,
  TemplateId,
  TemplateSectionVisibility,
} from "@/types/templates";
import {
  cloneCustomization,
  computeNextVersion,
  customizationsEqual,
  getGradientForAccent,
  sanitizeImportedHtml,
} from "@/utils/templateTheme";

const MAX_CLONE_CHANGELOG = 20;
const MAX_TEMPLATE_CHANGELOG = 15;

function buildCloneSnapshot(c: {
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
}): CloneChangelogSnapshot {
  return {
    name: c.name,
    group: c.group,
    status: c.status,
    badges: [...c.badges],
    notes: c.notes,
    baseType: c.baseType,
    customization: cloneCustomization(c.customization),
    customHtml: c.customHtml,
    resumeData: JSON.parse(JSON.stringify(c.resumeData)),
    tailoredSnapshot: c.tailoredSnapshot ? JSON.parse(JSON.stringify(c.tailoredSnapshot)) : undefined,
  };
}

function appendCloneChangelog(
  clone: ResumeClone,
  action: CloneChangelogAction,
  titleFa: string,
  detailsFa?: string[]
): CloneChangelogEntry[] {
  const existing = Array.isArray(clone.changelog) ? clone.changelog : [];
  const nextRevision = existing.length > 0 ? Math.max(...existing.map((e) => e.revision)) + 1 : 1;
  const entry: CloneChangelogEntry = {
    id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    revision: nextRevision,
    action,
    titleFa,
    detailsFa: detailsFa && detailsFa.length > 0 ? detailsFa : undefined,
    timestamp: Date.now(),
    snapshot: buildCloneSnapshot(clone),
  };
  return [entry, ...existing].slice(0, MAX_CLONE_CHANGELOG);
}

function appendTemplateChangelog(
  tpl: ResumeTemplate,
  titleFa: string
): TemplateChangelogEntry[] {
  const existing = Array.isArray(tpl.changelog) ? tpl.changelog : [];
  const nextRevision = existing.length > 0 ? Math.max(...existing.map((e) => e.revision)) + 1 : 1;
  const entry: TemplateChangelogEntry = {
    id: `tchg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    revision: nextRevision,
    version: tpl.version,
    titleFa,
    timestamp: Date.now(),
    snapshot: {
      nameFa: tpl.nameFa,
      version: tpl.version,
      baseType: tpl.baseType,
      customization: cloneCustomization(tpl.customization),
      customHtml: tpl.customHtml,
      contentSnapshot: tpl.contentSnapshot ? JSON.parse(JSON.stringify(tpl.contentSnapshot)) : undefined,
      tailoredSnapshot: tpl.tailoredSnapshot ? JSON.parse(JSON.stringify(tpl.tailoredSnapshot)) : undefined,
    },
  };
  return [entry, ...existing].slice(0, MAX_TEMPLATE_CHANGELOG);
}

export interface QuickCloneOptions {
  name?: string;
  group?: string;
  status?: CloneStatusBadge;
  badges?: string[];
  notes?: string;
  /** Optional git-style commit message; stored as the changelog title of the new version. */
  commitMessage?: string;
  targetCompany?: string;
  targetRole?: string;
  switchToClone?: boolean;
}

export interface SaveTemplateOptions {
  nameFa: string;
  nameEn?: string;
  version: string;
  descriptionFa?: string;
  recommendedFor?: string;
  mode: "new" | "new-version" | "update-current";
  includeContentSnapshot?: boolean;
}

export interface ImportTemplateOptions {
  rawText: string;
  filename?: string;
  nameFa?: string;
  version?: string;
  baseType?: BaseTemplateType;
}

export type ArchiveSyncState = "idle" | "syncing" | "saved" | "local-only";

interface ArchiveTombstone {
  id: string;
  deletedAt: string;
}

interface ResumeContextType {
  data: ResumeData;
  isEditMode: boolean;
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectedExpId: string;
  setSelectedExpId: (id: string) => void;

  // Templates, Versioning, Import & Live Customizations
  allTemplates: ResumeTemplate[];
  customTemplates: ResumeTemplate[];
  activeTemplateId: TemplateId;
  activeTemplate: ResumeTemplate;
  liveBaseType: BaseTemplateType;
  liveCustomization: TemplateCustomization;
  liveCustomHtml: string;
  hasUnsavedCustomizations: boolean;
  effectiveTailoredContent: TailoredResumeContent | null;
  selectTemplate: (id: TemplateId) => void;
  setLiveBaseType: (baseType: BaseTemplateType) => void;
  updateLiveCustomization: (patch: Partial<TemplateCustomization>) => void;
  updateLiveSections: (patch: Partial<TemplateSectionVisibility>) => void;
  setLiveCustomHtml: (html: string) => void;
  resetLiveCustomizations: () => void;
  saveCustomizationsAsTemplate: (options: SaveTemplateOptions) => ResumeTemplate;
  createTemplateVersion: (sourceTemplateId: TemplateId, customName?: string, customVersion?: string) => ResumeTemplate | null;
  importTemplate: (options: ImportTemplateOptions) => { ok: boolean; template?: ResumeTemplate; error?: string };
  exportTemplateJSON: (templateId: TemplateId) => void;
  deleteCustomTemplate: (templateId: TemplateId) => void;
  renameCustomTemplate: (templateId: TemplateId, nameFa: string, version?: string) => void;
  restoreTemplateChangelog: (templateId: TemplateId, entryId: string) => void;

  // Temporary Job-Tailored Template state (ephemeral, never mutates master templates)
  tailoredDrafts: TailoredDraft[];
  activeDraftId: string | null;
  activeDraft: TailoredDraft | null;
  isTailorModalOpen: boolean;
  setIsTailorModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  addTailoredDraft: (draft: TailoredDraft) => void;
  selectTailoredDraft: (id: string | null) => void;
  updateActiveDraftContent: (updater: (prev: TailoredResumeContent) => TailoredResumeContent) => void;
  deleteTailoredDraft: (id: string) => void;
  clearAllTailoredDrafts: () => void;

  // Quick Clone & Clone Archive (persistent snapshots with groups, badges & filters)
  clones: ResumeClone[];
  activeCloneId: string | null;
  activeClone: ResumeClone | null;
  // Where the Clone Archive actually lives (disk store on the server, browser cache fallback)
  archiveSync: {
    state: ArchiveSyncState;
    storageDir: string | null;
    lastSavedAt: number | null;
  };
  isCloneArchiveOpen: boolean;
  setIsCloneArchiveOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isCloneChatOpen: boolean;
  setIsCloneChatOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  quickCloneCurrent: (options?: QuickCloneOptions) => ResumeClone;
  loadClone: (cloneId: string) => void;
  exitActiveClone: () => void;
  saveCurrentToActiveClone: () => void;
  updateActiveCloneContent: (
    updater: (prev: TailoredResumeContent) => TailoredResumeContent,
    options?: {
      profilePatch?: Partial<ResumeData["profile"]>;
      contactPatch?: Partial<ResumeData["contact"]>;
      autoCreateCloneIfNone?: boolean;
      changeTitleFa?: string;
      changeDetailsFa?: string[];
    }
  ) => void;
  applyCloneChatResult: (payload: {
    userText: string;
    assistantReplyFa: string;
    hasChanges: boolean;
    changesSummaryFa?: string[];
    updatedContent?: TailoredResumeContent;
    profilePatch?: Partial<ResumeData["profile"]>;
    contactPatch?: Partial<ResumeData["contact"]>;
  }) => void;
  revertCloneChatMessage: (cloneId: string, messageId: string) => void;
  clearCloneChatHistory: (cloneId: string) => void;
  restoreCloneChangelog: (cloneId: string, entryId: string) => void;
  duplicateClone: (cloneId: string) => ResumeClone | null;
  updateClone: (
    cloneId: string,
    patch: Partial<
      Pick<
        ResumeClone,
        | "name"
        | "notes"
        | "group"
        | "status"
        | "badges"
        | "isPinned"
        | "isArchived"
        | "targetCompany"
        | "targetRole"
        | "jobUrl"
        | "appliedAt"
        | "followUpDate"
        | "interviewNotes"
      >
    >
  ) => void;
  deleteClone: (cloneId: string) => void;
  convertCloneToTemplate: (cloneId: string) => ResumeTemplate | null;

  // Updates
  updateProfile: (fields: Partial<ResumeData["profile"]>) => void;
  updateContact: (fields: Partial<ResumeData["contact"]>) => void;
  updateExperience: (id: string, fields: Partial<ExperienceItem>) => void;
  addExperience: () => void;
  deleteExperience: (id: string) => void;
  addExperienceBullet: (expId: string, bulletText?: string) => void;
  updateExperienceBullet: (expId: string, bulletIndex: number, text: string) => void;
  deleteExperienceBullet: (expId: string, bulletIndex: number) => void;
  reorderExperienceBullets: (expId: string, fromIndex: number, toIndex: number) => void;
  addSkill: (skill: string) => void;
  updateSkill: (index: number, skill: string) => void;
  deleteSkill: (index: number) => void;
  updateProject: (id: string, fields: Partial<ProjectItem>) => void;
  addProject: () => void;
  deleteProject: (id: string) => void;
  resetToDefaults: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY = "shayan_resume_data_v2";
const CUSTOM_TEMPLATES_STORAGE_KEY = "shayan_custom_templates_v1";
const ACTIVE_TEMPLATE_STORAGE_KEY = "shayan_active_template_id_v1";
const CLONES_STORAGE_KEY = "shayan_resume_clones_v1";
const ACTIVE_CLONE_STORAGE_KEY = "shayan_active_clone_id_v1";
// The archive is persisted on the server's disk; localStorage stays the instant cache.
const ARCHIVES_API_BASE = "/api/archives";
const ARCHIVES_SYNC_DEBOUNCE_MS = 1200;
const ARCHIVES_POLL_MS = 30000;
const TEMP_DRAFTS_SESSION_KEY = "shayan_temp_tailored_drafts_v1";
const TEMP_ACTIVE_DRAFT_SESSION_KEY = "shayan_temp_active_draft_id_v1";

export function sanitizeResumeData(raw: any): ResumeData {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_RESUME_DATA;
  }

  const defaultContact = DEFAULT_RESUME_DATA.contact;
  const rawContact = raw.contact || {};

  const sanitizeLink = (rawLink: any, defaultLink: { handle: string; url: string }) => {
    if (!rawLink) return defaultLink;
    if (typeof rawLink === "string") {
      return { handle: rawLink, url: rawLink };
    }
    return {
      handle: typeof rawLink.handle === "string" ? rawLink.handle : defaultLink.handle,
      url: typeof rawLink.url === "string" ? rawLink.url : defaultLink.url,
    };
  };

  return {
    profile: {
      role: raw.profile?.role || DEFAULT_RESUME_DATA.profile.role,
      firstName: raw.profile?.firstName || DEFAULT_RESUME_DATA.profile.firstName,
      lastName: raw.profile?.lastName || DEFAULT_RESUME_DATA.profile.lastName,
      subtitle: raw.profile?.subtitle || DEFAULT_RESUME_DATA.profile.subtitle,
      about: raw.profile?.about || DEFAULT_RESUME_DATA.profile.about,
      quote: raw.profile?.quote ?? DEFAULT_RESUME_DATA.profile.quote,
    },
    contact: {
      email: rawContact.email || defaultContact.email,
      phone: rawContact.phone || defaultContact.phone,
      location: rawContact.location || defaultContact.location,
      linkedin: sanitizeLink(rawContact.linkedin, defaultContact.linkedin),
      uxcel: sanitizeLink(rawContact.uxcel, defaultContact.uxcel),
      website: sanitizeLink(rawContact.website, defaultContact.website),
    },
    skills: Array.isArray(raw.skills) && raw.skills.length > 0 ? raw.skills : DEFAULT_RESUME_DATA.skills,
    experiences: Array.isArray(raw.experiences) && raw.experiences.length > 0 ? raw.experiences : DEFAULT_RESUME_DATA.experiences,
    education: Array.isArray(raw.education) && raw.education.length > 0 ? raw.education : DEFAULT_RESUME_DATA.education,
    projects: Array.isArray(raw.projects) && raw.projects.length > 0 ? raw.projects : DEFAULT_RESUME_DATA.projects,
  };
}

function sanitizeCustomTemplate(raw: any): ResumeTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const validBaseTypes: BaseTemplateType[] = ["executive-ats-2page", "modern-figma", "minimal-ats", "custom-html"];
  const baseType: BaseTemplateType = validBaseTypes.includes(raw.baseType) ? raw.baseType : "executive-ats-2page";
  const customization = cloneCustomization(raw.customization);
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id : `tpl-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nameFa = typeof raw.nameFa === "string" && raw.nameFa.trim() ? raw.nameFa.trim() : raw.name || "قالب سفارشی";

  const baseTpl: ResumeTemplate = {
    id,
    baseType,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : nameFa,
    nameFa,
    descriptionFa:
      typeof raw.descriptionFa === "string" && raw.descriptionFa.trim()
        ? raw.descriptionFa.trim()
        : `قالب شخصی‌سازی‌شده بر پایه ${BASE_TYPE_LABELS[baseType].shortFa}`,
    badge: typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : raw.isImported ? "ایمپورتی" : "شخصی‌سازی‌شده",
    pages: typeof raw.pages === "number" ? raw.pages : BASE_TYPE_LABELS[baseType].pages,
    atsScore: typeof raw.atsScore === "string" ? raw.atsScore : baseType === "executive-ats-2page" ? "99/100" : "96/100",
    recommendedFor: typeof raw.recommendedFor === "string" && raw.recommendedFor.trim() ? raw.recommendedFor.trim() : "ارسال هدفمند و اختصاصی",
    accentColor: customization.accentColor,
    previewGradient: typeof raw.previewGradient === "string" ? raw.previewGradient : getGradientForAccent(customization.accentColor),
    version: typeof raw.version === "string" && raw.version.trim() ? raw.version.trim() : "v1.0",
    isBuiltIn: false,
    isImported: Boolean(raw.isImported),
    parentTemplateId: typeof raw.parentTemplateId === "string" ? raw.parentTemplateId : undefined,
    parentTemplateName: typeof raw.parentTemplateName === "string" ? raw.parentTemplateName : undefined,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    customization,
    customHtml: typeof raw.customHtml === "string" ? sanitizeImportedHtml(raw.customHtml) : undefined,
    contentSnapshot: raw.contentSnapshot ? sanitizeResumeData(raw.contentSnapshot) : undefined,
    tailoredSnapshot: raw.tailoredSnapshot && typeof raw.tailoredSnapshot === "object" ? raw.tailoredSnapshot : undefined,
    changelog: Array.isArray(raw.changelog) ? (raw.changelog as TemplateChangelogEntry[]).slice(0, MAX_TEMPLATE_CHANGELOG) : undefined,
  };

  if (!baseTpl.changelog || baseTpl.changelog.length === 0) {
    baseTpl.changelog = [
      {
        id: `tchg-init-${baseTpl.createdAt || Date.now()}`,
        revision: 1,
        version: baseTpl.version,
        titleFa: "نسخه پایه قالب",
        timestamp: baseTpl.createdAt || Date.now(),
        snapshot: {
          nameFa: baseTpl.nameFa,
          version: baseTpl.version,
          baseType: baseTpl.baseType,
          customization: cloneCustomization(baseTpl.customization),
          customHtml: baseTpl.customHtml,
          contentSnapshot: baseTpl.contentSnapshot ? JSON.parse(JSON.stringify(baseTpl.contentSnapshot)) : undefined,
          tailoredSnapshot: baseTpl.tailoredSnapshot ? JSON.parse(JSON.stringify(baseTpl.tailoredSnapshot)) : undefined,
        },
      },
    ];
  }

  return baseTpl;
}

function sanitizeClone(raw: any): ResumeClone | null {
  if (!raw || typeof raw !== "object") return null;
  const validBaseTypes: BaseTemplateType[] = ["executive-ats-2page", "modern-figma", "minimal-ats", "custom-html"];
  const validStatuses: CloneStatusBadge[] = ["draft", "ready", "sent", "interview", "favorite"];
  const baseType: BaseTemplateType = validBaseTypes.includes(raw.baseType) ? raw.baseType : "executive-ats-2page";
  const status: CloneStatusBadge = validStatuses.includes(raw.status) ? raw.status : "draft";

  const baseClone: ResumeClone = {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `clone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "کلون رزومه",
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    group: typeof raw.group === "string" && raw.group.trim() ? raw.group.trim() : "job-application",
    status,
    badges: Array.isArray(raw.badges)
      ? raw.badges.filter((b: unknown) => typeof b === "string" && b.trim()).map((b: string) => b.trim()).slice(0, 8)
      : [],
    isPinned: Boolean(raw.isPinned),
    isArchived: Boolean(raw.isArchived),
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    sourceTemplateId: typeof raw.sourceTemplateId === "string" ? raw.sourceTemplateId : "modern-figma",
    sourceTemplateName: typeof raw.sourceTemplateName === "string" ? raw.sourceTemplateName : BASE_TYPE_LABELS[baseType].shortFa,
    baseType,
    customization: cloneCustomization(raw.customization),
    customHtml: typeof raw.customHtml === "string" ? sanitizeImportedHtml(raw.customHtml) : undefined,
    resumeData: sanitizeResumeData(raw.resumeData),
    tailoredSnapshot: raw.tailoredSnapshot && typeof raw.tailoredSnapshot === "object" ? raw.tailoredSnapshot : undefined,
    targetCompany: typeof raw.targetCompany === "string" ? raw.targetCompany : undefined,
    targetRole: typeof raw.targetRole === "string" ? raw.targetRole : undefined,
    jobUrl: typeof raw.jobUrl === "string" ? raw.jobUrl : undefined,
    appliedAt: typeof raw.appliedAt === "string" ? raw.appliedAt : undefined,
    followUpDate: typeof raw.followUpDate === "string" ? raw.followUpDate : undefined,
    interviewNotes: typeof raw.interviewNotes === "string" ? raw.interviewNotes : undefined,
    atsScore: typeof raw.atsScore === "number" ? raw.atsScore : undefined,
    chatHistory: Array.isArray(raw.chatHistory) ? (raw.chatHistory as CloneChatMessage[]).slice(-60) : [],
    changelog: Array.isArray(raw.changelog) ? (raw.changelog as CloneChangelogEntry[]).slice(0, MAX_CLONE_CHANGELOG) : undefined,
  };

  if (!baseClone.changelog || baseClone.changelog.length === 0) {
    baseClone.changelog = [
      {
        id: `chg-init-${baseClone.createdAt}`,
        revision: 1,
        action: "created",
        titleFa: "نسخه پایه کلون",
        timestamp: baseClone.createdAt,
        snapshot: buildCloneSnapshot(baseClone),
      },
    ];
  }

  return baseClone;
}

function parseArchiveTombstones(raw: unknown): ArchiveTombstone[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is ArchiveTombstone =>
      Boolean(entry) &&
      typeof entry === "object" &&
      typeof (entry as ArchiveTombstone).id === "string" &&
      typeof (entry as ArchiveTombstone).deletedAt === "string",
  );
}

function sanitizeCloneList(raw: unknown): ResumeClone[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitizeClone).filter(Boolean) as ResumeClone[];
}

// Merges the disk store into local state without ever overwriting a newer local edit.
function mergeCloneLists(
  localClones: ResumeClone[],
  incomingClones: ResumeClone[],
  tombstones: ArchiveTombstone[] = [],
): ResumeClone[] {
  const deletedAtById = new Map<string, number>();
  for (const tombstone of tombstones) {
    const ms = Date.parse(tombstone.deletedAt);
    if (Number.isFinite(ms)) deletedAtById.set(tombstone.id, ms);
  }
  const isDeleted = (clone: ResumeClone) => {
    const deletedAt = deletedAtById.get(clone.id);
    return deletedAt !== undefined && (clone.updatedAt || 0) <= deletedAt;
  };

  const surviving = localClones.filter((clone) => !isDeleted(clone));
  const byId = new Map<string, ResumeClone>();
  for (const clone of surviving) byId.set(clone.id, clone);
  let changed = surviving.length !== localClones.length;

  for (const clone of incomingClones) {
    if (isDeleted(clone)) continue;
    const existing = byId.get(clone.id);
    if (!existing) {
      byId.set(clone.id, clone);
      changed = true;
      continue;
    }
    if ((clone.updatedAt || 0) > (existing.updatedAt || 0)) {
      byId.set(clone.id, clone);
      changed = true;
    }
  }

  if (!changed) return localClones;
  return Array.from(byId.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return sanitizeResumeData(parsed);
        }
      } catch (e) {
        console.warn("Failed to load saved resume data:", e);
      }
    }
    return DEFAULT_RESUME_DATA;
  });

  const [customTemplates, setCustomTemplates] = useState<ResumeTemplate[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map(sanitizeCustomTemplate).filter(Boolean) as ResumeTemplate[];
          }
        }
      } catch (e) {
        console.warn("Failed to load custom templates:", e);
      }
    }
    return [];
  });

  const allTemplates = useMemo(() => [...BUILT_IN_TEMPLATES, ...customTemplates], [customTemplates]);

  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ACTIVE_TEMPLATE_STORAGE_KEY);
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "modern-figma";
  });

  const activeTemplate = useMemo(() => {
    return allTemplates.find((t) => t.id === activeTemplateId) || BUILT_IN_TEMPLATES[1];
  }, [allTemplates, activeTemplateId]);

  const [liveBaseType, setLiveBaseTypeState] = useState<BaseTemplateType>(() => activeTemplate.baseType);
  const [liveCustomization, setLiveCustomization] = useState<TemplateCustomization>(() =>
    cloneCustomization(activeTemplate.customization)
  );
  const [liveCustomHtml, setLiveCustomHtml] = useState<string>(
    () => activeTemplate.customHtml || STARTER_CUSTOM_HTML_TEMPLATE
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState<string>(() => {
    return data.experiences[0]?.id || "ofoq-dade";
  });

  // Ephemeral session-only tailored drafts (Master templates stay fixed and finalized)
  const [tailoredDrafts, setTailoredDrafts] = useState<TailoredDraft[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(TEMP_DRAFTS_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore session storage errors
      }
    }
    return [];
  });

  const [activeDraftId, setActiveDraftId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem(TEMP_ACTIVE_DRAFT_SESSION_KEY) || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [isCloneArchiveOpen, setIsCloneArchiveOpen] = useState(false);
  const [isCloneChatOpen, setIsCloneChatOpen] = useState(false);

  // Persistent Clone Archive state
  const [clones, setClones] = useState<ResumeClone[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CLONES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map(sanitizeClone).filter(Boolean) as ResumeClone[];
          }
        }
      } catch (e) {
        console.warn("Failed to load resume clones:", e);
      }
    }
    return [];
  });

  const [activeCloneId, setActiveCloneId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(ACTIVE_CLONE_STORAGE_KEY) || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Disk-backed archive sync: the server keeps the authoritative copy and one
  // complete snapshot per change, so the same archive shows up on every device.
  const [archiveSyncState, setArchiveSyncState] = useState<ArchiveSyncState>("idle");
  const [archiveStorageDir, setArchiveStorageDir] = useState<string | null>(null);
  const [archiveLastSavedAt, setArchiveLastSavedAt] = useState<number | null>(null);
  const [archivePushTick, setArchivePushTick] = useState(0);
  const archiveHydratedRef = useRef(false);
  const clonesRef = useRef<ResumeClone[]>([]);
  clonesRef.current = clones;

  const activeClone = useMemo(() => {
    if (!activeCloneId) return null;
    return clones.find((c) => c.id === activeCloneId) || null;
  }, [activeCloneId, clones]);

  const activeDraft = useMemo(() => {
    if (!activeDraftId) return null;
    return tailoredDrafts.find((d) => d.id === activeDraftId) || null;
  }, [activeDraftId, tailoredDrafts]);

  const effectiveTailoredContent = useMemo<TailoredResumeContent | null>(() => {
    if (activeDraft) return activeDraft.content;
    if (activeClone?.tailoredSnapshot) return activeClone.tailoredSnapshot;
    if (activeTemplate.tailoredSnapshot) return activeTemplate.tailoredSnapshot;
    return null;
  }, [activeDraft, activeClone, activeTemplate]);

  const hasUnsavedCustomizations = useMemo(() => {
    if (liveBaseType !== activeTemplate.baseType) return true;
    if (!customizationsEqual(liveCustomization, activeTemplate.customization)) return true;
    if (
      liveBaseType === "custom-html" &&
      (liveCustomHtml || "").trim() !== (activeTemplate.customHtml || STARTER_CUSTOM_HTML_TEMPLATE).trim()
    ) {
      return true;
    }
    return false;
  }, [liveBaseType, liveCustomization, liveCustomHtml, activeTemplate]);

  // Persist custom templates & active template id
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
      } catch (e) {
        console.warn("Failed to persist custom templates:", e);
      }
    }
  }, [customTemplates]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_TEMPLATE_STORAGE_KEY, activeTemplateId);
      } catch {
        // ignore
      }
    }
  }, [activeTemplateId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CLONES_STORAGE_KEY, JSON.stringify(clones));
      } catch (e) {
        console.warn("Failed to persist resume clones:", e);
      }
    }
  }, [clones]);

  // Load the archive from the server's disk store once, then let the effects below
  // keep it in step. A static deploy without the API simply stays local-only.
  useEffect(() => {
    let cancelled = false;

    const hydrateFromDisk = async () => {
      try {
        const response = await fetch(ARCHIVES_API_BASE, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as {
          archives?: unknown;
          tombstones?: unknown;
          storageDir?: unknown;
        };
        if (cancelled) return;

        if (typeof payload.storageDir === "string") setArchiveStorageDir(payload.storageDir);
        const tombstones = parseArchiveTombstones(payload.tombstones);
        const serverClones = sanitizeCloneList(payload.archives);

        archiveHydratedRef.current = true;
        setClones((prev) => mergeCloneLists(prev, serverClones, tombstones));
        setArchiveSyncState(serverClones.length > 0 ? "saved" : "idle");
        // Pushes the browser copy when the disk store is still empty (one-time migration)
        // and settles any local edit that lost the race earlier.
        setArchivePushTick((tick) => tick + 1);
      } catch {
        if (cancelled) return;
        archiveHydratedRef.current = true;
        setArchiveSyncState("local-only");
      }
    };

    void hydrateFromDisk();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror every archive change to disk. The server only writes a new snapshot when
  // the content really changed, so a burst of edits costs one write, not one per keypress.
  useEffect(() => {
    if (typeof window === "undefined" || !archiveHydratedRef.current) return;

    const timer = window.setTimeout(async () => {
      setArchiveSyncState("syncing");
      try {
        const response = await fetch(ARCHIVES_API_BASE, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archives: clonesRef.current, reason: "auto-save" }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as { storageDir?: unknown; tombstones?: unknown };
        if (typeof payload.storageDir === "string") setArchiveStorageDir(payload.storageDir);
        if (Array.isArray(payload.tombstones)) {
          const tombstones = parseArchiveTombstones(payload.tombstones);
          setClones((prev) => mergeCloneLists(prev, [], tombstones));
        }
        setArchiveSyncState("saved");
        setArchiveLastSavedAt(Date.now());
      } catch {
        setArchiveSyncState("local-only");
      }
    }, ARCHIVES_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [clones, archivePushTick]);

  // Pull newer entries (and deletions) from disk so another device's work shows up here.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = window.setInterval(async () => {
      if (!archiveHydratedRef.current) return;
      try {
        const response = await fetch(ARCHIVES_API_BASE, { headers: { Accept: "application/json" } });
        if (!response.ok) return;
        const payload = (await response.json()) as { archives?: unknown; tombstones?: unknown };
        const tombstones = parseArchiveTombstones(payload.tombstones);
        const serverClones = sanitizeCloneList(payload.archives);
        setClones((prev) => mergeCloneLists(prev, serverClones, tombstones));
      } catch {
        // Offline: keep working against the browser cache.
      }
    }, ARCHIVES_POLL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (activeCloneId) {
          localStorage.setItem(ACTIVE_CLONE_STORAGE_KEY, activeCloneId);
        } else {
          localStorage.removeItem(ACTIVE_CLONE_STORAGE_KEY);
        }
      } catch {
        // ignore
      }
    }
  }, [activeCloneId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(TEMP_DRAFTS_SESSION_KEY, JSON.stringify(tailoredDrafts));
      } catch {
        // ignore
      }
    }
  }, [tailoredDrafts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (activeDraftId) {
          sessionStorage.setItem(TEMP_ACTIVE_DRAFT_SESSION_KEY, activeDraftId);
        } else {
          sessionStorage.removeItem(TEMP_ACTIVE_DRAFT_SESSION_KEY);
        }
      } catch {
        // ignore
      }
    }
  }, [activeDraftId]);

  // Save resume data to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn("Failed to persist resume data:", e);
      }
    }
  }, [data]);

  const selectTemplate = (id: TemplateId) => {
    const target = allTemplates.find((t) => t.id === id) || BUILT_IN_TEMPLATES[0];
    setActiveTemplateId(target.id);
    setLiveBaseTypeState(target.baseType);
    setLiveCustomization(cloneCustomization(target.customization));
    setLiveCustomHtml(target.customHtml || STARTER_CUSTOM_HTML_TEMPLATE);
    if (target.contentSnapshot) {
      setData(sanitizeResumeData(target.contentSnapshot));
    }
  };

  const setLiveBaseType = (baseType: BaseTemplateType) => {
    setLiveBaseTypeState(baseType);
    if (baseType === "custom-html" && !liveCustomHtml.trim()) {
      setLiveCustomHtml(STARTER_CUSTOM_HTML_TEMPLATE);
    }
  };

  const updateLiveCustomization = (patch: Partial<TemplateCustomization>) => {
    setLiveCustomization((prev) => ({
      ...prev,
      ...patch,
      sections: patch.sections ? { ...prev.sections, ...patch.sections } : prev.sections,
    }));
  };

  const updateLiveSections = (patch: Partial<TemplateSectionVisibility>) => {
    setLiveCustomization((prev) => ({
      ...prev,
      sections: { ...prev.sections, ...patch },
    }));
  };

  const resetLiveCustomizations = () => {
    setLiveBaseTypeState(activeTemplate.baseType);
    setLiveCustomization(cloneCustomization(activeTemplate.customization));
    setLiveCustomHtml(activeTemplate.customHtml || STARTER_CUSTOM_HTML_TEMPLATE);
  };

  const saveCustomizationsAsTemplate = (options: SaveTemplateOptions): ResumeTemplate => {
    const now = Date.now();
    const cleanedCustom = cloneCustomization(liveCustomization);
    const cleanedHtml = liveBaseType === "custom-html" ? sanitizeImportedHtml(liveCustomHtml) : undefined;
    const baseMeta = BASE_TYPE_LABELS[liveBaseType];

    if (options.mode === "update-current" && !activeTemplate.isBuiltIn) {
      const updatedBase: ResumeTemplate = {
        ...activeTemplate,
        baseType: liveBaseType,
        nameFa: options.nameFa.trim() || activeTemplate.nameFa,
        name: options.nameEn?.trim() || options.nameFa.trim() || activeTemplate.name,
        version: options.version.trim() || activeTemplate.version,
        descriptionFa: options.descriptionFa?.trim() || activeTemplate.descriptionFa,
        recommendedFor: options.recommendedFor?.trim() || activeTemplate.recommendedFor,
        pages: baseMeta.pages,
        accentColor: cleanedCustom.accentColor,
        previewGradient: getGradientForAccent(cleanedCustom.accentColor),
        updatedAt: now,
        customization: cleanedCustom,
        customHtml: cleanedHtml,
        contentSnapshot: options.includeContentSnapshot ? JSON.parse(JSON.stringify(data)) : activeTemplate.contentSnapshot,
        tailoredSnapshot: options.includeContentSnapshot
          ? effectiveTailoredContent
            ? JSON.parse(JSON.stringify(effectiveTailoredContent))
            : undefined
          : activeTemplate.tailoredSnapshot,
      };
      const updated: ResumeTemplate = {
        ...updatedBase,
        changelog: appendTemplateChangelog(updatedBase, `بروزرسانی قالب (${updatedBase.version})`),
      };
      setCustomTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return updated;
    }

    const parentId = options.mode === "new-version" ? activeTemplate.parentTemplateId || activeTemplate.id : undefined;
    const parentName = options.mode === "new-version" ? activeTemplate.parentTemplateName || activeTemplate.nameFa : undefined;
    const newId = `tpl-custom-${now}`;
    const newTemplateBase: ResumeTemplate = {
      id: newId,
      baseType: liveBaseType,
      name: options.nameEn?.trim() || options.nameFa.trim() || "Custom Template",
      nameFa: options.nameFa.trim() || "قالب شخصی‌سازی‌شده جدید",
      descriptionFa:
        options.descriptionFa?.trim() ||
        (options.mode === "new-version"
          ? `ورژن جدید ساخته‌شده بر پایه ${activeTemplate.nameFa}`
          : `قالب ساخته‌شده از شخصی‌سازی‌های رزومه (${baseMeta.shortFa})`),
      badge: options.mode === "new-version" ? `ورژن ${options.version.trim() || "v2.0"}` : "قالب سفارشی",
      pages: baseMeta.pages,
      atsScore: liveBaseType === "executive-ats-2page" ? "99/100" : liveBaseType === "minimal-ats" ? "100/100" : "95/100",
      recommendedFor: options.recommendedFor?.trim() || "ارسال اختصاصی و شخصی‌سازی‌شده",
      accentColor: cleanedCustom.accentColor,
      previewGradient: getGradientForAccent(cleanedCustom.accentColor),
      version: options.version.trim() || "v1.0",
      isBuiltIn: false,
      isImported: liveBaseType === "custom-html",
      parentTemplateId: parentId,
      parentTemplateName: parentName,
      createdAt: now,
      updatedAt: now,
      customization: cleanedCustom,
      customHtml: cleanedHtml,
      contentSnapshot: options.includeContentSnapshot ? JSON.parse(JSON.stringify(data)) : undefined,
      tailoredSnapshot:
        options.includeContentSnapshot && effectiveTailoredContent
          ? JSON.parse(JSON.stringify(effectiveTailoredContent))
          : undefined,
    };
    const newTemplate: ResumeTemplate = {
      ...newTemplateBase,
      changelog: appendTemplateChangelog(
        newTemplateBase,
        options.mode === "new-version"
          ? `ساخت ورژن ${newTemplateBase.version} از ${activeTemplate.nameFa}`
          : "ایجاد اولیه قالب شخصی‌سازی‌شده"
      ),
    };

    setCustomTemplates((prev) => [newTemplate, ...prev]);
    setActiveTemplateId(newTemplate.id);
    setLiveBaseTypeState(newTemplate.baseType);
    setLiveCustomization(cloneCustomization(newTemplate.customization));
    if (newTemplate.customHtml) {
      setLiveCustomHtml(newTemplate.customHtml);
    }
    return newTemplate;
  };

  const createTemplateVersion = (
    sourceTemplateId: TemplateId,
    customName?: string,
    customVersion?: string
  ): ResumeTemplate | null => {
    const source = allTemplates.find((t) => t.id === sourceTemplateId);
    if (!source) return null;

    const now = Date.now();
    const rootId = source.parentTemplateId || source.id;
    const rootName = source.parentTemplateName || source.nameFa;
    const nextVersion = customVersion?.trim() || computeNextVersion(source.version, allTemplates, rootId);
    const versionedName = customName?.trim() || `${rootName} (${nextVersion})`;

    const forkedBase: ResumeTemplate = {
      ...source,
      id: `tpl-ver-${now}`,
      name: `${source.name} ${nextVersion}`,
      nameFa: versionedName,
      badge: `ورژن ${nextVersion}`,
      version: nextVersion,
      isBuiltIn: false,
      parentTemplateId: rootId,
      parentTemplateName: rootName,
      createdAt: now,
      updatedAt: now,
      customization: cloneCustomization(source.customization),
      customHtml: source.customHtml,
      contentSnapshot: source.contentSnapshot ? JSON.parse(JSON.stringify(source.contentSnapshot)) : undefined,
      tailoredSnapshot: source.tailoredSnapshot ? JSON.parse(JSON.stringify(source.tailoredSnapshot)) : undefined,
      changelog: [],
    };
    const forked: ResumeTemplate = {
      ...forkedBase,
      changelog: appendTemplateChangelog(forkedBase, `ایجاد ورژن ${nextVersion} از «${source.nameFa}»`),
    };

    setCustomTemplates((prev) => [forked, ...prev]);
    setActiveTemplateId(forked.id);
    setLiveBaseTypeState(forked.baseType);
    setLiveCustomization(cloneCustomization(forked.customization));
    setLiveCustomHtml(forked.customHtml || STARTER_CUSTOM_HTML_TEMPLATE);
    return forked;
  };

  const importTemplate = (
    options: ImportTemplateOptions
  ): { ok: boolean; template?: ResumeTemplate; error?: string } => {
    const trimmed = options.rawText.trim();
    if (!trimmed) {
      return { ok: false, error: "محتوای قالب نمی‌تواند خالی باشد." };
    }

    const now = Date.now();
    const isHtmlFile =
      (options.filename && /\.(html?|svg)$/i.test(options.filename)) ||
      (trimmed.startsWith("<") && !trimmed.startsWith("{"));

    // 1. JSON Template Import
    if (!isHtmlFile) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== "object") {
          return { ok: false, error: "ساختار JSON معتبر نیست." };
        }

        // Handle either our native ResumeTemplate JSON or a ResumeData JSON
        const isResumeDataOnly =
          !parsed.baseType && !parsed.customization && (parsed.profile || parsed.experiences);

        const baseType: BaseTemplateType =
          options.baseType ||
          (["executive-ats-2page", "modern-figma", "minimal-ats", "custom-html"].includes(parsed.baseType)
            ? parsed.baseType
            : "executive-ats-2page");

        const customization = cloneCustomization(parsed.customization || DEFAULT_CUSTOMIZATION);
        const derivedName =
          options.nameFa?.trim() ||
          parsed.nameFa ||
          parsed.name ||
          (options.filename ? options.filename.replace(/\.[^.]+$/, "") : "قالب ایمپورت‌شده");

        const importedBase: ResumeTemplate = {
          id: `tpl-imp-${now}`,
          baseType,
          name: parsed.name || derivedName,
          nameFa: derivedName,
          descriptionFa:
            parsed.descriptionFa ||
            `قالب ایمپورت‌شده از فایل JSON (${BASE_TYPE_LABELS[baseType].shortFa})`,
          badge: "ایمپورتی JSON",
          pages: typeof parsed.pages === "number" ? parsed.pages : BASE_TYPE_LABELS[baseType].pages,
          atsScore: typeof parsed.atsScore === "string" ? parsed.atsScore : "97/100",
          recommendedFor: parsed.recommendedFor || "قالب سفارشی واردشده",
          accentColor: customization.accentColor,
          previewGradient: getGradientForAccent(customization.accentColor),
          version: options.version?.trim() || parsed.version || "v1.0",
          isBuiltIn: false,
          isImported: true,
          createdAt: now,
          updatedAt: now,
          customization,
          customHtml: typeof parsed.customHtml === "string" ? sanitizeImportedHtml(parsed.customHtml) : undefined,
          contentSnapshot: isResumeDataOnly
            ? sanitizeResumeData(parsed)
            : parsed.contentSnapshot
            ? sanitizeResumeData(parsed.contentSnapshot)
            : undefined,
          tailoredSnapshot: parsed.tailoredSnapshot || undefined,
          changelog: [],
        };
        const imported: ResumeTemplate = {
          ...importedBase,
          changelog: appendTemplateChangelog(
            importedBase,
            `ایمپورت قالب JSON (${options.filename || importedBase.version})`
          ),
        };

        setCustomTemplates((prev) => [imported, ...prev]);
        setActiveTemplateId(imported.id);
        setLiveBaseTypeState(imported.baseType);
        setLiveCustomization(cloneCustomization(imported.customization));
        if (imported.customHtml) setLiveCustomHtml(imported.customHtml);
        if (imported.contentSnapshot) setData(sanitizeResumeData(imported.contentSnapshot));

        return { ok: true, template: imported };
      } catch {
        // Fall through to HTML check if JSON.parse failed and it looks like markup
        if (!trimmed.includes("<")) {
          return {
            ok: false,
            error: "فرمت فایل قابل تشخیص نیست. لطفاً فایل قالب JSON یا کد HTML/CSS معتبر وارد کنید.",
          };
        }
      }
    }

    // 2. HTML / CSS Template Import
    const sanitized = sanitizeImportedHtml(trimmed);
    if (!sanitized.trim()) {
      return { ok: false, error: "محتوای HTML معتبر یافت نشد." };
    }

    const derivedName =
      options.nameFa?.trim() ||
      (options.filename ? options.filename.replace(/\.[^.]+$/, "") : "قالب HTML سفارشی");

    const customization = cloneCustomization({
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#0284c7",
    });

    const htmlTemplateBase: ResumeTemplate = {
      id: `tpl-html-${now}`,
      baseType: "custom-html",
      name: derivedName,
      nameFa: derivedName,
      descriptionFa: "قالب اختصاصی ایمپورت‌شده با کد HTML/CSS و اتصال زنده به فیلدهای رزومه",
      badge: "قالب HTML ایمپورتی",
      pages: 1,
      atsScore: "95/100",
      recommendedFor: "طراحی‌های اختصاصی و قالب‌های دلخواه",
      accentColor: customization.accentColor,
      previewGradient: "from-indigo-600 to-slate-900",
      version: options.version?.trim() || "v1.0",
      isBuiltIn: false,
      isImported: true,
      createdAt: now,
      updatedAt: now,
      customization,
      customHtml: sanitized,
      changelog: [],
    };
    const htmlTemplate: ResumeTemplate = {
      ...htmlTemplateBase,
      changelog: appendTemplateChangelog(
        htmlTemplateBase,
        `ایمپورت قالب HTML (${options.filename || htmlTemplateBase.version})`
      ),
    };

    setCustomTemplates((prev) => [htmlTemplate, ...prev]);
    setActiveTemplateId(htmlTemplate.id);
    setLiveBaseTypeState("custom-html");
    setLiveCustomization(customization);
    setLiveCustomHtml(sanitized);

    return { ok: true, template: htmlTemplate };
  };

  const exportTemplateJSON = (templateId: TemplateId) => {
    const tpl = allTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    const isCurrent = tpl.id === activeTemplateId;
    const payload: ResumeTemplate = {
      ...tpl,
      baseType: isCurrent ? liveBaseType : tpl.baseType,
      customization: isCurrent ? cloneCustomization(liveCustomization) : tpl.customization,
      customHtml: isCurrent && liveBaseType === "custom-html" ? liveCustomHtml : tpl.customHtml,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeSlug = tpl.name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 32) || "template";
    a.href = url;
    a.download = `resume_template_${safeSlug}_${tpl.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteCustomTemplate = (templateId: TemplateId) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (activeTemplateId === templateId) {
      const fallback = BUILT_IN_TEMPLATES[0];
      setActiveTemplateId(fallback.id);
      setLiveBaseTypeState(fallback.baseType);
      setLiveCustomization(cloneCustomization(fallback.customization));
    }
  };

  const renameCustomTemplate = (templateId: TemplateId, nameFa: string, version?: string) => {
    setCustomTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== templateId) return t;
        const nextTpl: ResumeTemplate = {
          ...t,
          nameFa: nameFa.trim() || t.nameFa,
          version: version?.trim() || t.version,
          updatedAt: Date.now(),
        };
        return {
          ...nextTpl,
          changelog: appendTemplateChangelog(nextTpl, `تغییر نام / ورژن به «${nextTpl.nameFa} (${nextTpl.version})»`),
        };
      })
    );
  };

  const restoreTemplateChangelog = (templateId: TemplateId, entryId: string) => {
    const target = customTemplates.find((t) => t.id === templateId);
    const entry = target?.changelog?.find((e) => e.id === entryId);
    if (!target || !entry) return;

    const snap = entry.snapshot;
    const restoredBase: ResumeTemplate = {
      ...target,
      nameFa: snap.nameFa,
      version: snap.version,
      baseType: snap.baseType,
      accentColor: snap.customization.accentColor,
      previewGradient: getGradientForAccent(snap.customization.accentColor),
      customization: cloneCustomization(snap.customization),
      customHtml: snap.customHtml,
      contentSnapshot: snap.contentSnapshot ? JSON.parse(JSON.stringify(snap.contentSnapshot)) : undefined,
      tailoredSnapshot: snap.tailoredSnapshot ? JSON.parse(JSON.stringify(snap.tailoredSnapshot)) : undefined,
      updatedAt: Date.now(),
    };
    const restored: ResumeTemplate = {
      ...restoredBase,
      changelog: appendTemplateChangelog(restoredBase, `بازگشت به نسخه #${entry.revision} (${entry.version})`),
    };

    setCustomTemplates((prev) => prev.map((t) => (t.id === templateId ? restored : t)));
    setActiveTemplateId(restored.id);
    setLiveBaseTypeState(restored.baseType);
    setLiveCustomization(cloneCustomization(restored.customization));
    setLiveCustomHtml(restored.customHtml || STARTER_CUSTOM_HTML_TEMPLATE);
    if (restored.contentSnapshot) {
      setData(sanitizeResumeData(restored.contentSnapshot));
    }
  };

  const addTailoredDraft = (draft: TailoredDraft) => {
    setTailoredDrafts((prev) => [draft, ...prev]);
    setActiveDraftId(draft.id);
  };

  const selectTailoredDraft = (id: string | null) => {
    setActiveDraftId(id);
  };

  const updateActiveDraftContent = (updater: (prev: TailoredResumeContent) => TailoredResumeContent) => {
    if (!activeDraftId) return;
    setTailoredDrafts((prev) =>
      prev.map((d) => (d.id === activeDraftId ? { ...d, content: updater(d.content) } : d))
    );
  };

  const deleteTailoredDraft = (id: string) => {
    setTailoredDrafts((prev) => prev.filter((d) => d.id !== id));
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  };

  const clearAllTailoredDrafts = () => {
    setTailoredDrafts([]);
    setActiveDraftId(null);
  };

  // Clone Archive operations
  const quickCloneCurrent = (options?: QuickCloneOptions): ResumeClone => {
    const now = Date.now();
    const baseMeta = BASE_TYPE_LABELS[liveBaseType];
    const nextNumber = clones.length + 1;
    const defaultName = activeDraft
      ? `${activeDraft.targetCompany} — ${activeDraft.targetRole}`
      : `${activeTemplate.nameFa} · کلون #${nextNumber}`;

    const autoBadges: string[] = [];
    if (options?.badges && options.badges.length > 0) {
      autoBadges.push(...options.badges.map((b) => b.trim()).filter(Boolean));
    } else {
      autoBadges.push(baseMeta.shortFa);
      if (activeDraft?.atsScoreAfter) {
        autoBadges.push(`ATS ${activeDraft.atsScoreAfter}`);
      } else if (hasUnsavedCustomizations) {
        autoBadges.push("شخصی‌سازی‌شده");
      }
      if (activeDraft) {
        autoBadges.push("بهینه‌سازی AI");
      }
    }

    const defaultGroup = options?.group?.trim()
      ? options.group.trim()
      : activeDraft
        ? "job-application"
        : hasUnsavedCustomizations
          ? "experiment"
          : "role-variant";

    const newCloneBase: ResumeClone = {
      id: `clone-${now}-${Math.random().toString(36).slice(2, 6)}`,
      name: options?.name?.trim() || defaultName,
      notes:
        options?.notes?.trim() ||
        options?.commitMessage?.trim() ||
        (activeDraft ? `کلون ساخته‌شده از نسخه بهینه‌شده برای ${activeDraft.targetCompany}` : undefined),
      group: defaultGroup,
      status: options?.status || (activeDraft ? "ready" : "draft"),
      badges: Array.from(new Set(autoBadges)).slice(0, 8),
      isPinned: false,
      isArchived: defaultGroup === "archived",
      createdAt: now,
      updatedAt: now,
      sourceTemplateId: activeTemplate.id,
      sourceTemplateName: activeTemplate.nameFa,
      baseType: liveBaseType,
      customization: cloneCustomization(liveCustomization),
      customHtml: liveBaseType === "custom-html" ? sanitizeImportedHtml(liveCustomHtml) : undefined,
      resumeData: JSON.parse(JSON.stringify(data)),
      tailoredSnapshot: JSON.parse(JSON.stringify(effectiveTailoredContent || MASTER_RESUME_CONTENT)),
      targetCompany: options?.targetCompany?.trim() || activeDraft?.targetCompany,
      targetRole: options?.targetRole?.trim() || activeDraft?.targetRole,
      atsScore: activeDraft?.atsScoreAfter,
      chatHistory: [],
      changelog: [],
    };
    const commitTitle = options?.commitMessage?.trim();
    const newClone: ResumeClone = {
      ...newCloneBase,
      changelog: appendCloneChangelog(
        newCloneBase,
        "created",
        commitTitle ? commitTitle : "ساخت اولیه کلون",
        [`قالب مبنا: ${activeTemplate.nameFa} (${baseMeta.shortFa})`]
      ),
    };

    setClones((prev) => [newClone, ...prev]);
    if (options?.switchToClone !== false) {
      setActiveDraftId(null);
      setActiveCloneId(newClone.id);
    }
    return newClone;
  };

  const loadClone = (cloneId: string) => {
    const target = clones.find((c) => c.id === cloneId);
    if (!target) return;
    setActiveDraftId(null);
    setActiveCloneId(target.id);
    setData(sanitizeResumeData(target.resumeData));
    const matchedTemplate = allTemplates.find((t) => t.id === target.sourceTemplateId);
    if (matchedTemplate) {
      setActiveTemplateId(matchedTemplate.id);
    }
    setLiveBaseTypeState(target.baseType);
    setLiveCustomization(cloneCustomization(target.customization));
    if (target.customHtml) {
      setLiveCustomHtml(target.customHtml);
    }
  };

  const exitActiveClone = () => {
    setActiveCloneId(null);
  };

  const saveCurrentToActiveClone = () => {
    if (!activeCloneId) return;
    const now = Date.now();
    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== activeCloneId) return c;
        const updatedBase: ResumeClone = {
          ...c,
          updatedAt: now,
          sourceTemplateId: activeTemplate.id,
          sourceTemplateName: activeTemplate.nameFa,
          baseType: liveBaseType,
          customization: cloneCustomization(liveCustomization),
          customHtml: liveBaseType === "custom-html" ? sanitizeImportedHtml(liveCustomHtml) : undefined,
          resumeData: JSON.parse(JSON.stringify(data)),
          tailoredSnapshot: JSON.parse(
            JSON.stringify(effectiveTailoredContent || c.tailoredSnapshot || MASTER_RESUME_CONTENT)
          ),
        };
        return {
          ...updatedBase,
          changelog: appendCloneChangelog(updatedBase, "manual-save", "ذخیره دستی وضعیت فعلی رزومه", [
            `قالب فعال: ${activeTemplate.nameFa}`,
          ]),
        };
      })
    );
  };

  const updateActiveCloneContent = (
    updater: (prev: TailoredResumeContent) => TailoredResumeContent,
    options?: {
      profilePatch?: Partial<ResumeData["profile"]>;
      contactPatch?: Partial<ResumeData["contact"]>;
      autoCreateCloneIfNone?: boolean;
      changeTitleFa?: string;
      changeDetailsFa?: string[];
    }
  ) => {
    const baseContent: TailoredResumeContent = JSON.parse(
      JSON.stringify(effectiveTailoredContent || MASTER_RESUME_CONTENT)
    );
    const nextContent = updater(baseContent);

    const nextResumeData: ResumeData = {
      ...data,
      profile: {
        ...data.profile,
        role: nextContent.headlineRole || data.profile.role,
        subtitle: nextContent.headlineSubtitle || data.profile.subtitle,
        about: nextContent.summary || data.profile.about,
        ...(options?.profilePatch || {}),
      },
      contact: {
        ...data.contact,
        ...(options?.contactPatch || {}),
      },
    };

    setData(nextResumeData);

    const changeTitle = options?.changeTitleFa || "ویرایش مستقیم متن رزومه";

    // 1. If a clone is active, persist immediately into that clone
    if (activeCloneId) {
      const now = Date.now();
      setClones((prev) =>
        prev.map((c) => {
          if (c.id !== activeCloneId) return c;
          const updatedBase: ResumeClone = {
            ...c,
            updatedAt: now,
            resumeData: JSON.parse(JSON.stringify(nextResumeData)),
            tailoredSnapshot: JSON.parse(JSON.stringify(nextContent)),
          };
          return {
            ...updatedBase,
            changelog: appendCloneChangelog(updatedBase, "inline-edit", changeTitle, options?.changeDetailsFa),
          };
        })
      );
      return;
    }

    // 2. If a temporary AI tailored draft is active (and not creating a new clone)
    if (activeDraftId && !options?.autoCreateCloneIfNone) {
      setTailoredDrafts((prev) =>
        prev.map((d) => (d.id === activeDraftId ? { ...d, content: nextContent } : d))
      );
      return;
    }

    // 3. Otherwise automatically create a saved clone so the edit persists safely without losing Master
    const created = quickCloneCurrent({
      name: `${activeTemplate.nameFa} · ویرایش #${clones.length + 1}`,
      group: "experiment",
      status: "draft",
      switchToClone: true,
    });
    const now = Date.now();
    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== created.id) return c;
        const updatedBase: ResumeClone = {
          ...c,
          updatedAt: now,
          resumeData: JSON.parse(JSON.stringify(nextResumeData)),
          tailoredSnapshot: JSON.parse(JSON.stringify(nextContent)),
        };
        return {
          ...updatedBase,
          changelog: appendCloneChangelog(updatedBase, "inline-edit", changeTitle, options?.changeDetailsFa),
        };
      })
    );
  };

  const applyCloneChatResult = (payload: {
    userText: string;
    assistantReplyFa: string;
    hasChanges: boolean;
    changesSummaryFa?: string[];
    updatedContent?: TailoredResumeContent;
    profilePatch?: Partial<ResumeData["profile"]>;
    contactPatch?: Partial<ResumeData["contact"]>;
  }) => {
    const now = Date.now();
    const prevContent = JSON.parse(JSON.stringify(effectiveTailoredContent || MASTER_RESUME_CONTENT));
    const prevResumeData = JSON.parse(JSON.stringify(data));

    // Ensure there is an active clone so every chat change is automatically saved in the archive
    let targetCloneId = activeCloneId;
    if (!targetCloneId) {
      const created = quickCloneCurrent({
        name: activeDraft
          ? `${activeDraft.targetCompany} — ${activeDraft.targetRole}`
          : `${activeTemplate.nameFa} · ویرایش چت #${clones.length + 1}`,
        group: activeDraft ? "job-application" : "experiment",
        status: "draft",
        switchToClone: true,
      });
      targetCloneId = created.id;
    }

    let nextContent: TailoredResumeContent = prevContent;
    let nextResumeData: ResumeData = prevResumeData;

    if (payload.hasChanges) {
      if (payload.updatedContent) {
        nextContent = JSON.parse(JSON.stringify(payload.updatedContent));
      }
      nextResumeData = {
        ...prevResumeData,
        profile: {
          ...prevResumeData.profile,
          role: nextContent.headlineRole || prevResumeData.profile.role,
          subtitle: nextContent.headlineSubtitle || prevResumeData.profile.subtitle,
          about: nextContent.summary || prevResumeData.profile.about,
          ...(payload.profilePatch || {}),
        },
        contact: {
          ...prevResumeData.contact,
          ...(payload.contactPatch || {}),
        },
      };
      setData(nextResumeData);
    }

    const userMsg: CloneChatMessage = {
      id: `msg-u-${now}`,
      role: "user",
      text: payload.userText,
      timestamp: now,
    };

    const assistantMsg: CloneChatMessage = {
      id: `msg-a-${now + 1}`,
      role: "assistant",
      text: payload.assistantReplyFa,
      timestamp: now + 1,
      changesSummaryFa: payload.hasChanges ? payload.changesSummaryFa || [] : undefined,
      previousSnapshot: payload.hasChanges
        ? {
            tailoredSnapshot: prevContent,
            resumeData: prevResumeData,
          }
        : undefined,
    };

    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== targetCloneId) return c;
        const updatedBase: ResumeClone = {
          ...c,
          updatedAt: now,
          resumeData: payload.hasChanges ? JSON.parse(JSON.stringify(nextResumeData)) : c.resumeData,
          tailoredSnapshot: payload.hasChanges ? JSON.parse(JSON.stringify(nextContent)) : c.tailoredSnapshot,
          chatHistory: [...(c.chatHistory || []), userMsg, assistantMsg].slice(-60),
        };
        return {
          ...updatedBase,
          changelog: payload.hasChanges
            ? appendCloneChangelog(
                updatedBase,
                "chat-edit",
                "ویرایش هوشمند با چت AI",
                payload.changesSummaryFa && payload.changesSummaryFa.length > 0
                  ? payload.changesSummaryFa
                  : [payload.userText.slice(0, 90)]
              )
            : c.changelog,
        };
      })
    );
  };

  const revertCloneChatMessage = (cloneId: string, messageId: string) => {
    const targetClone = clones.find((c) => c.id === cloneId);
    const targetMsg = targetClone?.chatHistory?.find((m) => m.id === messageId);
    if (!targetClone || !targetMsg?.previousSnapshot) return;

    const restoredContent = targetMsg.previousSnapshot.tailoredSnapshot;
    const restoredData = targetMsg.previousSnapshot.resumeData;

    if (restoredData && activeCloneId === cloneId) {
      setData(sanitizeResumeData(restoredData));
    }

    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== cloneId) return c;
        const updatedBase: ResumeClone = {
          ...c,
          updatedAt: Date.now(),
          resumeData: restoredData ? sanitizeResumeData(restoredData) : c.resumeData,
          tailoredSnapshot: restoredContent ? JSON.parse(JSON.stringify(restoredContent)) : c.tailoredSnapshot,
          chatHistory: (c.chatHistory || []).map((m) =>
            m.id === messageId ? { ...m, reverted: true } : m
          ),
        };
        return {
          ...updatedBase,
          changelog: appendCloneChangelog(updatedBase, "restored", "بازگردانی تغییر چت AI"),
        };
      })
    );
  };

  const clearCloneChatHistory = (cloneId: string) => {
    setClones((prev) =>
      prev.map((c) => (c.id === cloneId ? { ...c, chatHistory: [] } : c))
    );
  };

  const restoreCloneChangelog = (cloneId: string, entryId: string) => {
    const targetClone = clones.find((c) => c.id === cloneId);
    const entry = targetClone?.changelog?.find((e) => e.id === entryId);
    if (!targetClone || !entry) return;

    const snap = entry.snapshot;
    const restoredResumeData = sanitizeResumeData(snap.resumeData);
    const restoredTailored = snap.tailoredSnapshot
      ? JSON.parse(JSON.stringify(snap.tailoredSnapshot))
      : undefined;

    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== cloneId) return c;
        const restoredBase: ResumeClone = {
          ...c,
          name: snap.name,
          group: snap.group,
          status: snap.status,
          badges: [...snap.badges],
          notes: snap.notes,
          baseType: snap.baseType,
          customization: cloneCustomization(snap.customization),
          customHtml: snap.customHtml,
          resumeData: restoredResumeData,
          tailoredSnapshot: restoredTailored,
          updatedAt: Date.now(),
        };
        return {
          ...restoredBase,
          changelog: appendCloneChangelog(
            restoredBase,
            "restored",
            `بازگشت به نسخه #${entry.revision} (${entry.titleFa})`
          ),
        };
      })
    );

    // Activate and display restored snapshot on canvas immediately
    setActiveDraftId(null);
    setActiveCloneId(cloneId);
    setData(restoredResumeData);
    setLiveBaseTypeState(snap.baseType);
    setLiveCustomization(cloneCustomization(snap.customization));
    if (snap.customHtml) {
      setLiveCustomHtml(snap.customHtml);
    }
  };

  const duplicateClone = (cloneId: string): ResumeClone | null => {
    const source = clones.find((c) => c.id === cloneId);
    if (!source) return null;
    const now = Date.now();
    const copyBase: ResumeClone = {
      ...source,
      id: `clone-${now}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${source.name} (کپی)`,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
      customization: cloneCustomization(source.customization),
      resumeData: JSON.parse(JSON.stringify(source.resumeData)),
      tailoredSnapshot: source.tailoredSnapshot ? JSON.parse(JSON.stringify(source.tailoredSnapshot)) : undefined,
      badges: [...source.badges],
      changelog: [],
    };
    const copy: ResumeClone = {
      ...copyBase,
      changelog: appendCloneChangelog(copyBase, "created", `کپی‌شده از «${source.name}»`),
    };
    setClones((prev) => [copy, ...prev]);
    return copy;
  };

  const updateClone = (
    cloneId: string,
    patch: Partial<
      Pick<
        ResumeClone,
        | "name"
        | "notes"
        | "group"
        | "status"
        | "badges"
        | "isPinned"
        | "isArchived"
        | "targetCompany"
        | "targetRole"
        | "jobUrl"
        | "appliedAt"
        | "followUpDate"
        | "interviewNotes"
      >
    >
  ) => {
    setClones((prev) =>
      prev.map((c) => {
        if (c.id !== cloneId) return c;
        const nextGroup = patch.group !== undefined ? patch.group.trim() || c.group : c.group;
        const nextArchived =
          patch.isArchived !== undefined
            ? patch.isArchived
            : patch.group === "archived"
              ? true
              : patch.group && patch.group !== "archived"
                ? false
                : c.isArchived;

        const updatedBase: ResumeClone = {
          ...c,
          ...patch,
          group: nextArchived && patch.group === undefined ? "archived" : nextGroup,
          isArchived: nextArchived,
          name: patch.name !== undefined ? patch.name.trim() || c.name : c.name,
          badges: patch.badges !== undefined ? Array.from(new Set(patch.badges.map((b) => b.trim()).filter(Boolean))).slice(0, 8) : c.badges,
          updatedAt: Date.now(),
        };

        const shouldLogMeta =
          patch.name !== undefined ||
          patch.status !== undefined ||
          patch.group !== undefined ||
          patch.notes !== undefined;

        return {
          ...updatedBase,
          changelog: shouldLogMeta
            ? appendCloneChangelog(updatedBase, "meta-edit", "ویرایش مشخصات یا وضعیت کلون")
            : c.changelog,
        };
      })
    );
  };

  const deleteClone = (cloneId: string) => {
    setClones((prev) => prev.filter((c) => c.id !== cloneId));
    if (activeCloneId === cloneId) {
      setActiveCloneId(null);
    }
  };

  const convertCloneToTemplate = (cloneId: string): ResumeTemplate | null => {
    const source = clones.find((c) => c.id === cloneId);
    if (!source) return null;
    const now = Date.now();
    const baseMeta = BASE_TYPE_LABELS[source.baseType];
    const newTplBase: ResumeTemplate = {
      id: `tpl-from-clone-${now}`,
      baseType: source.baseType,
      name: source.name,
      nameFa: source.name,
      descriptionFa: source.notes || `قالب تبدیل‌شده از آرشیو کلون‌ها (${baseMeta.shortFa})`,
      badge: "از کلون",
      pages: baseMeta.pages,
      atsScore: source.atsScore ? `${source.atsScore}/100` : source.baseType === "executive-ats-2page" ? "99/100" : "96/100",
      recommendedFor: source.targetCompany ? `مناسب ${source.targetCompany}` : "قالب ساخته‌شده از کلون",
      accentColor: source.customization.accentColor,
      previewGradient: getGradientForAccent(source.customization.accentColor),
      version: "v1.0",
      isBuiltIn: false,
      isImported: source.baseType === "custom-html",
      createdAt: now,
      updatedAt: now,
      customization: cloneCustomization(source.customization),
      customHtml: source.customHtml,
      contentSnapshot: JSON.parse(JSON.stringify(source.resumeData)),
      tailoredSnapshot: source.tailoredSnapshot ? JSON.parse(JSON.stringify(source.tailoredSnapshot)) : undefined,
      changelog: [],
    };
    const newTpl: ResumeTemplate = {
      ...newTplBase,
      changelog: appendTemplateChangelog(newTplBase, `تبدیل‌شده از کلون «${source.name}»`),
    };

    setCustomTemplates((prev) => [newTpl, ...prev]);
    setActiveTemplateId(newTpl.id);
    setLiveBaseTypeState(newTpl.baseType);
    setLiveCustomization(cloneCustomization(newTpl.customization));
    if (newTpl.customHtml) setLiveCustomHtml(newTpl.customHtml);
    return newTpl;
  };

  const updateProfile = (fields: Partial<ResumeData["profile"]>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...fields },
    }));
  };

  const updateContact = (fields: Partial<ResumeData["contact"]>) => {
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...fields },
    }));
  };

  const updateExperience = (id: string, fields: Partial<ExperienceItem>) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...fields } : exp
      ),
    }));
  };

  const addExperience = () => {
    const newId = `exp-${Date.now()}`;
    const newExp: ExperienceItem = {
      id: newId,
      role: "New Role Title",
      company: "Company Name",
      period: "2024 - Present",
      location: "Tehran, Iran",
      intro: "Brief role summary or team mission",
      bullets: ["Key achievement with quantifiable metric and impact."],
      tags: ["Product", "Strategy"],
    };
    setData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences],
    }));
    setSelectedExpId(newId);
  };

  const deleteExperience = (id: string) => {
    setData((prev) => {
      const filtered = prev.experiences.filter((exp) => exp.id !== id);
      return { ...prev, experiences: filtered };
    });
    if (selectedExpId === id) {
      setSelectedExpId(data.experiences[0]?.id || "");
    }
  };

  const addExperienceBullet = (expId: string, bulletText = "New key achievement or quantifiable impact") => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: [...exp.bullets, bulletText],
          };
        }
        return exp;
      }),
    }));
  };

  const updateExperienceBullet = (expId: string, bulletIndex: number, text: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const nextBullets = [...exp.bullets];
          nextBullets[bulletIndex] = text;
          return {
            ...exp,
            bullets: nextBullets,
          };
        }
        return exp;
      }),
    }));
  };

  const deleteExperienceBullet = (expId: string, bulletIndex: number) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: exp.bullets.filter((_, idx) => idx !== bulletIndex),
          };
        }
        return exp;
      }),
    }));
  };

  const reorderExperienceBullets = (expId: string, fromIndex: number, toIndex: number) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const bullets = [...exp.bullets];
          const [moved] = bullets.splice(fromIndex, 1);
          bullets.splice(toIndex, 0, moved);
          return { ...exp, bullets };
        }
        return exp;
      }),
    }));
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill.trim()],
    }));
  };

  const updateSkill = (index: number, skill: string) => {
    setData((prev) => {
      const next = [...prev.skills];
      next[index] = skill;
      return { ...prev, skills: next };
    });
  };

  const deleteSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index),
    }));
  };

  const updateProject = (id: string, fields: Partial<ProjectItem>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, ...fields } : proj
      ),
    }));
  };

  const addProject = () => {
    const newId = `proj-${Date.now()}`;
    const newProj: ProjectItem = {
      id: newId,
      title: "New Project Title",
      description: "Description of the product or initiative delivered and outcome.",
      metric: "metric achieved",
    };
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  };

  const deleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const resetToDefaults = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setData(DEFAULT_RESUME_DATA);
    setSelectedExpId(DEFAULT_RESUME_DATA.experiences[0]?.id || "delband");
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_data_${data.profile.firstName}_${data.profile.lastName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === "object") {
        setData(sanitizeResumeData(parsed));
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON format:", e);
    }
    return false;
  };

  return (
    <ResumeContext.Provider
      value={{
        data,
        isEditMode,
        setIsEditMode,
        isPanelOpen,
        setIsPanelOpen,
        selectedExpId,
        setSelectedExpId,
        allTemplates,
        customTemplates,
        activeTemplateId,
        activeTemplate,
        liveBaseType,
        liveCustomization,
        liveCustomHtml,
        hasUnsavedCustomizations,
        effectiveTailoredContent,
        selectTemplate,
        setLiveBaseType,
        updateLiveCustomization,
        updateLiveSections,
        setLiveCustomHtml,
        resetLiveCustomizations,
        saveCustomizationsAsTemplate,
        createTemplateVersion,
        importTemplate,
        exportTemplateJSON,
        deleteCustomTemplate,
        renameCustomTemplate,
        restoreTemplateChangelog,
        tailoredDrafts,
        activeDraftId,
        activeDraft,
        isTailorModalOpen,
        setIsTailorModalOpen,
        addTailoredDraft,
        selectTailoredDraft,
        updateActiveDraftContent,
        deleteTailoredDraft,
        clearAllTailoredDrafts,
        clones,
        activeCloneId,
        activeClone,
        archiveSync: {
          state: archiveSyncState,
          storageDir: archiveStorageDir,
          lastSavedAt: archiveLastSavedAt,
        },
        isCloneArchiveOpen,
        setIsCloneArchiveOpen,
        isCloneChatOpen,
        setIsCloneChatOpen,
        quickCloneCurrent,
        loadClone,
        exitActiveClone,
        saveCurrentToActiveClone,
        updateActiveCloneContent,
        applyCloneChatResult,
        revertCloneChatMessage,
        clearCloneChatHistory,
        restoreCloneChangelog,
        duplicateClone,
        updateClone,
        deleteClone,
        convertCloneToTemplate,
        updateProfile,
        updateContact,
        updateExperience,
        addExperience,
        deleteExperience,
        addExperienceBullet,
        updateExperienceBullet,
        deleteExperienceBullet,
        reorderExperienceBullets,
        addSkill,
        updateSkill,
        deleteSkill,
        updateProject,
        addProject,
        deleteProject,
        resetToDefaults,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
