import "dotenv/config";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface DocFileItem {
  folder: string;
  filename: string;
  content: string;
  sizeBytes: number;
  updatedAt: string;
}

interface MasterExperienceInput {
  id: string;
  company: string;
  period: string;
  location: string;
  role: string;
  intro: string;
  bullets: string[];
  tags: string[];
}

interface MasterProjectInput {
  id: string;
  title: string;
  description: string;
  url?: string;
}

interface MasterContentInput {
  headlineRole: string;
  headlineSubtitle: string;
  summary: string;
  skillGroups: { category: string; items: string[] }[];
  experiences: MasterExperienceInput[];
  projects: MasterProjectInput[];
}

interface TailorRequestBody {
  jobDescription?: string;
  targetCompany?: string;
  targetRole?: string;
  intensity?: "balanced" | "targeted" | "concise";
  selectedDocs?: string[];
  masterContent?: MasterContentInput;
}

async function loadWorkDocsFromDisk(): Promise<DocFileItem[]> {
  const folderNames = ["docs", "doc"];
  const collected: DocFileItem[] = [];

  for (const folder of folderNames) {
    const dirPath = path.resolve(__dirname, folder);
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const mdFiles = entries
        .filter((e) => e.isFile() && /\.(md|markdown)$/i.test(e.name))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));

      for (const filename of mdFiles) {
        const filePath = path.join(dirPath, filename);
        const [content, stat] = await Promise.all([
          fs.readFile(filePath, "utf-8"),
          fs.stat(filePath),
        ]);
        collected.push({
          folder,
          filename,
          content,
          sizeBytes: stat.size,
          updatedAt: stat.mtime.toISOString(),
        });
      }
    } catch {
      // Folder may not exist; skip cleanly
    }
  }

  return collected;
}

function sanitizeDocFilename(rawName: string): string | null {
  const base = path.basename(rawName.trim()).replace(/[^a-zA-Z0-9._-]/g, "-");
  if (!base || base === "." || base === "..") return null;
  return /\.(md|markdown)$/i.test(base) ? base : `${base}.md`;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_GEMINI_API_KEY");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Clone Archive store - complete snapshots on the server's local disk
// ---------------------------------------------------------------------------
// The browser keeps a copy in localStorage for instant paint and offline work,
// but the authoritative archive lives here as plain JSON files. Every device
// that talks to this server sees the same archive, and every change is kept as
// a complete, restorable snapshot.
//
//   data/archives/index.json                     current state of every archive
//   data/archives/versions/<id>/index.json       snapshot list for one archive
//   data/archives/versions/<id>/v-<ts>-<h>.json  one full snapshot per change

const ARCHIVES_DIR = path.resolve(__dirname, "data", "archives");
const ARCHIVES_INDEX_PATH = path.join(ARCHIVES_DIR, "index.json");
const ARCHIVES_VERSIONS_DIR = path.join(ARCHIVES_DIR, "versions");
const ARCHIVES_SCHEMA_VERSION = 1;
const MAX_ARCHIVE_VERSIONS = 1000;
const ARCHIVE_VERSION_FILE_RE = /^v-\d{10,16}-[a-f0-9]{8}\.json$/;

type StoredArchive = { id: string; [key: string]: unknown };

interface ArchiveIndexFile {
  schemaVersion: number;
  updatedAt: string | null;
  storageDir: string;
  archives: StoredArchive[];
  tombstones: ArchiveTombstone[];
}

// A deleted archive stays listed here so another device cannot resurrect it.
interface ArchiveTombstone {
  id: string;
  deletedAt: string;
}

interface ArchiveVersionEntry {
  file: string;
  savedAt: string;
  hash: string;
  reason: string;
  bytes: number;
}

interface ArchiveVersionIndexFile {
  archiveId: string;
  versions: ArchiveVersionEntry[];
}

function isStoredArchive(value: unknown): value is StoredArchive {
  if (!value || typeof value !== "object") return false;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" && id.trim().length > 0;
}

function emptyArchiveIndex(): ArchiveIndexFile {
  return {
    schemaVersion: ARCHIVES_SCHEMA_VERSION,
    updatedAt: null,
    storageDir: ARCHIVES_DIR,
    archives: [],
    tombstones: [],
  };
}

function parseTombstones(raw: unknown): ArchiveTombstone[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is ArchiveTombstone =>
      Boolean(entry) &&
      typeof entry === "object" &&
      typeof (entry as ArchiveTombstone).id === "string" &&
      typeof (entry as ArchiveTombstone).deletedAt === "string",
  );
}

async function writeJsonAtomic(target: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, target);
}

async function readArchiveIndex(): Promise<ArchiveIndexFile> {
  try {
    const parsed = JSON.parse(await fs.readFile(ARCHIVES_INDEX_PATH, "utf-8")) as Partial<ArchiveIndexFile>;
    return {
      schemaVersion: typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : ARCHIVES_SCHEMA_VERSION,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      storageDir: ARCHIVES_DIR,
      archives: Array.isArray(parsed.archives) ? parsed.archives.filter(isStoredArchive) : [],
      tombstones: parseTombstones(parsed.tombstones),
    };
  } catch {
    return emptyArchiveIndex();
  }
}

// Readable folder name for an archive id, with a short digest whenever the id
// had to be altered so two different ids can never share a folder.
function archiveFolderName(archiveId: string): string {
  const cleaned = archiveId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 96) || "archive";
  if (cleaned === archiveId) return cleaned;
  const digest = createHash("sha1").update(archiveId).digest("hex").slice(0, 8);
  return `${cleaned}-${digest}`;
}

function archiveVersionsDir(archiveId: string): string {
  return path.join(ARCHIVES_VERSIONS_DIR, archiveFolderName(archiveId));
}

async function readVersionIndexForDir(dir: string, archiveId: string): Promise<ArchiveVersionIndexFile> {
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(dir, "index.json"), "utf-8")) as Partial<ArchiveVersionIndexFile>;
    return {
      archiveId,
      versions: Array.isArray(parsed.versions)
        ? parsed.versions.filter((entry) => entry && typeof entry.file === "string")
        : [],
    };
  } catch {
    return { archiveId, versions: [] };
  }
}

