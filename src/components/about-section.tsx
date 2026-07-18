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
        eyebrow="A little about me"
        title="I care about the details behind the screen."
      />
      <div className="about-grid">
        <div className="about-copy">
          <ArrowDownRight aria-hidden="true" />
          <p>{body}</p>
          <p>{closing}</p>
        </div>
        <div className="principles-list">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
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
