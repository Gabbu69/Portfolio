"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import profilePortrait from "../../public/images/profile.webp";

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
        <span className="hero__axis hero__axis--horizontal" aria-hidden="true" />
        <span className="hero__axis hero__axis--vertical" aria-hidden="true" />

        <m.h1
          id="hero-title"
          aria-label={identity.fullName}
          style={{ y: reduceMotion ? 0 : titleY }}
          initial={reduceMotion ? false : "hidden"}
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
          initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
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
          <a className="button button--primary" href={`mailto:${identity.email}`}>
            Start a conversation <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="button button--quiet" href="#work">
            Explore my work <ArrowDown aria-hidden="true" />
          </a>
        </div>

        <div className="hero__facts" aria-label="Portfolio highlights">
          <div>
            <strong>{String(projectCount).padStart(2, "0")}</strong>
            <span>Selected projects</span>
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
