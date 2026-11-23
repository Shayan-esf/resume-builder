export interface ProfileData {
  role: string;
  firstName: string;
  lastName: string;
  subtitle: string;
  about: string;
  quote?: string;
}

export interface ContactData {
  email: string;
  phone: string;
  linkedin: {
    handle: string;
    url: string;
  };
  uxcel: {
    handle: string;
    url: string;
  };
  location: string;
  website: {
    handle: string;
    url: string;
  };
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyFa?: string;
  period: string;
  location: string;
  intro?: string;
  bullets: string[];
  tags: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  metric?: string;
  url?: string;
}

export interface ResumeData {
  profile: ProfileData;
  contact: ContactData;
  skills: string[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  profile: {
    role: "Product Manager",
    firstName: "Shayan",
    lastName: "Esfahanizadeh",
    subtitle: "Specialized in Discovery & Dev Handoff | Ex-Frontend",
    about: `As a Product Manager with a front-end engineering background, I specialize in end-to-end AI-driven products. Utilizing Product Discovery, Root Cause Analysis, and the JTBD framework, I translate complex problems into scalable solutions. I led the Delband digital health platform (Medicine 3.0 wearable ecosystem) from an independent startup to a recognized "Knowledge-Based" company, securing two funding rounds and a strategic acquisition by MCI. I scaled B2B health services to major enterprises including Mobarakeh Steel Group, secured Presidential Innovation Fund backing, and won the top award at the 6th International Digital Health Congress.`,
    quote: "“The best way to predict the future is to create it.” - Peter Drucker",
  },
  contact: {
    email: "esfahanizadeh81@gmail.com",
    phone: "+98 933 300 7274",
    linkedin: {
      handle: "@shayan-esf",
      url: "https://www.linkedin.com/in/shayan-esf/",
    },
    uxcel: {
      handle: "shayanesf",
      url: "https://app.uxcel.com/ux/shayanesf",
    },
    location: "Tehran, Iran",
    website: {
      handle: "esfahanizadeh.vercel.app",
      url: "https://esfahanizadeh.vercel.app/",
    },
  },
  skills: [
    "Product Strategy",
    "Product Discovery",
    "Root Cause Analysis",
    "Jobs-to-be-Done (JTBD)",
    "PRD & Dev Handoff",
    "AI & Prompt Engineering",
    "Vibe Coding",
    "React & TypeScript",
    "User Research",
    "Agile & Scrum",
  ],
  experiences: [
    {
      id: "ofoq-dade",
      role: "Product Facilitator & Startup Mentor",
      company: "Ofoq Dade",
      companyFa: "افق داده",
      period: "Jan 2024 - Present",
      location: "Tehran, Iran",
      intro: "Bridging clinical challenges and multidisciplinary tech solutions; mentor in Iran's first clinical innovation bootcamp",
      bullets: [
        "Analytical Problem-Solving & Design Thinking — Facilitated a 5-month clinical innovation program applying Design Thinking and divergent/convergent thinking frameworks; trained clinical teams in structured problem-solving, stakeholder persuasion, and defending their proposals.",
        "Eldercare Team Mentorship & Execution — Guided the eldercare team end-to-end from team formation to product implementation and fundraising readiness.",
      ],
      tags: ["Mentorship", "Innovation", "JTBD", "Rapid Prototyping"],
    },
    {
      id: "delband",
      role: "Technical Product Manager",
      company: "Hamrahe Aval (MCI) — Delband",
      companyFa: "همراه اول — دلبند",
      period: "Apr 2025 - Present",
      location: "Tehran, Iran",
      intro: "Led the delivery of the first native Med 3.0 digital health service in Iran by aligning business strategy, user value, and economic impact, and orchestrating cross-functional product, engineering, and stakeholder teams.",
      bullets: [
        "B2B Enterprise Pivot — Led the strategic pivot into corporate wellness by launching an enterprise digital health dashboard; opened a new B2B GTM channel and secured enterprise accounts including Mobarakeh Steel (modeled to lift business-plan IRR by 15%).",
        "Lean Discovery & Prototyping — Built and shipped a standalone Wizard of Oz prototype directly to target users without engineering overhead; killed a low-ROI workout feature using pilot validation data, saving 5 sprints and reducing GTM risk.",
        "Delivery & Performance Systems — Eliminated key-person dependency by standardizing workflows, redesigning OKRs, and building a team/individual performance-tracking panel aligned with product outcomes, accelerating sprint delivery 20% ahead of estimates with zero added headcount.",
        "Freemium Funnel, CLTV & CAC Optimization — Architected a personalized, sensor-less freemium funnel tailored to distinct user segments and personas; accelerated user acquisition, improved activation and free-to-hardware conversion, maximized CLTV, and lowered CAC by guiding free users organically toward hardware purchase and paid subscriptions.",
        "Segmentation, Use-Case Expansion & Organic Growth — Expanded daily usability and impact by reframing the same user beyond basic self-care into Health Companion and organizational wellness scenarios; separated buyer and end-user personas to cut low-value cohorts, while building UGC sharing mechanisms and peer-to-peer competitive challenges to drive organic referrals and brand awareness.",
        "Discovery-Driven Product Spin-offs — Identified two distinct market needs during product discovery; prevented core-product feature bloat by securing management approval to spin them off into two independent, persona-specific products (Rokhnama and BioPad), then built both end-to-end with AI as a Product Builder through to active user acquisition and fundraising.",
      ],
      tags: ["Product Strategy", "Digital Health", "B2B Dashboards", "M&A", "Wearables"],
    },
    {
      id: "uxcel",
      role: "Product Management Mentor",
      company: "Uxcel",
      companyFa: "یواکسل",
      period: "Sep 2022 - Present",
      location: "Remote",
      intro: "Global design & product education platform with over 300,000 active learners worldwide",
      bullets: [
        "Global Project Reviews & Coaching — Coached product management professionals worldwide through regular reviews of 170 real projects and structured feedback, focused on developing decision-making and execution skills.",
        "Content Team & Mentor Network Coordination — Coordinated with Uxcel's content team and international mentor network to design and publish specialized training, ensuring quality consistency across a distributed, multicultural team.",
      ],
      tags: ["Product Leadership", "Mentorship", "UX Strategy"],
    },
    {
      id: "saina-system",
      role: "Frontend Developer",
      company: "Ofogh Dadeha Iranian",
      companyFa: "افق داده‌ها ایرانیان",
      period: "Jun 2022 - May 2025",
      location: "Tehran, Iran",
      intro: "Front-end developer with strong product mindset, collaborating closely with product, SEO, and marketing teams to deliver high-performance, scalable web experiences",
      bullets: [
        "Website Update & Redesign — Rebuilt PLP and PDP pages using Angular 17 with SSR and implemented Bootstrap + Tailwind CSS for a scalable UI, achieving a 98+ mobile Lighthouse score and a 100 Technical SEO score.",
        "Venus Project — Built MVPs for employee check-in/out, leave management, and internal dashboards using Angular 14; owned the end-to-end redesign of the cross-platform geolocation flow, reducing failed location check-in rates by 20%.",
        "HR Services & Job Board Panel — Developed and deployed a standalone HR subdomain featuring job listings, custom applicant pipeline tracking, and internal HR evaluation modules, cutting employee performance evaluation time by 60%.",
        "Marketing Dashboard — Delivered real-time KPI, SEO, and behavior dashboards using Google Analytics, Clarity, and Looker Studio, enabling marketing channel screening and the identification and removal of funnel friction points.",
      ],
      tags: ["Angular", "TypeScript", "Frontend Engineering", "HR Tech"],
    },
  ],
  education: [
    {
      id: "kntu",
      school: "K. N. Toosi University of Technology",
      degree: "Bachelor's degree, Computer Engineering, Computer Software Engineering",
      period: "Jun 2020 - Sep 2025",
    },
  ],
  projects: [
    {
      id: "rokhnama",
      title: "Rokhnama — Founder & Product Builder",
      description:
        "Built a lightweight digital storefront & web catalog engine replacing static PDFs with mobile-first interactive showcases, including a live portal for K. N. Toosi University of Technology (International Student Affairs).",
      metric: "Interactive web catalog",
      url: "rokhnama.vercel.app",
    },
    {
      id: "biopad",
      title: "BioPad — Founder & Product Builder",
      description:
        "Architected an independent multi-wearable bodybuilding & digital health product (Beta) turning biometric telemetry into actionable workout and recovery insights with 3D interactive mascots and AI feedback loops.",
      url: "biopad.vercel.app",
    },
    {
      id: "mini-app-bot",
      title: "Mini-App & Messaging Bot Development",
      description:
        "Launched a native mini-app and bot across three domestic messaging platforms (Telegram, Bale, Rubika) with an AI reporting & coaching assistant and UGC sharing mechanisms; boosted brand awareness, drove organic acquisition of non-hardware users, and lowered CAC.",
      metric: "3 messaging platforms",
    },
    {
      id: "design-system-delband",
      title: "Design System & Delband App Redesign",
      description:
        "Built Delband's design system and redesigned the mobile app with Uxcel and custom AI agents — saving three months of the product roadmap and cutting design costs by 60%.",
      metric: "-60% design cost",
    },
    {
      id: "indora",
      title: "Indora — Location Intelligence",
      description:
        "Shipped location-intelligence platform driving data decisions. Authored PRDs, mapped user journeys, and executed initial GTM strategies.",
      url: "indoora.net",
    },
    {
      id: "stakeholder-portal",
      title: "Stakeholder Portal",
      description:
        "Developed web management dashboard integrating Gantt scheduling, task boards, and OKR tracking, centralizing progress to provide transparency for leadership.",
      url: "investor.delbandcare.com",
    },
  ],
};
