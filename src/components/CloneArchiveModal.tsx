import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Copy,
  CopyPlus,
  Edit3,
  Filter,
  FolderKanban,
  GitCompare,
  HardDrive,
  History,
  Kanban,
  Layers,
  List,
  MessageSquareText,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import {
  BUILT_IN_CLONE_GROUPS,
  CLONE_STATUS_META,
  CloneChangelogAction,
  CloneStatusBadge,
  getCloneGroupMeta,
  ResumeClone,
  SUGGESTED_CLONE_BADGES,
} from "@/types/clones";
import { BASE_TYPE_LABELS } from "@/types/templates";
import CloneKanbanView from "./CloneKanbanView";
import CloneDiffView from "./CloneDiffView";

interface CloneArchiveModalProps {
  isOpen: boolean;
  focusChangelogCloneId?: string | null;
  onClose: () => void;
}

type GroupByMode = "group" | "status" | "none";
type ArchiveViewMode = "list" | "kanban" | "diff";

const CHANGELOG_ACTION_LABELS: Record<CloneChangelogAction, string> = {
  created: "ایجاد",
  "inline-edit": "ویرایش متن",
  "chat-edit": "چت AI",
  "manual-save": "ذخیره دستی",
  "meta-edit": "ویرایش مشخصات",
  restored: "بازگشت نسخه",
};

const STATUS_KEYS: CloneStatusBadge[] = ["draft", "ready", "sent", "interview", "favorite"];

function formatPersianTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

function StatusIcon({ status }: { status: CloneStatusBadge }) {
  switch (status) {
    case "ready":
      return <Check className="size-3 shrink-0" />;
    case "sent":
      return <Send className="size-3 shrink-0" />;
    case "interview":
      return <Sparkles className="size-3 shrink-0" />;
    case "favorite":
      return <Star className="size-3 shrink-0" />;
    default:
      return <Clock className="size-3 shrink-0" />;
  }
}

