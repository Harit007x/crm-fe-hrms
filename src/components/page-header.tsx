import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The single page-title pattern for every route. Replaces the ad-hoc
 * `text-2xl font-bold` + arbitrary muted description that drifted page to page.
 * Title uses the Headline role (Manrope 700); description is Muted Ink at the
 * readable end of the ramp.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
