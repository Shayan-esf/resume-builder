import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit3,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import { MASTER_RESUME_CONTENT } from "@/types/tailoring";
import { auditResumeBullets } from "@/utils/bulletAuditor";
import { RichText } from "./RichText";

export type CareerToolsTab = "audit" | "outreach" | "interview";

interface CareerToolsModalProps {
  isOpen: boolean;
  initialTab?: CareerToolsTab;
  currentResumeText: string;
  onClose: () => void;
  onJumpToEditField: (fieldKey: string) => void;
  onOpenChatEditor: () => void;
}

interface OutreachResponse {
  detectedCompany: string;
  detectedRole: string;
  coverLetter: string;
  emailSubject: string;
  recruiterEmail: string;
  linkedinNote: string;
  linkedinInMail: string;
  strategyTipFa: string;
}

interface InterviewQuestionItem {
  question: string;
  whyAskedFa: string;
  idealAnswerGuide: string;
  coachingTipFa: string;
}

interface InterviewPrepResponse {
  detectedCompany: string;
  detectedRole: string;
  interviewFocusSummaryFa: string;
  technicalQuestions: InterviewQuestionItem[];
  behavioralQuestions: InterviewQuestionItem[];
  toughGapQuestions: InterviewQuestionItem[];
  questionsToAskInterviewer: { question: string; strategicReasonFa: string }[];
}

