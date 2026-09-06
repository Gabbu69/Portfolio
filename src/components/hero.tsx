"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import profilePortrait from "../../public/images/profile.webp";

const heroPixels = [
  { x: 18, y: 22, width: 8, height: 8, tone: "ink" },
  { x: 30, y: 10, width: 4, height: 4, tone: "signal" },
  { x: 42, y: 30, width: 12, height: 4, tone: "red" },
  { x: 58, y: 18, width: 4, height: 12, tone: "ink" },
  { x: 70, y: 38, width: 8, height: 8, tone: "signal" },
  { x: 84, y: 12, width: 4, height: 4, tone: "red" },
  { x: 96, y: 26, width: 12, height: 8, tone: "ink" },
  { x: 114, y: 8, width: 8, height: 8, tone: "signal" },
  { x: 128, y: 28, width: 4, height: 12, tone: "red" },
  { x: 142, y: 18, width: 12, height: 4, tone: "ink" },
  { x: 162, y: 34, width: 8, height: 8, tone: "signal" },
  { x: 180, y: 14, width: 4, height: 4, tone: "red" },
  { x: 196, y: 28, width: 12, height: 8, tone: "ink" },
  { x: 216, y: 18, width: 8, height: 4, tone: "signal" },
  { x: 8, y: 74, width: 4, height: 12, tone: "red" },
  { x: 24, y: 94, width: 12, height: 4, tone: "signal" },
  { x: 46, y: 70, width: 8, height: 8, tone: "ink" },
  { x: 64, y: 106, width: 4, height: 12, tone: "red" },
  { x: 80, y: 84, width: 12, height: 4, tone: "signal" },
  { x: 102, y: 116, width: 8, height: 8, tone: "ink" },
  { x: 124, y: 92, width: 4, height: 12, tone: "red" },
  { x: 144, y: 112, width: 12, height: 4, tone: "signal" },
  { x: 166, y: 78, width: 8, height: 8, tone: "ink" },
  { x: 184, y: 102, width: 4, height: 12, tone: "red" },
  { x: 202, y: 82, width: 12, height: 4, tone: "signal" },
  { x: 224, y: 112, width: 8, height: 8, tone: "ink" },
  { x: 18, y: 136, width: 12, height: 4, tone: "signal" },
  { x: 48, y: 144, width: 4, height: 4, tone: "red" },
  { x: 82, y: 132, width: 8, height: 8, tone: "ink" },
  { x: 126, y: 144, width: 12, height: 4, tone: "signal" },
  { x: 174, y: 134, width: 4, height: 8, tone: "red" },
  { x: 214, y: 146, width: 12, height: 4, tone: "ink" },
] as const;

type HeroProps = {
  identity: {
    fullName: string;
    role: string;
    email: string;
    location: string;
    headline: string;
    intro: string;
  };
  projectCount: number;
  workflowCount: number;
};

export function Hero({ identity, projectCount, workflowCount }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const portraitOffset = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const titleOffset = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const pixelOffset = useTransform(scrollYProgress, [0, 1], [0, -22]);
  const portraitY = useSpring(portraitOffset, {
    stiffness: 120,
    damping: 24,
    mass: 0.35,
  });
  const titleY = useSpring(titleOffset, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });
  const pixelY = useSpring(pixelOffset, {
    stiffness: 90,
    damping: 24,
    mass: 0.42,
  });

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__topline">
        <span className="hero__locator">
          <span lang="ja">開発者</span>
          <i aria-hidden="true" />
          Portfolio / 2026
        </span>
        <span className="hero__edition">Independent developer / Mindanao</span>
      </div>

      <div className="hero__stage">
        <div className="hero__architecture" aria-hidden="true">
          <span>EGP / 01</span>
          <span>KABACAN — COTABATO</span>
          <i /><i /><i />
        </div>
        <m.span
          className="hero__sun"
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        />
        <m.div
          className="hero-pixels"
          aria-hidden="true"
          style={{ y: reduceMotion ? 0 : pixelY }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            className="hero-pixels__svg"
            viewBox="0 0 240 160"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            focusable="false"
          >
            {heroPixels.map((pixel, index) => (
              <rect
                className={`hero-pixels__cell hero-pixels__cell--${pixel.tone}`}
                x={pixel.x}
                y={pixel.y}
                width={pixel.width}
                height={pixel.height}
                opacity={index % 4 === 0 ? 0.88 : 0.62}
                key={`${pixel.x}-${pixel.y}`}
              />
            ))}
          </svg>
        </m.div>
        <span className="hero__axis hero__axis--horizontal" aria-hidden="true" />
        <span className="hero__axis hero__axis--vertical" aria-hidden="true" />

        <m.h1
          id="hero-title"
          aria-label={identity.fullName}
          style={{ y: reduceMotion ? 0 : titleY }}
          initial={false}
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: reduceMotion ? 0 : 1, staggerChildren: 0.12 } },
          }}
        >
          {["Gabriel", "Paclibar"].map((name, index) => (
            <m.span
              className={index === 0 ? "hero__name hero__name--first" : "hero__name hero__name--last"}
              aria-hidden="true"
              key={name}
              variants={{
                hidden: { y: "110%" },
                visible: {
                  y: 0,
                  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {name}
            </m.span>
          ))}
        </m.h1>

        <m.figure
          className="hero-portrait"
          style={{ y: reduceMotion ? 0 : portraitY }}
          initial={false}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: reduceMotion ? 0 : 0.92, delay: reduceMotion ? 0 : 1.02, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-portrait__frame">
            <Image
              className="hero-portrait__image hero-portrait__image--main"
              src={profilePortrait}
              alt={`Portrait of ${identity.fullName}`}
              preload
              placeholder="blur"
              sizes="(max-width: 760px) 72vw, 34vw"
            />
          </div>
          <figcaption>
            <span>Portrait / 2026</span>
            <span><MapPin aria-hidden="true" /> {identity.location}</span>
          </figcaption>
        </m.figure>

        <p className="hero__role">
          <span lang="ja">開発者</span>
          <b>Full-stack / Developer</b>
        </p>
      </div>

      <div className="hero__footer">
        <div className="hero__copy">
          <p className="hero__headline">{identity.headline}</p>
          <p className="hero__intro">{identity.intro}</p>
        </div>

        <div className="hero__actions">
          <a className="button button--primary" href="#work">
            Explore my work <ArrowDown aria-hidden="true" />
          </a>
          <a className="button button--quiet" href={`mailto:${identity.email}`}>
            Start a conversation <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="hero__facts" aria-label="Portfolio highlights">
          <div>
            <strong>{String(projectCount).padStart(2, "0")}</strong>
            <span>Projects showcased</span>
          </div>
          <div>
            <strong>{String(workflowCount).padStart(2, "0")}</strong>
            <span>Hospital workflows</span>
          </div>
          <div>
            <strong>FE + BE</strong>
            <span>Full-stack range</span>
          </div>
        </div>
      </div>

      <a className="scroll-cue" href="#work" aria-label="Scroll to selected work">
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
