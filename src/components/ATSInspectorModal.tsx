import { useState } from "react";
import { Check, Copy, Download, FileText, Search, ShieldCheck, X } from "lucide-react";

interface ATSInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedText: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  matchCount: number;
}

export default function ATSInspectorModal({
  isOpen,
  onClose,
  extractedText,
  searchTerm,
  onSearchChange,
  matchCount,
}: ATSInspectorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "Shayan-Esfahanizadeh-Resume-ATS.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const words = extractedText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                <span>تست خوانایی و اسکن ATS (Text Inspector)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  ۱۰۰٪ قابل اسکن و سلکت
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                مشاهده مستقیم متن استخراج‌شده توسط موتورهای ATS و اطمینان از خوانا بودن تمام بخش‌ها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="بستن"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Stats & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
              <FileText className="size-3.5 text-slate-500" />
              <span>{wordCount} کلمه استخراج‌شده</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
              <ShieldCheck className="size-3.5" />
              <span>بدون متن پنهان / فاقد تصاویر رستریِ متنی</span>
            </div>
          </div>

          {/* Search in ATS Text */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              placeholder="جستجو در متن رزومه (کلیدواژه‌ها)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[10px] text-sky-600 font-medium">
                {matchCount} مورد
              </span>
            )}
          </div>
        </div>

        {/* Extracted Text Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed select-text" dir="ltr">
          <pre className="whitespace-pre-wrap break-words font-mono selection:bg-sky-500 selection:text-white">
            {extractedText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-[11px] text-slate-500">
            این متن دقیقاً همان محتوایی است که نرم‌افزارهای استخدام (Workday، Greenhouse و...) می‌خوانند.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
              title="دانلود فایل متنی برای فرم‌های استخدامی"
            >
              <Download className="size-3.5" />
              <span>دانلود .txt</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>کپی تمام متن (Plain Text)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
