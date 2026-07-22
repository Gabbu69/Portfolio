import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { Hero } from "@/components/hero";
import { MotionProvider } from "@/components/motion-provider";
import { PointerAura } from "@/components/pointer-aura";
import { ProjectShowcase } from "@/components/project-showcase";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { SkillKeyboard } from "@/components/skill-keyboard";
import { portfolio, projectCategories } from "@/data/portfolio";

export default function Home() {
  return (
    <MotionProvider>
      <PointerAura />
      <SiteHeader
        initials={portfolio.identity.initials}
        name={portfolio.identity.shortName}
        navigation={portfolio.navigation}
        github={portfolio.socials.github}
      />

      <main className="site-shell">
        <Hero
          identity={portfolio.identity}
          projectCount={portfolio.projects.length}
          workflowCount={portfolio.experience.modules.length}
        />

        <div className="process-rail" aria-label="Gabriel's working process">
          <div className="process-rail__track">
            {[0, 1].map((copy) => (
              <div className="process-rail__set" aria-hidden={copy === 1} key={copy}>
                <span>Observe the workflow</span><i>01</i>
                <span>Sketch the simplest path</span><i>02</i>
                <span>Build both sides</span><i>03</i>
                <span>Test with real context</span><i>04</i>
                <span>Refine what matters</span><i>05</i>
              </div>
            ))}
          </div>
        </div>

        <section className="page-section" id="work">
          <SectionHeading
            index="01"
            eyebrow="Selected work"
            title="A few things I’ve built and learned from."
            description={`${portfolio.projects.length} practical projects across healthcare, agriculture, community tools, and connected systems. Each one started with a specific workflow to improve.`}
          />
          <ProjectShowcase projects={portfolio.projects} categories={projectCategories} />
        </section>

        <ExperienceSection experience={portfolio.experience} />

        <section className="page-section skills-section" id="skills">
          <SectionHeading
            index="03"
            eyebrow="Toolkit"
            title="Tools I’m comfortable working with."
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
