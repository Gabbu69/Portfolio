"use client";

import Image from "next/image";
import { ArrowUpRight, Github, Search, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useState } from "react";
import { GithubArchive } from "@/components/github-archive";
import type {
  ArchiveProject,
  Project,
  ProjectCategory,
} from "@/data/portfolio";

type ProjectShowcaseProps = {
  projects: readonly Project[];
  archiveProjects: readonly ArchiveProject[];
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

export function ProjectShowcase({ projects, archiveProjects, categories }: ProjectShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const allProjects = [...projects, ...archiveProjects];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchesSearch = (project: Project | ArchiveProject) => {
    const text = [project.title, project.category, project.summary, ...project.stack].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  };
  const matchesFilter = (project: Project | ArchiveProject) =>
    (activeCategory === "All" || project.category === activeCategory) && matchesSearch(project);
  const visibleProjects = projects.filter(matchesFilter);
  const visibleArchive = archiveProjects.filter(matchesFilter);
  const resultCount = visibleProjects.length + visibleArchive.length;
  const isFiltered = activeCategory !== "All" || terms.length > 0;
  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
  };

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
          <small>Explore the work</small>
        </span>
        <div className="project-filter__options">
          {categories.map((category) => {
            const count =
              category === "All"
                ? allProjects.filter(matchesSearch).length
                : allProjects.filter((project) => project.category === category && matchesSearch(project)).length;
            const isActive = category === activeCategory;

            return (
              <button
                type="button"
                className={isActive ? "is-active" : undefined}
                aria-pressed={isActive}
                aria-controls="project-results"
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

      <div className="project-search-row">
        <label className="project-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search projects by name, technology, or topic</span>
          <input
            type="search"
            placeholder="Search projects, tools, or topics"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-controls="project-results"
          />
        </label>
        <p className="project-result-count" role="status" aria-atomic="true">
          <strong>{String(resultCount).padStart(2, "0")}</strong> of {allProjects.length} projects
        </p>
        {isFiltered ? (
          <button className="project-reset" type="button" onClick={resetFilters}>
            Reset filters <X aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div id="project-results">
      {resultCount === 0 ? (
        <div className="project-empty">
          <h3>No matching projects.</h3>
          <p>Try a project name, a tool like React, or a broader topic.</p>
          <button className="button button--primary" type="button" onClick={resetFilters}>Show all projects</button>
        </div>
      ) : null}
      <div className="project-list">
        <AnimatePresence initial={false}>
          {visibleProjects.map((project, index) => {
            const number = projectNumber(project);

            return (
              <m.article
                className={`project-entry${project.spotlight ? " project-entry--spotlight" : ""}${
                  index % 2 ? " project-entry--reverse" : ""
                }`}
                key={project.title}
                initial={false}
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
                    <a href={project.repo} target="_blank" rel="noreferrer" aria-label={`View ${project.title} source on GitHub`}>
                      <Github aria-hidden="true" />
                      Source
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                    {project.live ? (
                      <a href={project.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live project`}>
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
      </div>
      {visibleArchive.length > 0 ? <GithubArchive projects={visibleArchive} allProjects={archiveProjects} /> : null}
      </div>
    </div>
  );
}
