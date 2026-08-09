"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { CSSProperties } from "react";
import { useRef } from "react";
import profilePortrait from "../../public/images/profile.webp";

const matrixStreams = [
  { glyphs: "0101GABRIEL101001", left: "3%", delay: "-7.4s", speed: "10.8s", opacity: 0.46 },
  { glyphs: "10110BUILD01101", left: "12%", delay: "-2.2s", speed: "8.1s", opacity: 0.72 },
  { glyphs: "001REACT10110010", left: "21%", delay: "-5.8s", speed: "12.4s", opacity: 0.38 },
  { glyphs: "110010API011101", left: "30%", delay: "-1.1s", speed: "9.3s", opacity: 0.64 },
  { glyphs: "01DESIGN1001011", left: "39%", delay: "-8.9s", speed: "13.2s", opacity: 0.42 },
  { glyphs: "101101SHIP00101", left: "48%", delay: "-4.3s", speed: "8.7s", opacity: 0.78 },
  { glyphs: "001TSX10101100", left: "57%", delay: "-10.1s", speed: "11.6s", opacity: 0.5 },
  { glyphs: "110FULLSTACK0101", left: "66%", delay: "-3.6s", speed: "9.9s", opacity: 0.68 },
  { glyphs: "01001DATA11001", left: "75%", delay: "-6.7s", speed: "12.8s", opacity: 0.4 },
  { glyphs: "101CODE01101011", left: "84%", delay: "-0.5s", speed: "8.4s", opacity: 0.74 },
  { glyphs: "0110EGP1010011", left: "93%", delay: "-9.6s", speed: "11.1s", opacity: 0.48 },
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
        <span className="hero__signal">
          <i aria-hidden="true" />
          Build signal / online
        </span>
        <span className="hero__edition">Independent developer / Mindanao</span>
      </div>

      <div className="hero__stage">
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
            visible: { transition: { delayChildren: 0.1, staggerChildren: 0.12 } },
          }}
        >
          {["Gabriel", "Paclibar"].map((name, index) => (
            <m.span
              className={index === 0 ? "hero__name hero__name--first" : "hero__name hero__name--last"}
              data-text={name}
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
          transition={{ duration: 1.05, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
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
            <div className="hero-portrait__echo" aria-hidden="true">
              <Image
                src={profilePortrait}
                alt=""
                sizes="(max-width: 760px) 72vw, 34vw"
              />
            </div>
            <div className="hero-matrix" aria-hidden="true">
              <div className="hero-matrix__grid" />
              {matrixStreams.map((stream) => (
                <span
                  className="hero-matrix__stream"
                  key={`${stream.left}-${stream.glyphs}`}
                  style={{
                    "--stream-left": stream.left,
                    "--stream-delay": stream.delay,
                    "--stream-speed": stream.speed,
                    "--stream-opacity": stream.opacity,
                  } as CSSProperties}
                >
                  {stream.glyphs}
                </span>
              ))}
              <span className="hero-matrix__scan" />
              <span className="hero-matrix__readout hero-matrix__readout--top">
                EGP://01
              </span>
              <span className="hero-matrix__readout hero-matrix__readout--bottom">
                FULL STACK / ACTIVE
              </span>
            </div>
          </div>
          <figcaption>
            <span>Portrait / 2026</span>
            <span><MapPin aria-hidden="true" /> {identity.location}</span>
          </figcaption>
        </m.figure>

        <p className="hero__role" aria-hidden="true">
          Full-stack <span>/</span> Developer
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
