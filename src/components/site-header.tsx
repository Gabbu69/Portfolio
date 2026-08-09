"use client";

import { Github, Menu, MoveUpRight } from "lucide-react";
import { useRef } from "react";

type NavigationItem = {
  label: string;
  jpLabel: string;
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
      <div className="site-header__inner">
        <a className="brand-mark" href="#top" aria-label="Back to top">
          <span className="brand-mark__initials">{initials}</span>
          <span className="brand-mark__copy">
            <strong>{name}</strong>
            <small>Portfolio / 2026</small>
          </span>
        </a>

        <nav className="nav-pill" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <a key={item.href} href={item.href}>
              <span className="nav-pill__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="nav-pill__jp" lang="ja">{item.jpLabel}</span>
              <strong>{item.label}</strong>
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

          <details className="mobile-menu" ref={mobileMenuRef}>
            <summary aria-label="Toggle navigation menu">
              <Menu aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation">
              {navigation.map((item, index) => (
                <a key={item.href} href={item.href} onClick={closeMobileMenu}>
                  <span className="mobile-menu__index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mobile-menu__jp" lang="ja">{item.jpLabel}</span>
                  <strong>{item.label}</strong>
                </a>
              ))}
              <a href={github} target="_blank" rel="noreferrer" onClick={closeMobileMenu}>
                <Github aria-hidden="true" />
                GitHub
                <MoveUpRight aria-hidden="true" />
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
