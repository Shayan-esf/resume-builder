import React, { useMemo, useState } from "react";
import { ArrowLeftRight, Check, GitCompare } from "lucide-react";
import { CLONE_STATUS_META, getCloneGroupMeta, ResumeClone } from "@/types/clones";
import { MASTER_RESUME_CONTENT, TailoredResumeContent } from "@/types/tailoring";
import { BASE_TYPE_LABELS } from "@/types/templates";

interface CloneDiffViewProps {
  clones: ResumeClone[];
}

function stripBold(s: string): string {
  return (s || "").replace(/\*\*/g, "").trim();
}

function countWords(content: TailoredResumeContent): number {
  const parts: string[] = [
    content.headlineRole,
    content.headlineSubtitle,
    content.summary,
    ...content.skillGroups.flatMap((g) => [g.category, ...g.items]),
    ...content.experiences.flatMap((e) => [e.role, e.intro, ...e.bullets]),
    ...content.projects.flatMap((p) => [p.title, p.description]),
  ];
  return stripBold(parts.join(" "))
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function CloneDiffView({ clones }: CloneDiffViewProps) {
  const [leftId, setLeftId] = useState<string>(clones[0]?.id || "__master__");
  const [rightId, setRightId] = useState<string>(
    clones.length > 1 ? clones[1].id : "__master__"
  );
  const [onlyChanged, setOnlyChanged] = useState(false);

  const resolveSnapshot = (id: string): {
    label: string;
    metaLine: string;
    content: TailoredResumeContent;
    atsScore?: number;
  } => {
    if (id === "__master__") {
      return {
        label: "رزومه اصلی (Master)",
        metaLine: "نسخه پایه و مرجع",
        content: MASTER_RESUME_CONTENT,
      };
    }
    const found = clones.find((c) => c.id === id);
    if (!found) {
      return {
        label: "رزومه اصلی (Master)",
        metaLine: "نسخه پایه و مرجع",
        content: MASTER_RESUME_CONTENT,
      };
    }
    return {
      label: found.name,
      metaLine: `${BASE_TYPE_LABELS[found.baseType].shortFa} · ${CLONE_STATUS_META[found.status].labelFa} · ${getCloneGroupMeta(found.group).shortFa}`,
      content: found.tailoredSnapshot || MASTER_RESUME_CONTENT,
      atsScore: found.atsScore,
    };
  };

  const left = useMemo(() => resolveSnapshot(leftId), [leftId, clones]);
  const right = useMemo(() => resolveSnapshot(rightId), [rightId, clones]);

  const leftWords = useMemo(() => countWords(left.content), [left.content]);
  const rightWords = useMemo(() => countWords(right.content), [right.content]);

  const diffRows = useMemo(() => {
    const rows: {
      id: string;
      sectionFa: string;
      leftText: string;
      rightText: string;
      changed: boolean;
    }[] = [];

    const pushRow = (id: string, sectionFa: string, l: string, r: string) => {
      const changed = stripBold(l) !== stripBold(r);
      rows.push({ id, sectionFa, leftText: stripBold(l), rightText: stripBold(r), changed });
    };

    pushRow("headlineRole", "عنوان شغلی (Headline Role)", left.content.headlineRole, right.content.headlineRole);
    pushRow("headlineSubtitle", "زیرعنوان (Subtitle)", left.content.headlineSubtitle, right.content.headlineSubtitle);
    pushRow("summary", "خلاصه اجرایی (Summary)", left.content.summary, right.content.summary);

    // Skills comparison by group index
    const maxGroups = Math.max(left.content.skillGroups.length, right.content.skillGroups.length);
    for (let i = 0; i < maxGroups; i++) {
      const lg = left.content.skillGroups[i];
      const rg = right.content.skillGroups[i];
      const title = lg?.category || rg?.category || `مهارت‌ها ${i + 1}`;
      pushRow(
        `skill-${i}`,
        `مهارت‌ها — ${title}`,
        lg ? lg.items.join(" · ") : "—",
        rg ? rg.items.join(" · ") : "—"
      );
    }

    // Experiences comparison by experience id
    const expIds = Array.from(
      new Set([
        ...left.content.experiences.map((e) => e.id),
        ...right.content.experiences.map((e) => e.id),
      ])
    );

    for (const expId of expIds) {
      const le = left.content.experiences.find((e) => e.id === expId);
      const re = right.content.experiences.find((e) => e.id === expId);
      const roleTitle = le?.role || re?.role || expId.toUpperCase();

      pushRow(`exp-role-${expId}`, `سمت شغلی (${expId.toUpperCase()})`, le?.role || "—", re?.role || "—");
      pushRow(`exp-intro-${expId}`, `توضیح نقش — ${roleTitle}`, le?.intro || "—", re?.intro || "—");

      const maxBullets = Math.max(le?.bullets.length || 0, re?.bullets.length || 0);
      for (let b = 0; b < maxBullets; b++) {
        pushRow(
          `exp-b-${expId}-${b}`,
          `${roleTitle} · بولت ${b + 1}`,
          le?.bullets[b] || "— (حذف/موجود نیست)",
          re?.bullets[b] || "— (حذف/موجود نیست)"
        );
      }
    }

    // Projects comparison
    const projIds = Array.from(
      new Set([
        ...left.content.projects.map((p) => p.id),
        ...right.content.projects.map((p) => p.id),
      ])
    );
    for (const projId of projIds) {
      const lp = left.content.projects.find((p) => p.id === projId);
      const rp = right.content.projects.find((p) => p.id === projId);
      const title = lp?.title || rp?.title || projId;
      pushRow(
        `proj-${projId}`,
        `پروژه — ${title}`,
        lp ? `${lp.title}: ${lp.description}` : "—",
        rp ? `${rp.title}: ${rp.description}` : "—"
      );
    }

    return rows;
  }, [left.content, right.content]);

  const changedCount = diffRows.filter((r) => r.changed).length;
  const visibleRows = onlyChanged ? diffRows.filter((r) => r.changed) : diffRows;

  return (
    <div className="space-y-4">
      {/* Selector Bar */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              نسخه اول (سمت راست)
            </label>
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
            >
              <option value="__master__">رزومه اصلی (Master)</option>
              {clones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const prevLeft = leftId;
              setLeftId(rightId);
              setRightId(prevLeft);
            }}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center gap-1 text-xs cursor-pointer"
            title="جابجایی دو نسخه"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              نسخه دوم (سمت چپ)
            </label>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
            >
              <option value="__master__">رزومه اصلی (Master)</option>
              {clones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <GitCompare className="size-3.5 text-sky-600" />
              <span className="font-mono tabular-nums">{changedCount}</span> بخش دارای تفاوت
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono tabular-nums">
              نسخه اول: {leftWords} کلمه
              {typeof left.atsScore === "number" ? ` · ATS ${left.atsScore}` : ""}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono tabular-nums">
              نسخه دوم: {rightWords} کلمه
              {typeof right.atsScore === "number" ? ` · ATS ${right.atsScore}` : ""}
            </span>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyChanged}
              onChange={(e) => setOnlyChanged(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>فقط بخش‌های متفاوت نمایش داده شود</span>
          </label>
        </div>
      </div>

      {/* Diff Rows */}
      {visibleRows.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-center space-y-1">
          <Check className="size-5 text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-emerald-900">این دو نسخه از نظر متنی کاملاً یکسان هستند.</p>
          <p className="text-xs text-emerald-700">برای دیدن تفاوت‌ها، نسخه دیگری را از منوی بالا انتخاب کنید.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleRows.map((row) => (
            <div
              key={row.id}
              className={`rounded-xl border overflow-hidden ${
                row.changed ? "border-amber-200 bg-white" : "border-slate-200 bg-white/80"
              }`}
            >
              <div
                className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] font-semibold ${
                  row.changed
                    ? "bg-amber-50/70 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                <span>{row.sectionFa}</span>
                <span className="text-[10px] font-medium">
                  {row.changed ? "تغییر یافته" : "یکسان"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200">
                <div className="p-3 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 truncate">
                    {left.label}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap" dir="ltr">
                    {row.leftText}
                  </p>
                </div>
                <div className={`p-3 space-y-1 ${row.changed ? "bg-sky-50/35" : ""}`}>
                  <div className="text-[10px] font-semibold text-slate-400 truncate">
                    {right.label}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap" dir="ltr">
                    {row.rightText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
