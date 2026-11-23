import { TailoredResumeContent } from "@/types/tailoring";

export interface BulletAuditItem {
  experienceId: string;
  experienceRole: string;
  bulletIndex: number;
  fieldKey: string;
  rawText: string;
  plainText: string;
  wordCount: number;
  hasMetric: boolean;
  hasStrongVerb: boolean;
  hasWeakPhrase: boolean;
  lengthStatus: "good" | "short" | "long";
  score: number; // 0 - 100
  issuesFa: string[];
  strengthsFa: string[];
}

export interface ResumeBulletAuditReport {
  overallScore: number;
  totalBullets: number;
  withMetricsCount: number;
  strongVerbCount: number;
  needsImprovementCount: number;
  items: BulletAuditItem[];
}

const STRONG_ACTION_VERBS = new Set([
  "led",
  "launched",
  "built",
  "designed",
  "delivered",
  "drove",
  "driving",
  "shifted",
  "scaled",
  "redesigned",
  "rebuilt",
  "applied",
  "trained",
  "mentored",
  "coached",
  "coordinated",
  "developed",
  "deployed",
  "validated",
  "sharpened",
  "optimized",
  "defined",
  "authored",
  "directed",
  "prioritized",
  "shipped",
  "accelerated",
  "architected",
  "automated",
  "spearheaded",
  "orchestrated",
  "transformed",
  "established",
  "increased",
  "reduced",
  "cut",
  "saved",
  "boosted",
  "streamlined",
  "created",
  "implemented",
  "executed",
  "managed",
  "owned",
  "guided",
  "engineered",
  "pioneered",
  "restructured",
  "centralized",
]);

const WEAK_PHRASES = [
  /\bresponsible for\b/i,
  /\bhelped with\b/i,
  /\bworked on\b/i,
  /\bassisted with\b/i,
  /\bparticipated in\b/i,
  /\binvolved in\b/i,
  /\btasked with\b/i,
  /\bduties included\b/i,
];

const METRIC_PATTERN =
  /(\d+%|\$\d+|\d+\+|\b\d+(?:\.\d+)?\s?(?:x|k|m|b|sprints?|weeks?|months?|years?|teams?|projects?|users?|clients?|platforms?|modules?|countries?|rounds?)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:sprints?|weeks?|months?|teams?|platforms?|modules?|rounds?)\b|\b(?:IRR|CAC|ROI|KPI|conversion|lift|reduction|growth)\b)/i;

const HARD_NUMBER_PATTERN = /(\d+%?|\b(?:two|three|four|five|six|seven|eight|nine|ten)\s+(?:sprints?|weeks?|months?|teams?|platforms?|modules?|rounds?)\b)/i;

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*/g, "").trim();
}

function extractLeadingActionWord(plainText: string): string {
  // Handle "**Theme —** Verb ..." format common in this resume
  const afterDash = plainText.includes("—")
    ? plainText.split("—").slice(1).join("—").trim()
    : plainText.includes(":")
      ? plainText.split(":").slice(1).join(":").trim()
      : plainText;

  const firstWord = (afterDash || plainText)
    .replace(/^[^a-zA-Z]+/, "")
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z]/g, "");

  return firstWord || "";
}

export function auditResumeBullets(content: TailoredResumeContent): ResumeBulletAuditReport {
  const items: BulletAuditItem[] = [];

  for (const exp of content.experiences) {
    exp.bullets.forEach((rawText, bulletIndex) => {
      const plainText = stripMarkdownBold(rawText);
      const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
      const wordCount = words.length;

      const hasHardNumber = HARD_NUMBER_PATTERN.test(plainText);
      const hasImpactMetric = METRIC_PATTERN.test(plainText);
      const hasMetric = hasHardNumber || hasImpactMetric;

      const leadWord = extractLeadingActionWord(plainText);
      const hasStrongVerb = STRONG_ACTION_VERBS.has(leadWord);
      const hasWeakPhrase = WEAK_PHRASES.some((rx) => rx.test(plainText));

      const lengthStatus: "good" | "short" | "long" =
        wordCount < 11 ? "short" : wordCount > 44 ? "long" : "good";

      let score = 45;
      const issuesFa: string[] = [];
      const strengthsFa: string[] = [];

      if (hasHardNumber) {
        score += 30;
        strengthsFa.push("دارای عدد یا متریک کمی قابل‌سنجش");
      } else if (hasImpactMetric) {
        score += 18;
        strengthsFa.push("اشاره به شاخص کسب‌وکار (بهتر است عدد دقیق اضافه شود)");
        issuesFa.push("عدد یا درصد دقیق به اثر کسب‌وکار اضافه کنید (فرمول XYZ).");
      } else {
        issuesFa.push("فاقد عدد، درصد یا مقیاس کمی (مثلاً درصد رشد، تعداد کاربر یا زمان صرفه‌جویی‌شده).");
      }

      if (hasStrongVerb) {
        score += 15;
        strengthsFa.push("شروع با فعل کنشی قوی");
      } else {
        issuesFa.push("بولت را با یک فعل کنشی قدرتمندتر (مثل Led, Built, Drove, Reduced, Scaled) شروع کنید.");
      }

      if (hasWeakPhrase) {
        score -= 18;
        issuesFa.push("شامل عبارت غیرفعال (مثل responsible for / worked on)؛ به دستاورد مستقیم تبدیل کنید.");
      }

      if (lengthStatus === "good") {
        score += 10;
        strengthsFa.push(`طول مناسب برای اسکن سریع (${wordCount} کلمه)`);
      } else if (lengthStatus === "short") {
        score += 2;
        issuesFa.push(`خیلی کوتاه است (${wordCount} کلمه)؛ نتیجه یا روش اجرا را شفاف‌تر بنویسید.`);
      } else {
        score += 3;
        issuesFa.push(`نسبتاً طولانی است (${wordCount} کلمه)؛ برای اسکن بهتر ریکروتر به زیر ۴۰ کلمه فشرده کنید.`);
      }

      const clampedScore = Math.max(20, Math.min(100, score));

      items.push({
        experienceId: exp.id,
        experienceRole: exp.role,
        bulletIndex,
        fieldKey: `expBullet:${exp.id}:${bulletIndex}`,
        rawText,
        plainText,
        wordCount,
        hasMetric: hasHardNumber,
        hasStrongVerb,
        hasWeakPhrase,
        lengthStatus,
        score: clampedScore,
        issuesFa,
        strengthsFa,
      });
    });
  }

  const totalBullets = items.length;
  const overallScore =
    totalBullets > 0
      ? Math.round(items.reduce((acc, item) => acc + item.score, 0) / totalBullets)
      : 100;

  return {
    overallScore,
    totalBullets,
    withMetricsCount: items.filter((i) => i.hasMetric).length,
    strongVerbCount: items.filter((i) => i.hasStrongVerb).length,
    needsImprovementCount: items.filter((i) => i.score < 80).length,
    items,
  };
}
