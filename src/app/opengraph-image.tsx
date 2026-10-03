import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

export const alt = `${portfolio.identity.fullName} — ${portfolio.identity.role} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SocialImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f0e7", color: "#252720", padding: "56px 64px", fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", width: 490, height: 490, right: -110, top: -110, borderRadius: "50%", background: "#b83c2b" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 20 }}>
        <span style={{ color: "#b83c2b", fontWeight: 700 }}>EGP / PORTFOLIO</span>
        <span style={{ color: "#fffaf2", paddingRight: 8 }}>THINK. BUILD. REFINE.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 850 }}>
        <span style={{ fontSize: 86, fontWeight: 700, letterSpacing: "-4px", lineHeight: 1.05 }}>Gabriel</span>
        <span style={{ fontSize: 100, fontWeight: 700, letterSpacing: "-4px", color: "#b83c2b", lineHeight: 1.05 }}>Paclibar.</span>
        <span style={{ fontSize: 29, marginTop: 26, fontWeight: 700 }}>{portfolio.identity.role}</span>
        <span style={{ fontSize: 25, marginTop: 16, color: "#494b43" }}>{portfolio.identity.headline}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #b2b1a4", paddingTop: 20, fontSize: 19, color: "#494b43" }}>
        <span>Cotabato, Philippines</span><span>github.com/Gabbu69</span>
      </div>
    </div>,
    size,
  );
}
