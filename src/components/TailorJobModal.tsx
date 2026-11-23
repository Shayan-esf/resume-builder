import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  FilePlus2,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import {
  AtsAnalysisResult,
  AtsSuggestedAddition,
  DocFileItem,
  MASTER_RESUME_CONTENT,
  TailoredDraft,
  TailoringIntensity,
} from "@/types/tailoring";

type ModalTab = "ats" | "inspect" | "docs";

interface TailorJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResumeText?: string;
  onSaveAsTemplate?: () => void;
}

export default function TailorJobModal({
  isOpen,
  onClose,
  currentResumeText = "",
  onSaveAsTemplate,
}: TailorJobModalProps) {
  const {
    data,
    tailoredDrafts,
    activeDraft,
    addTailoredDraft,
    selectTailoredDraft,
    updateActiveDraftContent,
    deleteTailoredDraft,
    addSkill,
    addExperienceBullet,
    updateProfile,
    addProject,
    updateProject,
  } = useResume();

  const [activeTab, setActiveTab] = useState<ModalTab>("ats");

  // Docs state from /api/docs
  const [docs, setDocs] = useState<DocFileItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [selectedDocKeys, setSelectedDocKeys] = useState<string[]>([]);

  // Docs editor state
  const [editingDocName, setEditingDocName] = useState<string>("");
  const [editingDocContent, setEditingDocContent] = useState<string>("");
  const [isNewDocMode, setIsNewDocMode] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [docSaveNotice, setDocSaveNotice] = useState<string | null>(null);

  // Job description & AI state
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [intensity, setIntensity] = useState<TailoringIntensity>("targeted");
  const [jobDescription, setJobDescription] = useState("");

  // ATS Analysis state
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResult | null>(null);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Full optimization generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setIsLoadingDocs(true);
    setDocsError(null);
    try {
      const res = await fetch("/api/docs");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "خطا در خواندن فایل‌های پوشه docs");
      }
      const fetched: DocFileItem[] = Array.isArray(json.docs) ? json.docs : [];
      setDocs(fetched);
      setSelectedDocKeys((prev) => {
        const allKeys = fetched.map((d) => `${d.folder}/${d.filename}`);
        if (prev.length === 0) return allKeys;
        const stillExisting = prev.filter((k) => allKeys.includes(k));
        return stillExisting.length > 0 ? stillExisting : allKeys;
      });
      if (fetched.length > 0 && !editingDocName && !isNewDocMode) {
        setEditingDocName(fetched[0].filename);
        setEditingDocContent(fetched[0].content);
      }
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "خطا در دریافت فایل‌های مارک‌داون");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [editingDocName, isNewDocMode]);

  useEffect(() => {
    if (isOpen) {
      fetchDocs();
    }
  }, [isOpen, fetchDocs]);

  useEffect(() => {
    if (!activeDraft && activeTab === "inspect") {
      setActiveTab("ats");
    }
  }, [activeDraft, activeTab]);

  if (!isOpen) return null;

  const toggleDocSelection = (key: string) => {
    setSelectedDocKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Step 1: Analyze ATS Score + Missing Keywords + Suggested Additions
  const handleAnalyzeAts = async () => {
    setActionError(null);
    const trimmedJd = jobDescription.trim();
    if (trimmedJd.length < 20) {
      setActionError("لطفاً متن کامل شرح شغلی (حداقل ۲۰ کاراکتر) را وارد کنید.");
      return;
    }

    setIsAnalyzingAts(true);
    try {
      const res = await fetch("/api/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: trimmedJd,
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          currentResumeText,
          selectedDocs: selectedDocKeys,
          masterContent: MASTER_RESUME_CONTENT,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "خطا در تحلیل ATS با هوش مصنوعی");
      }

      setAtsAnalysis(payload as AtsAnalysisResult);
      setAppliedSuggestionIds({});
      if (!targetCompany.trim() && payload.detectedCompany) {
        setTargetCompany(payload.detectedCompany);
      }
      if (!targetRole.trim() && payload.detectedRole) {
        setTargetRole(payload.detectedRole);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "خطا در ارتباط با API تحلیل ATS");
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  // Step 2: Apply a single AI-recommended addition directly to the resume
  const handleApplySuggestion = (item: AtsSuggestedAddition) => {
    const content = item.englishContent.trim();
    if (!content) return;

    if (item.category === "skill") {
      if (!data.skills.some((s) => s.toLowerCase() === content.toLowerCase())) {
        addSkill(content);
      }
      if (activeDraft) {
        updateActiveDraftContent((prev) => ({
          ...prev,
          skillGroups: prev.skillGroups.map((g, idx) =>
            idx === 0 && !g.items.includes(content) ? { ...g, items: [content, ...g.items] } : g
          ),
        }));
      }
    } else if (item.category === "bullet") {
      if (activeDraft) {
        const targetId = item.targetSectionId || "mci";
        updateActiveDraftContent((prev) => ({
          ...prev,
          experiences: prev.experiences.map((exp) =>
            exp.id === targetId ? { ...exp, bullets: [content, ...exp.bullets] } : exp
          ),
        }));
      } else {
        const mappedExp =
          data.experiences.find((e) => {
            const id = e.id.toLowerCase();
            if (item.targetSectionId === "mci") return id.includes("delband") || id.includes("mci");
            if (item.targetSectionId === "uxcel") return id.includes("uxcel");
            if (item.targetSectionId === "ofoq") return id.includes("saina") || id.includes("ofoq");
            return id.includes("ofoq") || id.includes("tums");
          }) || data.experiences[0];
        if (mappedExp) {
          addExperienceBullet(mappedExp.id, content);
        }
      }
    } else if (item.category === "summary") {
      if (activeDraft) {
        updateActiveDraftContent((prev) => ({ ...prev, summary: content }));
      } else {
        updateProfile({ about: content });
      }
    } else if (item.category === "project") {
      const colonIdx = content.indexOf(":");
      const projTitle = colonIdx > 0 ? content.slice(0, colonIdx).trim() : item.titleFa;
      const projDesc = colonIdx > 0 ? content.slice(colonIdx + 1).trim() : content;

      if (activeDraft) {
        updateActiveDraftContent((prev) => ({
          ...prev,
          projects: [
            { id: `ai-proj-${Date.now()}`, title: projTitle, description: projDesc },
            ...prev.projects.slice(0, 5),
          ],
        }));
      } else {
        addProject();
        // Also update the first project slot cleanly if user wants immediate visibility
        if (data.projects[0]) {
          updateProject(data.projects[0].id, { title: projTitle, description: projDesc });
        }
      }
    }

    setAppliedSuggestionIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  // Step 3: Full AI Resume Optimization (creates live optimized version)
  const handleOptimizeFullResume = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActionError(null);

    const trimmedJd = jobDescription.trim();
    if (trimmedJd.length < 20) {
      setActionError("لطفاً متن کامل شرح شغلی (حداقل ۲۰ کاراکتر) را وارد کنید.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: trimmedJd,
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          intensity,
          selectedDocs: selectedDocKeys,
          masterContent: MASTER_RESUME_CONTENT,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "خطا در ارتباط با سرویس هوش مصنوعی");
      }

      const newDraft: TailoredDraft = {
        id: `draft-${Date.now()}`,
        createdAt: Date.now(),
        jobDescription: trimmedJd,
        targetCompany: payload.targetCompany || targetCompany.trim() || "Target Company",
        targetRole: payload.targetRole || targetRole.trim() || "Target Role",
        intensity,
        matchedKeywords: Array.isArray(payload.matchedKeywords) ? payload.matchedKeywords : [],
        missingOrGapKeywords: Array.isArray(payload.missingOrGapKeywords)
          ? payload.missingOrGapKeywords
          : [],
        tailoringRationale: payload.tailoringRationale || "",
        docsUsed: Array.isArray(payload.docsUsed) ? payload.docsUsed : [],
        atsScoreBefore:
          typeof payload.atsScoreBefore === "number"
            ? payload.atsScoreBefore
            : atsAnalysis?.overallScore,
        atsScoreAfter:
          typeof payload.atsScoreAfter === "number"
            ? payload.atsScoreAfter
            : atsAnalysis?.projectedScoreAfterOptimization,
        content: payload.tailored,
      };

      addTailoredDraft(newDraft);
      setActiveTab("inspect");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "خطا در بهینه‌سازی رزومه با هوش مصنوعی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectDocForEdit = (doc: DocFileItem) => {
    setIsNewDocMode(false);
    setEditingDocName(doc.filename);
    setEditingDocContent(doc.content);
    setDocSaveNotice(null);
  };

  const handleStartNewDoc = () => {
    setIsNewDocMode(true);
    setEditingDocName("04-additional-work.md");
    setEditingDocContent(
      "# Additional Work & Achievements\n\n## Project / Initiative Name\n- Context:\n- Actions:\n- Quantifiable Impact:\n"
    );
    setDocSaveNotice(null);
  };

  const handleSaveDoc = async () => {
    if (!editingDocName.trim() || !editingDocContent.trim()) {
      setDocsError("نام فایل و محتوای مارک‌داون نمی‌تواند خالی باشد.");
      return;
    }
    setIsSavingDoc(true);
    setDocsError(null);
    setDocSaveNotice(null);
    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: editingDocName.trim(),
          content: editingDocContent,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "خطا در ذخیره فایل مارک‌داون");
      }
      const updatedDocs: DocFileItem[] = Array.isArray(json.docs) ? json.docs : [];
      setDocs(updatedDocs);
      setIsNewDocMode(false);
      const savedKey = json.saved as string | undefined;
      if (savedKey) {
        setSelectedDocKeys((prev) => (prev.includes(savedKey) ? prev : [...prev, savedKey]));
      }
      setDocSaveNotice("فایل در پوشه docs ذخیره شد و برای هوش مصنوعی در دسترس است.");
      setTimeout(() => setDocSaveNotice(null), 3500);
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "خطا در ذخیره فایل");
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDoc = async (filename: string) => {
    setDocsError(null);
    try {
      const res = await fetch(`/api/docs/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "خطا در حذف فایل");
      }
      const updatedDocs: DocFileItem[] = Array.isArray(json.docs) ? json.docs : [];
      setDocs(updatedDocs);
      if (editingDocName === filename) {
        if (updatedDocs.length > 0) {
          setEditingDocName(updatedDocs[0].filename);
          setEditingDocContent(updatedDocs[0].content);
        } else {
          setEditingDocName("");
          setEditingDocContent("");
        }
      }
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "خطا در حذف فایل");
    }
  };

  const scoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-700";
    if (score >= 60) return "text-amber-700";
    return "text-rose-700";
  };

  const scoreBarClass = (score: number) => {
    if (score >= 80) return "bg-emerald-600";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-600";
  };

  const categoryLabelFa: Record<AtsSuggestedAddition["category"], string> = {
    skill: "مهارت کلیدی",
    bullet: "دستاورد / بولت سابقه",
    project: "پروژه مرتبط",
    summary: "خلاصه حرفه‌ای (Summary)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 no-print"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                تحلیل امتیاز ATS و بهینه‌ساز هوشمند رزومه (AI)
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                ارزیابی دقیق انطباق رزومه با شرح شغلی، استخراج موارد قابل افزودن از پوشه docs و بهینه‌سازی خودکار
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer shrink-0"
            title="بستن"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Tabs Navigation */}
        <nav className="px-5 pt-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("ats")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "ats"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>امتیاز ATS و بهینه‌سازی</span>
            {atsAnalysis && (
              <span className="font-mono tabular-nums text-[11px] text-indigo-700 font-bold">
                · {atsAnalysis.overallScore}/100
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inspect")}
            disabled={!activeDraft && tailoredDrafts.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap shrink-0 ${
              !activeDraft && tailoredDrafts.length === 0
                ? "border-transparent text-slate-300 cursor-not-allowed"
                : activeTab === "inspect"
                ? "border-indigo-600 text-indigo-700 cursor-pointer"
                : "border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
            }`}
          >
            <Layers className="size-3.5" />
            <span>نسخه‌های بهینه‌شده ({tailoredDrafts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "docs"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderOpen className="size-3.5" />
            <span>پایگاه دانش (docs/ · {docs.length})</span>
          </button>
        </nav>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/40">
          {/* ==================== TAB 1: ATS SCORE + SUGGESTIONS + OPTIMIZE ==================== */}
          {activeTab === "ats" && (
            <div className="space-y-4">
              {/* Job Description Input Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-900">
                    ۱. متن شرح شغلی و نیازمندی‌های موقعیت (Job Description)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {jobDescription.trim().length} کاراکتر
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="متن کامل شرح شغلی (Job Description)، مهارت‌های مورد نیاز، مسئولیت‌ها و شرایط احراز را اینجا وارد کنید..."
                  className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-sans"
                  dir="auto"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="نام شرکت مقصد (اختیاری)"
                    className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    dir="auto"
                  />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="عنوان شغلی هدف (اختیاری)"
                    className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    dir="auto"
                  />
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as TailoringIntensity)}
                    className="h-9 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  >
                    <option value="balanced">شدت بهینه‌سازی: ملایم</option>
                    <option value="targeted">شدت بهینه‌سازی: هدفمند (پیشنهادی)</option>
                    <option value="concise">شدت بهینه‌سازی: فشرده ATS</option>
                  </select>
                </div>

                {/* Docs Source Compact Selector */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                      <FolderOpen className="size-3.5 text-indigo-600" />
                      <span>فایل‌های مرجع سوابق شما در پوشه docs/ ({selectedDocKeys.length} انتخاب‌شده)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchDocs}
                        disabled={isLoadingDocs}
                        className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`size-3 ${isLoadingDocs ? "animate-spin" : ""}`} />
                        <span>بروزرسانی</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("docs")}
                        className="text-indigo-600 hover:underline cursor-pointer"
                      >
                        مدیریت فایل‌ها
                      </button>
                    </div>
                  </div>

                  {docs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {docs.map((doc) => {
                        const key = `${doc.folder}/${doc.filename}`;
                        const checked = selectedDocKeys.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleDocSelection(key)}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] transition cursor-pointer ${
                              checked
                                ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-medium"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                            dir="auto"
                          >
                            <span
                              className={`size-3 rounded-xs flex items-center justify-center border shrink-0 ${
                                checked
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "bg-white border-slate-300"
                              }`}
                            >
                              {checked && <Check className="size-2.5" />}
                            </span>
                            <span className="max-w-[180px] truncate">{doc.filename}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {actionError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                    <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Dual Action Bar: Analyze ATS Score OR Full Optimize */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    هوش مصنوعی فقط از سوابق واقعی شما استفاده می‌کند و مهارت جعلی اضافه نمی‌کند.
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isAnalyzingAts || isGenerating}
                      onClick={handleAnalyzeAts}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      {isAnalyzingAts ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>در حال محاسبه امتیاز ATS...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3.5 text-emerald-400" />
                          <span>محاسبه امتیاز ATS و پیشنهاد تغییرات</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating || isAnalyzingAts}
                      onClick={() => handleOptimizeFullResume()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>در حال بهینه‌سازی رزومه...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="size-3.5" />
                          <span>بهینه‌سازی خودکار کل رزومه</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== ATS ANALYSIS RESULTS ==================== */}
              {atsAnalysis && (
                <div className="space-y-4">
                  {/* Score Summary & 4-Pillar Breakdown */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          گزارش انطباق ATS برای{" "}
                          <strong className="text-slate-900">
                            {atsAnalysis.detectedRole || targetRole || "موقعیت هدف"}
                          </strong>
                          {atsAnalysis.detectedCompany ? ` · ${atsAnalysis.detectedCompany}` : ""}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                          {atsAnalysis.executiveVerdictFa}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <div className="text-center">
                          <div className="text-[11px] text-slate-500">امتیاز فعلی ATS</div>
                          <div
                            className={`text-2xl font-extrabold font-mono tabular-nums leading-tight ${scoreColorClass(
                              atsAnalysis.overallScore
                            )}`}
                          >
                            {atsAnalysis.overallScore}
                            <span className="text-xs font-normal text-slate-400">/100</span>
                          </div>
                        </div>

                        <div className="h-9 w-px bg-slate-200" />

                        <div className="text-center">
                          <div className="text-[11px] text-slate-500">امتیاز پس از بهینه‌سازی</div>
                          <div className="text-2xl font-extrabold font-mono tabular-nums leading-tight text-emerald-700">
                            {atsAnalysis.projectedScoreAfterOptimization}
                            <span className="text-xs font-normal text-slate-400">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4-Metric Score Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(
                        [
                          { label: "تطابق کلیدواژه‌ها", val: atsAnalysis.scoreBreakdown.keywordMatch },
                          { label: "ارتباط سوابق کاری", val: atsAnalysis.scoreBreakdown.experienceRelevance },
                          { label: "اعداد و دستاوردها", val: atsAnalysis.scoreBreakdown.impactAndMetrics },
                          { label: "ساختار و خوانایی ATS", val: atsAnalysis.scoreBreakdown.atsStructureReadability },
                        ] as const
                      ).map((metric) => (
                        <div key={metric.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">{metric.label}</span>
                            <span className="font-mono tabular-nums font-bold text-slate-900">
                              {metric.val}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${scoreBarClass(metric.val)}`}
                              style={{ width: `${Math.min(100, Math.max(0, metric.val))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing vs Matched Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5 text-amber-600" />
                          <span>کلیدواژه‌های کمبود در رزومه فعلی ({atsAnalysis.missingKeywords.length})</span>
                        </h3>
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {atsAnalysis.missingKeywords.length === 0 ? (
                          <p className="text-xs text-emerald-700">همه کلیدواژه‌های کلیدی آگهی پوشش داده شده‌اند.</p>
                        ) : (
                          atsAnalysis.missingKeywords.map((mk, idx) => (
                            <div
                              key={`${mk.keyword}-${idx}`}
                              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900 font-mono" dir="ltr">
                                  {mk.keyword}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {mk.importance === "high" ? "اولویت بالا" : "اولویت متوسط"} ·{" "}
                                  <span className={mk.inDocs ? "text-emerald-700" : "text-amber-700"}>
                                    {mk.inDocs ? "موجود در docs شما" : "نیاز به بررسی"}
                                  </span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">{mk.whereToAddFa}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>کلیدواژه‌های پوشش‌داده‌شده ({atsAnalysis.matchedKeywords.length})</span>
                      </h3>
                      <div className="text-xs text-slate-700 leading-relaxed" dir="ltr">
                        {atsAnalysis.matchedKeywords.length > 0
                          ? atsAnalysis.matchedKeywords.join(" · ")
                          : "—"}
                      </div>

                      {/* Optimization Checklist */}
                      {atsAnalysis.optimizationChecklistFa.length > 0 && (
                        <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                          <h4 className="text-xs font-bold text-slate-900">چک‌لیست اولویت‌دار بهینه‌سازی</h4>
                          <ul className="space-y-1.5 text-[11px] text-slate-700">
                            {atsAnalysis.optimizationChecklistFa.map((c, i) => (
                              <li key={i} className="leading-relaxed">
                                <strong className="text-slate-900">
                                  {c.priority === "high" ? "[اولویت بالا]" : c.priority === "medium" ? "[متوسط]" : "[تکمیلی]"}{" "}
                                  {c.actionFa}
                                </strong>
                                <span className="text-slate-500"> — {c.expectedImpactFa}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actionable Additions (1-Click Apply) */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          موارد پیشنهادی برای افزودن و شخصی‌سازی رزومه ({atsAnalysis.suggestedAdditions.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          می‌توانید هر مورد را با یک کلیک مستقیم به رزومه اضافه کنید یا کل رزومه را به صورت خودکار بهینه کنید
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => handleOptimizeFullResume()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        <Wand2 className="size-3.5" />
                        <span>اعمال بهینه‌سازی کامل روی کل رزومه</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {atsAnalysis.suggestedAdditions.map((item) => {
                        const isApplied = Boolean(appliedSuggestionIds[item.id]);
                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-900">{item.titleFa}</div>
                                <div className="text-[11px] text-slate-500">
                                  {categoryLabelFa[item.category]} ·{" "}
                                  <span className={item.verifiedFromDocs ? "text-emerald-700 font-medium" : "text-slate-500"}>
                                    {item.verifiedFromDocs ? "استخراج‌شده از سوابق واقعی docs" : "پیشنهاد بازنویسی"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(item.id, item.englishContent)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-medium text-slate-700 cursor-pointer"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="size-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                  <span>{copiedId === item.id ? "کپی شد" : "کپی متن"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleApplySuggestion(item)}
                                  disabled={isApplied}
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                    isApplied
                                      ? "bg-emerald-600 text-white cursor-default"
                                      : "bg-slate-900 hover:bg-slate-800 text-white"
                                  }`}
                                >
                                  {isApplied ? <Check className="size-3" /> : <Plus className="size-3" />}
                                  <span>{isApplied ? "به رزومه اضافه شد" : "افزودن به رزومه"}</span>
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">{item.reasonFa}</p>

                            <div
                              className="p-2.5 rounded-md bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans"
                              dir="ltr"
                            >
                              {item.englishContent}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: INSPECT & FINE-TUNE OPTIMIZED VERSIONS ==================== */}
          {activeTab === "inspect" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    نسخه‌های بهینه‌شده ساخته‌شده در این نشست ({tailoredDrafts.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => selectTailoredDraft(null)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                        !activeDraft
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <RotateCcw className="size-3" />
                      <span>قالب پایه (Master)</span>
                    </button>
                    {activeDraft && onSaveAsTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSaveAsTemplate();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold transition cursor-pointer"
                      >
                        <Save className="size-3" />
                        <span>تبدیل به قالب دائم</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab("ats")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Plus className="size-3" />
                      <span>شرح شغلی جدید</span>
                    </button>
                  </div>
                </div>

                {tailoredDrafts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tailoredDrafts.map((draft) => {
                      const isSelected = activeDraft?.id === draft.id;
                      return (
                        <div
                          key={draft.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectTailoredDraft(draft.id)}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <Briefcase className="size-3 text-indigo-600" />
                            <span>
                              {draft.targetCompany} — {draft.targetRole}
                            </span>
                            {typeof draft.atsScoreAfter === "number" && (
                              <span className="font-mono tabular-nums text-emerald-700 font-bold">
                                ({draft.atsScoreAfter}%)
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTailoredDraft(draft.id)}
                            className="p-0.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="حذف نسخه"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {activeDraft ? (
                <>
                  {/* Rationale & Before/After Score */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    {(typeof activeDraft.atsScoreBefore === "number" ||
                      typeof activeDraft.atsScoreAfter === "number") && (
                      <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-slate-100 text-xs">
                        {typeof activeDraft.atsScoreBefore === "number" && (
                          <span className="text-slate-600">
                            امتیاز ATS قبل از بهینه‌سازی:{" "}
                            <strong className="font-mono tabular-nums text-slate-900">
                              {activeDraft.atsScoreBefore}/100
                            </strong>
                          </span>
                        )}
                        {typeof activeDraft.atsScoreAfter === "number" && (
                          <span className="text-emerald-700 font-semibold">
                            امتیاز ATS پس از بهینه‌سازی:{" "}
                            <strong className="font-mono tabular-nums">
                              {activeDraft.atsScoreAfter}/100
                            </strong>
                          </span>
                        )}
                      </div>
                    )}

                    {activeDraft.tailoringRationale && (
                      <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
                        <div className="font-bold text-indigo-900 mb-1">خلاصه بهینه‌سازی اعمال‌شده:</div>
                        <p>{activeDraft.tailoringRationale}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-emerald-800">کلیدواژه‌های پوشش‌داده‌شده</div>
                        <div className="text-slate-700 leading-relaxed" dir="ltr">
                          {activeDraft.matchedKeywords.length > 0
                            ? activeDraft.matchedKeywords.join(" · ")
                            : "—"}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-amber-800">شکاف‌های صادقانه (نبود در سوابق)</div>
                        <div className="text-slate-700 leading-relaxed" dir="ltr">
                          {activeDraft.missingOrGapKeywords.length > 0
                            ? activeDraft.missingOrGapKeywords.join(" · ")
                            : "همه موارد کلیدی پوشش داده شده‌اند."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Fine-Tuning Editor */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        ویرایش دستی جزئیات نسخه بهینه‌شده
                      </h3>
                      <span className="text-[10px] text-slate-400">از **متن** برای بولد کردن استفاده کنید</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Headline Role</label>
                        <input
                          type="text"
                          value={activeDraft.content.headlineRole}
                          onChange={(e) =>
                            updateActiveDraftContent((prev) => ({
                              ...prev,
                              headlineRole: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Headline Subtitle</label>
                        <input
                          type="text"
                          value={activeDraft.content.headlineSubtitle}
                          onChange={(e) =>
                            updateActiveDraftContent((prev) => ({
                              ...prev,
                              headlineSubtitle: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1" dir="ltr">
                      <label className="text-[11px] font-semibold text-slate-600">Professional Summary</label>
                      <textarea
                        rows={4}
                        value={activeDraft.content.summary}
                        onChange={(e) =>
                          updateActiveDraftContent((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    <div className="space-y-2" dir="ltr">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Skills (Comma-separated)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeDraft.content.skillGroups.map((group, gIdx) => (
                          <div key={group.category} className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-700">{group.category}</span>
                            <input
                              type="text"
                              value={group.items.join(", ")}
                              onChange={(e) => {
                                const items = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                updateActiveDraftContent((prev) => ({
                                  ...prev,
                                  skillGroups: prev.skillGroups.map((sg, idx) =>
                                    idx === gIdx ? { ...sg, items } : sg
                                  ),
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3" dir="ltr">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Tailored Work Experience Bullets
                      </label>
                      {activeDraft.content.experiences.map((exp, expIdx) => (
                        <div key={exp.id} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) =>
                                updateActiveDraftContent((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((item, idx) =>
                                    idx === expIdx ? { ...item, role: e.target.value } : item
                                  ),
                                }))
                              }
                              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 flex-1"
                            />
                            <span className="text-[10px] font-mono uppercase text-slate-500">{exp.id}</span>
                          </div>
                          <div className="space-y-1.5">
                            {exp.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-1.5">
                                <textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) =>
                                    updateActiveDraftContent((prev) => ({
                                      ...prev,
                                      experiences: prev.experiences.map((item, idx) =>
                                        idx === expIdx
                                          ? {
                                              ...item,
                                              bullets: item.bullets.map((oldB, i) =>
                                                i === bIdx ? e.target.value : oldB
                                              ),
                                            }
                                          : item
                                      ),
                                    }))
                                  }
                                  className="flex-1 px-2.5 py-1.5 text-[11px] rounded border border-slate-200 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateActiveDraftContent((prev) => ({
                                      ...prev,
                                      experiences: prev.experiences.map((item, idx) =>
                                        idx === expIdx
                                          ? {
                                              ...item,
                                              bullets: item.bullets.filter((_, i) => i !== bIdx),
                                            }
                                          : item
                                      ),
                                    }))
                                  }
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                                  title="حذف بولت"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    در حال حاضر قالب ثابت پایه (Master) فعال است.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    یکی از نسخه‌های بالا را انتخاب کنید یا در تب اول شرح شغلی جدیدی تحلیل کنید.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <span>مشاهده و دانلود PDF</span>
                  <ArrowRight className="size-3.5 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: MARKDOWN DOCS MANAGER ==================== */}
          {activeTab === "docs" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    فایل‌های سوابق و مستندات شما (<code className="font-mono text-indigo-700">docs/</code>)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    هوش مصنوعی هنگام امتیازدهی ATS و پیشنهاد افزودنی‌ها، همه فایل‌های مارک‌داون این پوشه را بررسی می‌کند.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchDocs}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${isLoadingDocs ? "animate-spin" : ""}`} />
                    <span>بروزرسانی</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartNewDoc}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    <FilePlus2 className="size-3.5" />
                    <span>فایل جدید</span>
                  </button>
                </div>
              </div>

              {docsError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {docsError}
                </div>
              )}
              {docSaveNotice && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  {docSaveNotice}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5 max-h-[380px] overflow-y-auto">
                  {docs.map((doc) => {
                    const isActive = !isNewDocMode && editingDocName === doc.filename;
                    return (
                      <div
                        key={`${doc.folder}/${doc.filename}`}
                        className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-xs transition ${
                          isActive
                            ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold"
                            : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectDocForEdit(doc)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-right cursor-pointer"
                        >
                          <FileText className="size-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate" dir="auto">
                            {doc.filename}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.filename)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                          title="حذف فایل"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={editingDocName}
                      onChange={(e) => setEditingDocName(e.target.value)}
                      placeholder="filename.md"
                      className="flex-1 h-8 px-3 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      dir="auto"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDoc}
                      disabled={isSavingDoc}
                      className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Save className="size-3.5" />
                      <span>{isSavingDoc ? "در حال ذخیره..." : "ذخیره فایل"}</span>
                    </button>
                  </div>

                  <textarea
                    rows={13}
                    value={editingDocContent}
                    onChange={(e) => setEditingDocContent(e.target.value)}
                    className="w-full p-3 text-xs font-mono leading-relaxed rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    dir="auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
