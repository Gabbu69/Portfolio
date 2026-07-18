import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { Hero } from "@/components/hero";
import { PointerAura } from "@/components/pointer-aura";
import { ProjectShowcase } from "@/components/project-showcase";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { SkillKeyboard } from "@/components/skill-keyboard";
import { portfolio, projectCategories } from "@/data/portfolio";

export default function Home() {
  return (
    <>
      <PointerAura />
      <SiteHeader
        initials={portfolio.identity.initials}
        navigation={portfolio.navigation}
        github={portfolio.socials.github}
      />

      <main className="site-shell">
        <Hero identity={portfolio.identity} />
        <ExperienceSection experience={portfolio.experience} />

        <section className="page-section" id="work">
          <SectionHeading
            index="02"
            eyebrow="Selected work"
            title="Built from problems I wanted to understand."
            description="Healthcare, agriculture, document capture, and connected systems — each project taught me a different part of the stack."
          />
          <ProjectShowcase projects={portfolio.projects} categories={projectCategories} />
        </section>

        <section className="page-section skills-section" id="skills">
          <SectionHeading
            index="03"
            eyebrow="Toolkit"
            title="The keys I reach for."
            description="Move across the keyboard to explore the technologies behind the projects."
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
    </>
  );
}
