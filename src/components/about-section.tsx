import { ArrowDownRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

type Principle = { number: string; title: string; text: string };

type AboutSectionProps = {
  body: string;
  closing: string;
  principles: readonly Principle[];
};

export function AboutSection({ body, closing, principles }: AboutSectionProps) {
  return (
    <section className="page-section about-section" id="about">
      <SectionHeading
        index="04"
        eyebrow="About / approach"
        jpLabel="自己紹介"
        title="The screen is only half the work."
      />
      <div className="about-grid">
        <div className="about-copy">
          <ArrowDownRight className="about-copy__arrow" aria-hidden="true" />
          <p className="about-copy__lead">{body}</p>
          <p className="about-copy__closing">{closing}</p>
          <span className="about-copy__signature" aria-hidden="true">EGP / 2026</span>
        </div>
        <div className="principles-list" aria-label="Working principles">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span className="principles-list__number">{principle.number}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
