import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github, Layers, LockKeyhole } from "lucide-react";
import { allProjects, getProjectBySlug, portfolio } from "@/data/portfolio";
import { SiteHeader } from "@/components/site-header";
import type { ProjectCaseStudy } from "@/data/case-studies";

const navigation = portfolio.navigation.map(item => ({ ...item, href: `/${item.href}` }));
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProjects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const url = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: { title: `${project.title} | Gabriel Paclibar`, description: project.summary, url, type: "website" },
    twitter: { title: `${project.title} | Gabriel Paclibar`, description: project.summary, card: "summary_large_image" },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const study: ProjectCaseStudy = project.caseStudy;
  const image = "visual" in project && project.visual.kind === "image" ? project.visual : undefined;
  const sections = ["Overview", "Features", "Workflow", "Technical layers", "Limitations", "Evidence"];
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader initials={portfolio.identity.initials} name={portfolio.identity.shortName} navigation={navigation} github={portfolio.socials.github} homeHref="/#top" />
      <main className="case-study" id="main-content">
        <Link className="case-study__back" href="/#work"><ArrowLeft aria-hidden="true" />Back to all projects</Link>
        <header className="case-study__hero">
          <p className="eyebrow">{project.category} / App case study</p>
          <h1>{project.title}</h1>
          <p className="case-study__summary">{project.summary}</p>
          <p className="case-study__status">{study.status}</p>
          <ul className="case-study__stack" aria-label="Technologies">{project.stack.map(item => <li key={item}>{item}</li>)}</ul>
          <div className="case-study__links">
            {study.sourceAvailability === "public" ? <a href={project.repo} target="_blank" rel="noreferrer"><Github aria-hidden="true" />Source on GitHub<ArrowUpRight aria-hidden="true" /></a> : <span><LockKeyhole aria-hidden="true" />Private repository</span>}
            {"live" in project && project.live ? <a href={project.live} target="_blank" rel="noreferrer">Open demo<ArrowUpRight aria-hidden="true" /></a> : null}
          </div>
        </header>
        {image ? (
          <figure className={`case-study__image case-study__image--${image.fit ?? "cover"}`}>
            <div><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 92vw, 1040px" /></div>
            <figcaption>{image.alt}</figcaption>
          </figure>
        ) : null}
        <div className="case-study__layout">
          <nav className="case-study__contents" aria-label="Case study contents">
            <span>In this case study</span>
            {sections.map((title, index) => <a href={`#${title.toLowerCase().replaceAll(" ", "-")}`} key={title}><small>{String(index + 1).padStart(2, "0")}</small>{title}</a>)}
          </nav>
          <div className="case-study__sections">
            <section id="overview" aria-labelledby="overview-title">
              <p className="eyebrow">01 / Overview</p><h2 id="overview-title">What it’s built for.</h2>
              <p>{study.purpose}</p>
              <div className="case-study__audience"><strong>Who it serves</strong><p>{study.audience}</p></div>
            </section>
            <section id="features" aria-labelledby="features-title">
              <p className="eyebrow">02 / Features</p><h2 id="features-title">Inside the app.</h2>
              <div className="case-study__features">{study.features.map(feature => <article key={feature.title}><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>
            </section>
            <section id="workflow" aria-labelledby="workflow-title">
              <p className="eyebrow">03 / Workflow</p><h2 id="workflow-title">From task to outcome.</h2>
              <ol className="case-study__workflow">{study.workflow.map((step, index) => <li key={step}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            </section>
            <section id="technical-layers" aria-labelledby="layers-title">
              <p className="eyebrow">04 / Technical layers</p><h2 id="layers-title">How the pieces work.</h2>
              <div className="case-study__layers">{study.layers.map(layer => <article key={layer.name}><Layers aria-hidden="true" /><span className="eyebrow">{layer.name}</span><h3>{layer.technology}</h3><p>{layer.description}</p></article>)}</div>
            </section>
            <section id="limitations" aria-labelledby="limitations-title">
              <p className="eyebrow">05 / Limitations</p><h2 id="limitations-title">What to keep in mind.</h2>
              <ul className="case-study__limitations">{study.limitations.map(item => <li key={item}>{item}</li>)}</ul>
            </section>
            <section id="evidence" aria-labelledby="evidence-title">
              <p className="eyebrow">06 / Evidence</p><h2 id="evidence-title">Follow the source.</h2>
              {study.sources.length ? <><p>These descriptions were reviewed against the linked source snapshot on {study.reviewedAt ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${study.reviewedAt}T00:00:00Z`)) : "the recorded review date"}. Repository code and documentation may evolve after this review.</p><ul className="case-study__sources">{study.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight aria-hidden="true" /></a></li>)}</ul></> : <p>This repository is private. This case study uses the portfolio’s approved project summary and assets; private code and implementation details are not published here.</p>}
            </section>
          </div>
        </div>
        <footer className="case-study__footer"><Link href="/#work"><ArrowLeft aria-hidden="true" />Explore more projects</Link><Link href="/#contact">Send me a message<ArrowUpRight aria-hidden="true" /></Link></footer>
      </main>
    </>
  );
}
