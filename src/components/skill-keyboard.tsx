"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Database } from "lucide-react";
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

export function SkillKeyboard({ skills }: SkillKeyboardProps) {
  const [activeName, setActiveName] = useState(skills[0]?.name ?? "");
  const reduceMotion = useReducedMotion();
  const activeSkill = skills.find((skill) => skill.name === activeName) ?? skills[0];

  if (!activeSkill) return null;

  const ActiveIcon = skillIcons[activeSkill.icon];

  return (
    <div className="skills-stage">
      <motion.div
        className="skill-readout"
        key={activeSkill.name}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="skill-readout__icon" style={{ color: activeSkill.color }}>
          <ActiveIcon aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">Currently selected</p>
          <h3>{activeSkill.name}</h3>
          <p>{activeSkill.note}</p>
        </div>
      </motion.div>

      <div className="keyboard-wrap">
        <div className="keyboard" aria-label="Interactive technology toolkit">
          {skills.map((skill, index) => {
            const Icon = skillIcons[skill.icon];
            const isActive = activeSkill.name === skill.name;
            const keyStyle = { "--key-accent": skill.color } as CSSProperties;

            return (
              <button
                className={`skill-key skill-key--${(index % 5) + 1}${isActive ? " is-active" : ""}`}
                key={skill.name}
                type="button"
                style={keyStyle}
                aria-pressed={isActive}
                onClick={() => setActiveName(skill.name)}
                onMouseEnter={() => setActiveName(skill.name)}
                onFocus={() => setActiveName(skill.name)}
              >
                <span className="skill-key__top">
                  <Icon aria-hidden="true" />
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{skill.name}</strong>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
