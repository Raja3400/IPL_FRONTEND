import type { ReactNode } from "react";

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <section className="card empty-state">
      <h2 className="section-title">{title}</h2>
      <p className="muted">{message}</p>
      {action}
    </section>
  );
}
