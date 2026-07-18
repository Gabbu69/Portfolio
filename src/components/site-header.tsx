import { Github, Menu, MoveUpRight } from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  initials: string;
  navigation: readonly NavigationItem[];
  github: string;
};

export function SiteHeader({ initials, navigation, github }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand-mark" href="#top" aria-label="Back to top">
        <span>{initials}</span>
        <i aria-hidden="true" />
      </a>

      <nav className="nav-pill" aria-label="Main navigation">
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a
        className="header-github"
        href={github}
        target="_blank"
        rel="noreferrer"
        aria-label="Open Gabriel's GitHub profile"
      >
        <Github aria-hidden="true" />
        <span>GitHub</span>
        <MoveUpRight aria-hidden="true" />
      </a>

      <details className="mobile-menu">
        <summary aria-label="Open navigation menu">
          <Menu aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href={github} target="_blank" rel="noreferrer">
            GitHub <MoveUpRight aria-hidden="true" />
          </a>
        </nav>
      </details>
    </header>
  );
}
