import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { Hero } from "@/components/hero";
import { MotionProvider } from "@/components/motion-provider";
import { OpeningSequence } from "@/components/opening-sequence";
import { ProjectShowcase } from "@/components/project-showcase";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { SkillKeyboard } from "@/components/skill-keyboard";
import { portfolio, projectCategories } from "@/data/portfolio";

const processSteps = [
  { jpLabel: "観察", label: "Observe" },
  { jpLabel: "設計", label: "Design" },
  { jpLabel: "構築", label: "Build" },
  { jpLabel: "検証", label: "Test" },
  { jpLabel: "改善", label: "Refine" },
] as const;

export default function Home() {
  return (
    <MotionProvider>
      <OpeningSequence initials={portfolio.identity.initials} name={portfolio.identity.fullName} />

      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        initials={portfolio.identity.initials}
        name={portfolio.identity.shortName}
        navigation={portfolio.navigation}
        github={portfolio.socials.github}
      />

      <main id="main-content">
        <Hero
          identity={portfolio.identity}
          projectCount={portfolio.projects.length + portfolio.archiveProjects.length}
          workflowCount={portfolio.experience.modules.length}
        />

        <div className="process-rail" aria-label="Gabriel's working process">
          <div className="process-rail__track">
            {[0, 1].map((copy) => (
              <div className="process-rail__set" aria-hidden={copy === 1} key={copy}>
                {processSteps.map((step, index) => (
                  <span className="process-rail__step" key={step.label}>
                    <span lang="ja">{step.jpLabel}</span>
                    <b>{step.label}</b>
                    <i>{String(index + 1).padStart(2, "0")}</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="page-section" id="work">
          <SectionHeading
            index="01"
            jpLabel="作品"
            eyebrow="Selected work"
            title="Built for real work."
            description={`${portfolio.projects.length} selected case studies plus ${portfolio.archiveProjects.length} recent GitHub builds across healthcare, research, agriculture, community tools, and connected systems.`}
          />
          <ProjectShowcase
            projects={portfolio.projects}
            archiveProjects={portfolio.archiveProjects}
            categories={projectCategories}
          />
        </section>

        <ExperienceSection experience={portfolio.experience} />

        <section className="page-section skills-section" id="skills">
          <SectionHeading
            index="03"
            jpLabel="技術"
            eyebrow="Toolkit"
            title="A stack with range."
            description="I choose the stack around the problem, but these are the technologies I keep coming back to."
          />
          <SkillKeyboard skills={portfolio.skills} />
        </section>

        <AboutSection {...portfolio.about} />
      </main>

      <ContactSection
        identity={portfolio.identity}
        contact={portfolio.contact}
        github={portfolio.socials.github}
      />
    </MotionProvider>
  );
}
