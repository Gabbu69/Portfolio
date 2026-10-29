/* eslint-disable @next/next/no-img-element -- ImageResponse renders native image elements. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { portfolio } from "@/data/portfolio";
import { siteUrl } from "@/lib/site-url";

export const alt = `${portfolio.identity.fullName} — ${portfolio.identity.role} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Bundle the fonts and portrait locally so sharing never depends on font/CDN requests.
// https://nextjs.org/docs/app/api-reference/functions/image-response#custom-fonts
const [displayFont, bodyFont, portrait] = await Promise.all([
  readFile(join(process.cwd(), "public/fonts/BebasNeue-Regular.ttf")),
  readFile(join(process.cwd(), "public/fonts/Questrial-Regular.ttf")),
  readFile(join(process.cwd(), "public/images/profile-social.jpg")),
]);
const grid = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="none" stroke="#8a8d80" stroke-width="0.7"/></pattern></defs><rect width="1200" height="630" fill="url(#g)"/></svg>').toString("base64")}`;

export default function SocialImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f0e7", color: "#252720", fontFamily: "Questrial", position: "relative" }}>
      <img src={grid} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0, opacity: 0.19 }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 40, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "#b83c2b", color: "#fdfaf3", fontFamily: "Bebas", fontSize: 24, transform: "rotate(-3deg)" }}>EGP</div>
          <span style={{ marginLeft: 14, fontSize: 21 }}>{portfolio.identity.shortName}</span>
        </div>
        <span style={{ fontSize: 15, letterSpacing: 2, color: "#62665a" }}>PORTFOLIO / SELECTED WORKS</span>
      </div>
      <div style={{ position: "absolute", left: 56, top: 132, display: "flex", flexDirection: "column", width: 630 }}>
        <span style={{ fontFamily: "Bebas", fontSize: 112, lineHeight: 0.95 }}>GABRIEL</span>
        <div style={{ display: "flex", fontFamily: "Bebas", fontSize: 124, lineHeight: 0.95, color: "#b83c2b" }}>PACLIBAR<span style={{ color: "#252720" }}>.</span></div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
          <div style={{ width: 30, height: 2, background: "#b83c2b", marginRight: 14 }} />
          <span style={{ fontSize: 19, letterSpacing: 1.5 }}>{portfolio.identity.role.toUpperCase()}</span>
        </div>
        <span style={{ fontSize: 28, lineHeight: 1.3, marginTop: 24, maxWidth: 510, color: "#494b43" }}>{portfolio.identity.headline}</span>
      </div>
      <div style={{ position: "absolute", left: 754, top: 126, width: 390, height: 390, borderRadius: "50%", background: "#b83c2b" }} />
      <div style={{ position: "absolute", left: 768, top: 140, width: 362, height: 362, borderRadius: "50%", border: "1px solid #f4f0e740" }} />
      <div style={{ position: "absolute", left: 794, top: 142, width: 302, display: "flex", flexDirection: "column", padding: "10px 10px 0", border: "1px solid #b2b1a4", background: "#fdfaf3", transform: "rotate(-3deg)", boxShadow: "8px 14px 25px #25272024" }}>
        <img src={`data:image/jpeg;base64,${portrait.toString("base64")}`} width={280} height={316} alt="" style={{ objectFit: "cover" }} />
        <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", fontSize: 13, color: "#62665a" }}>
          <span>{portfolio.identity.shortName}</span><span>Developer</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 34, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #b2b1a4", paddingTop: 17 }}>
        <span style={{ fontSize: 20 }}>{new URL(siteUrl).hostname}</span>
        <span style={{ fontSize: 16, letterSpacing: 1, color: "#62665a" }}>THINK. BUILD. REFINE.</span>
      </div>
    </div>,
    { ...size, fonts: [
      { name: "Bebas", data: displayFont, weight: 400, style: "normal" },
      { name: "Questrial", data: bodyFont, weight: 400, style: "normal" },
    ] },
  );
}
