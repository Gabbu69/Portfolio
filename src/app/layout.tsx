import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
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

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const roleTitle = portfolio.identity.role.replace(/\b\w/g, (letter) =>
  letter.toUpperCase(),
);
const title = `${portfolio.identity.fullName} | ${roleTitle}`;
const description =
  `Portfolio of ${portfolio.identity.fullName}, a ${portfolio.identity.role} building practical applications for healthcare, agriculture, disaster preparedness, and community workflows.`;
const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
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
        url: "/og.png",
        width: 1744,
        height: 900,
        alt: `${portfolio.identity.fullName} — Full-stack developer portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  other: {
    "contact:email": portfolio.identity.email,
    "contact:github": portfolio.socials.github,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#efede7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
