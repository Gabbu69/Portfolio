import { ArrowUpRight, Github, Mail } from "lucide-react";

type ContactSectionProps = {
  identity: { fullName: string; email: string; location: string };
  contact: { eyebrow: string; title: string; body: string };
  github: string;
};

export function ContactSection({ identity, contact, github }: ContactSectionProps) {
  return (
    <footer className="contact-section" id="contact">
      <div className="contact-section__inner">
        <div className="contact-section__heading">
          <div className="contact-section__label">
            <span>05</span>
            <p className="eyebrow">{contact.eyebrow}</p>
          </div>
          <p>{contact.body}</p>
        </div>

        <h2>
          <span>Have something</span>
          <strong>useful in mind?</strong>
        </h2>

        <a className="contact-email" href={`mailto:${identity.email}`}>
          <Mail aria-hidden="true" />
          <span>{identity.email}</span>
          <ArrowUpRight aria-hidden="true" />
        </a>

        <div className="footer-row">
          <span>© 2026 {identity.fullName}</span>
          <span>{identity.location}</span>
          <a href={github} target="_blank" rel="noreferrer">
            <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