function readVersionIndex(archiveId: string): Promise<ArchiveVersionIndexFile> {
  return readVersionIndexForDir(archiveVersionsDir(archiveId), archiveId);
}

function hashArchive(archive: StoredArchive): string {
  return createHash("sha256").update(JSON.stringify(archive)).digest("hex");
}

// Writes a full snapshot unless the latest stored one is already identical.
async function appendArchiveVersion(archive: StoredArchive, reason: string): Promise<boolean> {
  const hash = hashArchive(archive);
  const dir = archiveVersionsDir(archive.id);
  const index = await readVersionIndexForDir(dir, archive.id);
  const last = index.versions[index.versions.length - 1];
  if (last && last.hash === hash) return false;

  await fs.mkdir(dir, { recursive: true });
  const savedAt = new Date();
  const file = `v-${savedAt.getTime()}-${hash.slice(0, 8)}.json`;
  const body = JSON.stringify(
    { archiveId: archive.id, savedAt: savedAt.toISOString(), reason, archive },
    null,
    2,
  );
  await fs.writeFile(path.join(dir, file), body, "utf-8");

  index.versions.push({
    file,
    savedAt: savedAt.toISOString(),
    hash,
    reason,
    bytes: Buffer.byteLength(body, "utf-8"),
  });

  if (index.versions.length > MAX_ARCHIVE_VERSIONS) {
    const dropped = index.versions.splice(0, index.versions.length - MAX_ARCHIVE_VERSIONS);
    for (const entry of dropped) {
      await fs.rm(path.join(dir, entry.file), { force: true }).catch(() => undefined);
    }
  }

  await writeJsonAtomic(path.join(dir, "index.json"), index);
  return true;
}

