import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useResume } from "@/context/ResumeContext";
import { MASTER_RESUME_CONTENT, TailoredResumeContent } from "@/types/tailoring";

interface CloneChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS: string[] = [
  "خلاصه رزومه (Summary) رو کوتاه‌تر، قوی‌تر و متمرکز بر B2B SaaS کن",
  "بولت‌های تجربه همراه اول (MCI) رو عدددارتر و تاثیرگذارتر بازنویسی کن",
  "مهارت‌ها رو برای نقش Senior Product Manager اولویت‌بندی و مرتب کن",
  "از مستندات docs دستاوردهای مهم مرتبط با AI و رشد محصول رو اضافه کن",
];

export default function CloneChatDrawer({ isOpen, onClose }: CloneChatDrawerProps) {
  const {
    data,
    activeClone,
    activeTemplate,
    effectiveTailoredContent,
    applyCloneChatResult,
    revertCloneChatMessage,
    clearCloneChatHistory,
  } = useResume();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = activeClone?.chatHistory || [];

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages.length, isSending]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isSending) return;

    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const currentContent: TailoredResumeContent = JSON.parse(
        JSON.stringify(effectiveTailoredContent || MASTER_RESUME_CONTENT)
      );

      const response = await fetch("/api/clone-chat-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: trimmed,
          cloneName: activeClone?.name || activeTemplate.nameFa,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          currentContent,
          profile: {
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            email: data.contact.email,
            phone: data.contact.phone,
            location: data.contact.location,
            website: data.contact.website.handle,
            linkedin: data.contact.linkedin.handle,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "خطا در ارتباط با سرویس هوش مصنوعی.");
      }

      const rawPatch = payload.profilePatch || {};
      const profilePatch: Partial<typeof data.profile> = {};
      if (rawPatch.firstName?.trim()) profilePatch.firstName = rawPatch.firstName.trim();
      if (rawPatch.lastName?.trim()) profilePatch.lastName = rawPatch.lastName.trim();

      const contactPatch: Partial<typeof data.contact> = {};
      if (rawPatch.email?.trim()) contactPatch.email = rawPatch.email.trim();
      if (rawPatch.phone?.trim()) contactPatch.phone = rawPatch.phone.trim();
      if (rawPatch.location?.trim()) contactPatch.location = rawPatch.location.trim();
      if (rawPatch.website?.trim()) {
        const w = rawPatch.website.trim();
        contactPatch.website = {
          handle: w,
          url: w.startsWith("http") ? w : `https://${w}`,
        };
      }
      if (rawPatch.linkedin?.trim()) {
        const l = rawPatch.linkedin.trim();
        contactPatch.linkedin = {
          handle: l,
          url: l.startsWith("http") ? l : `https://www.linkedin.com/${l.replace(/^\/+/, "")}`,
        };
      }

      applyCloneChatResult({
        userText: trimmed,
        assistantReplyFa: payload.assistantReplyFa || "تغییرات درخواستی روی کلون اعمال و ذخیره شد.",
        hasChanges: Boolean(payload.hasChanges),
        changesSummaryFa: Array.isArray(payload.changesSummaryFa) ? payload.changesSummaryFa : [],
        updatedContent: payload.updatedContent,
        profilePatch: Object.keys(profilePatch).length > 0 ? profilePatch : undefined,
        contactPatch: Object.keys(contactPatch).length > 0 ? contactPatch : undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای غیرمنتظره در پردازش چت.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <aside
      className="fixed top-14 left-0 bottom-0 z-40 w-full sm:w-[400px] bg-white border-r border-slate-200 shadow-2xl flex flex-col no-print"
      dir="rtl"
      aria-label="چت هوشمند ویرایش کلون رزومه"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-indigo-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 truncate">چت هوشمند ویرایش کلون</h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {activeClone
              ? `کلون فعال: ${activeClone.name} (ذخیره خودکار)`
              : "با اولین دستور، کلون جدید ساخته و تغییرات ذخیره می‌شود"}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeClone && messages.length > 0 && (
            <button
              type="button"
              onClick={() => clearCloneChatHistory(activeClone.id)}
              className="size-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="پاک کردن تاریخچه چت این کلون"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="بستن پنل چت"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60">
        {messages.length === 0 ? (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="size-3.5 text-indigo-600" />
                <span>بگویید چه تغییری روی رزومه اعمال کنم</span>
              </div>
              <p className="text-slate-600">
                هر تغییری در متن خلاصه، بولت‌های تجربه کاری، مهارت‌ها، پروژه‌ها یا تیتر بخواهید همین‌جا بنویسید؛ بلافاصله روی رزومه اعمال و در کلون ذخیره می‌شود و هر زمان می‌توانید برگردانید (Undo).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500">دستورهای سریع پیشنهادی:</div>
              <div className="space-y-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isSending}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-right px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-xs text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-800 shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.role === "assistant" && msg.changesSummaryFa && msg.changesSummaryFa.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <Check className="size-3 shrink-0" />
                      <span>{msg.reverted ? "تغییرات بازگردانی شد:" : "تغییرات اعمال و ذخیره شد:"}</span>
                    </div>
                    <ul className="space-y-1 pr-3 list-disc text-[11px] text-slate-600">
                      {msg.changesSummaryFa.map((item, i) => (
                        <li key={i} className={msg.reverted ? "line-through opacity-60" : ""}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.role === "assistant" && msg.previousSnapshot && !msg.reverted && activeClone && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => revertCloneChatMessage(activeClone.id, msg.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>بازگردانی این تغییر (Undo)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2.5">
            <Loader2 className="size-3.5 animate-spin shrink-0" />
            <span>در حال اعمال تغییرات و ذخیره روی کلون...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white space-y-2 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="مثلاً: بولت دوم MCI رو کوتاه‌تر کن و تاکید روی رشد B2B بگذار..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            title="ارسال دستور و ذخیره خودکار در کلون"
          >
            {isSending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            <span>اعمال</span>
          </button>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>Enter برای ارسال · Shift+Enter خط جدید</span>
          <span>متصل به فایل‌های docs/</span>
        </div>
      </form>
    </aside>
  );
}
