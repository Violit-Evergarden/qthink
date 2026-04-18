interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

const styles = {
  info: "border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  warning: "border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  tip: "border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200",
};

const icons = {
  info: "\u2139\uFE0F",
  warning: "\u26A0\uFE0F",
  tip: "\uD83D\uDCA1",
};

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div className={`my-6 rounded-xl border-l-4 p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <span className="text-lg leading-7">{icons[type]}</span>
        <div className="prose-sm flex-1">{children}</div>
      </div>
    </div>
  );
}
