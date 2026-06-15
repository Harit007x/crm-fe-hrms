import { APP_NAME } from "@/components/brand";

/**
 * The branded left panel shared across auth screens (login, signup, reset).
 * A quiet radial wash of the accent — not a flat indigo block — with a frosted
 * mark and a single line of copy. One place so the brand can never drift.
 */
export function AuthBrandPanel({
  headline,
  subline,
}: {
  headline: string;
  subline: string;
}) {
  return (
    <div className="bg-brand-spotlight relative hidden flex-col justify-between overflow-hidden p-12 text-primary-foreground lg:flex">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="relative flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-[7px] bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M7 7h10L7 17h10" />
          </svg>
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          {APP_NAME}
        </span>
      </div>

      <div className="relative max-w-md space-y-4">
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
          {headline}
        </h2>
        <p className="text-sm leading-relaxed text-primary-foreground/80">
          {subline}
        </p>
      </div>

      <p className="relative text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} {APP_NAME}. Enterprise CRM &amp; HRMS.
      </p>
    </div>
  );
}
