import Image from "next/image";
import { Building2, CalendarDays, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

type ExperienceSectionProps = {
  experience: {
    organization: string;
    shortOrganization: string;
    role: string;
    period: string;
    summary: string;
    privacyNote: string;
    logo: string;
    modules: readonly string[];
  };
};

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section className="page-section" id="experience">
      <SectionHeading
        index="02"
        eyebrow="Experience / OJT"
        title="Learning from the people doing the work."
        description="At USM Hospital, I explored how small software tools could reduce repetitive encoding and make routine information easier to review."
      />

      <article className="experience-card">
        <div className="experience-card__identity">
          <div className="experience-card__logo">
            <Image
              src={experience.logo}
              alt="USM Hospital logo"
              width={160}
              height={160}
              sizes="112px"
            />
          </div>
          <div>
            <p className="eyebrow">{experience.role}</p>
            <h3>{experience.organization}</h3>
            <div className="experience-card__meta">
              <span><Building2 aria-hidden="true" />{experience.shortOrganization}</span>
              <span><CalendarDays aria-hidden="true" />{experience.period}</span>
            </div>
          </div>
        </div>

        <div className="experience-card__body">
          <p>{experience.summary}</p>
          <div className="module-list" aria-label="OJT workflow areas">
            {experience.modules.map((module, index) => (
              <div key={module}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{module}</strong>
              </div>
            ))}
          </div>
          <p className="privacy-note">
            <ShieldCheck aria-hidden="true" />
            <span>{experience.privacyNote}</span>
          </p>
        </div>
      </article>
    </section>
  );
}
