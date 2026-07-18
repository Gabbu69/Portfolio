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
  | { kind: "image"; src: string; alt: string; fit?: "cover" | "contain" }
  | { kind: "encodex"; alt: string };

export type Project = {
  title: string;
  eyebrow: string;
  category: Exclude<ProjectCategory, "All">;
  featured: boolean;
  summary: string;
  note?: string;
  stack: readonly string[];
  repo: string;
  live?: string;
  visual: ProjectVisual;
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
    role: "Full-stack developer",
    email: "gabriellimjuco@gmail.com",
    location: "Kabacan, Cotabato, Philippines",
    availability: "Open to full-stack opportunities",
    headline: "I turn everyday problems into software people can actually use.",
    intro:
      "Hi, I’m Edgardo Gabriel Paclibar. I build web apps, desktop tools, and connected dashboards with a focus on clear workflows and practical results.",
    portrait: "/images/profile.webp",
  },
  navigation: [
    { label: "Work", href: "#work" },
    { label: "OJT", href: "#experience" },
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
    logo: "/images/usm-hospital-logo.webp",
    modules: ["YAKAP", "X-ray", "Laboratory", "Pharmacy"],
  },
  projects: [
    {
      title: "Encodex",
      eyebrow: "OJT prototype · desktop",
      category: "Healthcare",
      featured: true,
      summary:
        "A privacy-minded desktop prototype for capturing supported medical forms with a phone. Staff can review locally extracted information and copy only the fields they approve into an existing encoding workflow.",
      note: "Built around review-first capture; no real patient records are displayed.",
      stack: ["React", "TypeScript", "Electron", "OCR"],
      repo: "https://github.com/Gabbu69/Encodex",
      visual: {
        kind: "encodex",
        alt: "Fabricated Encodex review workflow using demo fields",
      },
    },
    {
      title: "USM HealthSync",
      eyebrow: "OJT prototype · full stack",
      category: "Healthcare",
      featured: true,
      summary:
        "A full-stack demo for annual PhilHealth FPA reminders, with role-based access, consent and opt-out controls, message previews, and sending guardrails.",
      note: "Uses synthetic client data and simulated SMS rather than a live hospital deployment.",
      stack: ["React", "TypeScript", "Python", "FastAPI"],
      repo: "https://github.com/Gabbu69/USMHealthSync",
      visual: {
        kind: "image",
        src: "/images/usm-hospital-logo.webp",
        alt: "USM Hospital mark used for the HealthSync prototype",
        fit: "contain",
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
      stack: ["Next.js", "TypeScript", "Python", "OCR"],
      repo: "https://github.com/Gabbu69/HalalScan",
      live: "https://halal-scan-seven.vercel.app",
      visual: {
        kind: "image",
        src: "/images/halalscan-knowledge.webp",
        alt: "HalalScan knowledge interface with demo content",
        fit: "cover",
      },
    },
    {
      title: "SiloGuard",
      eyebrow: "IoT research · dashboard",
      category: "Research",
      featured: false,
      summary:
        "An IoT research prototype for monitoring rice-storage conditions through ESP32 sensors and Supabase, with live readings, history, risk levels, alerts, and actuator controls.",
      stack: ["ESP32", "Supabase", "TypeScript", "C++"],
      repo: "https://github.com/Gabbu69/SiloGuard",
      live: "https://silo-guard.vercel.app",
      visual: {
        kind: "image",
        src: "/images/siloguard-logo.webp",
        alt: "SiloGuard rice storage monitoring logo",
        fit: "contain",
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
      },
    },
  ] satisfies readonly Project[],
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
      "I enjoy working across the whole stack: shaping the interface, connecting the API and data, then testing the details that make a tool dependable. My projects cover healthcare workflows, agriculture, document capture, and IoT.",
    closing:
      "I’m looking for a full-stack role where I can keep learning, contribute honestly, and build useful things with a team.",
    principles: [
      { number: "01", title: "Make it understandable", text: "Clear screens, plain language, and visible system feedback." },
      { number: "02", title: "Respect the context", text: "Prototype honestly and protect the people behind the data." },
      { number: "03", title: "Ship the useful part", text: "Start from the real workflow, then improve it one detail at a time." },
    ],
  },
  contact: {
    eyebrow: "Have a useful problem?",
    title: "Let’s build something that earns its place.",
    body: "I’m open to full-stack opportunities, collaborations, and conversations about practical software.",
  },
} as const;
