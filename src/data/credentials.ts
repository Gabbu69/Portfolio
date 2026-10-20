/** Add a record and its preview/original files to extend the collection. */
export type Credential = {
  id: string;
  title: string;
  issuer: string;
  kind: "Recognition" | "Course completion" | "Workshop completion" | "Appreciation" | "Participation";
  date: string;
  dateLabel: string;
  description: string;
  image: string;
  imageAlt: string;
  original: string;
  format: "PDF" | "JPG" | "PNG";
  featured?: boolean;
  distinction?: { value: string; suffix: string; label: string };
};

export const credentials: readonly Credential[] = [
  {
    id: "python-programming-2026",
    title: "Python Programming — 2nd Place",
    issuer: "Philippine Society of Information Technology Students · USM",
    kind: "Recognition",
    date: "2026-02-21",
    dateLabel: "21 Feb 2026",
    description: "Recognized for attaining 2nd place in Programming: Python during PSITS Day 2026, themed “PaunahAI: Game On!” The competition was held on 20 February 2026 at the University of Southern Mindanao.",
    image: "/certificates/python-programming-second-place-2026.webp",
    imageAlt: "Photograph of the PSITS Day 2026 certificate recognizing 2nd place in Programming: Python.",
    original: "/certificates/originals/python-programming-second-place-2026.jpg",
    format: "JPG",
    featured: true,
    distinction: { value: "2", suffix: "nd", label: "place" },
  },
  {
    id: "cyber-threat-management-2026",
    title: "Cyber Threat Management",
    issuer: "Cisco Networking Academy · University of Southern Mindanao",
    kind: "Course completion",
    date: "2026-07-01",
    dateLabel: "01 Jul 2026",
    description: "Completed Cyber Threat Management, offered by the University of Southern Mindanao through the Cisco Networking Academy program.",
    image: "/certificates/cyber-threat-management-2026.webp",
    imageAlt: "Cisco Networking Academy course completion certificate awarded to Edgardo Gabriel Paclibar for Cyber Threat Management.",
    original: "/certificates/originals/cyber-threat-management-2026.pdf",
    format: "PDF",
  },
  {
    id: "student-innovators-roadmap-2026",
    title: "Turning Ideas into Opportunities",
    issuer: "RAISE Project 2: Regional Agribusiness Hub · USM",
    kind: "Workshop completion",
    date: "2026-01-21",
    dateLabel: "21 Jan 2026",
    description: "Completed the seminar-workshop “Turning Ideas into Opportunities: The Student Innovator’s Roadmap,” conducted on 20–21 January 2026 at CASS-AVR, USM.",
    image: "/certificates/student-innovators-roadmap-2026.webp",
    imageAlt: "Photograph of Edgardo Gabriel L. Paclibar’s certificate of completion for The Student Innovator’s Roadmap seminar-workshop.",
    original: "/certificates/originals/student-innovators-roadmap-2026.jpg",
    format: "JPG",
  },
  {
    id: "aws-student-community-day-2025",
    title: "AWS Student Community Day 2025",
    issuer: "AWS Cloud Club – UP Mindanao",
    kind: "Appreciation",
    date: "2025-12-01",
    dateLabel: "01 Dec 2025",
    description: "Received a certificate of appreciation for being part of AWS Student Community Day, held on 29 November 2025 at Sta. Lucia Mall Convention Center, Davao City.",
    image: "/certificates/aws-student-community-day-2025.webp",
    imageAlt: "Certificate of appreciation presented to Edgardo Gabriel Paclibar for AWS Student Community Day 2025.",
    original: "/certificates/originals/aws-student-community-day-2025.png",
    format: "PNG",
  },
  {
    id: "usmart-tbi-seminar-2025",
    title: "USMart TBI Seminar Workshop",
    issuer: "USMart Technology Business Incubator · USM",
    kind: "Participation",
    date: "2025-02-12",
    dateLabel: "12 Feb 2025",
    description: "Participated in a seminar workshop covering “DICT’s Support for the Startup Ecosystem” and “AI Frontier: Generative AI Insights and Practices” at the University of Southern Mindanao.",
    image: "/certificates/usmart-tbi-seminar-2025.webp",
    imageAlt: "Photograph of a USMart TBI certificate of participation for a seminar workshop on startup support and generative AI.",
    original: "/certificates/originals/usmart-tbi-seminar-2025.jpg",
    format: "JPG",
  },
];
