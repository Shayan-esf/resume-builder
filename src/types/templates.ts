import { ResumeData } from "./resume";
import { TailoredResumeContent } from "./tailoring";

export type BuiltInTemplateId = "executive-ats-2page" | "modern-figma" | "minimal-ats";
export type BaseTemplateType = BuiltInTemplateId | "custom-html";
export type TemplateId = string;

export type FontPairingId =
  | "outfit-jakarta"
  | "dm-sans"
  | "poppins-dm"
  | "space-dm"
  | "editorial-serif";

export type DensityMode = "compact" | "balanced" | "relaxed";
export type HeaderAlignMode = "center" | "left" | "split";

export interface TemplateSectionVisibility {
  summary: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  honors: boolean;
}

export interface TemplateCustomization {
  accentColor: string;
  fontPairing: FontPairingId;
  density: DensityMode;
  fontSizeScale: number; // 0.92 - 1.1
  headerAlign: HeaderAlignMode;
  topAccentBar: boolean;
  showLogos: boolean;
  showTags: boolean;
  sections: TemplateSectionVisibility;
  atsOnlyExperienceBullets?: Record<string, number[]>;
  customCss?: string;
}

export interface TemplateChangelogEntry {
  id: string;
  revision: number;
  version: string;
  titleFa: string;
  timestamp: number;
  snapshot: {
    nameFa: string;
    version: string;
    baseType: BaseTemplateType;
    customization: TemplateCustomization;
    customHtml?: string;
    contentSnapshot?: ResumeData;
    tailoredSnapshot?: TailoredResumeContent;
  };
}

export interface ResumeTemplate {
  id: TemplateId;
  baseType: BaseTemplateType;
  name: string;
  nameFa: string;
  descriptionFa: string;
  badge: string;
  pages: number;
  atsScore: string;
  recommendedFor: string;
  accentColor: string;
  previewGradient: string;
  version: string;
  isBuiltIn: boolean;
  isImported?: boolean;
  parentTemplateId?: string;
  parentTemplateName?: string;
  createdAt?: number;
  updatedAt?: number;
  customization: TemplateCustomization;
  customHtml?: string;
  contentSnapshot?: ResumeData;
  tailoredSnapshot?: TailoredResumeContent;
  changelog?: TemplateChangelogEntry[];
}

export const DEFAULT_SECTION_VISIBILITY: TemplateSectionVisibility = {
  summary: true,
  skills: true,
  experience: true,
  education: true,
  projects: true,
  certifications: true,
  honors: true,
};

export const DEFAULT_CUSTOMIZATION: TemplateCustomization = {
  accentColor: "#0284c7",
  fontPairing: "outfit-jakarta",
  density: "balanced",
  fontSizeScale: 1,
  headerAlign: "center",
  topAccentBar: false,
  showLogos: true,
  showTags: true,
  sections: { ...DEFAULT_SECTION_VISIBILITY },
  atsOnlyExperienceBullets: {},
  customCss: "",
};

export const ACCENT_PRESETS: { name: string; hex: string; gradient: string }[] = [
  { name: "Sky Blue", hex: "#0284c7", gradient: "from-sky-600 to-slate-900" },
  { name: "Delband Teal", hex: "#0d9488", gradient: "from-teal-600 to-sky-800" },
  { name: "Indigo", hex: "#4f46e5", gradient: "from-indigo-600 to-slate-900" },
  { name: "Executive Slate", hex: "#334155", gradient: "from-slate-700 to-slate-950" },
  { name: "Emerald", hex: "#059669", gradient: "from-emerald-600 to-slate-900" },
  { name: "Crimson", hex: "#be123c", gradient: "from-rose-700 to-slate-900" },
  { name: "Amber Bronze", hex: "#b45309", gradient: "from-amber-700 to-stone-900" },
];

export const FONT_PAIRING_OPTIONS: {
  id: FontPairingId;
  label: string;
  labelFa: string;
  heading: string;
  body: string;
}[] = [
  {
    id: "outfit-jakarta",
    label: "Outfit + Plus Jakarta Sans",
    labelFa: "مدرن اجرایی (Outfit)",
    heading: "'Outfit', sans-serif",
    body: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif",
  },
  {
    id: "dm-sans",
    label: "DM Sans Clean",
    labelFa: "خوانا و مینیمال (DM Sans)",
    heading: "'DM Sans', sans-serif",
    body: "'DM Sans', -apple-system, sans-serif",
  },
  {
    id: "poppins-dm",
    label: "Poppins + DM Sans",
    labelFa: "هندسی و محصولی (Poppins)",
    heading: "'Poppins', sans-serif",
    body: "'DM Sans', -apple-system, sans-serif",
  },
  {
    id: "space-dm",
    label: "Space Grotesk + DM Sans",
    labelFa: "فنی و مهندسی (Space)",
    heading: "'Space Grotesk', sans-serif",
    body: "'DM Sans', -apple-system, sans-serif",
  },
  {
    id: "editorial-serif",
    label: "Source Serif 4 + Plus Jakarta Sans",
    labelFa: "کلاسیک و آکادمیک (Serif)",
    heading: "'Source Serif 4', Georgia, 'Times New Roman', serif",
    body: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif",
  },
];

