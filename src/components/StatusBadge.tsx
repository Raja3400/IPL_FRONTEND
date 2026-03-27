type StatusBadgeProps = {
  label: string;
};

export function StatusBadge({ label }: StatusBadgeProps) {
  return <span className="pill">{label}</span>;
}
