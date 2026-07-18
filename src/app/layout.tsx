import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { portfolio } from "@/data/portfolio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roleTitle = portfolio.identity.role.replace(/\b\w/g, (letter) =>
  letter.toUpperCase(),
);
const title = `${portfolio.identity.fullName} | ${roleTitle}`;
const description =
  `Portfolio of ${portfolio.identity.fullName}, a ${portfolio.identity.role} building practical web, desktop, and IoT prototypes for healthcare, agriculture, and everyday workflows.`;
const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
const themeBootScript = `(function(){try{var s=localStorage.getItem("gab-portfolio-theme");var t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var e=document.documentElement;e.dataset.theme=t;e.style.colorScheme=t}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: {
    default: title,
    template: "%s | Edgardo Gabriel Paclibar",
  },
  description,
  applicationName: `${portfolio.identity.fullName} Portfolio`,
  authors: [
    {
      name: portfolio.identity.fullName,
      url: portfolio.socials.github,
    },
  ],
  creator: portfolio.identity.fullName,
  publisher: portfolio.identity.fullName,
  category: "technology",
  icons: {
    icon: "/icon.svg",
  },
  keywords: [
    "Edgardo Gabriel Paclibar",
    "full-stack developer",
    "React developer",
    "TypeScript developer",
    "Next.js developer",
    "Python developer",
    "Laravel developer",
    "software portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    title,
    description,
    siteName: `${portfolio.identity.fullName} Portfolio`,
    images: [
      {
        url: portfolio.identity.portrait,
        width: 460,
        height: 460,
        alt: `Portrait of ${portfolio.identity.fullName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [portfolio.identity.portrait],
  },
  other: {
    "contact:email": portfolio.identity.email,
    "contact:github": portfolio.socials.github,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#111411" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
