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
    availability: string;
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
  const portraitOffset = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const portraitY = useSpring(portraitOffset, {
    stiffness: 120,
    damping: 24,
    mass: 0.35,
  });

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__copy">
        <p className="status-line">
          <span className="status-line__dot" aria-hidden="true" />
          {identity.availability}
        </p>

        <p className="hero__role">
          {identity.role} <span aria-hidden="true">/</span> {identity.fullName}
        </p>
        <h1 id="hero-title">
          <span>Hi, I’m Gabriel.</span>
          <em>I build practical software.</em>
        </h1>

        <p className="hero__headline">{identity.headline}</p>
        <p className="hero__intro">{identity.intro}</p>

        <div className="hero__actions">
          <a className="button button--primary" href={`mailto:${identity.email}`}>
            Send me a note <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="button button--quiet" href="#work">
            See selected work <ArrowDown aria-hidden="true" />
          </a>
        </div>

        <div className="hero__facts" aria-label="Portfolio highlights">
          <div>
            <strong>{String(projectCount).padStart(2, "0")}</strong>
            <span>Selected projects</span>
          </div>
          <div>
            <strong>{String(workflowCount).padStart(2, "0")}</strong>
            <span>Hospital workflow areas</span>
          </div>
          <div>
            <strong>Full</strong>
            <span>Stack perspective</span>
          </div>
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero-orbit" aria-hidden="true">
          <span className="hero-orbit__ring hero-orbit__ring--outer" />
          <span className="hero-orbit__ring hero-orbit__ring--inner" />
          <span className="hero-orbit__runner hero-orbit__runner--one"><i /></span>
          <span className="hero-orbit__runner hero-orbit__runner--two"><i /></span>
          <span className="hero-orbit__label hero-orbit__label--top">01 / frontend</span>
          <span className="hero-orbit__label hero-orbit__label--side">02 / backend</span>
        </div>
        <m.div
          className="hero__portrait-motion"
          style={{ y: reduceMotion ? 0 : portraitY }}
        >
          <figure className="portrait-card">
            <div className="portrait-frame">
              <Image
                src={profilePortrait}
                alt={`Portrait of ${identity.fullName}`}
                preload
                placeholder="blur"
                sizes="(max-width: 820px) 74vw, 34vw"
              />
            </div>
            <figcaption>
              <span>{identity.fullName}</span>
              <span><MapPin aria-hidden="true" /> {identity.location}</span>
            </figcaption>
          </figure>
        </m.div>

        <aside className="hero__margin-note">
          <span aria-hidden="true">Note / 01</span>
          <p>I like work that begins with a real process, not a feature list.</p>
        </aside>
      </div>

      <a className="scroll-cue" href="#work" aria-label="Scroll to selected work">
        <span>Scroll to work</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
