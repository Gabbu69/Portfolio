"use client";

import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useState } from "react";
import type {
  Project,
  ProjectCategory,
} from "@/data/portfolio";

type ProjectShowcaseProps = {
  projects: readonly Project[];
  categories: readonly ProjectCategory[];
};

type ProjectVisualProps = {
  number: string;
  project: Project;
};

function ProjectVisual({ number, project }: ProjectVisualProps) {
  const { category, stack, title, visual } = project;

  if (visual.kind === "image") {
    const isContained = visual.fit === "contain";

    return (
      <div
        className={`project-visual project-visual--image project-visual--${visual.fit ?? "cover"} project-visual--${visual.tone ?? "product"}`}
      >
        <div className="project-visual__masthead" aria-hidden="true">
          <span>{number}</span>
          <strong>{title}</strong>
          <span>Case study</span>
        </div>
        {isContained ? (
          <div className="project-visual__image project-visual__image--composition">
            <div className="project-media__copy" aria-hidden="true">
              <span>{category} / {number}</span>
              <strong>{title}</strong>
              <small>{stack.join(" · ")}</small>
            </div>
            <div className="project-media__asset">
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                sizes="(max-width: 520px) 82vw, (max-width: 760px) 52vw, 32vw"
              />
            </div>
            <span className="project-media__edition" aria-hidden="true">Selected work / 2026</span>
          </div>
        ) : (
          <div className="project-visual__image project-visual__image--screen">
            <div className="project-screen__frame">
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                sizes="(max-width: 760px) 92vw, 55vw"
              />
            </div>
            <div className="project-screen__caption" aria-hidden="true">
              <span>{category} interface</span>
              <span>{stack.slice(0, 2).join(" / ")}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`project-visual project-visual--interface project-visual--${visual.tone}`}>
      <div className="project-visual__masthead" aria-hidden="true">
        <span>{number}</span>
        <strong>{title}</strong>
        <span>System view</span>
      </div>
      <div className="interface-poster" aria-hidden="true">
        <span className="interface-poster__index">{number}</span>
        <p>{visual.detail}</p>
        <strong>{visual.label}</strong>
        <div className="interface-poster__signal">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="interface-poster__stamp">Prototype</span>
      </div>
    </div>
  );
}

export function ProjectShowcase({ projects, categories }: ProjectShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const reduceMotion = useReducedMotion();
  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  const projectNumber = (project: Project) =>
    String(projects.findIndex((candidate) => candidate.title === project.title) + 1).padStart(
      2,
      "0",
    );

  return (
    <div className="project-showcase">
      <div className="project-filter" aria-label="Filter projects by category">
        <span className="project-filter__title">
          <span lang="ja">作品</span>
          <small>Project archive</small>
        </span>
        <div className="project-filter__options">
          {categories.map((category) => {
            const count =
              category === "All"
                ? projects.length
                : projects.filter((project) => project.category === category).length;
            const isActive = category === activeCategory;

            return (
              <button
                type="button"
                className={isActive ? "is-active" : undefined}
                aria-pressed={isActive}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                <span>{category}</span>
                <small>{String(count).padStart(2, "0")}</small>
              </button>
            );
          })}
        </div>
      </div>

      <m.div className="project-list" layout={!reduceMotion}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleProjects.map((project, index) => {
            const number = projectNumber(project);

            return (
              <m.article
                className={`project-entry${project.spotlight ? " project-entry--spotlight" : ""}${
                  index % 2 ? " project-entry--reverse" : ""
                }`}
                key={project.title}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 46 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 28 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <header className="project-entry__heading">
                  <span className="project-entry__number">{number}</span>
                  <div>
                    <p className="project-entry__eyebrow">{project.eyebrow}</p>
                    <h3>{project.title}</h3>
                  </div>
                  <span className="project-entry__category">{project.category}</span>
                </header>

                <ProjectVisual
                  number={number}
                  project={project}
                />

                <div className="project-entry__body">
                  <p className="project-entry__summary">{project.summary}</p>
                  {project.note ? <p className="project-entry__note">{project.note}</p> : null}

                  <ul className="project-entry__stack" aria-label={`${project.title} technologies`}>
                    {project.stack.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>

                  <div className="project-entry__links">
                    <a href={project.repo} target="_blank" rel="noreferrer">
                      <Github aria-hidden="true" />
                      Source
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                    {project.live ? (
                      <a href={project.live} target="_blank" rel="noreferrer">
                        Live project
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </m.article>
            );
          })}
        </AnimatePresence>
      </m.div>
    </div>
  );
}
