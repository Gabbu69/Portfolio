"use client";

import { m, useReducedMotion } from "motion/react";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
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
        <span>{index}</span>
      </m.div>
      <m.div
        variants={copyVariants}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description ? <p className="section-heading__description">{description}</p> : null}
      </m.div>
    </m.header>
  );
}
