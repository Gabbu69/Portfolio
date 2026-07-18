type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div className="section-heading__marker" aria-hidden="true">
        <span>{index}</span>
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description ? <p className="section-heading__description">{description}</p> : null}
      </div>
    </header>
  );
}
