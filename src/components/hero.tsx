"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import profilePortrait from "../../public/images/profile.webp";

type HeroProps = {
  identity: { fullName: string; role: string; email: string; location: string; headline: string; intro: string };
  projectCount: number;
};

export function Hero({ identity, projectCount }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sunOffset = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const sunY = useSpring(sunOffset, { stiffness: 100, damping: 28 });

  return (
    <section className="folio-hero" id="top" aria-labelledby="hero-title" ref={heroRef}>
      <div className="folio-hero__edition">
        <span><span lang="ja">ポートフォリオ</span> / Selected works</span>
        <span>Mindanao, Philippines <span className="folio-hero__year">© 2026</span></span>
      </div>
      <div className="folio-hero__layout">
        <div className="folio-hero__copy">
          <div className="folio-hero__greeting"><span lang="ja">こんにちは。</span> Hello, I’m</div>
          <h1 id="hero-title" aria-label={identity.fullName}>
            <span className="folio-hero__name" aria-hidden="true">Gabriel</span>
            <span className="folio-hero__name folio-hero__name--accent" aria-hidden="true">Paclibar<span className="folio-hero__period">.</span></span>
          </h1>
          <p className="folio-hero__role"><span className="folio-hero__dash" aria-hidden="true" /> {identity.role}</p>
          <p className="folio-hero__headline">{identity.headline}</p>
          <p className="folio-hero__intro">{identity.intro}</p>
          <div className="folio-hero__actions">
            <a className="button button--primary" href="#work">Explore my work <ArrowDown aria-hidden="true" /></a>
            <a className="button button--quiet" href="#contact">Let’s talk <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
        <div className="folio-art">
          <m.div className="folio-art__sun" style={{ y: reduceMotion ? 0 : sunY }} aria-hidden="true" />
          <span className="folio-art__vertical" lang="ja" aria-hidden="true">丁寧につくる</span>
          <figure className="folio-art__portrait">
            <div className="folio-art__image-wrap">
              <Image src={profilePortrait} alt={`Portrait of ${identity.fullName}`} preload placeholder="blur" sizes="(max-width: 600px) 68vw, (max-width: 1000px) 38vw, 360px" />
              <span className="folio-art__shutter folio-art__shutter--left" aria-hidden="true" />
              <span className="folio-art__shutter folio-art__shutter--right" aria-hidden="true" />
            </div>
            <figcaption><span>Gabriel Paclibar</span><span lang="ja">開発者 / Developer</span></figcaption>
          </figure>
          <span className="folio-art__seal" aria-hidden="true"><span lang="ja">創造</span><small>CREATE</small></span>
          <div className="folio-art__caption"><span lang="ja">日々、改善。</span><span>Always learning.<br />Always building.</span></div>
        </div>
      </div>
      <div className="folio-hero__footer">
        <span><MapPin aria-hidden="true" /> {identity.location}</span>
        <a href="#work">{String(projectCount).padStart(2, "0")} projects to explore <ArrowDown aria-hidden="true" /></a>
        <span className="folio-hero__craft"><span lang="ja">考える。つくる。磨く。</span> Think. Build. Refine.</span>
      </div>
    </section>
  );
}
