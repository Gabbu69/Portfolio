/**
 * Portfolio content lives here on purpose.
 * Edit these values, duplicate a project/skill object, or swap an image path
 * without touching the page layout.
 */

export const projectCategories = [
  "All",
  "Healthcare",
  "Community",
  "Research",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export type ProjectVisual =
  | {
      kind: "image";
      src: string;
      alt: string;
      fit?: "cover" | "contain";
      tone?: "institution" | "product" | "agriculture";
    }
  | {
      kind: "interface";
      label: string;
      detail: string;
      tone: "signal" | "market";
    };

export type Project = {
  title: string;
  eyebrow: string;
  category: Exclude<ProjectCategory, "All">;
  featured: boolean;
  spotlight?: boolean;
  summary: string;
  note?: string;
  stack: readonly string[];
  repo: string;
  live?: string;
  visual: ProjectVisual;
};

export type ArchiveProject = {
  title: string;
  code: string;
  category: Exclude<ProjectCategory, "All">;
  summary: string;
  note?: string;
  stack: readonly string[];
  repo: string;
  live?: string;
  tone: "ruby" | "research" | "field" | "loyalty" | "local" | "hardware" | "hospitality";
};

export type SkillIcon =
  | "react"
  | "typescript"
  | "nextjs"
  | "tailwind"
  | "node"
  | "python"
  | "fastapi"
  | "laravel"
  | "php"
  | "supabase"
  | "database"
  | "git"
  | "github"
  | "vercel"
  | "arduino";

export type Skill = {
  name: string;
  icon: SkillIcon;
  color: string;
  note: string;
};

export const portfolio = {
  identity: {
    fullName: "Edgardo Gabriel Paclibar",
    shortName: "Gabriel Paclibar",
    initials: "EGP",
    role: "Aspiring Software Engineer",
    email: "gabriellimjuco@gmail.com",
    location: "Kabacan, Cotabato, Philippines",
    headline: "Useful software, built around real work.",
    intro:
      "I’m Gabriel, an aspiring software engineer from Cotabato with hands-on experience in full-stack development. I build practical web apps, desktop tools, and connected prototypes around real workflows.",
    portrait: "/images/profile.webp",
  },
  navigation: [
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  socials: {
    github: "https://github.com/Gabbu69",
  },
  experience: {
    organization: "University of Southern Mindanao Hospital",
    shortOrganization: "USM Hospital · Kabacan",
    role: "Developer Intern",
    period: "May 18 — July 10, 2026",
    summary:
      "During my OJT, I explored and built prototypes around YAKAP-related encoding, X-ray, laboratory, and pharmacy workflows, with an emphasis on reducing repetitive steps and keeping information clear for staff.",
    privacyNote:
      "These were prototype and learning projects, not claims of production deployment. No patient or confidential hospital data is shown here.",
    logo: "/images/usm-hospital-logo-cutout.png",
    modules: ["YAKAP", "X-ray", "Laboratory", "Pharmacy"],
  },
  projects: [
    {
      title: "PaSiBudget",
      eyebrow: "Rice-farm planning · offline prototype",
      category: "Community",
      featured: true,
      summary:
        "A bilingual offline rice-farm planner connecting budget assumptions, recorded expenses, harvest, sales, and break-even scenarios, with reports and validated backup/restore.",
      note: "A planning research prototype using decimal arithmetic and local browser storage. Sample values are demonstrations, not verified farm costs or market prices.",
      stack: ["React", "TypeScript", "Vite", "Dexie", "decimal.js", "PWA"],
      repo: "https://github.com/Gabbu69/PaSiBudget",
      live: "https://pasibudget.vercel.app",
      visual: {
        kind: "interface",
        label: "PaSiBudget",
        detail: "Offline · bilingual · break-even",
        tone: "market",
      },
    },
    {
      title: "USM Hospital System",
      eyebrow: "Hospital operations · full stack",
      category: "Healthcare",
      featured: true,
      spotlight: true,
      summary:
        "A collaborative hospital operations system connecting patient records, laboratory and radiology transactions, pharmacy inventory and dispensing, Konsulta settings, reports, and staff-specific dashboards.",
      note: "Built around distinct workflows for administrators, doctors, nurses, pharmacists, laboratory staff, radiology staff, and receptionists.",
      stack: ["Laravel", "PHP", "Vue", "Tailwind"],
      repo: "https://github.com/rzgonzaga/USMHospital",
      visual: {
        kind: "image",
        src: "/images/usm-hospital-logo-cutout.png",
        alt: "USM Hospital logo used in the hospital system case study",
        fit: "contain",
        tone: "institution",
      },
    },
    {
      title: "HalalScan",
      eyebrow: "Label screening · web app",
      category: "Community",
      featured: true,
      summary:
        "A prototype label-screening tool that combines OCR, ingredient classification, and rule-based checks to explain its findings.",
      note: "Supports informed checking; it does not replace an authorized halal certifying body.",
      stack: ["React", "TypeScript", "Flask", "OCR"],
      repo: "https://github.com/Gabbu69/HalalScan",
      live: "https://halal-scan-seven.vercel.app",
      visual: {
        kind: "image",
        src: "/images/halalscan-knowledge.webp",
        alt: "HalalScan knowledge interface with demo content",
        fit: "cover",
        tone: "product",
      },
    },
    {
      title: "LIGTAS-AI",
      eyebrow: "Thesis research · offline AI",
      category: "Research",
      featured: false,
      summary:
        "An offline English-Filipino-Taglish disaster-preparedness research system that retrieves grounded guidance, shows traceable citations, and abstains when its local corpus cannot support an answer.",
      note: "Educational preparedness prototype only—not a live warning service, emergency router, predictor, or medical adviser.",
      stack: ["Python", "FastAPI", "SQLite FTS5", "BM25"],
      repo: "https://github.com/Gabbu69/Ligtas_AI",
      visual: {
        kind: "interface",
        label: "LIGTAS—AI",
        detail: "Offline · cited · bounded",
        tone: "signal",
      },
    },
    {
      title: "AgriPresyo",
      eyebrow: "Market intelligence · bilingual",
      category: "Community",
      featured: false,
      summary:
        "A bilingual Philippine agricultural market-intelligence platform with commodity price tracking, vendor comparison, interactive history charts, and practical budget-planning tools.",
      note: "Uses a simulated real-time trading experience to make agricultural price information easier to compare and understand.",
      stack: ["React", "TypeScript", "Tailwind", "Recharts"],
      repo: "https://github.com/Gabbu69/AgriPresyo",
      visual: {
        kind: "interface",
        label: "AgriPresyo",
        detail: "Philippine market pulse",
        tone: "market",
      },
    },
    {
      title: "RMAIS",
      eyebrow: "Thesis prototype · mobile first",
      category: "Community",
      featured: false,
      summary:
        "A Laravel thesis prototype for monitoring rice and palay prices in M’lang, with traceable records, buyer and net-income comparisons, and explainable rule-based guidance.",
      note: "The prototype does not claim to forecast future prices.",
      stack: ["Laravel", "PHP", "Blade", "MySQL"],
      repo: "https://github.com/Gabbu69/RMAIS",
      visual: {
        kind: "image",
        src: "/images/rmais-visual.svg",
        alt: "RMAIS rice market information illustration",
        fit: "contain",
        tone: "agriculture",
      },
    },
  ] satisfies readonly Project[],
  archiveProjects: [
    {
      title: "AniTala",
      code: "AT",
      category: "Research",
      summary:
        "A Java application connecting harvest intake, produce sales, FEFO inventory, waste, and audit-safe sale voiding to repeatable warehouse ETL, Apriori rules, and K-means buyer segmentation.",
      note: "A local classroom prototype with synthetic teaching data; its mining patterns are not findings about real agricultural behavior.",
      stack: ["Java", "Javalin", "SQLite", "JavaScript", "JDBC", "JUnit"],
      repo: "https://github.com/Gabbu69/AniTala_v2",
      tone: "field",
    },
    {
      title: "ScopeWatch",
      code: "SW",
      category: "Research",
      summary:
        "A requirements-traceability workspace linking problems, objectives, features, tests, evidence, and change decisions, with server-side membership checks and deterministic scope-risk findings.",
      note: "A workspace prototype with private deployment access; the public source documents its authorization and audit behavior.",
      stack: ["Next.js", "TypeScript", "Cloudflare D1", "R2", "Drizzle", "Supabase Auth"],
      repo: "https://github.com/Gabbu69/ScopeWatch",
      tone: "research",
    },
    {
      title: "YAKAP Consulta",
      code: "YK",
      category: "Healthcare",
      summary:
        "A financial-monitoring prototype connecting beneficiary readiness, service costs, receivables, payments, co-payments, variances, and reports through role controls and traceable audit history.",
      note: "The demo uses fictional records. It does not submit data to PhilHealth or claim accreditation or medical-system certification.",
      stack: ["Laravel", "React", "TypeScript", "Inertia", "SQLite"],
      repo: "https://github.com/Gabbu69/YAKAP-Consulta-Financial-Monitoring-System",
      tone: "local",
    },
    {
      title: "Ruby / FLOW_RUBY",
      code: "RB",
      category: "Healthcare",
      summary:
        "An offline-first educational cycle-care prototype with pill tracking, local Dexie storage, a Capacitor mobile shell, optional single-tenant Supabase sync, and consent-controlled bring-your-own-key AI connections.",
      note: "Cloud sync needs owner-scoped authentication before public multi-user use. Cycle estimates are informational and are not contraception or medical advice.",
      stack: ["React", "TypeScript", "Capacitor", "Dexie", "Supabase"],
      repo: "https://github.com/Gabbu69/FLOW_RUBY",
      live: "https://flow-ruby-app.vercel.app/",
      tone: "ruby",
    },
    {
      title: "PACS",
      code: "PX",
      category: "Research",
      summary:
        "A localhost-only research desk for permitted thesis PDFs, evidence review, FTS5/BM25 and TF-IDF search, an auditable analytical data mart, and a validated PQL interpreter.",
      stack: ["React", "TypeScript", "Express", "SQLite", "PQL"],
      repo: "https://github.com/Gabbu69/PACS",
      tone: "research",
    },
    {
      title: "UGNAY",
      code: "UG",
      category: "Research",
      summary:
        "A Java and Spring research-continuity platform linking problems, studies, objectives, requirements, tests, and outputs through hybrid retrieval, warehouse snapshots, traceability, and RQL.",
      note: "The source prototype is public; its documented Windows Lite v0.2 release assets are not yet published.",
      stack: ["Java 21", "Spring Boot", "React", "MySQL", "ONNX"],
      repo: "https://github.com/Gabbu69/UGNAY",
      tone: "research",
    },
    {
      title: "GABAY",
      code: "GB",
      category: "Research",
      summary:
        "A mobile-first palay-price thesis system for verified histories, comparisons across naive, moving-average, SES, and ARIMA forecasts, and explainable Sell, Wait, or Monitor guidance.",
      note: "A decision-support research prototype; it does not guarantee a future price or profit.",
      stack: ["Python", "Django", "statsmodels", "PostgreSQL", "PWA"],
      repo: "https://github.com/Gabbu69/GABAY",
      tone: "field",
    },
    {
      title: "Loyalty Scan",
      code: "LS",
      category: "Community",
      summary:
        "A staff-first loyalty system for private QR IDs, fixed visit points, reward redemption, role controls, idempotent operations, row-level security, and an append-only audit ledger.",
      stack: ["Next.js", "TypeScript", "Supabase", "QR", "Tailwind"],
      repo: "https://github.com/Gabbu69/Loyalty-scanner",
      live: "https://loyalty-scanner.vercel.app/",
      tone: "loyalty",
    },
    {
      title: "Kabacan PicklePlay",
      code: "KP",
      category: "Community",
      summary:
        "A local court-discovery and booking prototype with verified-listing gates, schedule-based availability, server-authoritative pricing, atomic double-booking protection, and owner and administrator workflows.",
      stack: ["Laravel", "PHP", "Blade", "Alpine.js", "Leaflet"],
      repo: "https://github.com/Gabbu69/Pickleball_Kabacan_court_access",
      tone: "local",
    },
    {
      title: "SiloGuard",
      code: "SG",
      category: "Community",
      summary:
        "A connected rice-storage monitoring prototype combining ESP32 telemetry with realtime temperature, humidity, air-quality, and moisture dashboards, mold-risk scoring, alerts, rollups, and actuator commands.",
      stack: ["React", "TypeScript", "Supabase", "ESP32", "Realtime"],
      repo: "https://github.com/Gabbu69/SiloGuard",
      tone: "hardware",
    },
    {
      title: "Yaelitos",
      code: "YA",
      category: "Community",
      summary:
        "A mobile-first restaurant website with a Supabase booking-request pipeline, Turnstile checks, private staff and owner tools, request-status updates, audit activity, CSV export, and customer-data anonymization.",
      note: "Customers submit requests for staff review; the workflow does not automatically confirm bookings or process online payments.",
      stack: ["HTML", "CSS", "JavaScript", "Supabase", "Turnstile"],
      repo: "https://github.com/Gabbu69/YAELITOS-",
      live: "https://yaelitos.vercel.app/",
      tone: "hospitality",
    },
  ] satisfies readonly ArchiveProject[],
  skills: [
    { name: "React", icon: "react", color: "#61dafb", note: "Interfaces and reusable systems" },
    { name: "TypeScript", icon: "typescript", color: "#4f9cf9", note: "Safer application code" },
    { name: "Next.js", icon: "nextjs", color: "#f5f5f0", note: "Full-stack React apps" },
    { name: "Tailwind", icon: "tailwind", color: "#38bdf8", note: "Fast, consistent UI work" },
    { name: "Node.js", icon: "node", color: "#75b85a", note: "APIs and tooling" },
    { name: "Python", icon: "python", color: "#f3cb4d", note: "Automation, OCR, and APIs" },
    { name: "FastAPI", icon: "fastapi", color: "#37d3ae", note: "Typed Python services" },
    { name: "Laravel", icon: "laravel", color: "#ff5b55", note: "Structured PHP applications" },
    { name: "PHP", icon: "php", color: "#8993be", note: "Server-side development" },
    { name: "Supabase", icon: "supabase", color: "#4be39c", note: "Data, auth, and realtime" },
    { name: "Databases", icon: "database", color: "#d6fa63", note: "Relational data modeling" },
    { name: "Git", icon: "git", color: "#f06a4b", note: "Everyday version control" },
    { name: "GitHub", icon: "github", color: "#f2f2ed", note: "Collaboration and shipping" },
    { name: "Vercel", icon: "vercel", color: "#f5f5f0", note: "Web deployment" },
    { name: "ESP32", icon: "arduino", color: "#35c6c9", note: "Connected prototypes" },
  ] satisfies readonly Skill[],
  about: {
    body:
      "I like following a feature from its interface through the API and database, then testing that the pieces work together. Most of my projects start with a workflow that feels slower or more confusing than it needs to be.",
    closing:
      "I’m early in my career and looking for software engineering opportunities where I can learn from a team, contribute to interfaces, APIs, databases, and testing, and keep building useful things.",
    designNote:
      "The Japanese accents reflect my interest in Japanese typography and editorial design.",
    principles: [
      { number: "01", title: "Start with the workflow", text: "Understand what someone is already doing before changing the screen." },
      { number: "02", title: "Make the state obvious", text: "Use plain language, clear feedback, and data people can verify." },
      { number: "03", title: "Be honest about the prototype", text: "Show what works, say what does not, and protect the context around the data." },
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title: "Have something",
    titleAccent: "useful in mind?",
    body: "I’m open to early-career software engineering roles, collaborations, and conversations about practical software. I’m looking for a team where I can contribute and keep learning.",
  },
} as const;
