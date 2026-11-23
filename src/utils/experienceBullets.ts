export type AtsOnlyExperienceBulletsMap = Record<string, number[]>;

export const EXPERIENCE_COMPANY_LABELS: Record<string, string> = {
  tums: "TUMS Health Innoversity",
  mci: "Hamrahe Aval (MCI)",
  ofoq: "Ofogh Dadeha Iranian",
  uxcel: "Uxcel",
};

export function normalizeAtsOnlyBulletsMap(
  map?: AtsOnlyExperienceBulletsMap
): AtsOnlyExperienceBulletsMap {
  if (!map || typeof map !== "object") return {};
  const result: AtsOnlyExperienceBulletsMap = {};
  for (const [expId, indices] of Object.entries(map)) {
    if (!Array.isArray(indices)) continue;
    const cleaned = Array.from(
      new Set(indices.filter((n) => typeof n === "number" && Number.isInteger(n) && n >= 0))
    ).sort((a, b) => a - b);
    if (cleaned.length > 0) {
      result[expId] = cleaned;
    }
  }
  return result;
}

export function atsOnlyBulletsEqual(
  a?: AtsOnlyExperienceBulletsMap,
  b?: AtsOnlyExperienceBulletsMap
): boolean {
  const normA = normalizeAtsOnlyBulletsMap(a);
  const normB = normalizeAtsOnlyBulletsMap(b);
  const keysA = Object.keys(normA).sort();
  const keysB = Object.keys(normB).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const k = keysA[i];
    if (k !== keysB[i]) return false;
    const arrA = normA[k];
    const arrB = normB[k];
    if (arrA.length !== arrB.length) return false;
    for (let j = 0; j < arrA.length; j++) {
      if (arrA[j] !== arrB[j]) return false;
    }
  }
  return true;
}

export function isExperienceBulletAtsOnly(
  map: AtsOnlyExperienceBulletsMap | undefined,
  expId: string,
  bulletIndex: number
): boolean {
  const list = map?.[expId];
  return Array.isArray(list) && list.includes(bulletIndex);
}

export function toggleExperienceBulletAtsOnly(
  map: AtsOnlyExperienceBulletsMap | undefined,
  expId: string,
  bulletIndex: number
): AtsOnlyExperienceBulletsMap {
  const next = normalizeAtsOnlyBulletsMap(map);
  const current = next[expId] || [];
  if (current.includes(bulletIndex)) {
    const filtered = current.filter((i) => i !== bulletIndex);
    if (filtered.length === 0) {
      delete next[expId];
    } else {
      next[expId] = filtered;
    }
  } else {
    next[expId] = [...current, bulletIndex].sort((a, b) => a - b);
  }
  return next;
}

export function partitionExperienceBullets(
  bullets: string[],
  expId: string,
  map?: AtsOnlyExperienceBulletsMap
): {
  visibleBullets: { text: string; index: number }[];
  atsOnlyBullets: { text: string; index: number }[];
} {
  const hiddenSet = new Set(map?.[expId] || []);
  const visibleBullets: { text: string; index: number }[] = [];
  const atsOnlyBullets: { text: string; index: number }[] = [];

  bullets.forEach((text, index) => {
    if (hiddenSet.has(index)) {
      atsOnlyBullets.push({ text, index });
    } else {
      visibleBullets.push({ text, index });
    }
  });

  return { visibleBullets, atsOnlyBullets };
}

export function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

export function extractBulletPreview(bullet: string): { title: string; body: string } {
  const clean = stripMarkdownBold(bullet);
  const dashIdx = clean.indexOf("—");
  if (dashIdx > 0 && dashIdx < 65) {
    return {
      title: clean.slice(0, dashIdx).trim(),
      body: clean.slice(dashIdx + 1).trim(),
    };
  }
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 0 && colonIdx < 55) {
    return {
      title: clean.slice(0, colonIdx).trim(),
      body: clean.slice(colonIdx + 1).trim(),
    };
  }
  return {
    title: clean.slice(0, 44) + (clean.length > 44 ? "…" : ""),
    body: clean,
  };
}
