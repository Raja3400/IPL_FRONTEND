import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="stack stack--tight">
      {actions ? <div className="cta-row">{actions}</div> : null}
      {eyebrow ? <p className="pill">{eyebrow}</p> : null}
      <div className="stack stack--tight">
        <h1 className="page-title">{title}</h1>
        {description ? <p className="muted">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