export default function CloneArchiveModal({
  isOpen,
  focusChangelogCloneId = null,
  onClose,
}: CloneArchiveModalProps) {
  const {
    clones,
    activeCloneId,
    activeTemplate,
    activeDraft,
    liveBaseType,
    quickCloneCurrent,
    loadClone,
    exitActiveClone,
    saveCurrentToActiveClone,
    restoreCloneChangelog,
    duplicateClone,
    updateClone,
    deleteClone,
    convertCloneToTemplate,
    setIsCloneChatOpen,
    archiveSync,
  } = useResume();

  // Where this archive is persisted right now (server disk vs. this browser only)
  const archiveStatusLabel =
    archiveSync.state === "syncing"
      ? "در حال ذخیره روی دیسک…"
      : archiveSync.state === "saved"
        ? "روی دیسک ذخیره شده — از دستگاه‌های دیگر هم همین آرشیو دیده می‌شود"
        : archiveSync.state === "local-only"
          ? "سرور در دسترس نیست؛ فعلاً فقط در همین مرورگر ذخیره می‌شود"
          : "در حال آماده‌سازی ذخیره‌سازی…";

  // View mode & filter state
  const [viewMode, setViewMode] = useState<ArchiveViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<CloneStatusBadge | "all">("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByMode>("group");

  // Changelog accordion & safe delete confirmation state
  const [expandedChangelogId, setExpandedChangelogId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && focusChangelogCloneId) {
      setViewMode("list");
      setExpandedChangelogId(focusChangelogCloneId);
    }
  }, [isOpen, focusChangelogCloneId]);

  // Create custom clone panel state
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<string>("job-application");
  const [customGroupInput, setCustomGroupInput] = useState("");
  const [newStatus, setNewStatus] = useState<CloneStatusBadge>("ready");
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [newBadgeInput, setNewBadgeInput] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Inline edit state for an existing clone
  const [editingCloneId, setEditingCloneId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editCustomGroup, setEditCustomGroup] = useState("");
  const [editStatus, setEditStatus] = useState<CloneStatusBadge>("draft");
  const [editBadges, setEditBadges] = useState<string[]>([]);
  const [editBadgeInput, setEditBadgeInput] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Transient confirmation toast inside drawer
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => {
      setFeedback((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  // Discover all groups (built-in + custom user groups)
  const allGroups = useMemo(() => {
    const builtInKeys = new Set(BUILT_IN_CLONE_GROUPS.map((g) => g.key as string));
    const customGroupKeys = new Set<string>();
    clones.forEach((c) => {
      if (c.group && !builtInKeys.has(c.group)) {
        customGroupKeys.add(c.group);
      }
    });
    return [
      ...BUILT_IN_CLONE_GROUPS,
      ...Array.from(customGroupKeys).map((key) => getCloneGroupMeta(key)),
    ];
  }, [clones]);

  // Discover all badges across clones for badge filtering
  const allBadges = useMemo(() => {
    const counts = new Map<string, number>();
    clones.forEach((c) => {
      c.badges.forEach((b) => {
        counts.set(b, (counts.get(b) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [clones]);

  // Group counts (respecting archived visibility)
  const groupCounts = useMemo(() => {
    const map = new Map<string, number>();
    clones.forEach((c) => {
      if (!showArchived && c.isArchived && selectedGroup !== "archived") return;
      map.set(c.group, (map.get(c.group) || 0) + 1);
    });
    return map;
  }, [clones, showArchived, selectedGroup]);

  const archivedCount = useMemo(() => clones.filter((c) => c.isArchived).length, [clones]);

  // Filtered clones
  const filteredClones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return clones
      .filter((c) => {
        if (selectedGroup === "archived") {
          if (!c.isArchived && c.group !== "archived") return false;
        } else if (!showArchived && c.isArchived) {
          return false;
        }

        if (selectedGroup !== "all" && selectedGroup !== "archived" && c.group !== selectedGroup) {
          return false;
        }
        if (selectedStatus !== "all" && c.status !== selectedStatus) {
          return false;
        }
        if (selectedBadge !== "all" && !c.badges.includes(selectedBadge)) {
          return false;
        }
        if (pinnedOnly && !c.isPinned) {
          return false;
        }
        if (q) {
          const haystack = [
            c.name,
            c.notes || "",
            c.targetCompany || "",
            c.targetRole || "",
            c.sourceTemplateName,
            getCloneGroupMeta(c.group).labelFa,
            CLONE_STATUS_META[c.status].labelFa,
            ...c.badges,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [clones, searchQuery, selectedGroup, selectedStatus, selectedBadge, pinnedOnly, showArchived]);

  // Grouped structure for rendering
  const groupedSections = useMemo(() => {
    if (groupBy === "none") {
      return [
        {
          id: "all",
          title: "همه کلون‌ها",
          dotColor: "#0284c7",
          items: filteredClones,
        },
      ];
    }

    if (groupBy === "status") {
      return STATUS_KEYS.map((statusKey) => ({
        id: statusKey,
        title: CLONE_STATUS_META[statusKey].labelFa,
        dotColor: CLONE_STATUS_META[statusKey].accentHex,
        items: filteredClones.filter((c) => c.status === statusKey),
      })).filter((s) => s.items.length > 0);
    }

    // Group by clone.group
    const bucketMap = new Map<string, ResumeClone[]>();
    filteredClones.forEach((c) => {
      const list = bucketMap.get(c.group) || [];
      list.push(c);
      bucketMap.set(c.group, list);
    });

    return Array.from(bucketMap.entries()).map(([groupKey, items]) => {
      const meta = getCloneGroupMeta(groupKey);
      return {
        id: groupKey,
        title: meta.labelFa,
        dotColor: meta.dotColor,
        items,
      };
    });
  }, [filteredClones, groupBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedGroup !== "all" ||
    selectedStatus !== "all" ||
    selectedBadge !== "all" ||
    pinnedOnly;

  if (!isOpen) return null;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGroup("all");
    setSelectedStatus("all");
    setSelectedBadge("all");
    setPinnedOnly(false);
  };

  const handleInstantClone = () => {
    const created = quickCloneCurrent({ switchToClone: true });
    showFeedback(`کلون «${created.name}» با موفقیت ثبت شد.`);
  };

  const openCustomCreateForm = () => {
    const defaultName = activeDraft
      ? `${activeDraft.targetCompany} — ${activeDraft.targetRole}`
      : `${activeTemplate.nameFa} · کلون #${clones.length + 1}`;
    setNewName(defaultName);
    setNewGroup(activeDraft ? "job-application" : "role-variant");
    setCustomGroupInput("");
    setNewStatus(activeDraft ? "ready" : "draft");
    const initBadges: string[] = [BASE_TYPE_LABELS[liveBaseType].shortFa];
    if (activeDraft?.atsScoreAfter) initBadges.push(`ATS ${activeDraft.atsScoreAfter}`);
    setNewBadges(initBadges);
    setNewBadgeInput("");
    setNewNotes("");
    setIsCreateFormOpen(true);
  };

  const handleAddNewBadge = (badge: string) => {
    const trimmed = badge.trim();
    if (!trimmed) return;
    setNewBadges((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed].slice(0, 8)));
    setNewBadgeInput("");
  };

  const handleCreateCustomClone = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedGroup = newGroup === "__custom__" ? customGroupInput.trim() || "role-variant" : newGroup;
    const created = quickCloneCurrent({
      name: newName.trim() || undefined,
      group: resolvedGroup,
      status: newStatus,
      badges: newBadges,
      notes: newNotes.trim() || undefined,
      switchToClone: true,
    });
    setIsCreateFormOpen(false);
    showFeedback(`کلون «${created.name}» در گروه «${getCloneGroupMeta(created.group).shortFa}» ذخیره شد.`);
  };

  const startEditingClone = (clone: ResumeClone) => {
    setEditingCloneId(clone.id);
    setEditName(clone.name);
    const isBuiltIn = BUILT_IN_CLONE_GROUPS.some((g) => g.key === clone.group);
    setEditGroup(isBuiltIn ? clone.group : "__custom__");
    setEditCustomGroup(isBuiltIn ? "" : clone.group);
    setEditStatus(clone.status);
    setEditBadges([...clone.badges]);
    setEditBadgeInput("");
    setEditNotes(clone.notes || "");
  };

  const handleSaveCloneEdit = (cloneId: string) => {
    const resolvedGroup = editGroup === "__custom__" ? editCustomGroup.trim() || "role-variant" : editGroup;
    updateClone(cloneId, {
      name: editName,
      group: resolvedGroup,
      status: editStatus,
      badges: editBadges,
      notes: editNotes.trim() || undefined,
    });
    setEditingCloneId(null);
    showFeedback("تغییرات کلون ذخیره شد.");
  };

  const handleAddEditBadge = (badge: string) => {
    const trimmed = badge.trim();
    if (!trimmed) return;
    setEditBadges((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed].slice(0, 8)));
    setEditBadgeInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/45 backdrop-blur-xs no-print"
      dir="rtl"
      onClick={onClose}
    >
      <section
        className={`relative w-full h-full bg-white shadow-2xl border-r border-slate-200 flex flex-col overflow-hidden transition-[max-width] duration-200 ${
          viewMode === "list" ? "max-w-2xl" : "max-w-5xl"
        }`}
        onClick={(e) => e.stopPropagation()}
        aria-label="آرشیو کلون‌های رزومه"
      >
        {/* Top Drawer Header */}
        <header className="px-5 py-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Archive className="size-4 text-sky-600 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 truncate">آرشیو کلون‌ها و پیگیری اپلای</h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">({clones.length})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              تاریخچه تغییرات، بازگشت به نسخه‌های قبلی، بورد پیگیری اپلای و مقایسه دو نسخه
            </p>
            <div className="mt-1 flex items-center gap-1.5 min-w-0 text-[11px] text-slate-500">
              <HardDrive className="size-3 shrink-0" />
              <span
                className={`inline-block size-1.5 rounded-full shrink-0 ${
                  archiveSync.state === "saved"
                    ? "bg-emerald-500"
                    : archiveSync.state === "syncing"
                      ? "bg-sky-500"
                      : archiveSync.state === "local-only"
                        ? "bg-amber-500"
                        : "bg-slate-300"
                }`}
                aria-hidden
              />
              <span className="whitespace-nowrap">{archiveStatusLabel}</span>
              {archiveSync.storageDir && (
                <span
                  className="font-mono text-[10px] text-slate-400 truncate"
                  title={archiveSync.storageDir}
                  dir="ltr"
                >
                  {archiveSync.storageDir}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstantClone}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="کلون فوری از رزومه و قالب فعلی با یک کلیک"
            >
              <CopyPlus className="size-3.5 shrink-0" />
              <span>کلون فوری</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                isCreateFormOpen ? setIsCreateFormOpen(false) : openCustomCreateForm();
              }}
              className={`h-9 inline-flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCreateFormOpen
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              title="ساخت کلون با نام، گروه و بج اختصاصی"
            >
              <Plus className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">کلون با برچسب</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="size-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="بستن آرشیو کلون‌ها"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* 3-Mode View Switcher Tabs */}
        <div className="px-5 pt-2 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === "list"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="size-3.5" />
            <span>لیست و تاریخچه</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === "kanban"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Kanban className="size-3.5" />
            <span>بورد اپلای‌ها (Kanban)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("diff")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === "diff"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GitCompare className="size-3.5" />
            <span>مقایسه دو نسخه (Diff)</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 shrink-0">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Expandable Custom Labeled Clone Form */}
        {isCreateFormOpen && (
          <form
            onSubmit={handleCreateCustomClone}
            className="px-5 py-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">ساخت کلون جدید با گروه‌بندی و بج دلخواه</h3>
              <button
                type="button"
                onClick={() => setIsCreateFormOpen(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                انصراف
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">عنوان کلون</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثلاً: Snapp — Senior PM (نسخه ۲)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">گروه</label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                >
                  {BUILT_IN_CLONE_GROUPS.filter((g) => g.key !== "archived").map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.labelFa}
                    </option>
                  ))}
                  <option value="__custom__">+ ساخت گروه جدید...</option>
                </select>
              </div>
            </div>

            {newGroup === "__custom__" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">نام گروه اختصاصی</label>
                <input
                  type="text"
                  value={customGroupInput}
                  onChange={(e) => setCustomGroupInput(e.target.value)}
                  placeholder="مثلاً: شرکت‌های اروپایی یا فین‌تک"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>
            )}

            {/* Status Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">بج وضعیت</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_KEYS.map((key) => {
                  const meta = CLONE_STATUS_META[key];
                  const active = newStatus === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewStatus(key)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <StatusIcon status={key} />
                      <span>{meta.labelFa}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">بج‌ها و تگ‌های اختصاصی</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newBadgeInput}
                  onChange={(e) => setNewBadgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewBadge(newBadgeInput);
                    }
                  }}
                  placeholder="تایپ بج (مثلاً B2B، Remote) و Enter..."
                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleAddNewBadge(newBadgeInput)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  افزودن بج
                </button>
              </div>

              {/* Active badges in form */}
              {newBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {newBadges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-medium"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => setNewBadges((prev) => prev.filter((item) => item !== b))}
                        className="text-sky-600 hover:text-sky-950 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested quick badges */}
              <div className="flex flex-wrap items-center gap-1 mt-2">
                <span className="text-[10px] text-slate-500 ml-1">پیشنهادی:</span>
                {SUGGESTED_CLONE_BADGES.filter((b) => !newBadges.includes(b))
                  .slice(0, 6)
                  .map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleAddNewBadge(b)}
                      className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[10px] text-slate-600 cursor-pointer transition-colors"
                    >
                      + {b}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="یادداشت کوتاه (اختیاری)..."
                className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                ذخیره در آرشیو
              </button>
            </div>
          </form>
        )}

        {/* Filter & Grouping Bar (List mode only) */}
        {viewMode === "list" && (
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 space-y-2.5 shrink-0">
          {/* Row 1: Search + Grouping mode + Pinned/Archive toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در عنوان، شرکت، یادداشت یا بج..."
                className="w-full h-9 pr-8 pl-7 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
              <Search className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Grouping Segmented Control */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/70 border border-slate-200 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => setGroupBy("group")}
                className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  groupBy === "group" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                بر اساس گروه
              </button>
              <button
                type="button"
                onClick={() => setGroupBy("status")}
                className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  groupBy === "status" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                بر اساس وضعیت
              </button>
              <button
                type="button"
                onClick={() => setGroupBy("none")}
                className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  groupBy === "none" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ساده
              </button>
            </div>
          </div>

          {/* Row 2: Interactive Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <FolderKanban className="size-3.5 text-slate-400 shrink-0 ml-0.5" />
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedGroup === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              همه گروه‌ها ({clones.filter((c) => showArchived || !c.isArchived).length})
            </button>
            {allGroups
              .filter((g) => g.key !== "archived" || archivedCount > 0)
              .map((g) => {
                const count = g.key === "archived" ? archivedCount : groupCounts.get(g.key) || 0;
                const active = selectedGroup === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setSelectedGroup(active ? "all" : g.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border inline-flex items-center gap-1.5 ${
                      active
                        ? "bg-sky-600 text-white border-sky-600 font-semibold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{g.shortFa}</span>
                    <span className={`font-mono tabular-nums text-[10px] ${active ? "text-sky-100" : "text-slate-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Row 3: Status Badge Filters + Pinned/Archive + Custom Badge Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <Filter className="size-3 text-slate-400 shrink-0 ml-1" />
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedStatus === "all"
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                همه وضعیت‌ها
              </button>
              {STATUS_KEYS.map((key) => {
                const meta = CLONE_STATUS_META[key];
                const active = selectedStatus === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStatus(active ? "all" : key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    <StatusIcon status={key} />
                    <span>{meta.labelFa}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPinnedOnly((v) => !v)}
                className={`px-2 py-0.5 rounded border text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  pinnedOnly
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Pin className="size-3" />
                <span>پین‌شده</span>
              </button>

              {archivedCount > 0 && selectedGroup !== "archived" && (
                <button
                  type="button"
                  onClick={() => setShowArchived((v) => !v)}
                  className={`px-2 py-0.5 rounded border text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                    showArchived
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Archive className="size-3" />
                  <span>بایگانی ({archivedCount})</span>
                </button>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-sky-700 hover:bg-sky-50 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="size-3" />
                  <span>پاک کردن فیلتر</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 4: Custom Badge Filter Row (only shown when clones have badges) */}
          {allBadges.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-200/70">
              <Tag className="size-3 text-slate-400 shrink-0 ml-0.5" />
              <button
                type="button"
                onClick={() => setSelectedBadge("all")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedBadge === "all"
                    ? "bg-sky-700 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                همه بج‌ها
              </button>
              {allBadges.map(([badge, count]) => {
                const active = selectedBadge === badge;
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setSelectedBadge(active ? "all" : badge)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border inline-flex items-center gap-1 ${
                      active
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                    }`}
                  >
                    <span>{badge}</span>
                    <span className={`font-mono tabular-nums ${active ? "text-sky-100" : "text-slate-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">
          {viewMode === "kanban" ? (
            <CloneKanbanView
              clones={clones}
              activeCloneId={activeCloneId}
              onLoadClone={loadClone}
              onOpenChat={(cloneId) => {
                loadClone(cloneId);
                onClose();
                setIsCloneChatOpen(true);
              }}
              onUpdateClone={updateClone}
              onFeedback={showFeedback}
            />
          ) : viewMode === "diff" ? (
            <CloneDiffView clones={clones} />
          ) : clones.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6 py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="size-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-3">
                <CopyPlus className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">هنوز هیچ کلونی در آرشیو ندارید</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                با یک کلیک از وضعیت فعلی رزومه (متن، قالب و تنظیمات ظاهری) کلون بگیرید، آن‌ها را گروه‌بندی کنید و با بج وضعیت مدیریت نمایید.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleInstantClone}
                  className="h-9 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CopyPlus className="size-3.5" />
                  <span>ساخت اولین کلون فوری</span>
                </button>
                <button
                  type="button"
                  onClick={openCustomCreateForm}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>کلون با نام و گروه</span>
                </button>
              </div>
            </div>
          ) : filteredClones.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5">
              <p className="text-sm font-semibold text-slate-700">کلونی مطابق با فیلترهای فعلی پیدا نشد</p>
              <p className="text-xs text-slate-500">
                فیلتر گروه، وضعیت یا عبارت جستجو را تغییر دهید یا فیلترها را بازنشانی کنید.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>نمایش همه کلون‌ها</span>
              </button>
            </div>
          ) : (
            groupedSections.map((section) => (
              <div key={section.id} className="space-y-2.5">
                {/* Group Section Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-sm shrink-0"
                      style={{ backgroundColor: section.dotColor }}
                      aria-hidden="true"
                    />
                    <h3 className="text-xs font-bold text-slate-800">{section.title}</h3>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400">
                      {section.items.length}
                    </span>
                  </div>
                </div>

                {/* Items inside group */}
                <div className="space-y-2.5">
                  {section.items.map((clone) => {
                    const isActive = clone.id === activeCloneId;
                    const isEditing = editingCloneId === clone.id;
                    const groupMeta = getCloneGroupMeta(clone.group);
                    const statusMeta = CLONE_STATUS_META[clone.status];
                    const baseMeta = BASE_TYPE_LABELS[clone.baseType];

                    return (
                      <article
                        key={clone.id}
                        className={`rounded-xl border transition-colors p-3.5 ${
                          isActive
                            ? "border-sky-300 bg-sky-50/40"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Edit Mode for Group, Status, Badges & Name */
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-1">عنوان</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-1">گروه</label>
                                <select
                                  value={editGroup}
                                  onChange={(e) => setEditGroup(e.target.value)}
                                  className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                                >
                                  {BUILT_IN_CLONE_GROUPS.map((g) => (
                                    <option key={g.key} value={g.key}>
                                      {g.labelFa}
                                    </option>
                                  ))}
                                  <option value="__custom__">+ گروه اختصاصی...</option>
                                </select>
                              </div>
                            </div>

                            {editGroup === "__custom__" && (
                              <input
                                type="text"
                                value={editCustomGroup}
                                onChange={(e) => setEditCustomGroup(e.target.value)}
                                placeholder="نام گروه اختصاصی..."
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                              />
                            )}

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1">بج وضعیت</label>
                              <div className="flex flex-wrap gap-1">
                                {STATUS_KEYS.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setEditStatus(s)}
                                    className={`px-2 py-1 rounded text-[11px] font-medium border inline-flex items-center gap-1 cursor-pointer ${
                                      editStatus === s
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    <StatusIcon status={s} />
                                    <span>{CLONE_STATUS_META[s].labelFa}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-1">بج‌ها</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editBadgeInput}
                                  onChange={(e) => setEditBadgeInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddEditBadge(editBadgeInput);
                                    }
                                  }}
                                  placeholder="افزودن بج جدید..."
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddEditBadge(editBadgeInput)}
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                                >
                                  افزودن
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {editBadges.map((b) => (
                                  <span
                                    key={b}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-900 text-[11px]"
                                  >
                                    <span>{b}</span>
                                    <button
                                      type="button"
                                      onClick={() => setEditBadges((prev) => prev.filter((item) => item !== b))}
                                      className="text-sky-600 hover:text-sky-950 cursor-pointer"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="یادداشت..."
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                            />

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingCloneId(null)}
                                className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                انصراف
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveCloneEdit(clone.id)}
                                className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                              >
                                ذخیره تغییرات
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Read View */
                          <div className="space-y-2.5">
                            {/* Title Row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {clone.isPinned && (
                                    <Pin className="size-3.5 text-amber-600 shrink-0" />
                                  )}
                                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-full">
                                    {clone.name}
                                  </h4>
                                  {isActive && (
                                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded">
                                      فعال روی صفحه
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                                  <span>{baseMeta.shortFa}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">{formatPersianTime(clone.updatedAt)}</span>
                                  {clone.targetCompany && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                                        <Briefcase className="size-3 text-slate-400" />
                                        {clone.targetCompany}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Quick Icon Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateClone(clone.id, { isPinned: !clone.isPinned })}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    clone.isPinned
                                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  }`}
                                  title={clone.isPinned ? "برداشتن پین" : "پین در بالای لیست"}
                                >
                                  <Pin className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditingClone(clone)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="ویرایش عنوان، گروه، وضعیت و بج‌ها"
                                >
                                  <Edit3 className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextArchived = !clone.isArchived;
                                    updateClone(clone.id, {
                                      isArchived: nextArchived,
                                      group: nextArchived ? "archived" : "role-variant",
                                    });
                                    showFeedback(nextArchived ? "کلون بایگانی شد." : "کلون از بایگانی خارج شد.");
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title={clone.isArchived ? "خروج از بایگانی" : "بایگانی کردن"}
                                >
                                  {clone.isArchived ? (
                                    <ArchiveRestore className="size-3.5" />
                                  ) : (
                                    <Archive className="size-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteId(confirmDeleteId === clone.id ? null : clone.id)
                                  }
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    confirmDeleteId === clone.id
                                      ? "bg-red-100 text-red-700"
                                      : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                  title="حذف کلون"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Safe Delete Confirmation */}
                            {confirmDeleteId === clone.id && (
                              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-red-900">
                                  آیا از حذف کلون «{clone.name}» مطمئن هستید؟
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
                                  >
                                    انصراف
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteClone(clone.id);
                                      setConfirmDeleteId(null);
                                      showFeedback(`کلون «${clone.name}» حذف شد.`);
                                    }}
                                    className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                                  >
                                    بله، حذف شود
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Badges Strip (Status + Group + ATS + Custom Badges) */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusMeta.badgeClass}`}
                              >
                                <StatusIcon status={clone.status} />
                                <span>{statusMeta.labelFa}</span>
                              </span>

                              {/* Group Badge */}
                              <button
                                type="button"
                                onClick={() => setSelectedGroup(clone.group)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium cursor-pointer hover:opacity-85 transition-opacity ${groupMeta.badgeClass}`}
                                title="فیلتر بر اساس این گروه"
                              >
                                <FolderKanban className="size-3 shrink-0" />
                                <span>{groupMeta.shortFa}</span>
                              </button>

                              {/* ATS Score Badge */}
                              {typeof clone.atsScore === "number" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-mono tabular-nums font-semibold">
                                  ATS {clone.atsScore}
                                </span>
                              )}

                              {/* Tracker dates hint */}
                              {clone.appliedAt && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono tabular-nums text-slate-500">
                                  <Calendar className="size-2.5 text-slate-400" />
                                  ارسال: {clone.appliedAt}
                                </span>
                              )}

                              {/* Custom User Badges (clickable to filter) */}
                              {clone.badges.map((badge) => (
                                <button
                                  key={badge}
                                  type="button"
                                  onClick={() => setSelectedBadge(selectedBadge === badge ? "all" : badge)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-medium cursor-pointer transition-colors"
                                  title="فیلتر با این بج"
                                >
                                  <Tag className="size-2.5 text-slate-400" />
                                  <span>{badge}</span>
                                </button>
                              ))}
                            </div>

                            {/* Notes */}
                            {clone.notes && (
                              <p className="text-xs text-slate-600 leading-relaxed">{clone.notes}</p>
                            )}

                            {/* Expandable Per-Clone Changelog & 1-Click Rollback */}
                            {expandedChangelogId === clone.id && (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                                  <span className="inline-flex items-center gap-1.5">
                                    <History className="size-3.5 text-sky-600" />
                                    <span>
                                      تاریخچه تغییرات این کلون ({(clone.changelog || []).length} نسخه)
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedChangelogId(null)}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>

                                {(clone.changelog || []).length === 0 ? (
                                  <p className="text-[11px] text-slate-500">
                                    هنوز نسخه‌ای در تاریخچه ثبت نشده است.
                                  </p>
                                ) : (
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pl-1">
                                    {(clone.changelog || []).map((entry, idx) => (
                                      <div
                                        key={entry.id}
                                        className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start justify-between gap-2.5"
                                      >
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                          <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                            <span className="font-mono tabular-nums font-bold text-sky-700">
                                              #{entry.revision}
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                              {entry.titleFa}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                              · {CHANGELOG_ACTION_LABELS[entry.action]}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                                            {formatPersianTime(entry.timestamp)} ·{" "}
                                            {BASE_TYPE_LABELS[entry.snapshot.baseType].shortFa}
                                          </div>
                                          {entry.detailsFa && entry.detailsFa.length > 0 && (
                                            <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600 list-disc list-inside">
                                              {entry.detailsFa.slice(0, 3).map((d, dIdx) => (
                                                <li key={dIdx} className="truncate">
                                                  {d}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>

                                        {idx > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              restoreCloneChangelog(clone.id, entry.id);
                                              showFeedback(
                                                `کلون «${clone.name}» به نسخه #${entry.revision} بازگردانده و روی رزومه اعمال شد.`
                                              );
                                            }}
                                            className="px-2.5 py-1 rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                                          >
                                            <RotateCcw className="size-3" />
                                            <span>بازگشت</span>
                                          </button>
                                        ) : (
                                          <span className="text-[10px] font-semibold text-emerald-700 shrink-0 pt-0.5">
                                            نسخه فعلی
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Footer Action Bar */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {isActive ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        saveCurrentToActiveClone();
                                        showFeedback("تغییرات فعلی در این کلون ذخیره شد.");
                                      }}
                                      className="h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      <Save className="size-3" />
                                      <span>به‌روزرسانی</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => exitActiveClone()}
                                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      خروج
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      loadClone(clone.id);
                                      showFeedback(`کلون «${clone.name}» روی رزومه بارگذاری شد.`);
                                    }}
                                    className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    <Check className="size-3 text-sky-400" />
                                    <span>بارگذاری</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    loadClone(clone.id);
                                    onClose();
                                    setIsCloneChatOpen(true);
                                  }}
                                  className="h-8 px-2.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                  title="باز کردن چت هوشمند برای ویرایش متن این کلون"
                                >
                                  <MessageSquareText className="size-3" />
                                  <span>چت AI</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedChangelogId(
                                      expandedChangelogId === clone.id ? null : clone.id
                                    )
                                  }
                                  className={`h-8 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                                    expandedChangelogId === clone.id
                                      ? "border-sky-300 bg-sky-50 text-sky-800"
                                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                  }`}
                                  title="مشاهده چنج‌لاگ و بازگشت به نسخه‌های قبلی"
                                >
                                  <History className="size-3" />
                                  <span>تاریخچه</span>
                                  <span className="font-mono tabular-nums text-[10px] opacity-75">
                                    ({(clone.changelog || []).length})
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = duplicateClone(clone.id);
                                    if (copy) showFeedback(`کپی جدید «${copy.name}» ساخته شد.`);
                                  }}
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                  title="ساخت کپی مستقل از این کلون"
                                >
                                  <Copy className="size-3" />
                                  <span>کپی</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const tpl = convertCloneToTemplate(clone.id);
                                  if (tpl) showFeedback(`کلون به قالب دائم «${tpl.nameFa}» تبدیل شد.`);
                                }}
                                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-800 text-slate-600 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                title="تبدیل این کلون به یک قالب قابل استفاده مجدد"
                              >
                                <Layers className="size-3" />
                                <span>تبدیل به قالب</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
