import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Check,
  Edit3,
  MessageSquareText,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import {
  EditableFieldDescriptor,
  getEditableFieldsList,
} from "@/utils/resumeFieldMatcher";
import { RichText } from "./RichText";

interface InlineTextEditModalProps {
  isOpen: boolean;
  initialFieldKey: string | null;
  onClose: () => void;
  onOpenChatEditor?: () => void;
}

export default function InlineTextEditModal({
  isOpen,
  initialFieldKey,
  onClose,
  onOpenChatEditor,
}: InlineTextEditModalProps) {
  const {
    data,
    activeClone,
    effectiveTailoredContent,
    updateActiveCloneContent,
  } = useResume();

  const fields = useMemo(
    () => getEditableFieldsList(effectiveTailoredContent, data),
    [effectiveTailoredContent, data]
  );

  const [selectedKey, setSelectedKey] = useState<string>(initialFieldKey || "summary");
  const [draftValue, setDraftValue] = useState<string>("");
  const [savedNotice, setSavedNotice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedField: EditableFieldDescriptor = useMemo(() => {
    return fields.find((f) => f.key === selectedKey) || fields[0];
  }, [fields, selectedKey]);

  // Group fields for clean <optgroup> selector
  const groupedFields = useMemo(() => {
    const map = new Map<string, EditableFieldDescriptor[]>();
    fields.forEach((f) => {
      const list = map.get(f.groupLabelFa) || [];
      list.push(f);
      map.set(f.groupLabelFa, list);
    });
    return Array.from(map.entries());
  }, [fields]);

  useEffect(() => {
    if (!isOpen) return;
    const keyToUse =
      initialFieldKey && fields.some((f) => f.key === initialFieldKey)
        ? initialFieldKey
        : fields[0]?.key || "summary";
    setSelectedKey(keyToUse);
    const matched = fields.find((f) => f.key === keyToUse);
    setDraftValue(matched?.value || "");
    setSavedNotice(false);
  }, [isOpen, initialFieldKey]);

  // Sync draft when switching field inside modal
  const handleSelectField = (nextKey: string) => {
    setSelectedKey(nextKey);
    const matched = fields.find((f) => f.key === nextKey);
    setDraftValue(matched?.value || "");
    setSavedNotice(false);
  };

  // Escape key closes modal, Ctrl/Cmd+Enter saves
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedField, draftValue]);

  if (!isOpen || !selectedField) return null;

  const wrapSelectionWithBold = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = draftValue.slice(start, end);
    const replacement = selected ? `**${selected}**` : "**متن برجسته**";
    const next = draftValue.slice(0, start) + replacement + draftValue.slice(end);
    setDraftValue(next);
    window.setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + 2, start + replacement.length - 2);
    }, 0);
  };

  const applyFieldSave = (autoCreateCloneIfNone: boolean) => {
    const target = selectedField.target;
    const cleaned = draftValue.trim();

    if (target.kind === "profileName") {
      const parts = cleaned.split(/\s+/);
      const firstName = parts[0] || data.profile.firstName;
      const lastName = parts.slice(1).join(" ") || "";
      updateActiveCloneContent((prev) => prev, {
        profilePatch: { firstName, lastName },
        autoCreateCloneIfNone,
        changeTitleFa: `ویرایش «${selectedField.labelFa}»`,
      });
      return;
    }

    if (target.kind === "contact") {
      const contactPatch: Partial<typeof data.contact> = {};
      if (target.field === "email") contactPatch.email = cleaned;
      if (target.field === "phone") contactPatch.phone = cleaned;
      if (target.field === "location") contactPatch.location = cleaned;
      if (target.field === "website") {
        contactPatch.website = {
          handle: cleaned,
          url: cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
        };
      }
      if (target.field === "linkedin") {
        contactPatch.linkedin = {
          handle: cleaned,
          url: cleaned.startsWith("http")
            ? cleaned
            : `https://www.linkedin.com/${cleaned.replace(/^\/+/, "")}`,
        };
      }
      updateActiveCloneContent((prev) => prev, {
        contactPatch,
        autoCreateCloneIfNone,
        changeTitleFa: `ویرایش «${selectedField.labelFa}»`,
      });
      return;
    }

    updateActiveCloneContent(
      (prev) => {
        if (target.kind === "headlineRole") {
          return { ...prev, headlineRole: cleaned };
        }
        if (target.kind === "headlineSubtitle") {
          return { ...prev, headlineSubtitle: cleaned };
        }
        if (target.kind === "summary") {
          return { ...prev, summary: cleaned };
        }
        if (target.kind === "skillGroup") {
          const items = cleaned
            .split(/[,،\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          return {
            ...prev,
            skillGroups: prev.skillGroups.map((g, idx) =>
              idx === target.groupIndex ? { ...g, items } : g
            ),
          };
        }
        if (target.kind === "experienceRole") {
          return {
            ...prev,
            experiences: prev.experiences.map((exp) =>
              exp.id === target.expId ? { ...exp, role: cleaned } : exp
            ),
          };
        }
        if (target.kind === "experienceIntro") {
          return {
            ...prev,
            experiences: prev.experiences.map((exp) =>
              exp.id === target.expId ? { ...exp, intro: cleaned } : exp
            ),
          };
        }
        if (target.kind === "experienceBullet") {
          return {
            ...prev,
            experiences: prev.experiences.map((exp) => {
              if (exp.id !== target.expId) return exp;
              const nextBullets = [...exp.bullets];
              nextBullets[target.bulletIndex] = cleaned;
              return { ...exp, bullets: nextBullets };
            }),
          };
        }
        if (target.kind === "experienceTags") {
          const tags = cleaned
            .split(/[,،\n]+/)
            .map((t) => t.trim())
            .filter(Boolean);
          return {
            ...prev,
            experiences: prev.experiences.map((exp) =>
              exp.id === target.expId ? { ...exp, tags } : exp
            ),
          };
        }
        if (target.kind === "projectTitle") {
          return {
            ...prev,
            projects: prev.projects.map((p) =>
              p.id === target.projectId ? { ...p, title: cleaned } : p
            ),
          };
        }
        if (target.kind === "projectDescription") {
          return {
            ...prev,
            projects: prev.projects.map((p) =>
              p.id === target.projectId ? { ...p, description: cleaned } : p
            ),
          };
        }
        return prev;
      },
      { autoCreateCloneIfNone, changeTitleFa: `ویرایش «${selectedField.labelFa}»` }
    );
  };

  const handleSave = (closeAfter: boolean) => {
    applyFieldSave(true);
    setSavedNotice(true);
    if (closeAfter) {
      window.setTimeout(() => onClose(), 180);
    } else {
      window.setTimeout(() => setSavedNotice(false), 1800);
    }
  };

  const handleAddBulletBelow = () => {
    if (selectedField.target.kind !== "experienceBullet") return;
    const { expId, bulletIndex } = selectedField.target;
    const newBulletText = "**Key Achievement —** Describe measurable impact and outcome.";
    updateActiveCloneContent(
      (prev) => ({
        ...prev,
        experiences: prev.experiences.map((exp) => {
          if (exp.id !== expId) return exp;
          const nextBullets = [...exp.bullets];
          nextBullets.splice(bulletIndex + 1, 0, newBulletText);
          return { ...exp, bullets: nextBullets };
        }),
      }),
      { autoCreateCloneIfNone: true, changeTitleFa: `افزودن بولت جدید در ${selectedField.groupLabelFa}` }
    );
    const nextKey = `expBullet:${expId}:${bulletIndex + 1}`;
    setSelectedKey(nextKey);
    setDraftValue(newBulletText);
  };

  const handleDeleteBullet = () => {
    if (selectedField.target.kind !== "experienceBullet") return;
    const { expId, bulletIndex } = selectedField.target;
    updateActiveCloneContent(
      (prev) => ({
        ...prev,
        experiences: prev.experiences.map((exp) => {
          if (exp.id !== expId || exp.bullets.length <= 1) return exp;
          return {
            ...exp,
            bullets: exp.bullets.filter((_, idx) => idx !== bulletIndex),
          };
        }),
      }),
      { autoCreateCloneIfNone: true, changeTitleFa: `حذف بولت در ${selectedField.groupLabelFa}` }
    );
    onClose();
  };

  const wordCount = draftValue.trim() ? draftValue.trim().split(/\s+/).length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="ویرایش مستقیم متن رزومه"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Edit3 className="size-4 text-sky-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 truncate">ویرایش سریع متن کلون</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {activeClone
                ? `تغییرات مستقیماً در کلون «${activeClone.name}» ذخیره می‌شود`
                : "با ذخیره، به صورت خودکار یک کلون جدید ساخته و ذخیره می‌شود تا نسخه اصلی حفظ شود"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0"
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Field Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              بخش انتخاب‌شده برای ویرایش (می‌توانید به هر بخش دیگر نیز جابجا شوید)
            </label>
            <select
              value={selectedField.key}
              onChange={(e) => handleSelectField(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            >
              {groupedFields.map(([groupName, items]) => (
                <optgroup key={groupName} label={groupName}>
                  {items.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.labelFa}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Textarea / Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                {selectedField.labelFa}
              </label>
              <div className="flex items-center gap-2">
                {selectedField.supportsBoldMarkdown && (
                  <button
                    type="button"
                    onClick={wrapSelectionWithBold}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    title="برجسته‌کردن متن انتخاب‌شده با ** **"
                  >
                    <Bold className="size-3" />
                    <span>بولد</span>
                  </button>
                )}
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {wordCount} کلمه · {draftValue.length} کاراکتر
                </span>
              </div>
            </div>

            {selectedField.multiline ? (
              <textarea
                ref={textareaRef}
                rows={5}
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                dir="auto"
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 resize-y"
                placeholder="متن جدید را وارد کنید..."
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                dir="auto"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                placeholder="متن جدید را وارد کنید..."
                autoFocus
              />
            )}

            {(selectedField.target.kind === "skillGroup" || selectedField.target.kind === "experienceTags") && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                موارد را با کاما (<code>,</code>) از هم جدا کنید.
              </p>
            )}

            {/* Live Bold Preview for Markdown-enabled fields */}
            {selectedField.supportsBoldMarkdown && draftValue.trim() && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-semibold text-slate-400 mb-1">پیش‌نمایش نمایشی در رزومه:</div>
                <p className="text-xs leading-relaxed text-slate-700" dir="auto">
                  <RichText text={draftValue} strongClassName="font-bold text-slate-900" />
                </p>
              </div>
            )}
          </div>

          {/* Bullet-specific helper actions */}
          {selectedField.target.kind === "experienceBullet" && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleAddBulletBelow}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <Plus className="size-3.5 text-sky-600" />
                <span>افزودن بولت جدید زیر این مورد</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteBullet}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>حذف این بولت</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onOpenChatEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChatEditor();
                }}
                className="h-9 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquareText className="size-3.5" />
                <span>ویرایش با چت AI</span>
              </button>
            )}
            <span className="hidden sm:inline text-[10px] text-slate-400">Ctrl + Enter برای ذخیره سریع</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="h-9 px-3.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {savedNotice ? <Check className="size-3.5 text-emerald-600" /> : <Save className="size-3.5" />}
              <span>{savedNotice ? "ذخیره شد" : "ذخیره و ادامه"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Check className="size-3.5 text-sky-400" />
              <span>ذخیره در کلون</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