export default function CareerToolsModal({
  isOpen,
  initialTab = "audit",
  currentResumeText,
  onClose,
  onJumpToEditField,
  onOpenChatEditor,
}: CareerToolsModalProps) {
  const { activeDraft, activeClone, effectiveTailoredContent } = useResume();

  const [activeTab, setActiveTab] = useState<CareerToolsTab>(initialTab);

  // Tab 1: Bullet Auditor state
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [onlyNeedsWork, setOnlyNeedsWork] = useState(false);

  // Shared Job Context state for Tab 2 (Outreach) & Tab 3 (Interview)
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"executive" | "startup" | "concise">("executive");

  // Outreach state
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [outreachResult, setOutreachResult] = useState<OutreachResponse | null>(null);

  // Interview Prep state
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [interviewResult, setInterviewResult] = useState<InterviewPrepResponse | null>(null);
  const [interviewCategory, setInterviewCategory] = useState<
    "technical" | "behavioral" | "tough" | "ask"
  >("technical");
  const [expandedQuestionKey, setExpandedQuestionKey] = useState<string | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    if (!targetCompany && (activeDraft?.targetCompany || activeClone?.targetCompany)) {
      setTargetCompany(activeDraft?.targetCompany || activeClone?.targetCompany || "");
    }
    if (!targetRole && (activeDraft?.targetRole || activeClone?.targetRole)) {
      setTargetRole(activeDraft?.targetRole || activeClone?.targetRole || "");
    }
    if (!jobDescription && activeDraft?.jobDescription) {
      setJobDescription(activeDraft.jobDescription);
    }
  }, [isOpen, initialTab, activeDraft, activeClone]);

  const auditReport = useMemo(() => {
    return auditResumeBullets(effectiveTailoredContent || MASTER_RESUME_CONTENT);
  }, [effectiveTailoredContent]);

  const uniqueRoles = useMemo(() => {
    const map = new Map<string, string>();
    auditReport.items.forEach((item) => {
      if (!map.has(item.experienceId)) {
        map.set(item.experienceId, item.experienceRole);
      }
    });
    return Array.from(map.entries());
  }, [auditReport]);

  const filteredBullets = useMemo(() => {
    return auditReport.items.filter((item) => {
      if (roleFilter !== "all" && item.experienceId !== roleFilter) return false;
      if (onlyNeedsWork && item.score >= 80) return false;
      return true;
    });
  }, [auditReport, roleFilter, onlyNeedsWork]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateOutreach = async () => {
    if (jobDescription.trim().length < 25) {
      setOutreachError("لطفاً شرح شغلی (Job Description) را کامل‌تر وارد کنید (حداقل ۲۵ کاراکتر).");
      return;
    }
    setOutreachError(null);
    setIsGeneratingOutreach(true);
    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          tone,
          resumeText: currentResumeText,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "خطا در تولید کاور لتر و پیام ارسال");
      }
      setOutreachResult(json as OutreachResponse);
      if (json.detectedCompany && !targetCompany.trim()) setTargetCompany(json.detectedCompany);
      if (json.detectedRole && !targetRole.trim()) setTargetRole(json.detectedRole);
    } catch (err: any) {
      setOutreachError(err?.message || "ارتباط با سرویس هوش مصنوعی با خطا مواجه شد.");
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (jobDescription.trim().length < 25) {
      setInterviewError("لطفاً شرح شغلی (Job Description) را کامل‌تر وارد کنید (حداقل ۲۵ کاراکتر).");
      return;
    }
    setInterviewError(null);
    setIsGeneratingInterview(true);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          resumeText: currentResumeText,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "خطا در تولید بسته آمادگی مصاحبه");
      }
      setInterviewResult(json as InterviewPrepResponse);
      setInterviewCategory("technical");
      setExpandedQuestionKey("technical-0");
      if (json.detectedCompany && !targetCompany.trim()) setTargetCompany(json.detectedCompany);
      if (json.detectedRole && !targetRole.trim()) setTargetRole(json.detectedRole);
    } catch (err: any) {
      setInterviewError(err?.message || "ارتباط با سرویس هوش مصنوعی با خطا مواجه شد.");
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const renderScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-sky-700 bg-sky-50 border-sky-200";
    return "text-amber-800 bg-amber-50 border-amber-200";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="استودیو ابزارهای اپلای و کیفیت رزومه"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Award className="size-4.5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">
                ابزارهای هوشمند کیفیت رزومه، ارسال و مصاحبه
              </h2>
              <p className="text-xs text-slate-500 truncate">
                ممیزی لحظه‌ای بولت‌ها · نگارش کاور لتر و ایمیل ریکروتر · شبیه‌ساز سوالات مصاحبه
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0"
            aria-label="بستن"
          >
            <X className="size-4.5" />
          </button>
        </header>

        {/* Primary Tabs */}
        <div className="px-6 pt-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "audit"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Target className="size-3.5" />
            <span>ممیزی کیفیت بولت‌ها</span>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {auditReport.overallScore}/100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outreach")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "outreach"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="size-3.5" />
            <span>کاور لتر و پیام ارسال AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "interview"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="size-3.5" />
            <span>بسته آمادگی مصاحبه AI</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 space-y-5">
          {/* ==================== TAB 1: SMART BULLET AUDITOR ==================== */}
          {activeTab === "audit" && (
            <div className="space-y-5">
              {/* Summary Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                  <div className="text-[11px] font-medium text-slate-500">امتیاز کل بولت‌ها</div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {auditReport.overallScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                  <div className="text-[11px] font-medium text-slate-500">دارای عدد و متریک</div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-2xl font-extrabold text-emerald-700">
                      {auditReport.withMetricsCount}
                    </span>
                    <span className="text-xs text-slate-400">از {auditReport.totalBullets}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                  <div className="text-[11px] font-medium text-slate-500">فعل کنشی قدرتمند</div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-2xl font-extrabold text-sky-700">
                      {auditReport.strongVerbCount}
                    </span>
                    <span className="text-xs text-slate-400">از {auditReport.totalBullets}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                  <div className="text-[11px] font-medium text-slate-500">نیازمند تقویت</div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-2xl font-extrabold text-amber-700">
                      {auditReport.needsImprovementCount}
                    </span>
                    <span className="text-xs text-slate-400">بولت</span>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                      roleFilter === "all"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    همه سوابق ({auditReport.totalBullets})
                  </button>
                  {uniqueRoles.map(([expId, role]) => (
                    <button
                      key={expId}
                      type="button"
                      onClick={() => setRoleFilter(expId)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        roleFilter === expId
                          ? "bg-sky-600 text-white border-sky-600 font-semibold"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {role.split("|")[0].trim()}
                    </button>
                  ))}
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={onlyNeedsWork}
                    onChange={(e) => setOnlyNeedsWork(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>فقط موارد نیازمند بهبود (&lt;80)</span>
                </label>
              </div>

              {/* Bullet Audit Cards */}
              {filteredBullets.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-center space-y-1.5">
                  <CheckCircle2 className="size-6 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">
                    همه بولت‌های این بخش امتیاز بالای ۸۰ دارند!
                  </p>
                  <p className="text-xs text-emerald-700">
                    ساختار افعال، اعداد و طول بولت‌ها برای سیستم‌های ATS و ریکروترها استاندارد است.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBullets.map((item) => (
                    <article
                      key={item.fieldKey}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800">{item.experienceRole}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">بولت {item.bulletIndex + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{item.wordCount} کلمه</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-mono tabular-nums font-bold ${renderScoreColor(
                            item.score
                          )}`}
                        >
                          امتیاز {item.score}
                        </span>
                      </div>

                      <p
                        className="text-xs leading-relaxed text-slate-800 bg-slate-50/80 border border-slate-200/70 rounded-lg p-3"
                        dir="ltr"
                      >
                        <RichText text={item.rawText} strongClassName="font-bold text-slate-950" />
                      </p>

                      {/* Diagnostics */}
                      <div className="space-y-1">
                        {item.issuesFa.map((issue, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-amber-900"
                          >
                            <AlertTriangle className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                        {item.strengthsFa.map((str, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-emerald-800"
                          >
                            <Check className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onJumpToEditField(item.fieldKey);
                          }}
                          className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Edit3 className="size-3 text-sky-400" />
                          <span>ویرایش سریع همین بولت</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenChatEditor();
                          }}
                          className="h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <MessageSquareText className="size-3" />
                          <span>بازنویسی با چت AI</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: AI COVER LETTER & OUTREACH ==================== */}
          {activeTab === "outreach" && (
            <div className="space-y-5">
              {/* Shared Job Input Card */}
              <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      نام شرکت هدف (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="مثلاً: Stripe / Snapp / Digikala"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      dir="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      عنوان سمت شغلی (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="مثلاً: Senior Technical Product Manager"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      dir="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      لحن نگارش پیام‌ها
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as "executive" | "startup" | "concise")}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800"
                    >
                      <option value="executive">اجرایی و رسمی (Executive)</option>
                      <option value="startup">استارتاپی و محصول‌محور (Startup)</option>
                      <option value="concise">فشرده و مستقیم (Concise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    شرح شغل (Job Description)
                  </label>
                  <textarea
                    rows={5}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="متن کامل آگهی شغلی را اینجا پیست کنید تا کاور لتر، ایمیل ریکروتر و پیام لینکدین دقیقاً منطبق بر رزومه فعلی شما تولید شود..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    dir="auto"
                  />
                </div>

                {outreachError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {outreachError}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    تولیدشده صرفاً بر پایه دستاوردهای واقعی رزومه فعلی شما (بدون آمار ساختگی)
                  </span>
                  <button
                    type="button"
                    disabled={isGeneratingOutreach}
                    onClick={handleGenerateOutreach}
                    className="h-9 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isGeneratingOutreach ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    <span>
                      {isGeneratingOutreach ? "در حال نگارش..." : "تولید کاور لتر و پیام‌های ارسال"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Generated Outreach Outputs */}
              {outreachResult && (
                <div className="space-y-4">
                  {/* Persian Strategy Tip */}
                  <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-950 leading-relaxed">
                    <span className="font-bold text-sky-900">توصیه استراتژیک ارسال: </span>
                    {outreachResult.strategyTipFa}
                  </div>

                  {/* 1. Cover Letter */}
                  <section className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <FileText className="size-3.5 text-sky-600" />
                        <span>Cover Letter (کاور لتر رسمی)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy("cover", outreachResult.coverLetter)}
                          className="h-7 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === "cover" ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{copiedId === "cover" ? "کپی شد" : "کپی"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadText(
                              `Cover_Letter_${(outreachResult.detectedCompany || "Company").replace(/[^a-zA-Z0-9_-]+/g, "_")}.txt`,
                              outreachResult.coverLetter
                            )
                          }
                          className="h-7 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="size-3" />
                          <span>دانلود .txt</span>
                        </button>
                      </div>
                    </div>
                    <pre
                      className="p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans"
                      dir="ltr"
                    >
                      {outreachResult.coverLetter}
                    </pre>
                  </section>

                  {/* 2. Recruiter Cold Email */}
                  <section className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Mail className="size-3.5 text-emerald-600" />
                        <span>ایمیل مستقیم به ریکروتر / Hiring Manager</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            "email",
                            `Subject: ${outreachResult.emailSubject}\n\n${outreachResult.recruiterEmail}`
                          )
                        }
                        className="h-7 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === "email" ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>{copiedId === "email" ? "کپی شد" : "کپی موضوع و متن"}</span>
                      </button>
                    </div>
                    <div className="p-4 space-y-2.5" dir="ltr">
                      <div className="text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
                        <span className="font-bold text-slate-500 mr-1.5">Subject:</span>
                        <span className="font-semibold text-slate-900">
                          {outreachResult.emailSubject}
                        </span>
                      </div>
                      <pre className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                        {outreachResult.recruiterEmail}
                      </pre>
                    </div>
                  </section>

                  {/* 3. LinkedIn Note + InMail */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Send className="size-3.5 text-indigo-600" />
                          <span>LinkedIn Connection Note</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tabular-nums text-slate-400">
                            {outreachResult.linkedinNote.length}/300
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy("li-note", outreachResult.linkedinNote)}
                            className="h-7 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === "li-note" ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>{copiedId === "li-note" ? "کپی شد" : "کپی"}</span>
                          </button>
                        </div>
                      </div>
                      <p className="p-4 text-xs leading-relaxed text-slate-800 flex-1" dir="ltr">
                        {outreachResult.linkedinNote}
                      </p>
                    </section>

                    <section className="rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Send className="size-3.5 text-sky-600" />
                          <span>LinkedIn InMail / Direct DM</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("li-inmail", outreachResult.linkedinInMail)}
                          className="h-7 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === "li-inmail" ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{copiedId === "li-inmail" ? "کپی شد" : "کپی"}</span>
                        </button>
                      </div>
                      <p
                        className="p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap flex-1"
                        dir="ltr"
                      >
                        {outreachResult.linkedinInMail}
                      </p>
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: AI INTERVIEW PREP PACK ==================== */}
          {activeTab === "interview" && (
            <div className="space-y-5">
              {/* Shared Job Input Card */}
              <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      نام شرکت هدف (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="مثلاً: Delivery Hero / Snapp"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                      dir="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      عنوان سمت شغلی (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="مثلاً: Product Manager — Growth & AI"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                      dir="auto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    شرح شغل (Job Description)
                  </label>
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="متن شرح شغل را اینجا وارد کنید تا سوالات تخصصی، رفتاری STAR، سوالات چالشی شکاف‌ها و سوالات هوشمندانه برای پرسیدن از مصاحبه‌کننده طراحی شود..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs leading-relaxed"
                    dir="auto"
                  />
                </div>

                {interviewError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {interviewError}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    راهنمای پاسخ‌ها بر اساس پروژه‌ها و اعداد واقعی رزومه شما شخصی‌سازی می‌شود
                  </span>
                  <button
                    type="button"
                    disabled={isGeneratingInterview}
                    onClick={handleGenerateInterview}
                    className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isGeneratingInterview ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5 text-sky-400" />
                    )}
                    <span>
                      {isGeneratingInterview
                        ? "در حال طراحی سوالات..."
                        : "ساخت بسته کامل آمادگی مصاحبه"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Generated Interview Prep Pack */}
              {interviewResult && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 leading-relaxed">
                    <div className="font-bold text-indigo-900 mb-1">
                      تمرکز اصلی تیم مصاحبه‌کننده ({interviewResult.detectedCompany} ·{" "}
                      {interviewResult.detectedRole})
                    </div>
                    <p>{interviewResult.interviewFocusSummaryFa}</p>
                  </div>

                  {/* Category Switcher */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInterviewCategory("technical")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        interviewCategory === "technical"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      تخصصی و محصولی ({interviewResult.technicalQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterviewCategory("behavioral")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        interviewCategory === "behavioral"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      رفتاری STAR ({interviewResult.behavioralQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterviewCategory("tough")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        interviewCategory === "tough"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      چالشی و شکاف‌ها ({interviewResult.toughGapQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterviewCategory("ask")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        interviewCategory === "ask"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      سوال از مصاحبه‌کننده ({interviewResult.questionsToAskInterviewer.length})
                    </button>
                  </div>

                  {/* Question Cards */}
                  {interviewCategory !== "ask" ? (
                    <div className="space-y-3">
                      {(interviewCategory === "technical"
                        ? interviewResult.technicalQuestions
                        : interviewCategory === "behavioral"
                          ? interviewResult.behavioralQuestions
                          : interviewResult.toughGapQuestions
                      ).map((q, idx) => {
                        const qKey = `${interviewCategory}-${idx}`;
                        const isExpanded = expandedQuestionKey === qKey;
                        return (
                          <article
                            key={qKey}
                            className="rounded-xl bg-white border border-slate-200 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setExpandedQuestionKey(isExpanded ? null : qKey)}
                              className="w-full px-4 py-3.5 text-right flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div
                                  className="text-xs font-bold text-slate-900 leading-relaxed text-left"
                                  dir="ltr"
                                >
                                  {idx + 1}. {q.question}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  چرا می‌پرسند: {q.whyAskedFa}
                                </div>
                              </div>
                              <span className="text-slate-400 mt-1 shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/50">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-slate-600">
                                      چارچوب پاسخ پیشنهادی (بر پایه رزومه شما):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopy(
                                          qKey,
                                          `Q: ${q.question}\n\nAnswer Guide:\n${q.idealAnswerGuide}`
                                        )
                                      }
                                      className="h-7 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedId === qKey ? (
                                        <Check className="size-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="size-3" />
                                      )}
                                      <span>{copiedId === qKey ? "کپی شد" : "کپی پاسخ"}</span>
                                    </button>
                                  </div>
                                  <p
                                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap"
                                    dir="ltr"
                                  >
                                    {q.idealAnswerGuide}
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900">
                                  <span className="font-bold">نکته کوچینگ: </span>
                                  {q.coachingTipFa}
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {interviewResult.questionsToAskInterviewer.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white border border-slate-200 p-4 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className="text-xs font-bold text-slate-900 leading-relaxed flex-1 text-left"
                              dir="ltr"
                            >
                              {idx + 1}. {item.question}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCopy(`ask-${idx}`, item.question)}
                              className="p-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
                              title="کپی سوال"
                            >
                              {copiedId === `ask-${idx}` ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            دلیل استراتژیک: {item.strategicReasonFa}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
