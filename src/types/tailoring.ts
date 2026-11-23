export type TailoringIntensity = "balanced" | "targeted" | "concise";

export interface TailoredSkillGroup {
  category: string;
  items: string[];
}

export interface TailoredExperienceItem {
  id: string;
  role: string;
  intro: string;
  bullets: string[];
  tags: string[];
}

export interface TailoredProjectItem {
  id: string;
  title: string;
  description: string;
}

export interface TailoredResumeContent {
  headlineRole: string;
  headlineSubtitle: string;
  summary: string;
  skillGroups: TailoredSkillGroup[];
  experiences: TailoredExperienceItem[];
  projects: TailoredProjectItem[];
}

export interface DocFileItem {
  folder: string;
  filename: string;
  content: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface AtsScoreBreakdown {
  keywordMatch: number;
  experienceRelevance: number;
  impactAndMetrics: number;
  atsStructureReadability: number;
}

export interface AtsMissingKeyword {
  keyword: string;
  importance: "high" | "medium";
  inDocs: boolean;
  whereToAddFa: string;
}

export interface AtsSuggestedAddition {
  id: string;
  category: "skill" | "bullet" | "project" | "summary";
  titleFa: string;
  reasonFa: string;
  targetSectionId?: string;
  englishContent: string;
  verifiedFromDocs: boolean;
}

export interface AtsOptimizationItem {
  priority: "high" | "medium" | "low";
  actionFa: string;
  expectedImpactFa: string;
}

export interface AtsAnalysisResult {
  overallScore: number;
  projectedScoreAfterOptimization: number;
  scoreBreakdown: AtsScoreBreakdown;
  detectedCompany: string;
  detectedRole: string;
  executiveVerdictFa: string;
  matchedKeywords: string[];
  missingKeywords: AtsMissingKeyword[];
  suggestedAdditions: AtsSuggestedAddition[];
  optimizationChecklistFa: AtsOptimizationItem[];
  docsUsed: string[];
  analyzedAt: number;
}

export interface TailoredDraft {
  id: string;
  createdAt: number;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  intensity: TailoringIntensity;
  matchedKeywords: string[];
  missingOrGapKeywords: string[];
  tailoringRationale: string;
  docsUsed?: string[];
  atsScoreBefore?: number;
  atsScoreAfter?: number;
  content: TailoredResumeContent;
}

export const MASTER_RESUME_CONTENT: TailoredResumeContent = {
  headlineRole: "Technical Product Manager",
  headlineSubtitle: "Ex-Frontend Engineer | Product Discovery & Dev Handoff",
  summary:
    'Technical Product Manager specializing in **Product Discovery & Dev Handoff** with a solid software engineering foundation in modern frontend architecture. Led the **Delband** Medicine 3.0 digital health platform (wearables & AI ecosystem) from 0-to-1 startup to an accredited **Knowledge-Based Enterprise**, securing **two institutional funding rounds**, **Presidential Innovation Fund** backing, and strategic acquisition by **Hamrahe Aval (MCI)**. Expert in bridging engineering squads, clinical advisors, and C-suite stakeholders using **Jobs-to-be-Done (JTBD)**, **Root Cause Analysis**, and metric-driven execution to scale enterprise B2B offerings (e.g., **Mobarakeh Steel Group**).',
  skillGroups: [
    {
      category: "Product Strategy",
      items: [
        "Product Discovery",
        "AI Rapid Prototyping",
        "Startup Building",
        "Product Building",
        "Roadmap Planning",
        "OKRs",
        "PRD Writing",
        "Agile/Scrum",
        "User Research",
        "Jobs-to-be-Done (JTBD)",
        "Lean Validation (Wizard of Oz)",
        "GTM Strategy",
        "Prioritization",
        "Growth Hacking",
        "Stakeholder Management",
      ],
    },
    {
      category: "Technical Architecture",
      items: [
        "Custom AI Agent & Skills",
        "TypeScript",
        "React",
        "Angular",
        "RESTful APIs",
        "SQL",
        "Markdown Specs",
        "Prompt Engineering",
        "JavaScript",
        "Tailwind CSS",
        "Bootstrap",
        "CI/CD",
        "RxJS",
        "Service Workers",
        "Unit Testing",
      ],
    },
    {
      category: "Analytics & Business",
      items: [
        "Conversion Funnel Optimization",
        "Customer Acquisition Cost (CAC) Reduction",
        "Internal Rate of Return (IRR) Modeling",
        "A/B Testing",
        "Google Analytics 4",
        "Microsoft Clarity",
      ],
    },
    {
      category: "Tools & Platforms",
      items: [
        "Jira",
        "Figma",
        "Notion",
        "Azure DevOps",
        "Git",
        "CI/CD",
        "Swagger",
        "GitLab",
        "Postman",
      ],
    },
  ],
  experiences: [
    {
      id: "tums",
      role: "Technology & Product Advisor | Mentor Bootcamp",
      intro:
        "Bridging clinical challenges and multidisciplinary tech solutions; mentor in **Iran's first clinical innovation bootcamp**",
      bullets: [
        "**Analytical Problem-Solving & Design Thinking —** Facilitated a **5-month clinical innovation program** applying Design Thinking and divergent/convergent thinking frameworks; trained clinical teams in **structured problem-solving**, stakeholder persuasion, and defending their proposals.",
        "**Eldercare Team Mentorship & Execution —** Guided the eldercare team end-to-end from **team formation to product implementation** and **fundraising readiness**.",
      ],
      tags: ["Design Thinking", "JTBD", "Prompt Engineering", "Vibe Coding", "Health-Tech", "Fundraising"],
    },
    {
      id: "mci",
      role: "Technical Product Manager",
      intro:
        "Led the delivery of the **first native Med 3.0 digital health** service in Iran by aligning business strategy, user value, and economic impact, and orchestrating cross-functional product, engineering, and stakeholder teams.",
      bullets: [
        "**B2B Enterprise Pivot —** Led the strategic pivot into corporate wellness by launching an **enterprise digital health dashboard**; opened a new **B2B GTM channel** and secured enterprise accounts including **Mobarakeh Steel** (modeled to lift business-plan IRR by **15%**).",
        "**Lean Discovery & Prototyping —** Built and shipped a standalone **Wizard of Oz** prototype directly to target users without engineering overhead; killed a low-ROI workout feature using pilot validation data, saving **5 sprints** and reducing GTM risk.",
        '**Delivery & Performance Systems —** Eliminated key-person dependency by standardizing workflows, redesigning OKRs, and building a team/individual performance-tracking panel aligned with product outcomes, accelerating sprint delivery **20% ahead of estimates** with zero added headcount.',
        "**Freemium Funnel, CLTV & CAC Optimization —** Architected a personalized, **sensor-less freemium funnel** tailored to distinct user segments and personas; accelerated user acquisition, improved **activation and free-to-hardware conversion**, maximized **CLTV**, and lowered **CAC** by guiding free users organically toward hardware purchase and paid subscriptions.",
        "**Segmentation, Use-Case Expansion & Organic Growth —** Expanded daily usability and impact by reframing the same user beyond basic **self-care** into **Health Companion** and **organizational wellness** scenarios; separated buyer and end-user personas to cut low-value cohorts, while building **UGC sharing mechanisms** and **peer-to-peer competitive challenges** to drive organic referrals and **brand awareness**.",
        "**Discovery-Driven Product Spin-offs —** Identified two distinct market needs during product discovery; prevented core-product feature bloat by securing management approval to spin them off into two independent, persona-specific products (**Rokhnama** and **BioPad**), then built both end-to-end with **AI as a Product Builder** through to active user acquisition and fundraising.",
      ],
      tags: ["React", "Product Strategy", "Product Discovery", "GTM", "OKR", "Agile/Scrum", "Prototyping"],
    },
    {
      id: "uxcel",
      role: "Product Management Mentor",
      intro:
        "Member of the Uxcel mentoring team — ranked among the **top 10 product management mentors** on an interactive learning platform serving **500,000+ professionals in 150+ countries** (including Microsoft, IBM, Samsung, and Dropbox).",
      bullets: [
        "**Mentoring & Professional Development —** Coached product management professionals worldwide through regular reviews of **170 real projects** and structured feedback, focused on developing decision-making and execution skills.",
        "**Content Team & Mentor Network Coordination —** Coordinated with Uxcel's content team and international mentor network to design and publish specialized training, ensuring quality consistency across a distributed team.",
      ],
      tags: ["Product Leadership", "Mentorship", "UX Strategy", "Product Team Upskilling", "Coaching"],
    },
    {
      id: "ofoq",
      role: "Frontend Developer",
      intro:
        "Front-end developer with strong product mindset, collaborating closely with **product, SEO, and marketing teams** to deliver high-performance, scalable web experiences while developing stakeholder empathy.",
      bullets: [
        "**Website Update & Redesign —** Rebuilt PLP and PDP pages using **Angular 17** with **SSR** and implemented **Bootstrap + Tailwind CSS** for a scalable UI, achieving a **98+ mobile Lighthouse score** and a **100 Technical SEO score**.",
        "**Venus Project —** Built MVPs for employee check-in/out, leave management, and internal dashboards using **Angular 14**; owned the end-to-end redesign of the cross-platform geolocation flow, reducing failed location check-in rates by **20%**.",
        "**HR Services & Job Board Panel —** Developed and deployed a standalone HR subdomain featuring job listings, custom applicant pipeline tracking, and internal HR evaluation modules, cutting employee performance evaluation time by **60%**.",
        "**Marketing Dashboard —** Delivered real-time KPI, SEO, and behavior dashboards using **Google Analytics, Clarity, and Looker Studio**, enabling marketing channel screening and the identification and removal of **funnel friction points**.",
      ],
      tags: ["Angular", "TypeScript", "RxJs", "Sass", "Angular Material", "Bootstrap", "UI/UX", "OOP"],
    },
  ],
  projects: [
    {
      id: "rokhnama",
      title: "Rokhnama — Founder & Product Builder",
      description:
        "Built a lightweight **digital storefront & web catalog engine** replacing static PDFs with mobile-first interactive showcases, including a live portal for **K. N. Toosi University of Technology (International Student Affairs)**.",
    },
    {
      id: "biopad",
      title: "BioPad — Founder & Product Builder",
      description:
        "Architected an independent **multi-wearable bodybuilding & digital health product** (Beta) converting raw biometric telemetry into actionable workout and recovery insights, featuring **3D interactive mascots** and AI-assisted feedback loops.",
    },
    {
      id: "mini-app-bot",
      title: "Mini-App & Messaging Bot Development",
      description:
        "Launched a native mini-app and bot across **three domestic messaging platforms** (Telegram, Bale, Rubika) with an **AI reporting & coaching assistant** and UGC sharing mechanisms; boosted brand awareness, drove organic acquisition of non-hardware users, and **lowered CAC**.",
    },
    {
      id: "design-system-delband",
      title: "Design System & Delband App Redesign",
      description:
        "Built Delband's **design system** and redesigned the mobile app with **Uxcel and custom AI agents** — saving **three months** of the product roadmap and cutting design costs by **60%**.",
    },
    {
      id: "indora",
      title: "Indora — Location Intelligence",
      description:
        "Shipped location-intelligence platform driving data decisions. Authored PRDs, mapped user journeys, and executed initial GTM strategies to operationalize raw location data.",
    },
    {
      id: "stakeholder-portal",
      title: "Stakeholder Portal",
      description:
        "Developed web management dashboard integrating **Gantt scheduling, task boards, and OKR tracking**, centralizing progress to provide transparency for leadership.",
    },
    {
      id: "eldercare",
      title: "Eldercare Coordination Program",
      description:
        'Led interdisciplinary clinical team through agile discovery. Defined "trusted caregiver" criteria and capped scope to a live digital pilot, prioritizing readmission reduction.',
    },
    {
      id: "mentorship-platform",
      title: "Mentorship Services Platform",
      description:
        "Directed end-to-end product discovery for a mentorship platform. Defined persona-driven workflows and prioritized high-value modules (session management, messaging) through final release.",
    },
  ],
};
