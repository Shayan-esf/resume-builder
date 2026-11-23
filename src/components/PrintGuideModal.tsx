import { CheckCircle2, HelpCircle, Printer, X } from "lucide-react";

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export default function PrintGuideModal({
  isOpen,
  onClose,
  onPrint,
}: PrintGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                راهنمای ذخیره PDF استاندارد و بهینه برای ATS
              </h3>
              <p className="text-xs text-slate-500">
                تنظیمات پرینت جهت حفظ متون برداری، حجم کم و اسکن دقیق سیستم‌های ATS
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

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-600">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 leading-relaxed">
              <strong className="font-semibold block mb-0.5">
                چرا خروجی پرینت مرورگر بهترین روش برای ATS است؟
              </strong>
              این خروجی برخلاف ابزارهای تبدیل عکس (Canvas/PNG)، متون را به صورت
              برداری (Vector Text) و با فونت‌های استاندارد ذخیره می‌کند. در نتیجه:
              حجم فایل بسیار کم (حدود ۱۰۰ تا ۲۰۰ کیلوبایت) و تمام متون کاملاً قابل جستجو و سلکت هستند.
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-medium text-slate-700 text-xs uppercase tracking-wider text-slate-500">
              تنظیمات پیشنهادی در پنجره پرینت (Print Dialog):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Destination / مقصد:</span>
                <span className="font-semibold text-slate-800">
                  Save as PDF (ذخیره به عنوان PDF)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Paper size / اندازه:</span>
                <span className="font-semibold text-slate-800">A4 (Portrait / عمودی)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Margins / حاشیه:</span>
                <span className="font-semibold text-slate-800">None (بدون حاشیه)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Background graphics:</span>
                <span className="font-semibold text-emerald-700">✓ حتماً تیک بخورد (فعال)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            متوجه شدم
          </button>
          <button
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
          >
            <Printer className="size-4" />
            <span>باز کردن پنجره پرینت و ذخیره PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
