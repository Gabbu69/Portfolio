"use client";

import { useState, type CSSProperties } from "react";
import { Database } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import {
  SiArduino,
  SiFastapi,
  SiGit,
  SiGithub,
  SiLaravel,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import type { Skill } from "@/data/portfolio";

const skillIcons = {
  react: SiReact,
  typescript: SiTypescript,
  nextjs: SiNextdotjs,
  tailwind: SiTailwindcss,
  node: SiNodedotjs,
  python: SiPython,
  fastapi: SiFastapi,
  laravel: SiLaravel,
  php: SiPhp,
  supabase: SiSupabase,
  database: Database,
  git: SiGit,
  github: SiGithub,
  vercel: SiVercel,
  arduino: SiArduino,
};

type SkillKeyboardProps = {
  skills: readonly Skill[];
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.045,
    },
  },
};

const skillVariants = {
  hidden: { y: 22, scale: 0.975 },
  visible: {
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 180, damping: 20 },
  },
};

export function SkillKeyboard({ skills }: SkillKeyboardProps) {
  const [activeName, setActiveName] = useState(skills[0]?.name ?? "");
  const reduceMotion = useReducedMotion();
  const activeSkill = skills.find((skill) => skill.name === activeName) ?? skills[0];
  const activeIndex = skills.findIndex((skill) => skill.name === activeSkill?.name);

  if (!activeSkill) return null;

  const ActiveIcon = skillIcons[activeSkill.icon];

  return (
    <div className="skill-explorer">
      <AnimatePresence mode="wait" initial={false}>
        <m.aside
          className="skill-readout"
          key={activeSkill.name}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          <span className="skill-readout__label">
            <span lang="ja">技術</span>
            Tool {String(activeIndex + 1).padStart(2, "0")} / {String(skills.length).padStart(2, "0")}
          </span>
          <span className="skill-readout__icon" style={{ color: activeSkill.color }}>
            <ActiveIcon aria-hidden="true" />
          </span>
          <div>
            <h3>{activeSkill.name}</h3>
            <p>{activeSkill.note}</p>
          </div>
          <span className="skill-readout__word" aria-hidden="true">{activeSkill.name}</span>
        </m.aside>
      </AnimatePresence>

      <m.ul
        className="skill-list"
        aria-label="Interactive technology toolkit"
        variants={listVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        {skills.map((skill, index) => {
          const Icon = skillIcons[skill.icon];
          const isActive = activeSkill.name === skill.name;
          const style = { "--skill-color": skill.color } as CSSProperties;

          return (
            <m.li
              key={skill.name}
              className={`skill-item${isActive ? " is-active" : ""}`}
              style={style}
              variants={skillVariants}
              whileHover={reduceMotion ? undefined : { y: -5 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <button
                className="skill-item__button"
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveName(skill.name)}
                onMouseEnter={() => setActiveName(skill.name)}
                onFocus={() => setActiveName(skill.name)}
              >
                <span className="skill-item__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="skill-item__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="skill-item__copy">
                  <strong>{skill.name}</strong>
                </span>
              </button>
            </m.li>
          );
        })}
      </m.ul>
    </div>
  );
}
