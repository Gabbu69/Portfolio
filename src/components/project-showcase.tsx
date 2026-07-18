"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Github } from "lucide-react";
import type { Project, ProjectCategory } from "@/data/portfolio";

type ProjectShowcaseProps = {
  projects: readonly Project[];
  categories: readonly ProjectCategory[];
};

function EncodexVisual({ alt }: { alt: string }) {
  return (
    <div className="encodex-demo" role="img" aria-label={alt}>
      <div className="encodex-demo__bar">
        <span className="encodex-demo__dots"><i /><i /><i /></span>
        <strong>ENCODEX / LOCAL REVIEW</strong>
        <span>READY</span>
      </div>
      <div className="encodex-demo__workspace">
        <div className="encodex-demo__capture">
          <span>CAPTURE 01</span>
          <div className="demo-document">
            <i /><i /><i /><i /><i />
            <b>DEMO</b>
          </div>
          <small>Local processing</small>
        </div>
        <div className="encodex-demo__fields">
          <div><span>Patient</span><strong>Demo Patient 001</strong><i>98%</i></div>
          <div><span>Record</span><strong>TEST-0001</strong><i>96%</i></div>
          <div><span>Result</span><strong>For staff review</strong><i>—</i></div>
          <span className="encodex-demo__action">Copy approved fields</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  reduceMotion,
}: {
  project: Project;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      layout={!reduceMotion}
      className={`project-card${project.featured ? " project-card--featured" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="project-card__visual">
        {project.visual.kind === "encodex" ? (
          <EncodexVisual alt={project.visual.alt} />
        ) : (
          <div className={`project-image project-image--${project.visual.fit ?? "cover"}`}>
            <Image
              src={project.visual.src}
              alt={project.visual.alt}
              fill
              sizes={project.featured ? "(max-width: 760px) 92vw, 62vw" : "(max-width: 760px) 92vw, 36vw"}
            />
          </div>
        )}
        <span className="project-card__number" aria-hidden="true">
          {project.title.slice(0, 2).toUpperCase()}
        </span>
      </div>

      <div className="project-card__content">
        <div className="project-card__heading">
          <div>
            <p className="eyebrow">{project.eyebrow}</p>
            <h3>{project.title}</h3>
          </div>
          <span className="project-card__category">{project.category}</span>
        </div>
        <p className="project-card__summary">{project.summary}</p>
        {project.note ? <p className="project-card__note">{project.note}</p> : null}
        <ul className="tech-list" aria-label={`${project.title} technologies`}>
          {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        <div className="project-card__links">
          <a href={project.repo} target="_blank" rel="noreferrer">
            <Github aria-hidden="true" /> Source <ArrowUpRight aria-hidden="true" />
          </a>
          {project.live ? (
            <a href={project.live} target="_blank" rel="noreferrer">
              Live demo <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectShowcase({ projects, categories }: ProjectShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const reduceMotion = useReducedMotion();
  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="project-showcase">
      <div className="project-filters" aria-label="Filter projects">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
            <span>
              {category === "All"
                ? projects.length
                : projects.filter((project) => project.category === category).length}
            </span>
          </button>
        ))}
      </div>

      <motion.div className="project-grid" layout={!reduceMotion}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleProjects.map((project) => (
            <ProjectCard key={project.title} project={project} reduceMotion={reduceMotion} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
