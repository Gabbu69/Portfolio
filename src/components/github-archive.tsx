import { ArrowUpRight, Github } from "lucide-react";
import type { ArchiveProject } from "@/data/portfolio";

type GithubArchiveProps = {
  projects: readonly ArchiveProject[];
  allProjects: readonly ArchiveProject[];
};

const posterPixels = Array.from({ length: 28 }, (_, index) => index);

export function GithubArchive({ projects, allProjects }: GithubArchiveProps) {
  return (
    <section className="github-archive" aria-labelledby="github-archive-title">
      <header className="github-archive__header">
        <div className="github-archive__marker">
          <span lang="ja">追加作品</span>
          <small>GitHub archive</small>
        </div>
        <div className="github-archive__title">
          <p className="eyebrow">More builds · recent systems</p>
          <h3 id="github-archive-title">More ways I build.</h3>
        </div>
        <p className="github-archive__intro">
          A compact archive of recent full-stack, research, mobile, local-business,
          and connected-device work. Every description follows the public source;
          live links appear only where a working demo is available.
        </p>
        <div className="github-archive__count" aria-label={`${projects.length} additional projects`}>
          <strong>{String(projects.length).padStart(2, "0")}</strong>
          <span>Additional projects</span>
        </div>
      </header>

      <ol className="github-archive__grid">
        {projects.map((project, index) => {
          const number = String(allProjects.findIndex((entry) => entry.repo === project.repo) + 1).padStart(2, "0");

          return (
            <li className={`archive-card archive-card--${project.tone}`} key={project.repo}>
              <article>
                <div
                  className={`archive-poster archive-poster--pattern-${(index % 4) + 1}`}
                  aria-hidden="true"
                >
                  <div className="archive-poster__meta">
                    <span>GH / {number}</span>
                    <span>{project.live ? "LIVE BUILD" : "SOURCE BUILD"}</span>
                  </div>
                  <div className="archive-poster__matrix">
                    {posterPixels.map((pixel) => <i key={pixel} />)}
                  </div>
                  <strong>{project.code}</strong>
                  <span className="archive-poster__signal">PIXEL / SYSTEM</span>
                </div>

                <div className="archive-card__body">
                  <div className="archive-card__heading">
                    <span className="archive-card__number">{number}</span>
                    <div>
                      <p>{project.category} · GitHub build</p>
                      <h4>{project.title}</h4>
                    </div>
                  </div>

                  <p className="archive-card__summary">{project.summary}</p>
                  {project.note ? <p className="archive-card__note">{project.note}</p> : null}

                  <ul className="archive-card__stack" aria-label={`${project.title} technologies`}>
                    {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
                  </ul>

                  <div className="archive-card__links">
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
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
