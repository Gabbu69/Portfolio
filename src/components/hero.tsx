import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";

type HeroProps = {
  identity: {
    fullName: string;
    role: string;
    email: string;
    location: string;
    availability: string;
    headline: string;
    intro: string;
    portrait: string;
  };
};

export function Hero({ identity }: HeroProps) {
  const nameParts = identity.fullName.split(" ");
  const firstLine = nameParts.slice(0, 2).join(" ");
  const lastLine = nameParts.slice(2).join(" ");

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__copy">
        <div className="status-line">
          <span className="status-line__dot" aria-hidden="true" />
          {identity.availability}
        </div>

        <p className="hero__role">{identity.role}</p>
        <h1 id="hero-title">
          <span>{firstLine}</span>
          <span className="hero__surname">{lastLine}</span>
        </h1>

        <div className="hero__statement">
          <p className="hero__headline">{identity.headline}</p>
          <p className="hero__intro">{identity.intro}</p>
        </div>

        <div className="hero__actions">
          <a className="button button--primary" href={`mailto:${identity.email}`}>
            Start a conversation <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="button button--quiet" href="#work">
            Explore my work <ArrowDown aria-hidden="true" />
          </a>
        </div>

        <div className="hero__location">
          <MapPin aria-hidden="true" />
          <span>{identity.location}</span>
        </div>
      </div>

      <div className="hero__visual">
        <div className="portrait-frame">
          <div className="portrait-frame__label">
            <span>Based in Mindanao</span>
            <span>2026</span>
          </div>
          <Image
            src={identity.portrait}
            alt={`Portrait of ${identity.fullName}`}
            width={460}
            height={460}
            priority
            sizes="(max-width: 760px) 76vw, 38vw"
          />
          <span className="portrait-frame__corner portrait-frame__corner--one" aria-hidden="true" />
          <span className="portrait-frame__corner portrait-frame__corner--two" aria-hidden="true" />
        </div>

        <svg className="hero-wave" viewBox="0 0 680 200" role="img" aria-label="Abstract data waveform">
          <path className="hero-wave__ghost" d="M0 105C55 105 62 105 86 104C116 103 114 76 140 76C168 76 168 126 196 126C224 126 225 87 253 87C283 87 281 113 310 113C343 113 343 62 377 62C412 62 410 145 444 145C476 145 474 94 506 94C540 94 537 110 570 110C612 110 625 105 680 105" />
          <path className="hero-wave__line" d="M0 105C55 105 62 105 86 104C116 103 114 76 140 76C168 76 168 126 196 126C224 126 225 87 253 87C283 87 281 113 310 113C343 113 343 62 377 62C412 62 410 145 444 145C476 145 474 94 506 94C540 94 537 110 570 110C612 110 625 105 680 105" />
        </svg>

        <div className="hero__facts" aria-label="Portfolio highlights">
          <div><strong>05</strong><span>Selected projects</span></div>
          <div><strong>04</strong><span>OJT workflow areas</span></div>
          <div><strong>Full</strong><span>Stack perspective</span></div>
        </div>
      </div>

      <a className="scroll-cue" href="#experience" aria-label="Scroll to OJT experience">
        <span>Scroll to explore</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
