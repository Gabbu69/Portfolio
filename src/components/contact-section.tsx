import { ArrowUp, ArrowUpRight, Github } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

type ContactSectionProps = {
  identity: { fullName: string; email: string };
  contact: { eyebrow: string; title: string; titleAccent: string; body: string };
  github: string;
};

export function ContactSection({ identity, contact, github }: ContactSectionProps) {
  return (
    <footer className="contact-section" id="contact">
      <div className="contact-section__inner">
        <div className="contact-section__heading">
          <div className="contact-section__label">
            <span>05</span>
            <div>
              <p className="eyebrow">{contact.eyebrow}</p>
            </div>
          </div>
          <p>{contact.body}</p>
        </div>

        <h2>
          <span>{contact.title}</span>
          <strong>{contact.titleAccent}</strong>
        </h2>

        <ContactForm email={identity.email} formId={process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID?.trim()} captchaSiteKey={process.env.NEXT_PUBLIC_FORMSPREE_RECAPTCHA_SITE_KEY?.trim()} />

        <div className="footer-row">
          <span>© 2026 {identity.fullName}</span>
          <a href={github} target="_blank" rel="noreferrer">
            <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="#top">Back to top <ArrowUp aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
