"use client";

import { Github, Menu, MoveUpRight } from "lucide-react";
import { useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type NavigationItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  initials: string;
  name: string;
  navigation: readonly NavigationItem[];
  github: string;
};

export function SiteHeader({ initials, name, navigation, github }: SiteHeaderProps) {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const closeMobileMenu = () => mobileMenuRef.current?.removeAttribute("open");

  return (
    <header className="site-header">
      <a className="brand-mark" href="#top" aria-label="Back to top">
        <span className="brand-mark__initials">{initials}</span>
        <span className="brand-mark__name">{name}</span>
      </a>

      <nav className="nav-pill" aria-label="Main navigation">
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
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

        <ThemeToggle />

        <details className="mobile-menu" ref={mobileMenuRef}>
          <summary aria-label="Toggle navigation menu">
            <Menu aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMobileMenu}>
                {item.label}
              </a>
            ))}
            <a href={github} target="_blank" rel="noreferrer" onClick={closeMobileMenu}>
              GitHub <MoveUpRight aria-hidden="true" />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
