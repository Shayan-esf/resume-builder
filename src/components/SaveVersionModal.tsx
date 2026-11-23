import { useEffect, useRef, useState } from "react";
import { Check, GitCommitHorizontal, Save, Sparkles, X } from "lucide-react";

export interface SaveVersionPayload {
  name: string;
  commitMessage: string;
}

interface SaveVersionModalProps {
  isOpen: boolean;
  defaultName: string;
  defaultCommitMessage?: string;
  existingCount?: number;
  onClose: () => void;
  onSave: (payload: SaveVersionPayload) => void;
  onQuickSave?: () => void;
}

export default function SaveVersionModal({
  isOpen,
  defaultName,
  defaultCommitMessage = "",
  existingCount = 0,
  onClose,
  onSave,
  onQuickSave,
}: SaveVersionModalProps) {
  const [name, setName] = useState(defaultName);
  const [commitMessage, setCommitMessage] = useState(defaultCommitMessage);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(defaultName);
    setCommitMessage(defaultCommitMessage);
    const timer = window.setTimeout(() => nameRef.current?.select(), 60);
    return () => window.clearTimeout(timer);
  }, [isOpen, defaultName, defaultCommitMessage]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const trimmedCommit = commitMessage.trim();
  const canSave = trimmedName.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="ذخیره نسخه در تاریخچه"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <GitCommitHorizontal className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                ذخیره نسخه در تاریخچه
              </h3>
              <p className="text-xs text-slate-500">
                با پیام کامیت، بعداً راحت می‌فهمی این نسخه چه تفاوتی داشت
                {existingCount > 0 ? ` · ${existingCount} نسخه در آرشیو` : ""}
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

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-slate-600">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نام نسخه
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: نسخهٔ ارسال برای دیجی‌کالا"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              dir="auto"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              پیام کامیت <span className="font-normal text-slate-400">(اختیاری)</span>
            </label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={3}
              placeholder="مثلاً: بولت‌های MCI با شواهد CLTV/CAC بازنویسی شد؛ پاراگراف معرفی حذف شد"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none leading-relaxed"
              dir="auto"
            />
            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
              این پیام در «تاریخچه» همان نسخه به‌عنوان عنوان کامیت ثبت می‌شود و در کارت آرشیو هم دیده می‌شود.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-[11px] text-slate-500 leading-relaxed">
            یک اسنپ‌شات کامل از محتوا، قالب و شخصی‌سازی‌های فعلی ذخیره می‌شود؛ نسخهٔ اصلی (Master) دست‌نخورده می‌ماند.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
          >
            انصراف
          </button>
          {onQuickSave && (
            <button
              type="button"
              onClick={onQuickSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="ذخیره بدون پیام کامیت"
            >
              <Sparkles className="size-3.5 text-sky-600" />
              ذخیره سریع بدون پیام
            </button>
          )}
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ name: trimmedName, commitMessage: trimmedCommit })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {trimmedCommit ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
            {trimmedCommit ? "ثبت کامیت و ذخیره" : "ذخیره در تاریخچه"}
          </button>
        </div>
      </div>
    </div>
  );
}