export const BASE_TYPE_LABELS: Record<BaseTemplateType, { nameFa: string; shortFa: string; pages: number }> = {
  "executive-ats-2page": {
    nameFa: "ساختار اجرایی (۲ صفحه ATS)",
    shortFa: "اجرایی ۲ صفحه",
    pages: 2,
  },
  "modern-figma": {
    nameFa: "ساختار مدرن (دیزاین‌سیستم)",
    shortFa: "مدرن UI",
    pages: 1,
  },
  "minimal-ats": {
    nameFa: "ساختار کلاسیک ATS (محدودیت تک‌صفحه)",
    shortFa: "کلاسیک ۱ صفحه ATS",
    pages: 1,
  },
  "custom-html": {
    nameFa: "قالب ایمپورتی (HTML / CSS)",
    shortFa: "HTML سفارشی",
    pages: 1,
  },
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "executive-ats-2page",
    baseType: "executive-ats-2page",
    name: "Executive (2-Page ATS)",
    nameFa: "قالب اجرایی (۲ صفحه)",
    descriptionFa: "رزومه جامع و متوازن دو صفحه‌ای با استانداردهای رسمی ATS برای موقعیت‌های ارشد و بین‌المللی",
    badge: "استاندارد رسمی",
    pages: 2,
    atsScore: "99/100",
    recommendedFor: "موقعیت‌های ارشد، بین‌المللی و مدیران محصول",
    accentColor: "#0284c7",
    previewGradient: "from-sky-600 to-slate-900",
    version: "v1.0",
    isBuiltIn: true,
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#0284c7",
      fontPairing: "outfit-jakarta",
      density: "balanced",
      headerAlign: "center",
      showLogos: true,
      showTags: true,
      sections: { ...DEFAULT_SECTION_VISIBILITY },
    },
  },
  {
    id: "modern-figma",
    baseType: "modern-figma",
    name: "Modern UI (Delband)",
    nameFa: "قالب مدرن (Delband UI)",
    descriptionFa: "طراحی برداری دیزاین‌سیستم دل‌بند با رنگ‌بندی ملایم و ساختار ماژولار",
    badge: "دیزاین‌سیستم",
    pages: 1,
    atsScore: "95/100",
    recommendedFor: "ارائه مستقیم به کارفرمایان و پورتفولیو",
    accentColor: "#00a8cc",
    previewGradient: "from-teal-600 to-sky-800",
    version: "v1.0",
    isBuiltIn: true,
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#0284c7",
      fontPairing: "outfit-jakarta",
      density: "balanced",
      headerAlign: "left",
      showLogos: true,
      showTags: true,
      sections: { ...DEFAULT_SECTION_VISIBILITY },
    },
  },
  {
    id: "minimal-ats",
    baseType: "minimal-ats",
    name: "Classic ATS (1-Page)",
    nameFa: "قالب کلاسیک ATS (۱ صفحه)",
    descriptionFa: "چیدمان کلاسیک تک‌ستونه با استاندارد ۱۰۰٪ ATS، محدودیت دقیق تک‌صفحه A4 و اتصال کامل به محتوای اصلی رزومه",
    badge: "کلاسیک تک‌صفحه",
    pages: 1,
    atsScore: "100/100",
    recommendedFor: "سیستم‌های غربالگری ATS بین‌المللی، شرکت‌های بزرگ و ارسال تک‌صفحه‌ای",
    accentColor: "#0f172a",
    previewGradient: "from-slate-800 to-slate-950",
    version: "v2.0",
    isBuiltIn: true,
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#0f172a",
      fontPairing: "editorial-serif",
      density: "compact",
      headerAlign: "center",
      showLogos: false,
      showTags: false,
      sections: { ...DEFAULT_SECTION_VISIBILITY },
    },
  },
];

export const BUILT_IN_TEMPLATES = RESUME_TEMPLATES;

export const STARTER_CUSTOM_HTML_TEMPLATE = `<style>
  .custom-cv {
    font-family: var(--resume-font-body, 'Plus Jakarta Sans', sans-serif);
    color: #1e293b;
    padding: 14mm 15mm;
    line-height: 1.5;
  }
  .custom-cv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid var(--resume-accent, #0284c7);
    padding-bottom: 12px;
    margin-bottom: 18px;
  }
  .custom-cv h1 {
    font-family: var(--resume-font-heading, 'Outfit', sans-serif);
    font-size: 24px;
    font-weight: 800;
    margin: 0;
    color: #0f172a;
  }
  .custom-cv .role {
    color: var(--resume-accent, #0284c7);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .custom-cv .contact {
    text-align: right;
    font-size: 11px;
    color: #475569;
    line-height: 1.6;
  }
  .custom-cv h2 {
    font-family: var(--resume-font-heading, 'Outfit', sans-serif);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--resume-accent, #0284c7);
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin: 16px 0 8px;
  }
  .custom-cv p {
    font-size: 11.5px;
    margin: 0 0 8px;
  }
  .custom-cv .skills-inline {
    font-size: 11px;
    color: #334155;
  }
  .custom-cv .exp-block {
    margin-bottom: 12px;
  }
  .custom-cv .exp-head {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
  }
  .custom-cv .exp-meta {
    font-size: 10.5px;
    color: #64748b;
    font-weight: 500;
  }
  .custom-cv ul {
    margin: 4px 0 0 18px;
    padding: 0;
    font-size: 11px;
    color: #334155;
  }
  .custom-cv li {
    margin-bottom: 3px;
  }
</style>

<div class="custom-cv">
  <header class="custom-cv-header">
    <div>
      <h1>{{fullName}}</h1>
      <div class="role">{{role}} · {{subtitle}}</div>
    </div>
    <div class="contact">
      <div>{{email}}</div>
      <div>{{phone}} · {{location}}</div>
      <div>{{website}} · {{linkedin}}</div>
    </div>
  </header>

  <section>
    <h2>Summary</h2>
    <p>{{summary}}</p>
  </section>

  <section>
    <h2>Core Skills</h2>
    <div class="skills-inline">{{skills}}</div>
  </section>

  <section>
    <h2>Work Experience</h2>
    {{experiences}}
  </section>

  <section>
    <h2>Education</h2>
    {{education}}
  </section>
</div>`;
