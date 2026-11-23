import React, { useEffect, useState } from "react";
import { useResume } from "@/context/ResumeContext";
import {
  ACCENT_PRESETS,
  BASE_TYPE_LABELS,
  BaseTemplateType,
  DensityMode,
  FONT_PAIRING_OPTIONS,
  HeaderAlignMode,
  TemplateSectionVisibility,
} from "@/types/templates";
import {
  Bot,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  Code2,
  Download,
  Eye,
  EyeOff,
  Mail,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
import { MASTER_RESUME_CONTENT } from "@/types/tailoring";
import {
  EXPERIENCE_COMPANY_LABELS,
  extractBulletPreview,
  isExperienceBulletAtsOnly,
  toggleExperienceBulletAtsOnly,
} from "@/utils/experienceBullets";

export type EditorPanelTab = "design" | "experience" | "profile" | "contact" | "skills" | "tools";

interface ResumeEditorPanelProps {
  onPrint?: () => void;
  initialTab?: EditorPanelTab;
  onSaveAsTemplate?: () => void;
  onOpenTemplateImport?: () => void;
}

export default function ResumeEditorPanel({
  onPrint,
  initialTab,
  onSaveAsTemplate,
  onOpenTemplateImport,
}: ResumeEditorPanelProps) {
  const {
    data,
    effectiveTailoredContent,
    isEditMode,
    setIsEditMode,
    isPanelOpen,
    setIsPanelOpen,
    selectedExpId,
    setSelectedExpId,
    activeTemplate,
    liveBaseType,
    liveCustomization,
    liveCustomHtml,
    hasUnsavedCustomizations,
    setLiveBaseType,
    updateLiveCustomization,
    updateLiveSections,
    setLiveCustomHtml,
    resetLiveCustomizations,
    updateProfile,
    updateContact,
    updateExperience,
    addExperience,
    deleteExperience,
    addExperienceBullet,
    updateExperienceBullet,
    deleteExperienceBullet,
    addSkill,
    deleteSkill,
    updateProject,
    addProject,
    deleteProject,
    resetToDefaults,
    exportJSON,
    importJSON,
  } = useResume();

  const [activeTab, setActiveTab] = useState<EditorPanelTab>(initialTab || "design");
  const [newSkillText, setNewSkillText] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [jsonImportError, setJsonImportError] = useState("");
  const [showAdvancedCss, setShowAdvancedCss] = useState(false);
  const [expandedAtsExpId, setExpandedAtsExpId] = useState<string>("mci");

  const activeWorkExperiences = (
    effectiveTailoredContent?.experiences || MASTER_RESUME_CONTENT.experiences
  ).filter((exp) => !(liveBaseType === "executive-ats-2page" && exp.id === "uxcel"));

  const totalAtsOnlyBullets = activeWorkExperiences.reduce((acc, exp) => {
    const hidden = liveCustomization.atsOnlyExperienceBullets?.[exp.id] || [];
    return acc + hidden.filter((idx) => idx < exp.bullets.length).length;
  }, 0);

  const resolveCanonicalExpId = (expId: string): string => {
    if (expId === "delband") return "mci";
    if (expId === "ofoq-dade") return "ofoq";
    return expId;
  };

  const handleToggleBulletAtsOnly = (expId: string, bulletIdx: number) => {
    const canonicalId = resolveCanonicalExpId(expId);
    updateLiveCustomization({
      atsOnlyExperienceBullets: toggleExperienceBulletAtsOnly(
        liveCustomization.atsOnlyExperienceBullets,
        canonicalId,
        bulletIdx
      ),
    });
  };

  useEffect(() => {
    if (initialTab && isPanelOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isPanelOpen]);

  const currentExperience = data.experiences.find((exp) => exp.id === selectedExpId) || data.experiences[0];

  const handleAddBullet = () => {
    if (currentExperience) {
      addExperienceBullet(currentExperience.id, "دستاورد یا مسئولیت جدید با متریک و شاخص اثرگذاری قابل اندازه‌گیری");
    }
  };

  const handleSkillAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillText.trim()) {
      addSkill(newSkillText.trim());
      setNewSkillText("");
    }
  };

  const sectionToggleList: { key: keyof TemplateSectionVisibility; label: string }[] = [
    { key: "summary", label: "خلاصه حرفه‌ای (Summary)" },
    { key: "skills", label: "مهارت‌ها (Skills)" },
    { key: "experience", label: "سوابق کاری (Experience)" },
    { key: "education", label: "تحصیلات (Education)" },
    { key: "projects", label: "پروژه‌های کلیدی (Projects)" },
    { key: "certifications", label: "مدارک و گواهینامه‌ها (Certifications)" },
    { key: "honors", label: "افتخارات و ارائه‌ها (Honors)" },
  ];

  // If panel is closed, render a clean minimal trigger on the right side
  if (!isPanelOpen) {
    return (
      <aside className="fixed top-20 right-0 z-30 no-print" dir="rtl">
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-3.5 rounded-l-xl shadow-md transition-all cursor-pointer border-y border-l border-slate-700"
          title="باز کردن پنل ویرایش و شخصی‌سازی قالب رزومه"
          id="open-editor-panel-btn"
        >
          <Sliders className="size-3.5 text-sky-400" />
          <span className="hidden sm:inline">ویرایش و شخصی‌سازی</span>
          <ChevronLeft className="size-3.5 text-slate-400" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="fixed top-0 right-0 h-full w-[420px] max-w-[95vw] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-sans no-print"
      dir="rtl"
      id="resume-management-panel"
    >
      {/* Panel Top Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Sliders className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">ویرایشگر و شخصی‌ساز قالب</h2>
            <p className="text-[11px] text-slate-400 truncate">
              {activeTemplate.nameFa} · {activeTemplate.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              isEditMode
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="حالت پیش‌نمایش یا هایلایت ویرایش"
          >
            {isEditMode ? "ویرایش روشن" : "پیش‌نمایش"}
          </button>

          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="size-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="بستن پنل"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
        {(
          [
            { id: "design", label: "شخصی‌سازی قالب", icon: Palette },
            { id: "experience", label: "سوابق", icon: Briefcase },
            { id: "profile", label: "مشخصات", icon: User },
            { id: "contact", label: "تماس", icon: Mail },
            { id: "skills", label: "مهارت و پروژه", icon: Wrench },
            { id: "tools", label: "ابزارها", icon: Sparkles },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ==================== TAB: DESIGN & TEMPLATE CUSTOMIZATION ==================== */}
        {activeTab === "design" && (
          <div className="space-y-4">
            {/* Save / Convert to Template Callout */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">تبدیل تنظیمات به قالب دائمی</span>
                {hasUnsavedCustomizations && (
                  <span className="text-[11px] font-semibold text-sky-700">تغییرات اعمال شده</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                هر تغییری که اینجا روی ساختار، رنگ، فونت یا بخش‌ها بدهید بلافاصله روی رزومه اعمال می‌شود و هر زمان بخواهید می‌توانید آن را به یک قالب یا ورژن جدید تبدیل کنید.
              </p>
              <div className="flex items-center gap-2">
                {onSaveAsTemplate && (
                  <button
                    type="button"
                    onClick={onSaveAsTemplate}
                    className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Save className="size-3.5" />
                    <span>تبدیل به قالب / ورژن جدید</span>
                  </button>
                )}
                {hasUnsavedCustomizations && (
                  <button
                    type="button"
                    onClick={resetLiveCustomizations}
                    className="py-2 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                    title="بازنشانی تنظیمات این قالب به حالت ذخیره شده"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>بازنشانی</span>
                  </button>
                )}
              </div>
            </div>

            {/* 1. Base Template Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">۱. نوع ساختار پایه قالب</label>
                {onOpenTemplateImport && (
                  <button
                    type="button"
                    onClick={onOpenTemplateImport}
                    className="text-[11px] font-semibold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="size-3" />
                    <span>ایمپورت قالب</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  ["executive-ats-2page", "modern-figma", "minimal-ats", "custom-html"] as BaseTemplateType[]
                ).map((typeId) => {
                  const isSelected = liveBaseType === typeId;
                  return (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => setLiveBaseType(typeId)}
                      className={`p-2.5 rounded-xl border text-right transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-sky-50 border-sky-500 text-sky-950 font-semibold"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs">{BASE_TYPE_LABELS[typeId].shortFa}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {BASE_TYPE_LABELS[typeId].pages} صفحه
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Accent Color */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">۲. رنگ تاکیدی و هویت بصری</label>
                <span className="text-[11px] font-mono text-slate-500">{liveCustomization.accentColor}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((preset) => {
                  const isActive =
                    liveCustomization.accentColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => updateLiveCustomization({ accentColor: preset.hex })}
                      className={`size-8 rounded-lg flex items-center justify-center transition-transform cursor-pointer border ${
                        isActive
                          ? "ring-2 ring-offset-2 ring-slate-900 scale-105 border-transparent"
                          : "border-black/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {isActive && <Check className="size-4 text-white" />}
                    </button>
                  );
                })}
                <label
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title="انتخاب رنگ دلخواه"
                >
                  <input
                    type="color"
                    value={liveCustomization.accentColor}
                    onChange={(e) => updateLiveCustomization({ accentColor: e.target.value })}
                    className="size-4 rounded border-0 p-0 bg-transparent cursor-pointer"
                  />
                  <span>دلخواه</span>
                </label>
              </div>
            </div>

            {/* 3. Typography & Scale */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">۳. فونت و اندازه متن</label>
              <select
                value={liveCustomization.fontPairing}
                onChange={(e) =>
                  updateLiveCustomization({
                    fontPairing: e.target.value as typeof liveCustomization.fontPairing,
                  })
                }
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                {FONT_PAIRING_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.labelFa} — {f.label}
                  </option>
                ))}
              </select>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">مقیاس اندازه متن</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {Math.round(liveCustomization.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.92}
                  max={1.1}
                  step={0.02}
                  value={liveCustomization.fontSizeScale}
                  onChange={(e) =>
                    updateLiveCustomization({ fontSizeScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Density & Header Alignment */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">۴. تراکم و فاصله‌گذاری صفحه</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      { id: "compact", label: "فشرده" },
                      { id: "balanced", label: "متعادل" },
                      { id: "relaxed", label: "باز" },
                    ] as { id: DensityMode; label: string }[]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updateLiveCustomization({ density: d.id })}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        liveCustomization.density === d.id
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">چیدمان هدر رزومه</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      { id: "center", label: "وسط‌چین" },
                      { id: "left", label: "چپ‌چین" },
                      { id: "split", label: "دوستونه" },
                    ] as { id: HeaderAlignMode; label: string }[]
                  ).map((align) => (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() => updateLiveCustomization({ headerAlign: align.id })}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        liveCustomization.headerAlign === align.id
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Visual Elements & Section Visibility */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">۵. نمایش بخش‌ها و المان‌های بصری</label>

              <div className="grid grid-cols-1 gap-1.5">
                <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                  <span>نوار رنگی بالای صفحه (Top Accent Bar)</span>
                  <input
                    type="checkbox"
                    checked={liveCustomization.topAccentBar}
                    onChange={(e) => updateLiveCustomization({ topAccentBar: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                  <span>نمایش لوگوی شرکت‌ها و دانشگاه</span>
                  <input
                    type="checkbox"
                    checked={liveCustomization.showLogos}
                    onChange={(e) => updateLiveCustomization({ showLogos: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                  <span>نمایش برچسب مهارت‌ها زیر هر سابقه</span>
                  <input
                    type="checkbox"
                    checked={liveCustomization.showTags}
                    onChange={(e) => updateLiveCustomization({ showTags: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">بخش‌های فعال رزومه</span>
                <div className="grid grid-cols-1 gap-1">
                  {sectionToggleList.map((sec) => (
                    <label
                      key={sec.key}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                    >
                      <span>{sec.label}</span>
                      <input
                        type="checkbox"
                        checked={liveCustomization.sections[sec.key]}
                        onChange={(e) => updateLiveSections({ [sec.key]: e.target.checked })}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Work Experience Bullet Visibility (Human vs ATS-Only) */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="size-3.5 text-sky-600" />
                  <span>۶. فیلتر بولت‌های سوابق کاری (انسان / فقط ATS)</span>
                </label>
                {totalAtsOnlyBullets > 0 && (
                  <button
                    type="button"
                    onClick={() => updateLiveCustomization({ atsOnlyExperienceBullets: {} })}
                    className="text-[10px] font-semibold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer shrink-0"
                  >
                    نمایش همه ({totalAtsOnlyBullets} مخفی)
                  </button>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500">
                بولت‌های کم‌اولویت را روی <strong className="text-amber-700 font-semibold">«فقط ATS»</strong> بگذارید تا برای خواننده انسانی مخفی شوند (سفید و بدون اشغال فضا)، اما سیستم ATS و فایل PDF متن کامل آن‌ها را بخوانند.
              </p>

              <div className="space-y-2">
                {activeWorkExperiences.map((exp) => {
                  const isExpanded = expandedAtsExpId === exp.id;
                  const companyLabel =
                    EXPERIENCE_COMPANY_LABELS[exp.id] ||
                    data.experiences.find((d) => d.id === exp.id)?.company ||
                    exp.id;
                  const hiddenIndices = (liveCustomization.atsOnlyExperienceBullets?.[exp.id] || []).filter(
                    (i) => i < exp.bullets.length
                  );
                  const visibleCount = exp.bullets.length - hiddenIndices.length;

                  return (
                    <div
                      key={exp.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedAtsExpId(isExpanded ? "" : exp.id)}
                        className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer text-right"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate" dir="ltr">
                            {companyLabel}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate" dir="ltr">
                            {exp.role}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 tabular-nums">
                            {visibleCount} قابل دید
                          </span>
                          {hiddenIndices.length > 0 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80 tabular-nums">
                              {hiddenIndices.length} فقط ATS
                            </span>
                          )}
                          <ChevronDown
                            className={`size-3.5 text-slate-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-2 space-y-1.5 divide-y divide-slate-100">
                          {exp.bullets.map((bullet, idx) => {
                            const isAtsOnly = isExperienceBulletAtsOnly(
                              liveCustomization.atsOnlyExperienceBullets,
                              exp.id,
                              idx
                            );
                            const preview = extractBulletPreview(bullet);

                            return (
                              <div
                                key={idx}
                                className={`pt-1.5 first:pt-0 flex items-start justify-between gap-2 rounded-lg p-1.5 transition-colors ${
                                  isAtsOnly ? "bg-amber-50/50" : "bg-white"
                                }`}
                              >
                                <div className="min-w-0 flex-1" dir="ltr">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <span
                                      className={`text-[11px] font-semibold truncate ${
                                        isAtsOnly
                                          ? "text-slate-400 line-through"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {preview.title}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-[10px] line-clamp-2 mt-0.5 leading-snug ${
                                      isAtsOnly ? "text-slate-400" : "text-slate-500"
                                    }`}
                                  >
                                    {preview.body}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleBulletAtsOnly(exp.id, idx)}
                                  className={`shrink-0 px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    isAtsOnly
                                      ? "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200/80"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                  }`}
                                  title={
                                    isAtsOnly
                                      ? "کلیک برای نمایش مجدد به خواننده انسانی"
                                      : "کلیک برای مخفی‌کردن از دید انسان (فقط خواندن توسط ATS)"
                                  }
                                >
                                  {isAtsOnly ? (
                                    <>
                                      <EyeOff className="size-3" />
                                      <span>فقط ATS</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="size-3" />
                                      <span>انسان + ATS</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. Custom HTML Editor (when custom-html base type) + Advanced Custom CSS */}
            {liveBaseType === "custom-html" && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-sky-600" />
                  <span>ویرایش کد HTML / CSS قالب ایمپورتی</span>
                </label>
                <textarea
                  rows={10}
                  value={liveCustomHtml}
                  onChange={(e) => setLiveCustomHtml(e.target.value)}
                  className="w-full p-2.5 text-[11px] font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  dir="ltr"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAdvancedCss(!showAdvancedCss)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Code2 className="size-3.5" />
                <span>{showAdvancedCss ? "بستن CSS سفارشی پیشرفته" : "افزودن CSS سفارشی پیشرفته"}</span>
              </button>
              {showAdvancedCss && (
                <textarea
                  rows={5}
                  value={liveCustomization.customCss || ""}
                  onChange={(e) => updateLiveCustomization({ customCss: e.target.value })}
                  placeholder="/* مثلاً: .a4-sheet h1 { letter-spacing: 0.02em; } */"
                  className="mt-2 w-full p-2.5 text-[11px] font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: EXPERIENCES & BULLET POINTS ==================== */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-sky-600" />
                  <span>انتخاب موقعیت شغلی جهت ویرایش:</span>
                </label>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="size-3.5" />
                  <span>سابقه جدید</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {data.experiences.map((exp) => {
                  const isSelected = exp.id === (currentExperience?.id || "");
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setSelectedExpId(exp.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-sky-50 border-sky-500 text-sky-950"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-xs truncate w-full">{exp.company}</div>
                      <div className="text-[10px] text-slate-500 truncate w-full">{exp.role}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{exp.period}</span>
                        <span className="font-mono tabular-nums">{exp.bullets.length} بولت</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentExperience && (
              <div className="space-y-4 border-t border-slate-200 pt-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">مشخصات سابقه: {currentExperience.company}</span>
                    {data.experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteExperience(currentExperience.id)}
                        className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium hover:underline"
                      >
                        <Trash2 className="size-3" />
                        <span>حذف سابقه</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">عنوان سمت شغلی</label>
                      <input
                        type="text"
                        value={currentExperience.role}
                        onChange={(e) => updateExperience(currentExperience.id, { role: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">نام شرکت</label>
                      <input
                        type="text"
                        value={currentExperience.company}
                        onChange={(e) => updateExperience(currentExperience.id, { company: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">دوره زمانی</label>
                      <input
                        type="text"
                        value={currentExperience.period}
                        onChange={(e) => updateExperience(currentExperience.id, { period: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">محل فعالیت</label>
                      <input
                        type="text"
                        value={currentExperience.location}
                        onChange={(e) => updateExperience(currentExperience.id, { location: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">توضیح مقدماتی</label>
                    <textarea
                      rows={2}
                      value={currentExperience.intro || ""}
                      onChange={(e) => updateExperience(currentExperience.id, { intro: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      دستاوردها و بولت‌پوینت‌ها ({currentExperience.bullets.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddBullet}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                      id="add-bullet-point-btn"
                    >
                      <Plus className="size-3.5" />
                      <span>افزودن بولت</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentExperience.bullets.map((bullet, idx) => {
                      const isAtsOnly = isExperienceBulletAtsOnly(
                        liveCustomization.atsOnlyExperienceBullets,
                        resolveCanonicalExpId(currentExperience.id),
                        idx
                      );
                      return (
                        <div
                          key={idx}
                          className={`border rounded-xl p-2.5 space-y-1.5 transition-colors ${
                            isAtsOnly
                              ? "bg-amber-50/40 border-amber-200"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="font-mono tabular-nums">#{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleBulletAtsOnly(currentExperience.id, idx)}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                  isAtsOnly
                                    ? "bg-amber-100 border-amber-300 text-amber-900"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                }`}
                                title={
                                  isAtsOnly
                                    ? "مخفی از چشم انسان — فقط ATS می‌خواند"
                                    : "قابل مشاهده برای انسان و ATS"
                                }
                              >
                                {isAtsOnly ? (
                                  <>
                                    <EyeOff className="size-3" />
                                    <span>فقط ATS</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="size-3" />
                                    <span>انسان + ATS</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteExperienceBullet(currentExperience.id, idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                              title="حذف بولت"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={bullet}
                            onChange={(e) =>
                              updateExperienceBullet(currentExperience.id, idx, e.target.value)
                            }
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 leading-relaxed"
                            dir="ltr"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PROFILE & BIO ==================== */}
        {activeTab === "profile" && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">عنوان شغلی (Job Title)</label>
              <input
                type="text"
                value={data.profile.role}
                onChange={(e) => updateProfile({ role: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-sky-700"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نام (First Name)</label>
                <input
                  type="text"
                  value={data.profile.firstName}
                  onChange={(e) => updateProfile({ firstName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نام خانوادگی (Last Name)</label>
                <input
                  type="text"
                  value={data.profile.lastName}
                  onChange={(e) => updateProfile({ lastName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">زیرعنوان تخصصی (Subtitle)</label>
              <input
                type="text"
                value={data.profile.subtitle}
                onChange={(e) => updateProfile({ subtitle: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                درباره من / خلاصه سوابق (Summary)
              </label>
              <textarea
                rows={7}
                value={data.profile.about}
                onChange={(e) => updateProfile({ about: e.target.value })}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed text-slate-800"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">نقل قول برگزیده</label>
              <input
                type="text"
                value={data.profile.quote || ""}
                onChange={(e) => updateProfile({ quote: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* ==================== TAB: CONTACT & LINKS ==================== */}
        {activeTab === "contact" && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ایمیل (Email)</label>
              <input
                type="email"
                value={data.contact.email}
                onChange={(e) => updateContact({ email: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">شماره تماس (Phone)</label>
              <input
                type="text"
                value={data.contact.phone}
                onChange={(e) => updateContact({ phone: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="text-xs font-bold text-slate-700 block">لینکدین (LinkedIn)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={data.contact?.linkedin?.handle || "@shayan-esf"}
                  onChange={(e) =>
                    updateContact({
                      linkedin: {
                        ...(data.contact?.linkedin || { url: "https://www.linkedin.com/in/shayan-esf/" }),
                        handle: e.target.value,
                      },
                    })
                  }
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  dir="ltr"
                />
                <input
                  type="text"
                  value={data.contact?.linkedin?.url || "https://www.linkedin.com/in/shayan-esf/"}
                  onChange={(e) =>
                    updateContact({
                      linkedin: {
                        ...(data.contact?.linkedin || { handle: "@shayan-esf" }),
                        url: e.target.value,
                      },
                    })
                  }
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="text-xs font-bold text-slate-700 block">وب‌سایت شخصی (Website)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={data.contact.website?.handle || "esfahanizadeh.vercel.app"}
                  onChange={(e) =>
                    updateContact({
                      website: {
                        ...(data.contact.website || { url: "https://esfahanizadeh.vercel.app/" }),
                        handle: e.target.value,
                      },
                    })
                  }
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  dir="ltr"
                />
                <input
                  type="text"
                  value={data.contact.website?.url || "https://esfahanizadeh.vercel.app/"}
                  onChange={(e) =>
                    updateContact({
                      website: {
                        ...(data.contact.website || { handle: "esfahanizadeh.vercel.app" }),
                        url: e.target.value,
                      },
                    })
                  }
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">موقعیت مکانی (Location)</label>
              <input
                type="text"
                value={data.contact.location}
                onChange={(e) => updateContact({ location: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* ==================== TAB: SKILLS & PROJECTS ==================== */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
                <span>مهارت‌ها (Skills)</span>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">{data.skills.length}</span>
              </label>

              <form onSubmit={handleSkillAdd} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  placeholder="مهارت جدید (مثلاً: Product-Led Growth)..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>افزودن</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {data.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-medium"
                    dir="ltr"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => deleteSkill(i)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">پروژه‌های کلیدی (Projects)</label>
                <button
                  type="button"
                  onClick={addProject}
                  className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>افزودن پروژه</span>
                </button>
              </div>

              {data.projects.map((proj) => (
                <div key={proj.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                      className="text-xs font-bold px-2 py-1 rounded border border-slate-300 bg-white flex-1"
                      dir="ltr"
                    />
                    {data.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteProject(proj.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    dir="ltr"
                  />
                  <input
                    type="text"
                    placeholder="لینک پروژه (اختیاری)"
                    value={proj.url || ""}
                    onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: TOOLS & STORAGE ==================== */}
        {activeTab === "tools" && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Printer className="size-4 text-sky-600" />
                <span>خروجی PDF و چاپ رزومه</span>
              </h3>
              <button
                type="button"
                onClick={onPrint}
                className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="size-4" />
                <span>پرینت / ذخیره PDF برداری</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="size-4 text-slate-600" />
                <span>پشتیبان‌گیری از داده‌های رزومه (JSON)</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportJSON}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>دانلود JSON</span>
                </button>
                <label className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center">
                  <Upload className="size-3.5" />
                  <span>بارگذاری JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          const ok = importJSON(content);
                          if (!ok) setJsonImportError("فایل JSON نامعتبر است.");
                          else setJsonImportError("");
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
              {jsonImportError && <p className="text-[11px] text-red-600">{jsonImportError}</p>}
            </div>

            <div className="border border-red-200 bg-red-50/50 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <RefreshCw className="size-3.5 text-red-600" />
                <span>بازنشانی به متن‌های پیش‌فرض اولیه</span>
              </h3>
              {showResetConfirm ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaults();
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    بله، بازنشانی کن
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                >
                  بازنشانی همه اطلاعات به پیش‌فرض
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="text-[11px]">ذخیره‌سازی خودکار فعال</span>
        <button
          type="button"
          onClick={() => setIsPanelOpen(false)}
          className="text-sky-600 hover:text-sky-800 font-semibold text-[11px] hover:underline cursor-pointer"
        >
          بستن پنل
        </button>
      </div>
    </aside>
  );
}
