import type { ReactNode } from "react";

export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={accent ? "stat stat--accent" : "stat"}>
      <div className="stat__label">{label}</div>
      <div className="stat__value stat__value--small">{value}</div>
      {hint ? <div className="muted">{hint}</div> : null}
    </div>
  );
}
