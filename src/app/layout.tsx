import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import { portfolio } from "@/data/portfolio";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";
import "./japanese.css";

const themeScript = `(function(){var t;try{t=localStorage.getItem('gab-portfolio-theme')}catch(e){}if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='dark'?'#181917':'#f4f0e7'})()`;

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

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});

const roleTitle = portfolio.identity.role.replace(/\b\w/g, (letter) =>
  letter.toUpperCase(),
);
const title = `${portfolio.identity.fullName} | ${roleTitle}`;
const description =
  `Portfolio of ${portfolio.identity.fullName}, a ${portfolio.identity.role} building practical applications for healthcare, agriculture, disaster preparedness, and community workflows.`;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
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
    url: "/",
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
  themeColor: "#f4f0e7",
  colorScheme: "light dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