async function startServer() {
  const app = express();
  // Archive payloads carry full resume snapshots, so they get a larger body limit
  // than the AI routes (2 MB). Mounted first: body-parser skips an already parsed body.
  app.use("/api/archives", express.json({ limit: "40mb" }));
  app.use(express.json({ limit: "2mb" }));

  // ----- Clone Archive: disk-backed, versioned -----

  // Current archive state plus where it lives on disk.
  app.get("/api/archives", async (_req, res) => {
    try {
      const index = await readArchiveIndex();
      res.json({
        archives: index.archives,
        tombstones: index.tombstones,
        updatedAt: index.updatedAt,
        storageDir: ARCHIVES_DIR,
        schemaVersion: index.schemaVersion,
      });
    } catch (err) {
      console.error("Error reading clone archive index:", err);
      res.status(500).json({ error: "خطا در خواندن آرشیو کلون‌ها از دیسک سرور." });
    }
  });

  // Full backup: every archive plus, on request, every saved snapshot.
  app.get("/api/archives/export", async (req, res) => {
    try {
      const index = await readArchiveIndex();
      const includeVersions = String(req.query.withVersions ?? "") === "1";
      const versionsByArchive: Record<string, unknown[]> = {};

      if (includeVersions) {
        const folders = await fs.readdir(ARCHIVES_VERSIONS_DIR, { withFileTypes: true }).catch(() => []);
        for (const folder of folders) {
          if (!folder.isDirectory()) continue;
          const dir = path.join(ARCHIVES_VERSIONS_DIR, folder.name);
          const versionIndex = await readVersionIndexForDir(dir, folder.name);
          if (versionIndex.versions.length === 0) continue;

          const snapshots: unknown[] = [];
          for (const entry of versionIndex.versions) {
            const raw = await fs.readFile(path.join(dir, entry.file), "utf-8").catch(() => null);
            if (!raw) continue;
            snapshots.push({
              savedAt: entry.savedAt,
              reason: entry.reason,
              hash: entry.hash,
              snapshot: JSON.parse(raw),
            });
          }
          if (snapshots.length > 0) versionsByArchive[versionIndex.archiveId] = snapshots;
        }
      }

      res.setHeader("Content-Disposition", 'attachment; filename="resume-archives-export.json"');
      res.json({
        exportedAt: new Date().toISOString(),
        schemaVersion: index.schemaVersion,
        storageDir: ARCHIVES_DIR,
        archives: index.archives,
        ...(includeVersions ? { versions: versionsByArchive } : {}),
      });
    } catch (err) {
      console.error("Error exporting clone archive:", err);
      res.status(500).json({ error: "خطا در تهیه خروجی کامل آرشیو." });
    }
  });

  // Replace the stored archive with the incoming list and snapshot what changed.
  app.put("/api/archives", async (req, res) => {
    try {
      const body = (req.body ?? {}) as { archives?: unknown; reason?: unknown; confirmDeleteAll?: unknown };
      if (!Array.isArray(body.archives)) {
        res.status(400).json({ error: "بدنه درخواست باید شامل آرایه‌ی archives باشد." });
        return;
      }
      if (body.archives.length > 5000) {
        res.status(413).json({ error: "تعداد آرشیوها بیش از حد مجاز است." });
        return;
      }
      const invalidCount = body.archives.filter((item) => !isStoredArchive(item)).length;
      if (invalidCount > 0) {
        res.status(400).json({ error: `${invalidCount} آرشیو شناسه‌ی معتبر (id) ندارد.` });
        return;
      }

      const incoming = (body.archives as StoredArchive[]).map(
        (archive): StoredArchive => ({
          ...archive,
          id: archive.id.trim(),
        }),
      );
      const existing = await readArchiveIndex();
      if (existing.archives.length > 0 && incoming.length === 0 && body.confirmDeleteAll !== true) {
        res.status(409).json({
          error: "حذف کامل آرشیوها نیاز به تأیید دارد؛ آخرین نسخه‌ها روی دیسک باقی مانده‌اند.",
        });
        return;
      }

      const reason =
        typeof body.reason === "string" && body.reason.trim()
          ? body.reason.trim().slice(0, 200)
          : "auto-save";

      // Removed archives become tombstones, so a device still holding a stale copy
      // cannot bring them back; an archive edited after the delete wins (restore).
      const nowIso = new Date().toISOString();
      const incomingIds = new Set(incoming.map((archive) => archive.id));
      const tombstoneById = new Map<string, string>();
      for (const tombstone of existing.tombstones) tombstoneById.set(tombstone.id, tombstone.deletedAt);
      for (const archive of existing.archives) {
        if (!incomingIds.has(archive.id)) tombstoneById.set(archive.id, nowIso);
      }

      const accepted = incoming.filter((archive) => {
        const deletedAt = tombstoneById.get(archive.id);
        if (!deletedAt) return true;
        const deletedAtMs = Date.parse(deletedAt);
        const updatedAt = typeof archive.updatedAt === "number" ? archive.updatedAt : 0;
        return Number.isFinite(deletedAtMs) ? updatedAt > deletedAtMs : true;
      });
      for (const archive of accepted) tombstoneById.delete(archive.id);

      const cutoffMs = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const tombstones = Array.from(tombstoneById, ([id, deletedAt]) => ({ id, deletedAt }))
        .filter((tombstone) => {
          const ms = Date.parse(tombstone.deletedAt);
          return Number.isFinite(ms) && ms >= cutoffMs;
        })
        .slice(-500);

      const previousById = new Map(existing.archives.map((archive) => [archive.id, archive]));
      let snapshotsWritten = 0;

      for (const archive of accepted) {
        const previous = previousById.get(archive.id);
        if (previous && hashArchive(previous) === hashArchive(archive)) continue;
        if (await appendArchiveVersion(archive, previous ? reason : "created")) snapshotsWritten += 1;
      }

      const updatedAt = new Date().toISOString();
      await writeJsonAtomic(ARCHIVES_INDEX_PATH, {
        schemaVersion: ARCHIVES_SCHEMA_VERSION,
        updatedAt,
        storageDir: ARCHIVES_DIR,
        archives: accepted,
        tombstones,
      } satisfies ArchiveIndexFile);

      res.json({
        total: accepted.length,
        snapshotsWritten,
        tombstones,
        updatedAt,
        storageDir: ARCHIVES_DIR,
      });
    } catch (err) {
      console.error("Error saving clone archive:", err);
      res.status(500).json({ error: "خطا در ذخیره‌ی آرشیو روی دیسک سرور." });
    }
  });

  // Snapshot list for one archive.
  app.get("/api/archives/:id/versions", async (req, res) => {
    try {
      const archiveId = typeof req.params.id === "string" ? req.params.id.trim() : "";
      if (!archiveId) {
        res.status(400).json({ error: "شناسه‌ی آرشیو معتبر نیست." });
        return;
      }
      const index = await readVersionIndex(archiveId);
      res.json({
        archiveId: index.archiveId,
        count: index.versions.length,
        versions: index.versions,
        storageDir: archiveVersionsDir(archiveId),
      });
    } catch (err) {
      console.error("Error reading archive versions:", err);
      res.status(500).json({ error: "خطا در خواندن نسخه‌های آرشیو." });
    }
  });

  // One complete snapshot, exactly as it was saved.
  app.get("/api/archives/:id/versions/:file", async (req, res) => {
    try {
      const archiveId = typeof req.params.id === "string" ? req.params.id.trim() : "";
      const file = typeof req.params.file === "string" ? req.params.file : "";
      if (!archiveId || !ARCHIVE_VERSION_FILE_RE.test(file)) {
        res.status(400).json({ error: "درخواست نسخه معتبر نیست." });
        return;
      }
      const raw = await fs.readFile(path.join(archiveVersionsDir(archiveId), file), "utf-8");
      res.type("application/json").send(raw);
    } catch (err) {
      console.error("Error reading archive snapshot:", err);
      res.status(404).json({ error: "نسخه‌ی مورد نظر روی دیسک پیدا نشد." });
    }
  });

  // Remove an archive from the current state; its snapshots stay unless purged.
  app.delete("/api/archives/:id", async (req, res) => {
    try {
      const archiveId = typeof req.params.id === "string" ? req.params.id.trim() : "";
      if (!archiveId) {
        res.status(400).json({ error: "شناسه‌ی آرشیو معتبر نیست." });
        return;
      }
      const index = await readArchiveIndex();
      const nextArchives = index.archives.filter((archive) => archive.id !== archiveId);
      if (nextArchives.length === index.archives.length) {
        res.status(404).json({ error: "آرشیو مورد نظر پیدا نشد." });
        return;
      }

      const tombstones = [
        ...index.tombstones.filter((tombstone) => tombstone.id !== archiveId),
        { id: archiveId, deletedAt: new Date().toISOString() },
      ].slice(-500);

      await writeJsonAtomic(ARCHIVES_INDEX_PATH, {
        schemaVersion: ARCHIVES_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        storageDir: ARCHIVES_DIR,
        archives: nextArchives,
        tombstones,
      } satisfies ArchiveIndexFile);

      const purge = String(req.query.purge ?? "") === "1";
      if (purge) await fs.rm(archiveVersionsDir(archiveId), { recursive: true, force: true });

      res.json({ deleted: archiveId, total: nextArchives.length, purged: purge, tombstones });
    } catch (err) {
      console.error("Error deleting clone archive:", err);
      res.status(500).json({ error: "خطا در حذف آرشیو." });
    }
  });

  // Read markdown files from /docs and /doc folders
  app.get("/api/docs", async (_req, res) => {
    try {
      const docs = await loadWorkDocsFromDisk();
      const totalChars = docs.reduce((sum, d) => sum + d.content.length, 0);
      res.json({
        docs,
        totalChars,
        folders: ["docs", "doc"],
      });
    } catch (err) {
      console.error("Error reading markdown docs:", err);
      res.status(500).json({ error: "خطا در خواندن فایل‌های مارک‌داون از پوشه docs." });
    }
  });

  // Create or update a markdown file in /docs
  app.post("/api/docs", async (req, res) => {
    try {
      const { filename, content } = req.body as { filename?: string; content?: string };
      const safeName = filename ? sanitizeDocFilename(filename) : null;
      if (!safeName) {
        res.status(400).json({ error: "نام فایل معتبر نیست (مثال: my-projects.md)." });
        return;
      }
      if (typeof content !== "string" || !content.trim()) {
        res.status(400).json({ error: "محتوای مارک‌داون نمی‌تواند خالی باشد." });
        return;
      }

      const docsDir = path.resolve(__dirname, "docs");
      await fs.mkdir(docsDir, { recursive: true });
      await fs.writeFile(path.join(docsDir, safeName), content, "utf-8");

      const docs = await loadWorkDocsFromDisk();
      res.json({ saved: `docs/${safeName}`, docs });
    } catch (err) {
      console.error("Error saving markdown doc:", err);
      res.status(500).json({ error: "خطا در ذخیره فایل مارک‌داون در پوشه docs." });
    }
  });

  // Delete a markdown file in /docs
  app.delete("/api/docs/:filename", async (req, res) => {
    try {
      const safeName = sanitizeDocFilename(req.params.filename || "");
      if (!safeName) {
        res.status(400).json({ error: "نام فایل معتبر نیست." });
        return;
      }
      const targetPath = path.resolve(__dirname, "docs", safeName);
      await fs.unlink(targetPath);
      const docs = await loadWorkDocsFromDisk();
      res.json({ deleted: `docs/${safeName}`, docs });
    } catch (err) {
      console.error("Error deleting markdown doc:", err);
      res.status(500).json({ error: "فایل مورد نظر در پوشه docs یافت نشد یا حذف نشد." });
    }
  });

  // AI ATS Score, Gap Analysis & Actionable Personalization Suggestions
  app.post("/api/ats-analyze", async (req, res) => {
    try {
      const body = req.body as {
        jobDescription?: string;
        targetCompany?: string;
        targetRole?: string;
        currentResumeText?: string;
        selectedDocs?: string[];
        masterContent?: MasterContentInput;
      };

      const jobDescription = body.jobDescription?.trim();
      if (!jobDescription || jobDescription.length < 20) {
        res.status(400).json({
          error: "لطفاً توضیحات کامل شرح شغلی (حداقل ۲۰ کاراکتر) را وارد کنید.",
        });
        return;
      }

      const allDocs = await loadWorkDocsFromDisk();
      const activeDocs =
        Array.isArray(body.selectedDocs) && body.selectedDocs.length > 0
          ? allDocs.filter((d) => body.selectedDocs!.includes(`${d.folder}/${d.filename}`))
          : allDocs;

      const docsMarkdownBundle =
        activeDocs.length > 0
          ? activeDocs
              .map(
                (doc) =>
                  `### FILE: ${doc.folder}/${doc.filename}\n\`\`\`markdown\n${doc.content.trim().slice(0, 14000)}\n\`\`\``
              )
              .join("\n\n")
          : "(No external markdown files found in docs/ folder.)";

      const resumeSnapshot =
        body.currentResumeText && body.currentResumeText.trim().length > 40
          ? body.currentResumeText.trim().slice(0, 14000)
          : JSON.stringify(body.masterContent || {}, null, 2);

      const ai = getAiClient();

      const systemInstruction = `You are a Senior ATS (Applicant Tracking System) Auditor and Technical Product Management Career Strategist.
Evaluate the candidate's CURRENT RESUME against the provided JOB DESCRIPTION, and cross-reference the candidate's verified Markdown Knowledge Base (docs/) to recommend high-impact, 100% truthful additions and optimizations.

STRICT RULES:
1. SCORING CALIBRATION: Be realistic and analytical (do not blindly give 95+). Score 0-100 across:
   - keywordMatch: exact & semantic coverage of required JD skills/tools/domain terms in the current resume
   - experienceRelevance: alignment of roles, seniority, and domain
   - impactAndMetrics: presence of concrete, quantified outcomes relevant to the JD
   - atsStructureReadability: clarity, scannability, role-headline alignment, action verbs
   Compute overallScore as a realistic weighted average, and projectedScoreAfterOptimization as the realistic achievable score after applying your verified suggestions.
2. TRUTHFULNESS: Never fabricate experiences or metrics. When recommending additions in "suggestedAdditions", pull verified skills, projects, achievements, or phrasing from the candidate's docs/ knowledge base whenever possible and set verifiedFromDocs=true. If suggesting a general reframing or gap-mitigating summary angle, keep it grounded and honest.
3. ACTIONABLE SUGGESTIONS (suggestedAdditions): Return 4 to 7 concrete items across categories ("skill", "bullet", "project", "summary"):
   - For "skill": englishContent should be the concise skill name (e.g. "Product-Led Growth (PLG)")
   - For "bullet": englishContent should be a strong, ready-to-insert resume bullet in English formatted as "**Theme —** action with **quantified impact**." Set targetSectionId to the best matching experience ID ("tums", "mci", "uxcel", or "ofoq").
   - For "project": englishContent should be "Project Title: 1-sentence impact-focused description"
   - For "summary": englishContent should be a sharp 2-3 sentence ATS-aligned executive summary in English.
4. PERSIAN EXPLANATIONS: Write executiveVerdictFa, titleFa, reasonFa, whereToAddFa, actionFa, and expectedImpactFa in clear, natural, professional Persian. Keep englishContent and keywords in the language of the resume/JD (typically English).`;

      const userPrompt = `TARGET HINTS:
- Target Company: ${body.targetCompany?.trim() || "(detect from JD)"}
- Target Role: ${body.targetRole?.trim() || "(detect from JD)"}

JOB DESCRIPTION:
"""
${jobDescription}
"""

CURRENT ACTIVE RESUME TEXT (BEING EVALUATED BY ATS):
"""
${resumeSnapshot}
"""

CANDIDATE VERIFIED KNOWLEDGE BASE (docs/ folder — source of additional true achievements, projects, and skills not yet on the resume):
${docsMarkdownBundle}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              projectedScoreAfterOptimization: { type: Type.INTEGER },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  keywordMatch: { type: Type.INTEGER },
                  experienceRelevance: { type: Type.INTEGER },
                  impactAndMetrics: { type: Type.INTEGER },
                  atsStructureReadability: { type: Type.INTEGER },
                },
                required: [
                  "keywordMatch",
                  "experienceRelevance",
                  "impactAndMetrics",
                  "atsStructureReadability",
                ],
              },
              detectedCompany: { type: Type.STRING },
              detectedRole: { type: Type.STRING },
              executiveVerdictFa: { type: Type.STRING },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    importance: { type: Type.STRING },
                    inDocs: { type: Type.BOOLEAN },
                    whereToAddFa: { type: Type.STRING },
                  },
                  required: ["keyword", "importance", "inDocs", "whereToAddFa"],
                },
              },
              suggestedAdditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    titleFa: { type: Type.STRING },
                    reasonFa: { type: Type.STRING },
                    targetSectionId: { type: Type.STRING },
                    englishContent: { type: Type.STRING },
                    verifiedFromDocs: { type: Type.BOOLEAN },
                  },
                  required: [
                    "id",
                    "category",
                    "titleFa",
                    "reasonFa",
                    "englishContent",
                    "verifiedFromDocs",
                  ],
                },
              },
              optimizationChecklistFa: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    priority: { type: Type.STRING },
                    actionFa: { type: Type.STRING },
                    expectedImpactFa: { type: Type.STRING },
                  },
                  required: ["priority", "actionFa", "expectedImpactFa"],
                },
              },
            },
            required: [
              "overallScore",
              "projectedScoreAfterOptimization",
              "scoreBreakdown",
              "detectedCompany",
              "detectedRole",
              "executiveVerdictFa",
              "matchedKeywords",
              "missingKeywords",
              "suggestedAdditions",
              "optimizationChecklistFa",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "پاسخی از سرویس هوش مصنوعی دریافت نشد." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({
        ...parsed,
        docsUsed: activeDocs.map((d) => `${d.folder}/${d.filename}`),
        analyzedAt: Date.now(),
      });
    } catch (err: unknown) {
      console.error("Error in /api/ats-analyze:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({
          error: "کلید GEMINI_API_KEY در تنظیمات Secrets ثبت نشده است.",
        });
        return;
      }

      if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        res.status(403).json({
          error: "کلید Gemini API نامعتبر است یا دسترسی ندارد. لطفاً بخش Settings > Secrets را بررسی کنید.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error: "سهمیه درخواست‌های API موقتاً پر شده است. لطفاً چند لحظه بعد دوباره تلاش کنید.",
        });
        return;
      }

      res.status(500).json({
        error: `خطا در تحلیل ATS رزومه: ${message}`,
      });
    }
  });

  app.post("/api/tailor-resume", async (req, res) => {
    try {
      const body = req.body as TailorRequestBody;
      const jobDescription = body.jobDescription?.trim();
      const masterContent = body.masterContent;
      const intensity = body.intensity || "targeted";

      if (!jobDescription || jobDescription.length < 20) {
        res.status(400).json({
          error: "لطفاً توضیحات کامل موقعیت شغلی (حداقل ۲۰ کاراکتر) را وارد کنید.",
        });
        return;
      }

      if (!masterContent) {
        res.status(400).json({
          error: "اطلاعات قالب پایه ارسال نشده است.",
        });
        return;
      }

      const allDocs = await loadWorkDocsFromDisk();
      const activeDocs =
        Array.isArray(body.selectedDocs) && body.selectedDocs.length > 0
          ? allDocs.filter((d) => body.selectedDocs!.includes(`${d.folder}/${d.filename}`))
          : allDocs;

      const docsMarkdownBundle =
        activeDocs.length > 0
          ? activeDocs
              .map(
                (doc) =>
                  `### FILE: ${doc.folder}/${doc.filename}\n\`\`\`markdown\n${doc.content.trim()}\n\`\`\``
              )
              .join("\n\n")
          : "(No external markdown files found in docs/ or doc/ folder; rely solely on MASTER_RESUME_CONTENT.)";

      const ai = getAiClient();

      const intensityGuide =
        intensity === "balanced"
          ? "Keep wording very close to the master resume. Primarily reorder skills and bullets so the most relevant ones come first, with light keyword alignment in the summary and headline."
          : intensity === "concise"
          ? "Create a high-signal, punchy ATS-tailored version: sharpen summary to 3 crisp sentences, keep the top 3-5 most relevant bullets per role (minimum 2 for shorter roles), and surface the exact matching skills first."
          : "Actively tailor the headline subtitle, summary, skill ordering, experience intros/bullets, and project descriptions to mirror the job description's language and priorities while staying 100% faithful to the candidate's documented background.";

      const systemInstruction = `You are an expert Technical & Product Management Resume Strategist and ATS Optimization Specialist.
Your task is to generate a TEMPORARY, job-specific tailored version of Shayan Esfahanizadeh's finalized master resume based strictly on:
1) The candidate's Markdown Work Knowledge Base (from the \`docs/\` / \`doc/\` folder), and
2) The finalized Master Resume structure.

STRICT TRUTHFULNESS RULES (NON-NEGOTIABLE):
1. NEVER invent, fabricate, or exaggerate companies, job titles, dates, degrees, metrics, percentages, tools, or experiences not present in the Candidate Markdown Docs or Master Resume.
2. You SHOULD draw relevant verified details, projects, impact metrics, and context from the Candidate Markdown Docs when they strengthen alignment with the Job Description.
3. Keep the exact 4 experience IDs ("tums", "mci", "uxcel", "ofoq") and the exact project IDs provided in masterContent.
4. You MAY reframe, reorder, emphasize, and incorporate accurate terminology/synonyms from the Job Description where the candidate genuinely performed that work.
5. Use **double asterisks** around 2-4 key phrases or metrics per summary/bullet (e.g. **Product Discovery**, **15% increase in business-plan IRR**, **Wizard of Oz**) matching the bold formatting style of the master resume. Keep each bullet structured as "**Action/Theme —** concrete description with **impact**."
6. Keep lengths disciplined so the tailored resume fits cleanly on 1-2 A4 pages without overflowing:
   - summary: ~75-110 words
   - skillGroups: preserve the 4 category names from masterContent, reorder items inside each category so JD-relevant skills appear first (keep 5-12 concise skills per group).
   - experiences: keep all 4 IDs ("tums", "mci", "uxcel", "ofoq"). For "mci", keep 5-7 strong bullets (or 4-5 in concise mode). For "ofoq", 3-4 bullets. For "tums", 2-3 bullets. For "uxcel", 2 bullets.
   - projects: keep all project IDs from masterContent and tighten/emphasize relevance to the JD (1-2 sentences each).
7. For "missingOrGapKeywords", honestly list notable skills/tools/domain requirements in the JD that are NOT present in the candidate's docs or master resume so the user is aware of them (do NOT add unpossessed skills into the resume itself).
8. Write "tailoringRationale" in clear, natural Persian (2-3 sentences) summarizing what was tailored from the docs for this specific job posting.`;

      const userPrompt = `TARGET HINTS:
- Target Company (user hint, extract from JD if empty): ${body.targetCompany?.trim() || "(auto-detect from JD)"}
- Target Role (user hint, extract from JD if empty): ${body.targetRole?.trim() || "(auto-detect from JD)"}
- Tailoring Intensity: ${intensity} (${intensityGuide})

JOB REQUIREMENTS / DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE WORK KNOWLEDGE BASE (READ FROM MARKDOWN DOCS FOLDER):
${docsMarkdownBundle}

MASTER RESUME TEMPLATE STRUCTURE (TARGET SCHEMA & BASELINE):
${JSON.stringify(masterContent, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetCompany: { type: Type.STRING },
              targetRole: { type: Type.STRING },
              atsScoreBefore: { type: Type.INTEGER },
              atsScoreAfter: { type: Type.INTEGER },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingOrGapKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tailoringRationale: { type: Type.STRING },
              tailored: {
                type: Type.OBJECT,
                properties: {
                  headlineRole: { type: Type.STRING },
                  headlineSubtitle: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  skillGroups: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ["category", "items"],
                    },
                  },
                  experiences: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        role: { type: Type.STRING },
                        intro: { type: Type.STRING },
                        bullets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        tags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ["id", "role", "intro", "bullets", "tags"],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["id", "title", "description"],
                    },
                  },
                },
                required: [
                  "headlineRole",
                  "headlineSubtitle",
                  "summary",
                  "skillGroups",
                  "experiences",
                  "projects",
                ],
              },
            },
            required: [
              "targetCompany",
              "targetRole",
              "atsScoreBefore",
              "atsScoreAfter",
              "matchedKeywords",
              "missingOrGapKeywords",
              "tailoringRationale",
              "tailored",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "پاسخی از سرویس هوش مصنوعی دریافت نشد." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({
        ...parsed,
        docsUsed: activeDocs.map((d) => `${d.folder}/${d.filename}`),
      });
    } catch (err: unknown) {
      console.error("Error in /api/tailor-resume:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({
          error: "کلید GEMINI_API_KEY در تنظیمات Secrets ثبت نشده است.",
        });
        return;
      }

      if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        res.status(403).json({
          error: "کلید Gemini API نامعتبر است یا دسترسی ندارد. لطفاً بخش Settings > Secrets را بررسی کنید.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error: "سهمیه درخواست‌های API موقتاً پر شده است. لطفاً چند لحظه بعد دوباره تلاش کنید.",
        });
        return;
      }

      res.status(500).json({
        error: `خطا در تولید نسخه سفارشی رزومه: ${message}`,
      });
    }
  });

  // Conversational AI Chat Editor for Resume Clones (applies & saves user-requested changes)
  app.post("/api/clone-chat-edit", async (req, res) => {
    try {
      const body = req.body as {
        instruction?: string;
        cloneName?: string;
        history?: { role: "user" | "assistant"; text: string }[];
        currentContent?: MasterContentInput;
        profile?: {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          location?: string;
          website?: string;
          linkedin?: string;
        };
      };

      const instruction = body.instruction?.trim();
      if (!instruction) {
        res.status(400).json({ error: "لطفاً دستور یا تغییر مورد نظر خود را بنویسید." });
        return;
      }
      if (!body.currentContent) {
        res.status(400).json({ error: "محتوای فعلی رزومه ارسال نشده است." });
        return;
      }

      const allDocs = await loadWorkDocsFromDisk();
      const docsBundle =
        allDocs.length > 0
          ? allDocs
              .map(
                (doc) =>
                  `### FILE: ${doc.folder}/${doc.filename}\n\`\`\`markdown\n${doc.content.trim().slice(0, 10000)}\n\`\`\``
              )
              .join("\n\n")
          : "(No external docs available.)";

      const recentHistory = Array.isArray(body.history)
        ? body.history
            .slice(-8)
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
            .join("\n")
        : "";

      const ai = getAiClient();

      const systemInstruction = `You are an expert interactive Resume Editor Assistant embedded directly inside a Resume Clone Editor.
The user will give you instructions in Persian or English to modify their active resume clone (e.g., rewrite summary, shorten/strengthen specific bullets, add/reorder skills, pull verified facts from their docs/, change headline/role/subtitle, translate a section, update project descriptions, or update contact/name info).

STRICT RULES:
1. SURGICAL PRECISION: Modify ONLY the sections the user asked to change. Keep all other sections, experience IDs ("tums", "mci", "uxcel", "ofoq"), project IDs, and untouched text completely intact in "updatedContent".
2. TRUTHFULNESS & DOCS GROUNDING: Never invent fake metrics, companies, or degrees. If the user asks to add achievements/projects/skills from their background, pull verified details from the provided docs/ Markdown files. If the user explicitly provides new text or wording they want written, apply their requested text faithfully.
3. FORMATTING: Preserve **double asterisks** around key phrases/metrics in summary, experience intros, bullets, and project descriptions so bold emphasis renders properly.
4. PROFILE/CONTACT PATCH: Only populate fields in "profilePatch" that the user explicitly asked to change; leave all unchanged fields as empty string "".
5. QUESTIONS WITHOUT EDITS: If the user is only asking a question or asking for suggestions without requesting an immediate edit, set hasChanges=false and return currentContent unchanged in updatedContent.
6. PERSIAN COMMUNICATION: Write "assistantReplyFa" (2-4 concise, helpful sentences) and "changesSummaryFa" (short bullet list of exact edits made) in natural, clear Persian.`;

      const userPrompt = `ACTIVE CLONE NAME: ${body.cloneName || "Active Resume Clone"}

CURRENT PROFILE & CONTACT:
${JSON.stringify(body.profile || {}, null, 2)}

CURRENT RESUME CONTENT (TARGET TO EDIT):
${JSON.stringify(body.currentContent, null, 2)}

VERIFIED CANDIDATE KNOWLEDGE BASE (docs/ folder):
${docsBundle}

${recentHistory ? `RECENT CHAT HISTORY:\n${recentHistory}\n\n` : ""}USER'S LATEST INSTRUCTION:
"""
${instruction}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assistantReplyFa: { type: Type.STRING },
              hasChanges: { type: Type.BOOLEAN },
              changesSummaryFa: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              profilePatch: {
                type: Type.OBJECT,
                properties: {
                  firstName: { type: Type.STRING },
                  lastName: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  website: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                },
                required: [
                  "firstName",
                  "lastName",
                  "email",
                  "phone",
                  "location",
                  "website",
                  "linkedin",
                ],
              },
              updatedContent: {
                type: Type.OBJECT,
                properties: {
                  headlineRole: { type: Type.STRING },
                  headlineSubtitle: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  skillGroups: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ["category", "items"],
                    },
                  },
                  experiences: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        role: { type: Type.STRING },
                        intro: { type: Type.STRING },
                        bullets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        tags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ["id", "role", "intro", "bullets", "tags"],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["id", "title", "description"],
                    },
                  },
                },
                required: [
                  "headlineRole",
                  "headlineSubtitle",
                  "summary",
                  "skillGroups",
                  "experiences",
                  "projects",
                ],
              },
            },
            required: [
              "assistantReplyFa",
              "hasChanges",
              "changesSummaryFa",
              "profilePatch",
              "updatedContent",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "پاسخی از سرویس هوش مصنوعی دریافت نشد." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      console.error("Error in /api/clone-chat-edit:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({
          error: "کلید GEMINI_API_KEY در تنظیمات Secrets ثبت نشده است.",
        });
        return;
      }

      if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        res.status(403).json({
          error: "کلید Gemini API نامعتبر است یا دسترسی ندارد. لطفاً بخش Settings > Secrets را بررسی کنید.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error: "سهمیه درخواست‌های API موقتاً پر شده است. لطفاً چند لحظه بعد دوباره تلاش کنید.",
        });
        return;
      }

      res.status(500).json({
        error: `خطا در پردازش درخواست چت: ${message}`,
      });
    }
  });

  // AI Cover Letter, Recruiter Cold Email & LinkedIn Outreach Generator
  app.post("/api/generate-outreach", async (req, res) => {
    try {
      const body = req.body as {
        jobDescription?: string;
        targetCompany?: string;
        targetRole?: string;
        tone?: "executive" | "startup" | "concise";
        currentContent?: MasterContentInput;
        profileName?: string;
      };

      const jobDescription = body.jobDescription?.trim() || "";
      if (jobDescription.length < 20) {
        res.status(400).json({
          error: "لطفاً توضیحات شرح شغلی (حداقل ۲۰ کاراکتر) را وارد کنید تا کاور لتر و پیام دقیق نوشته شود.",
        });
        return;
      }

      const allDocs = await loadWorkDocsFromDisk();
      const docsBundle = allDocs
        .map((d) => `### ${d.folder}/${d.filename}\n${d.content.trim().slice(0, 8000)}`)
        .join("\n\n");

      const toneDesc =
        body.tone === "startup"
          ? "Direct, builder-minded, energetic startup operator tone focusing on 0-to-1 execution and speed."
          : body.tone === "concise"
            ? "Ultra-crisp, high-signal executive brief tone (short paragraphs, zero fluff)."
            : "Confident, executive, metric-driven professional tone suitable for global tech companies.";

      const ai = getAiClient();
      const systemInstruction = `You are a Principal Career Strategist writing tailored, truthful application outreach materials for ${body.profileName || "Shayan Esfahanizadeh"}.
STRICT RULES:
1. 100% TRUTHFUL: Only cite verified achievements, companies, metrics, and products present in the candidate's active resume and docs/. Never invent numbers or companies.
2. HIGH SIGNAL: Connect 2-3 specific candidate wins (e.g., Delband 0-to-1 to MCI acquisition, Mobarakeh Steel B2B pivot +15% IRR, Wizard of Oz saving 5 sprints, Uxcel Top 10 mentor) directly to the hiring team's problems in the JD.
3. TONE: ${toneDesc}
4. OUTPUTS:
   - coverLetter: Ready-to-send English cover letter (~220-300 words, 3-4 crisp paragraphs with salutation and sign-off).
   - emailSubject: Compelling short email subject line in English.
   - recruiterEmail: Crisp cold outreach / application email in English (~110-160 words).
   - linkedinNote: Under 290 characters LinkedIn connection request note in English.
   - linkedinInMail: Short high-conversion LinkedIn DM to hiring manager/recruiter (~90-130 words).
   - strategyTipFa: 2 concise sentences in Persian explaining the angle used and best follow-up timing.`;

      const userPrompt = `TARGET COMPANY: ${body.targetCompany?.trim() || "(detect from JD)"}
TARGET ROLE: ${body.targetRole?.trim() || "(detect from JD)"}

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 12000)}
"""

ACTIVE RESUME SNAPSHOT:
${JSON.stringify(body.currentContent || {}, null, 2).slice(0, 12000)}

VERIFIED BACKGROUND DOCS:
${docsBundle.slice(0, 12000)}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedCompany: { type: Type.STRING },
              detectedRole: { type: Type.STRING },
              coverLetter: { type: Type.STRING },
              emailSubject: { type: Type.STRING },
              recruiterEmail: { type: Type.STRING },
              linkedinNote: { type: Type.STRING },
              linkedinInMail: { type: Type.STRING },
              strategyTipFa: { type: Type.STRING },
            },
            required: [
              "detectedCompany",
              "detectedRole",
              "coverLetter",
              "emailSubject",
              "recruiterEmail",
              "linkedinNote",
              "linkedinInMail",
              "strategyTipFa",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "پاسخی از سرویس هوش مصنوعی دریافت نشد." });
        return;
      }
      res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      console.error("Error in /api/generate-outreach:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({ error: "کلید GEMINI_API_KEY در تنظیمات Secrets ثبت نشده است." });
        return;
      }
      if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        res.status(403).json({ error: "کلید Gemini API نامعتبر است یا دسترسی ندارد. بخش Settings > Secrets را بررسی کنید." });
        return;
      }
      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({ error: "سهمیه درخواست‌های API موقتاً پر شده است. کمی بعد دوباره تلاش کنید." });
        return;
      }
      res.status(500).json({ error: `خطا در تولید کاور لتر و پیام ارسال: ${message}` });
    }
  });

  // AI Interview Prep Pack Generator (Technical, STAR Behavioral, Gap Probes, Questions to Ask)
  app.post("/api/interview-prep", async (req, res) => {
    try {
      const body = req.body as {
        jobDescription?: string;
        targetCompany?: string;
        targetRole?: string;
        currentContent?: MasterContentInput;
      };

      const jobDescription = body.jobDescription?.trim() || "";
      if (jobDescription.length < 20) {
        res.status(400).json({
          error: "لطفاً شرح شغلی (حداقل ۲۰ کاراکتر) را وارد کنید تا سوالات مصاحبه دقیق طراحی شوند.",
        });
        return;
      }

      const allDocs = await loadWorkDocsFromDisk();
      const docsBundle = allDocs
        .map((d) => `### ${d.folder}/${d.filename}\n${d.content.trim().slice(0, 8000)}`)
        .join("\n\n");

      const ai = getAiClient();
      const systemInstruction = `You are a Bar-Raiser Interview Coach for Senior Technical Product Managers.
Using the candidate's active resume, verified docs/, and the target Job Description, generate a practical, realistic interview preparation pack.
STRICT RULES:
1. Ground every suggested answer angle strictly in the candidate's REAL documented experiences (Delband/MCI, TUMS Innoversity, Uxcel, Ofogh Dadeha, Indora, etc.) — never fabricate stories.
2. Provide 3-4 technical/product case questions, 3-4 STAR behavioral questions, 2-3 tough/gap probe questions (honestly addressing potential gaps vs the JD), and 4 smart questions the candidate should ask the interviewer.
3. Write the actual interview question in English (as typically asked in international PM interviews) and provide clear, actionable Persian coaching notes (whyAskedFa, answerAngleFa, starStoryRef).`;

      const userPrompt = `TARGET COMPANY: ${body.targetCompany?.trim() || "(detect from JD)"}
TARGET ROLE: ${body.targetRole?.trim() || "(detect from JD)"}

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 12000)}
"""

ACTIVE RESUME SNAPSHOT:
${JSON.stringify(body.currentContent || {}, null, 2).slice(0, 12000)}

VERIFIED BACKGROUND DOCS:
${docsBundle.slice(0, 12000)}`;

      const questionSchema = {
        type: Type.OBJECT,
        properties: {
          questionEn: { type: Type.STRING },
          whyAskedFa: { type: Type.STRING },
          answerAngleFa: { type: Type.STRING },
          verifiedStoryRef: { type: Type.STRING },
        },
        required: ["questionEn", "whyAskedFa", "answerAngleFa", "verifiedStoryRef"],
      };

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedCompany: { type: Type.STRING },
              detectedRole: { type: Type.STRING },
              interviewFocusSummaryFa: { type: Type.STRING },
              technicalQuestions: { type: Type.ARRAY, items: questionSchema },
              behavioralQuestions: { type: Type.ARRAY, items: questionSchema },
              toughGapQuestions: { type: Type.ARRAY, items: questionSchema },
              questionsToAskInterviewer: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionEn: { type: Type.STRING },
                    purposeFa: { type: Type.STRING },
                  },
                  required: ["questionEn", "purposeFa"],
                },
              },
            },
            required: [
              "detectedCompany",
              "detectedRole",
              "interviewFocusSummaryFa",
              "technicalQuestions",
              "behavioralQuestions",
              "toughGapQuestions",
              "questionsToAskInterviewer",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "پاسخی از سرویس هوش مصنوعی دریافت نشد." });
        return;
      }
      res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      console.error("Error in /api/interview-prep:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({ error: "کلید GEMINI_API_KEY در تنظیمات Secrets ثبت نشده است." });
        return;
      }
      if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        res.status(403).json({ error: "کلید Gemini API نامعتبر است یا دسترسی ندارد. بخش Settings > Secrets را بررسی کنید." });
        return;
      }
      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({ error: "سهمیه درخواست‌های API موقتاً پر شده است. کمی بعد دوباره تلاش کنید." });
        return;
      }
      res.status(500).json({ error: `خطا در تولید راهنمای مصاحبه: ${message}` });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
