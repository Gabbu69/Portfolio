"use client";

import Image from "next/image";
import { ArrowUpRight, Download, Expand, Trophy, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { SectionHeading } from "@/components/section-heading";
import { credentials, type Credential } from "@/data/credentials";
import styles from "./credentials-section.module.css";

export function CredentialsSection() {
  const featured = credentials.find((credential) => credential.featured);
  const collection = credentials.filter((credential) => credential.id !== featured?.id);
  const years = credentials.map((credential) => credential.date.slice(0, 4)).sort();
  const yearRange = years[0] === years.at(-1) ? years[0] : `${years[0]}–${years.at(-1)}`;
  const [selected, setSelected] = useState<Credential | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  const id = useId();

  useEffect(() => () => restoreScroll.current?.(), []);

  function openCredential(credential: Credential, trigger: HTMLButtonElement) {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    triggerRef.current = trigger;
    setSelected(credential);
    const { overflow, paddingRight } = document.body.style;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(document.body).paddingRight);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${padding + gutter}px`;
    restoreScroll.current = () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      restoreScroll.current = null;
    };
    dialog.showModal();
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    // Keep the global project shortcut from opening a second modal above this one.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]"));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <section className={`page-section ${styles.section}`} id="credentials" aria-label="Certificates and recognition">
      <SectionHeading
        index="04"
        eyebrow="Certificates & recognition"
        title="Always a student."
        description="Learning beyond the build, through courses, competitions, workshops, and community."
      />

      <div className={styles.collectionMeta}>
        <span>Selected milestones / {yearRange}</span>
        <span>{String(credentials.length).padStart(2, "0")} in the collection</span>
      </div>

      {featured ? (
        <article className={styles.featured}>
          <div className={styles.featuredCopy}>
            <p className={styles.featuredLabel}><Trophy aria-hidden="true" /> {featured.kind}</p>
            {featured.distinction ? <div className={styles.place} aria-hidden="true">{featured.distinction.value}<span>{featured.distinction.suffix}</span><small>{featured.distinction.label}</small></div> : null}
            <h3>{featured.title}</h3>
            <p className={styles.featuredSummary}>{featured.issuer}</p>
            <div className={styles.featuredFooter}>
              <time dateTime={featured.date}>{featured.dateLabel}</time>
              <button type="button" onClick={(event) => openCredential(featured, event.currentTarget)} aria-haspopup="dialog" aria-controls={`${id}-dialog`}>
                View certificate <ArrowUpRight aria-hidden="true" />
                <span className="sr-only">: {featured.title}</span>
              </button>
            </div>
          </div>
          <button className={styles.featuredImage} type="button" onClick={(event) => openCredential(featured, event.currentTarget)} aria-label={`Preview certificate: ${featured.title}`} aria-haspopup="dialog" aria-controls={`${id}-dialog`}>
            <Image src={featured.image} alt={featured.imageAlt} fill sizes="(max-width: 700px) 90vw, 50vw" />
            <span className={styles.expand}><Expand aria-hidden="true" /><span className="sr-only">Enlarge</span></span>
          </button>
        </article>
      ) : null}

      <div className={styles.grid}>
        {collection.map((credential, index) => (
          <article className={styles.card} key={credential.id}>
            <button className={styles.thumbnail} type="button" onClick={(event) => openCredential(credential, event.currentTarget)} aria-label={`Preview certificate: ${credential.title}`} aria-haspopup="dialog" aria-controls={`${id}-dialog`}>
              <Image src={credential.image} alt={credential.imageAlt} fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 570px" />
              <span className={styles.expand}><Expand aria-hidden="true" /><span className="sr-only">Enlarge</span></span>
            </button>
            <div className={styles.cardCopy}>
              <div className={styles.cardMeta}><span>{credential.kind}</span><time dateTime={credential.date}>{credential.dateLabel}</time></div>
              <h3>{credential.title}</h3>
              <p className={styles.issuer}>{credential.issuer}</p>
              <p className={styles.summary}>{credential.description}</p>
              <div className={styles.cardFooter}>
                <span aria-hidden="true">{String(index + (featured ? 2 : 1)).padStart(2, "0")} / EGP</span>
                <button type="button" onClick={(event) => openCredential(credential, event.currentTarget)} aria-haspopup="dialog" aria-controls={`${id}-dialog`}>
                  View certificate <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only">: {credential.title}</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className={styles.collectionNote}><span aria-hidden="true" />A growing collection. More milestones will find their place here.</p>

      <dialog ref={dialogRef} id={`${id}-dialog`} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={selected ? `${id}-description` : undefined} onKeyDown={containFocus} onClose={() => {
        restoreScroll.current?.();
        triggerRef.current?.focus({ preventScroll: true });
      }} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialogRef.current?.close();
      }}>
        <header className={styles.dialogHeader}>
          <div><p className="eyebrow">The certificate collection</p><h2 id={`${id}-title`}>{selected?.title ?? "Certificate preview"}</h2></div>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()} aria-label="Close certificate preview"><X aria-hidden="true" /></button>
        </header>
        {selected ? (
          <div className={styles.dialogBody}>
            <div className={styles.document}><Image src={selected.image} alt={selected.imageAlt} fill sizes="(max-width: 800px) 94vw, 70vw" unoptimized /></div>
            <div className={styles.details}>
              <span className={styles.detailKind}>{selected.kind}</span>
              <p id={`${id}-description`}>{selected.description}</p>
              <dl><div><dt>Issued by</dt><dd>{selected.issuer}</dd></div><div><dt>Certificate date</dt><dd><time dateTime={selected.date}>{selected.dateLabel}</time></dd></div></dl>
              <a className={styles.originalLink} href={selected.original} target="_blank" rel="noreferrer">Open original <span>{selected.format}</span><ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
              <a className={styles.download} href={selected.original} download><Download aria-hidden="true" />Download certificate</a>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
