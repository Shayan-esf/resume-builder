import React, { useEffect, useState } from "react";
import {
  Check,
  Code2,
  Download,
  FileJson,
  GitBranch,
  History,
  Layers,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import {
  BASE_TYPE_LABELS,
  BaseTemplateType,
  STARTER_CUSTOM_HTML_TEMPLATE,
} from "@/types/templates";
import { computeNextVersion } from "@/utils/templateTheme";
import type { TemplateManagerTab } from "./Toolbar";

interface TemplateManagerModalProps {
  isOpen: boolean;
  initialTab?: TemplateManagerTab;
  onClose: () => void;
  onPrint: () => void;
  onOpenCustomizePanel: () => void;
}

export default function TemplateManagerModal({
  isOpen,
  initialTab = "gallery",
  onClose,
  onPrint,
  onOpenCustomizePanel,
}: TemplateManagerModalProps) {
  const {
    allTemplates,
    customTemplates,
    activeTemplateId,
    activeTemplate,
    liveBaseType,
    liveCustomization,
    hasUnsavedCustomizations,
    effectiveTailoredContent,
    selectTemplate,
    createTemplateVersion,
    saveCustomizationsAsTemplate,
    importTemplate,
    exportTemplateJSON,
    deleteCustomTemplate,
    restoreTemplateChangelog,
  } = useResume();

  const [activeTab, setActiveTab] = useState<TemplateManagerTab>(initialTab);
  const [expandedChangelogId, setExpandedChangelogId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [galleryNotice, setGalleryNotice] = useState<string | null>(null);

  const showGalleryNotice = (msg: string) => {
    setGalleryNotice(msg);
    window.setTimeout(() => {
      setGalleryNotice((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  const formatPersianTime = (ts: number) => {
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
  };

  // Import form state
  const [importName, setImportName] = useState("");
  const [importVersion, setImportVersion] = useState("v1.0");
  const [importBaseType, setImportBaseType] = useState<BaseTemplateType>("executive-ats-2page");
  const [importRawText, setImportRawText] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Save customizations as template form state
  const [saveMode, setSaveMode] = useState<"new" | "new-version" | "update-current">("new-version");
  const [saveNameFa, setSaveNameFa] = useState("");
  const [saveVersion, setSaveVersion] = useState("v2.0");
  const [saveDescFa, setSaveDescFa] = useState("");
  const [saveRecommendedFor, setSaveRecommendedFor] = useState("");
  const [includeContentSnapshot, setIncludeContentSnapshot] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setImportError(null);
      setImportSuccess(null);
      setSaveNotice(null);

      const nextVer = computeNextVersion(
        activeTemplate.version,
        allTemplates,
        activeTemplate.parentTemplateId || activeTemplate.id
      );
      setSaveMode(activeTemplate.isBuiltIn ? "new-version" : "update-current");
      setSaveVersion(activeTemplate.isBuiltIn ? nextVer : activeTemplate.version);
      setSaveNameFa(
        activeTemplate.isBuiltIn
          ? `${activeTemplate.nameFa} (نسخه سفارشی)`
          : activeTemplate.nameFa
      );
      setSaveDescFa(activeTemplate.descriptionFa);
      setSaveRecommendedFor(activeTemplate.recommendedFor);
      setIncludeContentSnapshot(Boolean(effectiveTailoredContent));
    }
  }, [isOpen, initialTab, activeTemplate, allTemplates, effectiveTailoredContent]);

  if (!isOpen) return null;

  const builtInTemplates = allTemplates.filter((t) => t.isBuiltIn);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    if (!importName.trim()) {
      setImportName(file.name.replace(/\.[^.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      setImportRawText(text);
      if (/\.(html?|htm)$/i.test(file.name) || text.trim().startsWith("<")) {
        setImportBaseType("custom-html");
      }
      setImportError(null);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(null);

    const result = importTemplate({
      rawText: importRawText,
      filename: importFileName || undefined,
      nameFa: importName.trim() || undefined,
      version: importVersion.trim() || "v1.0",
      baseType: importBaseType,
    });

    if (!result.ok) {
      setImportError(result.error || "خطا در ایمپورت قالب");
      return;
    }

    setImportSuccess(`قالب «${result.template?.nameFa}» با موفقیت ایمپورت و فعال شد.`);
    setImportRawText("");
    setImportFileName("");
    setImportName("");
    setTimeout(() => {
      setActiveTab("gallery");
    }, 800);
  };

  const handleSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveCustomizationsAsTemplate({
      nameFa: saveNameFa.trim() || "قالب سفارشی من",
      version: saveVersion.trim() || "v1.0",
      descriptionFa: saveDescFa.trim(),
      recommendedFor: saveRecommendedFor.trim(),
      mode: saveMode,
      includeContentSnapshot,
    });

    setSaveNotice(`قالب «${saved.nameFa} (${saved.version})» ذخیره و در لیست قالب‌های شما ثبت شد.`);
    setTimeout(() => {
      setActiveTab("gallery");
    }, 800);
  };

  const handleForkAndCustomize = (sourceId: string) => {
    const created = createTemplateVersion(sourceId);
    if (created) {
      onClose();
      onOpenCustomizePanel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Layers className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">استودیو و مدیریت قالب‌های رزومه</h2>
              <p className="text-xs text-slate-500">
                انتخاب نوع قالب، ایمپورت فایل قالب، ساخت ورژن جدید و تبدیل شخصی‌سازی‌ها به قالب قابل استفاده مجدد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "gallery"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="size-3.5" />
            <span>گالری قالب‌ها و ورژن‌ها ({allTemplates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "import"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="size-3.5" />
            <span>ایمپورت قالب (JSON / HTML)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("save")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "save"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Save className="size-3.5" />
            <span>تبدیل رزومه فعلی به قالب</span>
            {hasUnsavedCustomizations && (
              <span className="text-[10px] font-bold text-sky-700">· تغییرات جدید</span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {/* ==================== TAB 1: GALLERY & VERSIONS ==================== */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              {/* Built-in Base Templates */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">۱. قالب‌های استاندارد پایه</h3>
                    <p className="text-xs text-slate-500">
                      انتخاب ساختار اصلی رزومه یا ساخت یک ورژن شخصی‌سازی‌شده از روی آن
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {builtInTemplates.map((tpl) => {
                    const isSelected = tpl.id === activeTemplateId;
                    return (
                      <div
                        key={tpl.id}
                        className={`rounded-xl border bg-white p-4 flex flex-col justify-between transition-all ${
                          isSelected
                            ? "border-sky-500 ring-2 ring-sky-500/15 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-2.5">
                            <span className="font-medium">{tpl.badge}</span>
                            <span className="font-mono tabular-nums">
                              {tpl.version} · {tpl.pages} صفحه
                            </span>
                          </div>

                          <div
                            className={`h-20 rounded-lg bg-gradient-to-br ${tpl.previewGradient} p-3 text-white flex flex-col justify-between mb-3`}
                          >
                            <div className="space-y-1 opacity-90">
                              <div className="h-1.5 w-16 bg-white/85 rounded" />
                              <div className="h-1 w-24 bg-white/50 rounded" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums opacity-85 pt-1 border-t border-white/20">
                              <span>{BASE_TYPE_LABELS[tpl.baseType].shortFa}</span>
                              <span>ATS {tpl.atsScore}</span>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mb-1">{tpl.nameFa}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mb-3">{tpl.descriptionFa}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              selectTemplate(tpl.id);
                              onClose();
                            }}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-sky-600 text-white"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            {isSelected && <Check className="size-3.5" />}
                            <span>{isSelected ? "قالب فعال فعلی" : "انتخاب این قالب"}</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleForkAndCustomize(tpl.id)}
                              className="py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="ساخت یک ورژن جدید از این قالب و باز کردن پنل شخصی‌سازی"
                            >
                              <GitBranch className="size-3 text-sky-600" />
                              <span>ورژن جدید</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => exportTemplateJSON(tpl.id)}
                              className="py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="دانلود ساختار این قالب به صورت JSON"
                            >
                              <Download className="size-3 text-slate-500" />
                              <span>خروجی JSON</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* User's Custom, Versioned & Imported Templates */}
              <section className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      ۲. قالب‌های شخصی‌سازی‌شده، ورژن‌ها و ایمپورتی شما ({customTemplates.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      قالب‌هایی که وارد کرده‌اید یا از تغییرات رزومه ساخته‌اید اینجا ذخیره می‌شوند
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("import")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="size-3.5 text-sky-600" />
                      <span>ایمپورت قالب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("save")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="size-3.5" />
                      <span>ذخیره رزومه فعلی به عنوان قالب</span>
                    </button>
                  </div>
                </div>

                {galleryNotice && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span>{galleryNotice}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setGalleryNotice(null)}
                      className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}

                {customTemplates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      هنوز قالب اختصاصی یا ورژن جدیدی نساخته‌اید.
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      می‌توانید روی هر قالب پایه دکمه «ورژن جدید» را بزنید، یک فایل قالب ایمپورت کنید، یا از پنل «ویرایش و شخصی‌سازی» تغییرات خود را روی رزومه اعمال و سپس تبدیل به قالب کنید.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customTemplates.map((tpl) => {
                      const isSelected = tpl.id === activeTemplateId;
                      const isConfirmingDelete = confirmDeleteId === tpl.id;
                      const isChangelogOpen = expandedChangelogId === tpl.id;
                      const changelog = tpl.changelog || [];

                      return (
                        <div
                          key={tpl.id}
                          className={`rounded-xl border bg-white p-4 flex flex-col justify-between gap-3 transition-all ${
                            isSelected
                              ? "border-sky-500 ring-2 ring-sky-500/15"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="size-3 rounded-sm shrink-0 border border-black/10"
                                    style={{ backgroundColor: tpl.accentColor }}
                                  />
                                  <h4 className="text-sm font-bold text-slate-900 truncate">{tpl.nameFa}</h4>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                                    {tpl.version}
                                  </span>
                                  <span>·</span>
                                  <span>{BASE_TYPE_LABELS[tpl.baseType].shortFa}</span>
                                  {tpl.parentTemplateName && (
                                    <>
                                      <span>·</span>
                                      <span>برگرفته از {tpl.parentTemplateName}</span>
                                    </>
                                  )}
                                  {tpl.contentSnapshot && (
                                    <>
                                      <span>·</span>
                                      <span className="text-sky-700 font-medium">دارای محتوای اختصاصی</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : tpl.id)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                                  isConfirmingDelete
                                    ? "bg-red-100 text-red-700"
                                    : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                }`}
                                title="حذف این قالب"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {isConfirmingDelete && (
                              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-red-800">
                                  از حذف قالب «{tpl.nameFa}» مطمئن هستید؟
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                  >
                                    انصراف
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteCustomTemplate(tpl.id);
                                      setConfirmDeleteId(null);
                                      showGalleryNotice(`قالب «${tpl.nameFa}» حذف شد.`);
                                    }}
                                    className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold cursor-pointer"
                                  >
                                    بله، حذف شود
                                  </button>
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-slate-600 leading-relaxed">{tpl.descriptionFa}</p>

                            {/* Expandable Template Changelog & 1-Click Rollback */}
                            {isChangelogOpen && (
                              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                  <span className="inline-flex items-center gap-1.5">
                                    <History className="size-3.5 text-sky-600" />
                                    <span>تاریخچه نسخه‌های قالب ({changelog.length})</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedChangelogId(null)}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                                {changelog.length === 0 ? (
                                  <p className="text-[11px] text-slate-500">هنوز تغییری ثبت نشده است.</p>
                                ) : (
                                  <div className="space-y-1.5 max-h-44 overflow-y-auto pl-1">
                                    {changelog.map((entry, idx) => (
                                      <div
                                        key={entry.id}
                                        className="p-2 rounded-md bg-white border border-slate-200/80 flex items-center justify-between gap-2"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                                            <span className="font-mono tabular-nums text-sky-700">
                                              #{entry.revision}
                                            </span>
                                            <span className="truncate">{entry.titleFa}</span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                                            {entry.version} · {formatPersianTime(entry.timestamp)}
                                          </div>
                                        </div>
                                        {idx > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              restoreTemplateChangelog(tpl.id, entry.id);
                                              showGalleryNotice(
                                                `قالب «${tpl.nameFa}» به نسخه #${entry.revision} برگردانده شد.`
                                              );
                                            }}
                                            className="px-2 py-1 rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                                          >
                                            <RotateCcw className="size-2.5" />
                                            <span>بازگشت</span>
                                          </button>
                                        ) : (
                                          <span className="text-[10px] font-medium text-emerald-700 shrink-0">
                                            نسخه فعلی
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                selectTemplate(tpl.id);
                                onClose();
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                                isSelected
                                  ? "bg-sky-600 text-white"
                                  : "bg-slate-900 hover:bg-slate-800 text-white"
                              }`}
                            >
                              {isSelected && <Check className="size-3.5" />}
                              <span>{isSelected ? "فعال" : "اعمال قالب"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                selectTemplate(tpl.id);
                                onClose();
                                onOpenCustomizePanel();
                              }}
                              className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="ویرایش و شخصی‌سازی این قالب"
                            >
                              <SlidersHorizontal className="size-3" />
                              <span>شخصی‌سازی</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleForkAndCustomize(tpl.id)}
                              className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="ساخت ورژن جدید از این قالب"
                            >
                              <GitBranch className="size-3 text-sky-600" />
                              <span>ورژن جدید</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedChangelogId(isChangelogOpen ? null : tpl.id)
                              }
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                                isChangelogOpen
                                  ? "border-sky-300 bg-sky-50 text-sky-800"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                              title="تاریخچه تغییرات و بازگشت به نسخه قبلی"
                            >
                              <History className="size-3" />
                              <span className="font-mono tabular-nums">{changelog.length}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => exportTemplateJSON(tpl.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                              title="خروجی JSON قالب"
                            >
                              <Download className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Footer strip */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    قالب‌های شما به صورت خودکار در مرورگر ذخیره می‌شوند و قابلیت خروجی JSON و چاپ برداری ATS دارند.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPrint();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Printer className="size-3.5" />
                  <span>چاپ قالب فعال</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: IMPORT TEMPLATE ==================== */}
          {activeTab === "import" && (
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ایمپورت قالب از فایل یا کد</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      فایل قالب <span className="font-mono">.json</span> (خروجی همین برنامه یا تنظیمات سفارشی) یا قالب <span className="font-mono">.html</span> را وارد کنید.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap">
                      <Upload className="size-3.5" />
                      <span>انتخاب فایل (.json / .html)</span>
                      <input
                        type="file"
                        accept=".json,.html,.htm"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImportRawText(STARTER_CUSTOM_HTML_TEMPLATE);
                        setImportBaseType("custom-html");
                        setImportName("قالب HTML اختصاصی");
                        setImportVersion("v1.0");
                        setImportFileName("starter-template.html");
                        setImportError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <Code2 className="size-3.5" />
                      <span>نمونه قالب HTML آماده</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">نام قالب واردشده</label>
                    <input
                      type="text"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                      placeholder="مثلاً: قالب اروپایی مینیمال"
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">شماره ورژن</label>
                    <input
                      type="text"
                      value={importVersion}
                      onChange={(e) => setImportVersion(e.target.value)}
                      placeholder="v1.0"
                      className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">نوع ساختار قالب</label>
                    <select
                      value={importBaseType}
                      onChange={(e) => setImportBaseType(e.target.value as BaseTemplateType)}
                      className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    >
                      <option value="executive-ats-2page">اجرایی ۲ صفحه ATS</option>
                      <option value="modern-figma">مدرن دیزاین‌سیستم</option>
                      <option value="minimal-ats">کلاسیک ATS تک‌صفحه</option>
                      <option value="custom-html">قالب کد HTML / CSS اختصاصی</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      محتوای فایل قالب (JSON یا HTML/CSS)
                    </label>
                    {importFileName && (
                      <span className="text-[11px] font-mono text-sky-700">{importFileName}</span>
                    )}
                  </div>
                  <textarea
                    rows={10}
                    value={importRawText}
                    onChange={(e) => setImportRawText(e.target.value)}
                    placeholder='کد JSON قالب یا کد HTML/CSS رزومه را اینجا پیست کنید یا از دکمه «انتخاب فایل» استفاده کنید...'
                    className="w-full p-3 text-xs font-mono leading-relaxed rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    در قالب‌های HTML می‌توانید از متغیرهای زنده مثل{" "}
                    <code className="font-mono text-sky-700">{"{{fullName}}"}</code>،{" "}
                    <code className="font-mono text-sky-700">{"{{role}}"}</code>،{" "}
                    <code className="font-mono text-sky-700">{"{{summary}}"}</code>،{" "}
                    <code className="font-mono text-sky-700">{"{{skills}}"}</code>،{" "}
                    <code className="font-mono text-sky-700">{"{{experiences}}"}</code> و{" "}
                    <code className="font-mono text-sky-700">{"{{education}}"}</code> استفاده کنید تا اطلاعات رزومه شما به صورت خودکار داخل آن قرار بگیرد.
                  </p>
                </div>

                {importError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    {importSuccess}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => exportTemplateJSON(activeTemplateId)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    <FileJson className="size-3.5 text-sky-600" />
                    <span>دانلود JSON قالب فعلی به عنوان الگو</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="size-3.5" />
                    <span>ایمپورت و فعال‌سازی قالب</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ==================== TAB 3: SAVE CUSTOMIZATIONS AS TEMPLATE ==================== */}
          {activeTab === "save" && (
            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    تبدیل شخصی‌سازی‌های فعلی رزومه به یک قالب قابل استفاده مجدد
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    تمام تنظیمات فعلی رزومه (ساختار{" "}
                    <strong className="text-slate-700">{BASE_TYPE_LABELS[liveBaseType].shortFa}</strong>، رنگ تاکیدی، فونت، فاصله‌گذاری، بخش‌های فعال و کدهای سفارشی) به صورت یک قالب مستقل یا ورژن جدید ذخیره می‌شوند.
                  </p>
                </div>

                {/* Live Config Preview Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">ساختار:</span>
                    <span className="font-semibold text-slate-900">{BASE_TYPE_LABELS[liveBaseType].shortFa}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">رنگ:</span>
                    <span
                      className="size-3.5 rounded-sm border border-black/10 inline-block"
                      style={{ backgroundColor: liveCustomization.accentColor }}
                    />
                    <span className="font-mono text-[11px]">{liveCustomization.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">تراکم:</span>
                    <span className="font-semibold text-slate-900">
                      {liveCustomization.density === "compact"
                        ? "فشرده"
                        : liveCustomization.density === "relaxed"
                        ? "باز"
                        : "متعادل"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">مقیاس فونت:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {Math.round(liveCustomization.fontSizeScale * 100)}%
                    </span>
                  </div>
                </div>

                {/* Save Mode */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">نحوه ذخیره‌سازی</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSaveMode("new-version");
                        const nextVer = computeNextVersion(
                          activeTemplate.version,
                          allTemplates,
                          activeTemplate.parentTemplateId || activeTemplate.id
                        );
                        setSaveVersion(nextVer);
                      }}
                      className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                        saveMode === "new-version"
                          ? "bg-sky-50 border-sky-500 text-sky-950"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">ورژن جدید از قالب فعلی</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ساخت نسخه بعدی با حفظ سابقه قالب پایه
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSaveMode("new");
                        setSaveVersion("v1.0");
                      }}
                      className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                        saveMode === "new"
                          ? "bg-sky-50 border-sky-500 text-sky-950"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">قالب مستقل جدید</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ثبت به عنوان یک قالب کاملاً جدید در گالری
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={activeTemplate.isBuiltIn}
                      onClick={() => {
                        setSaveMode("update-current");
                        setSaveVersion(activeTemplate.version);
                      }}
                      className={`p-3 rounded-xl border text-right transition-colors ${
                        activeTemplate.isBuiltIn
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : saveMode === "update-current"
                          ? "bg-sky-50 border-sky-500 text-sky-950 cursor-pointer"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      <div className="text-xs font-bold">بروزرسانی همین قالب</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {activeTemplate.isBuiltIn
                          ? "قالب‌های پایه ثابت هستند"
                          : "ذخیره روی همین قالب سفارشی"}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Metadata Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">نام قالب</label>
                    <input
                      type="text"
                      required
                      value={saveNameFa}
                      onChange={(e) => setSaveNameFa(e.target.value)}
                      placeholder="مثلاً: قالب مدیر محصول بین‌المللی"
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ورژن</label>
                    <input
                      type="text"
                      required
                      value={saveVersion}
                      onChange={(e) => setSaveVersion(e.target.value)}
                      placeholder="v2.0"
                      className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">توضیح کوتاه (اختیاری)</label>
                    <input
                      type="text"
                      value={saveDescFa}
                      onChange={(e) => setSaveDescFa(e.target.value)}
                      placeholder="ویژگی‌های این قالب یا تغییرات این ورژن..."
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">مناسب برای (اختیاری)</label>
                    <input
                      type="text"
                      value={saveRecommendedFor}
                      onChange={(e) => setSaveRecommendedFor(e.target.value)}
                      placeholder="مثلاً: استارتاپ‌های هوش مصنوعی، پوزیشن‌های ریموت"
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Include Content Snapshot Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeContentSnapshot}
                    onChange={(e) => setIncludeContentSnapshot(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      محتوای فعلی رزومه {effectiveTailoredContent ? "(شامل نسخه شخصی‌سازی‌شده AI)" : ""} هم داخل این قالب ذخیره شود
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      اگر غیرفعال باشد، فقط استایل، رنگ‌بندی، فونت و چیدمان به عنوان قالب ذخیره می‌شود و روی هر محتوایی قابل اعمال است.
                    </div>
                  </div>
                </label>

                {saveNotice && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    {saveNotice}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCustomizePanel();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>تنظیم بیشتر رنگ و چیدمان</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <Save className="size-3.5" />
                    <span>ذخیره به عنوان قالب</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
