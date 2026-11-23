import React, { useState } from "react";
import {
  Briefcase,
  Calendar,
  Check,
  Clock,
  Edit3,
  ExternalLink,
  MessageSquareText,
  Save,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { CLONE_STATUS_META, CloneStatusBadge, ResumeClone } from "@/types/clones";
import { BASE_TYPE_LABELS } from "@/types/templates";

const KANBAN_COLUMNS: CloneStatusBadge[] = [
  "draft",
  "ready",
  "sent",
  "interview",
  "favorite",
];

function getSafeHttpUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function StatusGlyph({ status }: { status: CloneStatusBadge }) {
  switch (status) {
    case "ready":
      return <Check className="size-3.5 shrink-0" />;
    case "sent":
      return <Send className="size-3.5 shrink-0" />;
    case "interview":
      return <Sparkles className="size-3.5 shrink-0" />;
    case "favorite":
      return <Star className="size-3.5 shrink-0" />;
    default:
      return <Clock className="size-3.5 shrink-0" />;
  }
}

interface CloneKanbanViewProps {
  clones: ResumeClone[];
  activeCloneId: string | null;
  onLoadClone: (cloneId: string) => void;
  onOpenChat: (cloneId: string) => void;
  onUpdateClone: (
    cloneId: string,
    patch: Partial<
      Pick<
        ResumeClone,
        "status" | "targetCompany" | "targetRole" | "jobUrl" | "appliedAt" | "followUpDate" | "interviewNotes"
      >
    >
  ) => void;
  onFeedback: (msg: string) => void;
}

export default function CloneKanbanView({
  clones,
  activeCloneId,
  onLoadClone,
  onOpenChat,
  onUpdateClone,
  onFeedback,
}: CloneKanbanViewProps) {
  const [editingTrackerId, setEditingTrackerId] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const visibleClones = clones.filter((c) => !c.isArchived);

  const openTrackerEditor = (clone: ResumeClone) => {
    setEditingTrackerId(clone.id);
    setCompany(clone.targetCompany || "");
    setRole(clone.targetRole || "");
    setJobUrl(clone.jobUrl || "");
    setAppliedAt(clone.appliedAt || "");
    setFollowUpDate(clone.followUpDate || "");
    setInterviewNotes(clone.interviewNotes || "");
    setUrlError(null);
  };

  const handleSaveTracker = (cloneId: string) => {
    const trimmedUrl = jobUrl.trim();
    if (trimmedUrl && !getSafeHttpUrl(trimmedUrl)) {
      setUrlError("لینک آگهی باید با https:// یا http:// شروع شود.");
      return;
    }

    onUpdateClone(cloneId, {
      targetCompany: company.trim() || undefined,
      targetRole: role.trim() || undefined,
      jobUrl: trimmedUrl || undefined,
      appliedAt: appliedAt.trim() || undefined,
      followUpDate: followUpDate.trim() || undefined,
      interviewNotes: interviewNotes.trim() || undefined,
    });
    setEditingTrackerId(null);
    setUrlError(null);
    onFeedback("اطلاعات پیگیری اپلای ذخیره شد.");
  };

  const handleStageChange = (clone: ResumeClone, nextStatus: CloneStatusBadge) => {
    const patch: Parameters<typeof onUpdateClone>[1] = { status: nextStatus };
    if (nextStatus === "sent" && !clone.appliedAt) {
      patch.appliedAt = new Date().toISOString().slice(0, 10);
    }
    onUpdateClone(clone.id, patch);
    onFeedback(`وضعیت «${clone.name}» به «${CLONE_STATUS_META[nextStatus].labelFa}» تغییر کرد.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
        <span>
          پیگیری مرحله‌به‌مرحله اپلای‌ها: وضعیت هر کلون را بین ستون‌ها جابجا کنید، لینک آگهی و تاریخ پیگیری ثبت کنید.
        </span>
        <span className="font-mono tabular-nums font-semibold text-slate-700">
          {visibleClones.length} پرونده فعال
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
        {KANBAN_COLUMNS.map((statusKey) => {
          const meta = CLONE_STATUS_META[statusKey];
          const columnItems = visibleClones.filter((c) => c.status === statusKey);

          return (
            <section
              key={statusKey}
              className="rounded-xl bg-slate-50/90 border border-slate-200 p-2.5 space-y-2.5 min-h-[260px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="size-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: meta.accentHex }}
                    aria-hidden="true"
                  />
                  <h3 className="text-xs font-bold text-slate-900 truncate">{meta.labelFa}</h3>
                </div>
                <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500">
                  {columnItems.length}
                </span>
              </div>

              {/* Cards */}
              {columnItems.length === 0 ? (
                <div className="py-8 px-2 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white/60">
                  موردی در این مرحله نیست
                </div>
              ) : (
                <div className="space-y-2">
                  {columnItems.map((clone) => {
                    const isActive = clone.id === activeCloneId;
                    const isEditing = editingTrackerId === clone.id;
                    const safeUrl = getSafeHttpUrl(clone.jobUrl);

                    return (
                      <article
                        key={clone.id}
                        className={`rounded-lg border bg-white p-2.5 space-y-2 transition-colors ${
                          isActive ? "border-sky-400 ring-1 ring-sky-200" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug break-words min-w-0">
                            {clone.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() =>
                              isEditing ? setEditingTrackerId(null) : openTrackerEditor(clone)
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer shrink-0"
                            title="ویرایش جزئیات پیگیری اپلای"
                          >
                            {isEditing ? <X className="size-3" /> : <Edit3 className="size-3" />}
                          </button>
                        </div>

                        {(clone.targetCompany || clone.targetRole) && (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 flex-wrap">
                            <Briefcase className="size-3 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">
                              {[clone.targetCompany, clone.targetRole].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500 font-mono tabular-nums">
                          <span>{BASE_TYPE_LABELS[clone.baseType].shortFa}</span>
                          {typeof clone.atsScore === "number" && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-700 font-semibold">
                                ATS {clone.atsScore}
                              </span>
                            </>
                          )}
                        </div>

                        {(clone.appliedAt || clone.followUpDate || safeUrl) && !isEditing && (
                          <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[10px] text-slate-600">
                            {clone.appliedAt && (
                              <div className="flex items-center gap-1 font-mono tabular-nums">
                                <Calendar className="size-2.5 text-slate-400 shrink-0" />
                                <span>ارسال: {clone.appliedAt}</span>
                              </div>
                            )}
                            {clone.followUpDate && (
                              <div className="flex items-center gap-1 font-mono tabular-nums text-amber-800">
                                <Clock className="size-2.5 text-amber-600 shrink-0" />
                                <span>پیگیری: {clone.followUpDate}</span>
                              </div>
                            )}
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sky-700 hover:underline font-medium"
                              >
                                <ExternalLink className="size-2.5 shrink-0" />
                                <span>مشاهده آگهی شغلی</span>
                              </a>
                            )}
                          </div>
                        )}

                        {clone.interviewNotes && !isEditing && (
                          <p className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 leading-relaxed">
                            {clone.interviewNotes}
                          </p>
                        )}

                        {/* Inline Tracker Details Editor */}
                        {isEditing && (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <input
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="شرکت هدف..."
                              className="w-full h-7 px-2 rounded border border-slate-200 text-[11px]"
                            />
                            <input
                              type="text"
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              placeholder="عنوان شغلی..."
                              className="w-full h-7 px-2 rounded border border-slate-200 text-[11px]"
                            />
                            <input
                              type="url"
                              value={jobUrl}
                              onChange={(e) => {
                                setJobUrl(e.target.value);
                                setUrlError(null);
                              }}
                              placeholder="https://... لینک آگهی"
                              dir="ltr"
                              className="w-full h-7 px-2 rounded border border-slate-200 text-[11px] font-mono"
                            />
                            {urlError && <p className="text-[10px] text-red-600">{urlError}</p>}
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-0.5">تاریخ ارسال</label>
                                <input
                                  type="date"
                                  value={appliedAt}
                                  onChange={(e) => setAppliedAt(e.target.value)}
                                  className="w-full h-7 px-1.5 rounded border border-slate-200 text-[10px] font-mono"
                                  dir="ltr"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-0.5">تاریخ پیگیری</label>
                                <input
                                  type="date"
                                  value={followUpDate}
                                  onChange={(e) => setFollowUpDate(e.target.value)}
                                  className="w-full h-7 px-1.5 rounded border border-slate-200 text-[10px] font-mono"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={interviewNotes}
                              onChange={(e) => setInterviewNotes(e.target.value)}
                              placeholder="یادداشت مصاحبه یا نام ریکروتر..."
                              className="w-full p-1.5 rounded border border-slate-200 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTracker(clone.id)}
                              className="w-full h-7 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Save className="size-3" />
                              <span>ذخیره اطلاعات پیگیری</span>
                            </button>
                          </div>
                        )}

                        {/* Quick Stage Move & Load */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <select
                            aria-label="تغییر مرحله اپلای"
                            value={clone.status}
                            onChange={(e) =>
                              handleStageChange(clone, e.target.value as CloneStatusBadge)
                            }
                            className="w-full h-7 px-2 rounded border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700 cursor-pointer"
                          >
                            {KANBAN_COLUMNS.map((s) => (
                              <option key={s} value={s}>
                                مرحله: {CLONE_STATUS_META[s].labelFa}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onLoadClone(clone.id);
                                onFeedback(`کلون «${clone.name}» روی رزومه باز شد.`);
                              }}
                              className="flex-1 h-7 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold cursor-pointer"
                            >
                              {isActive ? "فعال روی صفحه" : "باز کردن"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenChat(clone.id)}
                              className="h-7 px-2 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                              title="ویرایش با چت AI"
                            >
                              <MessageSquareText className="size-3" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
