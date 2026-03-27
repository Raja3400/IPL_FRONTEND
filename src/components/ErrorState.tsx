import type { ReactNode } from "react";

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <section className="card stack">
      <p className="error-text">{message}</p>
      {action}
    </section>
  );
}
