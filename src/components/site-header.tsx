"use client";

import { Github, Menu, MoveUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [activeSection, setActiveSection] = useState("#top");
  const closeMobileMenu = () => mobileMenuRef.current?.removeAttribute("open");

  useEffect(() => {
    const menu = mobileMenuRef.current;
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu?.open) {
        menu.removeAttribute("open");
        menu.querySelector("summary")?.focus();
      }
    };
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu?.contains(event.target)) closeMobileMenu();
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
      }
    }, { rootMargin: "-15% 0px -65% 0px" });
    for (const href of ["#top", ...navigation.map((item) => item.href)]) {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    }
    document.addEventListener("keydown", dismissOnEscape);
    document.addEventListener("pointerdown", dismissOutside);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", dismissOnEscape);
      document.removeEventListener("pointerdown", dismissOutside);
    };
  }, [navigation]);

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
            <a key={item.href} href={item.href} aria-current={activeSection === item.href ? "location" : undefined}>
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
                <a key={item.href} href={item.href} aria-current={activeSection === item.href ? "location" : undefined} onClick={(event) => {
                  closeMobileMenu();
                  const target = document.querySelector<HTMLElement>(event.currentTarget.hash);
                  target?.setAttribute("tabindex", "-1");
                  target?.focus({ preventScroll: true });
                }}>
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
