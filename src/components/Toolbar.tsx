import React, { useState } from "react";
import {
  Archive,
  Award,
  Check,
  ChevronDown,
  CopyPlus,
  Download,
  FileDown,
  FileText,
  GitBranch,
  HelpCircle,
  Layers,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ResumeTemplate, TemplateId } from "@/types/templates";
import type { CareerToolsTab } from "./CareerToolsModal";

export type LayoutMode = "fit-page" | "fit-width" | "natural";
export type TemplateManagerTab = "gallery" | "import" | "save";

interface ToolbarProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  matchCount: number;
  onOpenATSInspector: () => void;
  onOpenPrintGuide: () => void;
  onPrint: () => void;
  onDownloadPdf?: (compressed?: boolean) => void;
  isDownloadingPdf?: boolean;
  onDownloadDocx?: () => void;
  isDownloadingDocx?: boolean;
  isPanelOpen?: boolean;
  onTogglePanel?: () => void;
  templates: ResumeTemplate[];
  activeTemplateId: TemplateId;
  hasUnsavedCustomizations?: boolean;
  onSelectTemplate: (id: TemplateId) => void;
  onOpenTemplateManager: (tab?: TemplateManagerTab) => void;
  hasActiveDraft?: boolean;
  onOpenTailorModal?: () => void;
  onOpenCareerTools?: (tab?: CareerToolsTab) => void;
  clonesCount?: number;
  hasActiveClone?: boolean;
  onQuickClone?: () => void;
  onOpenCloneArchive?: () => void;
}

