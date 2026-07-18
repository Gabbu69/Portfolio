"use client";

import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { Project, ProjectCategory } from "@/data/portfolio";

type ProjectShowcaseProps = {
  projects: readonly Project[];
  categories: readonly ProjectCategory[];
};

const revealTransition = {
  type: "spring" as const,
  stiffness: 92,
  damping: 21,
  mass: 0.68,
};

type TiltVisualProps = {
  children: ReactNode;
  className: string;
  reduceMotion: boolean | null;
};

function TiltVisual({ children, className, reduceMotion }: TiltVisualProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateXTarget = useTransform(pointerY, [-0.5, 0.5], [2.8, -2.8]);
  const rotateYTarget = useTransform(pointerX, [-0.5, 0.5], [-2.8, 2.8]);
  const rotateX = useSpring(rotateXTarget, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(rotateYTarget, { stiffness: 220, damping: 24 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <m.div
      className={className}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 950 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      whileHover={reduceMotion ? undefined : { y: -7, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </m.div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="project-card__links">
      <a href={project.repo} target="_blank" rel="noreferrer">
        <Github aria-hidden="true" /> View source <ArrowUpRight aria-hidden="true" />
      </a>
      {project.live ? (
        <a href={project.live} target="_blank" rel="noreferrer">
          Open live demo <ArrowUpRight aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

function ProjectCard({
  project,
  number,
  reduceMotion,
}: {
  project: Project;
  number: number;
  reduceMotion: boolean | null;
}) {
  const displayNumber = String(number).padStart(2, "0");

  return (
    <m.article
      className="project-card"
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 58 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 26, transition: { duration: 0.2 } }}
      viewport={{ once: true, amount: 0.14 }}
      transition={revealTransition}
    >
      <TiltVisual
        className={`project-card__visual project-card__visual--${number}`}
        reduceMotion={reduceMotion}
      >
        <div className={`project-image project-image--${project.visual.fit ?? "cover"}`}>
          <Image
            src={project.visual.src}
            alt={project.visual.alt}
            fill
            sizes="(max-width: 820px) 92vw, 48vw"
          />
        </div>
        <span className="project-card__number" aria-hidden="true">{displayNumber}</span>
      </TiltVisual>

      <m.div
        className="project-card__content"
        initial={reduceMotion ? false : { y: 28 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ ...revealTransition, delay: 0.08 }}
      >
        <div className="project-card__meta">
          <p className="eyebrow">{project.eyebrow}</p>
          <span>{project.category}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="project-card__summary">{project.summary}</p>
        {project.note ? <p className="project-card__note">{project.note}</p> : null}
        <ul className="tech-list" aria-label={`${project.title} technologies`}>
          {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        <ProjectLinks project={project} />
      </m.div>
    </m.article>
  );
}

function CompactProject({
  project,
  number,
  reduceMotion,
}: {
  project: Project;
  number: number;
  reduceMotion: boolean | null;
}) {
  const displayNumber = String(number).padStart(2, "0");

  return (
    <m.article
      className="project-compact"
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 18, transition: { duration: 0.18 } }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...revealTransition, delay: Math.max(0, number - 3) * 0.08 }}
    >
      <div className="project-compact__topline">
        <span>{displayNumber}</span>
        <span>{project.category}</span>
      </div>
      <div className="project-compact__body">
        <div className="project-compact__image">
          <Image
            src={project.visual.src}
            alt={project.visual.alt}
            fill
            sizes="120px"
          />
        </div>
        <div>
          <p className="eyebrow">{project.eyebrow}</p>
          <h3>{project.title}</h3>
        </div>
      </div>
      <p className="project-compact__summary">{project.summary}</p>
      <ul className="tech-list" aria-label={`${project.title} technologies`}>
        {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
      </ul>
      <ProjectLinks project={project} />
    </m.article>
  );
}

export function ProjectShowcase({ projects, categories }: ProjectShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const reduceMotion = useReducedMotion();
  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);
  const caseStudies =
    activeCategory === "All"
      ? visibleProjects.filter((project) => project.featured)
      : visibleProjects;
  const smallerProjects =
    activeCategory === "All"
      ? visibleProjects.filter((project) => !project.featured)
      : [];
  const projectNumber = (project: Project) =>
    projects.findIndex((candidate) => candidate.title === project.title) + 1;

  return (
    <div className="project-showcase">
      <div className="project-filters" aria-label="Filter projects">
        {categories.map((category) => {
          const count =
            category === "All"
              ? projects.length
              : projects.filter((project) => project.category === category).length;
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category)}
            >
              {isActive ? (
                <m.span
                  className="project-filter__active"
                  layoutId="active-project-filter"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="project-filter__label">{category}</span>
              <span className="project-filter__count">{String(count).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <m.div className="project-showcase__cases" layout={!reduceMotion}>
        <AnimatePresence initial={false}>
          {caseStudies.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              number={projectNumber(project)}
              reduceMotion={reduceMotion}
            />
          ))}
        </AnimatePresence>
      </m.div>

      <AnimatePresence initial={false}>
        {smallerProjects.length ? (
          <m.section
            className="project-showcase__more"
            aria-labelledby="more-projects-title"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={revealTransition}
          >
            <header className="project-showcase__more-heading">
              <h3 id="more-projects-title">More project work</h3>
              <p>Research and thesis prototypes from agriculture and community-focused work.</p>
            </header>
            <m.div className="project-compact-grid" layout={!reduceMotion}>
              <AnimatePresence initial={false}>
                {smallerProjects.map((project) => (
                  <CompactProject
                    key={project.title}
                    project={project}
                    number={projectNumber(project)}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </AnimatePresence>
            </m.div>
          </m.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
