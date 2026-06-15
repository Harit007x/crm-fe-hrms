import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Tone = "neutral" | "primary" | "green" | "orange" | "red" | "blue" | "purple";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  green: "bg-greenBackground text-green",
  orange: "bg-orangeBackground text-orange",
  red: "bg-redBackground text-red",
  blue: "bg-blueBackground text-blue",
  purple: "bg-purpleBackground text-purple",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  /** Icon tint. Stays neutral unless the metric itself carries meaning. */
  tone?: Tone;
  /** Optional up/down delta. Color is semantic (green up / red down). */
  trend?: { value: string; direction: "up" | "down" };
  href?: string;
  className?: string;
}

/**
 * One KPI tile, used everywhere a "big number" appears. Replaces the bespoke
 * Card+rainbow-icon blocks. Icon defaults to a quiet muted chip so the value —
 * not decoration — is the loudest thing (DESIGN.md "One Voice Rule").
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  trend,
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              toneStyles[tone]
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-bold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "mb-0.5 text-xs font-medium tabular-nums",
              trend.direction === "up" ? "text-green" : "text-red"
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );

  const base = cn(
    "rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors",
    href && "hover:border-foreground/15 hover:bg-accent/40",
    className
  );

  if (href) {
    return (
      <Link to={href} className={cn(base, "block")}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-7 w-16" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}
