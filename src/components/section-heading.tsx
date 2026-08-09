"use client";

import { m, useReducedMotion } from "motion/react";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  jpLabel: string;
  title: string;
  description?: string;
};

const headingVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const markerVariants = {
  hidden: { y: 14 },
  visible: {
    y: 0,
    transition: { type: "spring" as const, stiffness: 170, damping: 19 },
  },
};

const copyVariants = {
  hidden: { y: 30 },
  visible: {
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

export function SectionHeading({
  index,
  eyebrow,
  jpLabel,
  title,
  description,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.header
      className="section-heading"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={headingVariants}
    >
      <m.div
        className="section-heading__marker"
        aria-hidden="true"
        variants={markerVariants}
      >
        <span>Section</span>
        <strong>{index}</strong>
        <span className="section-heading__jp" lang="ja">{jpLabel}</span>
      </m.div>
      <m.div
        className="section-heading__copy"
        variants={copyVariants}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2><span>{title}</span></h2>
      </m.div>
      {description ? (
        <m.p className="section-heading__description" variants={copyVariants}>
          {description}
        </m.p>
      ) : null}
    </m.header>
  );
}