export default function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  searchTerm,
  onSearchChange,
  matchCount,
  onOpenATSInspector,
  onOpenPrintGuide,
  onPrint,
  onDownloadPdf,
  isDownloadingPdf,
  onDownloadDocx,
  isDownloadingDocx,
  isPanelOpen,
  onTogglePanel,
  templates,
  activeTemplateId,
  hasUnsavedCustomizations,
  onSelectTemplate,
  onOpenTemplateManager,
  hasActiveDraft,
  onOpenTailorModal,
  onOpenCareerTools,
  clonesCount = 0,
  hasActiveClone = false,
  onQuickClone,
  onOpenCloneArchive,
}: ToolbarProps) {
  const [openMenu, setOpenMenu] = useState<"templates" | "export" | "more" | null>(null);
  const [justCloned, setJustCloned] = useState(false);

  const currentTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];
  const builtInTemplates = templates.filter((t) => t.isBuiltIn);
  const userTemplates = templates.filter((t) => !t.isBuiltIn);

  const toggleMenu = (menu: "templates" | "export" | "more") => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const handleQuickCloneClick = () => {
    if (!onQuickClone) return;
    onQuickClone();
    setJustCloned(true);
    window.setTimeout(() => setJustCloned(false), 1600);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-14 no-print">
      <div className="max-w-[1440px] h-full mx-auto flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand & Template Switcher */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className="inline-flex items-center justify-center size-8 rounded-lg bg-slate-900 text-white text-xs font-extrabold tracking-tight font-['Outfit',sans-serif] shrink-0"
              title="Shayan Esfahanizadeh"
            >
              SE
            </span>
            <span className="hidden lg:inline font-bold text-sm tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] whitespace-nowrap shrink-0">
              Shayan Esfahanizadeh
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Prioritized Template Switcher */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => toggleMenu("templates")}
              className="h-9 flex items-center gap-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-colors border border-slate-200/80 whitespace-nowrap shrink-0 cursor-pointer"
              title="انتخاب نوع قالب، ورژن‌ها و ایمپورت قالب"
            >
              <Layers className="size-3.5 text-sky-600 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">{currentTemplate.nameFa}</span>
              <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-slate-500">
                {currentTemplate.version}
              </span>
              {hasUnsavedCustomizations && (
                <span className="text-[11px] font-medium text-sky-700 hidden md:inline">
                  · سفارشی
                </span>
              )}
              <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
            </button>

            {openMenu === "templates" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div
                  className="absolute left-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-right"
                  dir="rtl"
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>انتخاب قالب رزومه</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenTemplateManager("gallery");
                      }}
                      className="text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
                    >
                      گالری و ورژن‌ها
                    </button>
                  </div>

                  {/* Built-in Templates */}
                  <div className="py-1 max-h-72 overflow-y-auto">
                    <div className="px-3.5 pt-1.5 pb-1 text-[10px] font-semibold text-slate-400">
                      قالب‌های پایه استاندارد
                    </div>
                    {builtInTemplates.map((t) => {
                      const isSelected = t.id === activeTemplateId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onSelectTemplate(t.id);
                            setOpenMenu(null);
                          }}
                          className={`w-full px-3.5 py-2 text-right flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-sky-50 text-sky-950 font-semibold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs truncate">{t.nameFa}</div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                              {t.pages} صفحه · ATS {t.atsScore}
                            </div>
                          </div>
                          {isSelected && <Check className="size-3.5 text-sky-600 shrink-0" />}
                        </button>
                      );
                    })}

                    {/* User Custom / Versioned / Imported Templates */}
                    {userTemplates.length > 0 && (
                      <>
                        <div className="px-3.5 pt-2.5 pb-1 mt-1 border-t border-slate-100 text-[10px] font-semibold text-slate-400">
                          قالب‌های من، ورژن‌ها و ایمپورتی ({userTemplates.length})
                        </div>
                        {userTemplates.map((t) => {
                          const isSelected = t.id === activeTemplateId;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                onSelectTemplate(t.id);
                                setOpenMenu(null);
                              }}
                              className={`w-full px-3.5 py-2 text-right flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-sky-50 text-sky-950 font-semibold"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="size-2 rounded-full shrink-0"
                                    style={{ backgroundColor: t.accentColor }}
                                  />
                                  <span className="text-xs truncate">{t.nameFa}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate font-mono">
                                  {t.version} · {t.isImported ? "ایمپورتی" : "سفارشی"}
                                </div>
                              </div>
                              {isSelected && <Check className="size-3.5 text-sky-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Quick Template Actions */}
                  <div className="pt-2 mt-1 border-t border-slate-100 px-2.5 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenTemplateManager("import");
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="size-3 text-sky-600" />
                      <span>ایمپورت قالب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenTemplateManager("save");
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Save className="size-3" />
                      <span>ساخت قالب / ورژن</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Core Editing & AI Workspace Controls */}
        <nav className="flex items-center gap-2 shrink-0" aria-label="ابزارهای اصلی ویرایش">
          {onTogglePanel && (
            <button
              type="button"
              onClick={onTogglePanel}
              className={`h-9 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap shrink-0 cursor-pointer ${
                isPanelOpen
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              title="ویرایش متن، تغییر رنگ، فونت و شخصی‌سازی چیدمان رزومه"
            >
              <SlidersHorizontal className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">ویرایش و شخصی‌سازی</span>
              <span className="inline sm:hidden">ویرایش</span>
            </button>
          )}

          {onOpenTailorModal && (
            <button
              type="button"
              onClick={onOpenTailorModal}
              className={`h-9 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap shrink-0 cursor-pointer ${
                hasActiveDraft
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50"
              }`}
              title="شخصی‌سازی هوشمند رزومه برای آگهی شغلی با هوش مصنوعی"
            >
              <Sparkles className={`size-3.5 shrink-0 ${hasActiveDraft ? "text-white" : "text-indigo-600"}`} />
              <span className="hidden md:inline">{hasActiveDraft ? "نسخه موقت AI" : "شخصی‌ساز AI"}</span>
              <span className="inline md:hidden">AI</span>
            </button>
          )}

          {/* Accessible Quick Clone + Clone Archive Split Control */}
          {onQuickClone && onOpenCloneArchive && (
            <div className="inline-flex items-stretch h-9 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
              <button
                type="button"
                onClick={handleQuickCloneClick}
                className={`flex items-center gap-1.5 px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  justCloned
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                }`}
                title="کلون سریع از وضعیت فعلی رزومه و ذخیره در آرشیو"
              >
                {justCloned ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <CopyPlus className="size-3.5 text-sky-600 shrink-0" />
                )}
                <span className="hidden sm:inline">{justCloned ? "کلون شد" : "کلون سریع"}</span>
              </button>
              <button
                type="button"
                onClick={onOpenCloneArchive}
                className={`flex items-center gap-1.5 px-2.5 border-l border-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  hasActiveClone
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
                title="باز کردن آرشیو کلون‌ها (گروه‌بندی، بج و فیلتر)"
              >
                <Archive className={`size-3.5 shrink-0 ${hasActiveClone ? "text-sky-400" : "text-slate-500"}`} />
                <span className="hidden lg:inline">آرشیو</span>
                {clonesCount > 0 && (
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      hasActiveClone ? "text-sky-300" : "text-slate-500"
                    }`}
                  >
                    {clonesCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Primary Export CTA + Compact Utilities Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Primary Action: Split Export PDF */}
          <div className="relative inline-flex items-stretch h-9 rounded-lg shadow-xs shrink-0">
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 rounded-l-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="ذخیره PDF وکتور با متن ۱۰۰٪ واقعی و قابل جستجو (Ctrl+P)"
            >
              <Printer className="size-3.5 shrink-0" />
              <span>خروجی PDF</span>
            </button>
            <button
              type="button"
              onClick={() => toggleMenu("export")}
              className="flex items-center justify-center px-2 rounded-r-lg bg-sky-700 hover:bg-sky-800 text-white border-l border-sky-500/40 transition-colors cursor-pointer shrink-0"
              title="گزینه‌های دانلود و پرینت PDF"
              aria-label="گزینه‌های بیشتر خروجی PDF"
            >
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "export" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-right"
                  dir="rtl"
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                    روش‌های دریافت فایل PDF
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onPrint();
                    }}
                    className="w-full px-3.5 py-2 text-right hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <Printer className="size-4 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">PDF متنی برداری (پیشنهادی)</div>
                      <div className="text-[10px] text-slate-500">بالاترین سازگاری ATS و وضوح بی‌نهایت</div>
                    </div>
                  </button>

                  {onDownloadPdf && (
                    <>
                      <button
                        type="button"
                        disabled={isDownloadingPdf}
                        onClick={() => {
                          setOpenMenu(null);
                          onDownloadPdf(false);
                        }}
                        className="w-full px-3.5 py-2 text-right hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Download className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">دانلود مستقیم با کیفیت بالا</div>
                          <div className="text-[10px] text-slate-500">خروجی یک‌کلیک با لایه متن پنهان</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled={isDownloadingPdf}
                        onClick={() => {
                          setOpenMenu(null);
                          onDownloadPdf(true);
                        }}
                        className="w-full px-3.5 py-2 text-right hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FileDown className="size-4 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">دانلود نسخه فشرده و کم‌حجم</div>
                          <div className="text-[10px] text-slate-500">مناسب فرم‌هایی با محدودیت حجم فایل</div>
                        </div>
                      </button>
                    </>
                  )}

                  {onDownloadDocx && (
                    <button
                      type="button"
                      disabled={isDownloadingDocx}
                      onClick={() => {
                        setOpenMenu(null);
                        onDownloadDocx();
                      }}
                      className="w-full px-3.5 py-2 text-right hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer disabled:opacity-50 border-t border-slate-100 mt-1 pt-2"
                    >
                      <FileText className="size-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {isDownloadingDocx ? "در حال ساخت Word..." : "دانلود Word استاندارد (.docx)"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          تک‌ستونه، قابل ویرایش و ۱۰۰٪ سازگار با ATS
                        </div>
                      </div>
                    </button>
                  )}

                  <div className="mt-1 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenPrintGuide();
                      }}
                      className="w-full px-3.5 py-2 text-right hover:bg-slate-50 flex items-center gap-2 text-xs text-slate-600 cursor-pointer"
                    >
                      <HelpCircle className="size-3.5 text-slate-400 shrink-0" />
                      <span>راهنمای تنظیمات پرینت A4</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Overflow Utilities Menu (Search, Zoom, ATS, Template Studio) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => toggleMenu("more")}
              className={`size-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 ${
                openMenu === "more"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title="ابزارهای بیشتر: جستجو، زوم، بررسی ATS و مدیریت قالب‌ها"
              aria-label="ابزارهای بیشتر"
            >
              <MoreHorizontal className="size-4" />
            </button>

            {openMenu === "more" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-right space-y-3"
                  dir="rtl"
                >
                  {/* Search inside Utilities */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-500">جستجو در متن رزومه</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="مثلاً: Product Discovery..."
                        className="w-full h-8 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                        dir="auto"
                      />
                      <Search className="size-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      {searchTerm && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums text-sky-700 font-semibold">
                          {matchCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-700">بزرگ‌نمایی نمایش</span>
                    <div className="flex items-center h-8 bg-slate-100 rounded-lg px-1 text-slate-700 border border-slate-200/80">
                      <button
                        type="button"
                        onClick={onZoomOut}
                        className="p-1 rounded hover:bg-white transition-colors cursor-pointer"
                        title="کوچک‌نمایی"
                      >
                        <ZoomOut className="size-3.5" />
                      </button>
                      <span className="text-[11px] font-mono tabular-nums px-2 min-w-[44px] text-center select-none">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={onZoomIn}
                        className="p-1 rounded hover:bg-white transition-colors cursor-pointer"
                        title="بزرگ‌نمایی"
                      >
                        <ZoomIn className="size-3.5" />
                      </button>
                      {zoom !== 1 && (
                        <button
                          type="button"
                          onClick={onResetZoom}
                          className="p-1 rounded hover:bg-white transition-colors border-r border-slate-200 mr-0.5 cursor-pointer"
                          title="بازنشانی زوم"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    {onOpenCareerTools && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenCareerTools("audit");
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2.5 text-xs font-semibold text-indigo-900 transition-colors cursor-pointer"
                      >
                        <Award className="size-3.5 text-indigo-600 shrink-0" />
                        <span>ممیزی بولت‌ها، کاور لتر و مصاحبه AI</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenTemplateManager("gallery");
                      }}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <GitBranch className="size-3.5 text-sky-600 shrink-0" />
                      <span>مدیریت قالب‌ها، ورژن‌ها و ایمپورت</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenATSInspector();
                      }}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                      <span>بررسی متن خالص ATS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenPrintGuide();
                      }}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="size-3.5 text-slate-500 shrink-0" />
                      <span>راهنمای چاپ A4</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
