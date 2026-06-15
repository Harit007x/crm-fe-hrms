import { cn } from "@/lib/utils";

/** Single source of truth for the product's name. */
export const APP_NAME = "Zynetz";

const sizes = {
  sm: { box: "size-6", glyph: "size-3.5", text: "text-sm" },
  md: { box: "size-7", glyph: "size-4", text: "text-base" },
  lg: { box: "size-9", glyph: "size-5", text: "text-lg" },
} as const;

/**
 * The Zynetz mark — a crisp geometric "Z" cut from a rounded indigo tile.
 * Tile carries the accent; glyph is the accent's foreground so it reads in
 * light and dark without recoloring. No drop-glow, no gradient text.
 */
export function LogoMark({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const s = sizes[size];
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[7px] bg-primary text-primary-foreground shadow-sm",
        s.box,
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={s.glyph}
      >
        <path d="M7 7h10L7 17h10" />
      </svg>
    </div>
  );
}

/** Full lockup: mark + wordmark. Use `withText={false}` for the icon alone. */
export function Logo({
  size = "md",
  withText = true,
  className,
  textClassName,
}: {
  size?: keyof typeof sizes;
  withText?: boolean;
  className?: string;
  textClassName?: string;
}) {
  const s = sizes[size];
  return (
    <span className={cn("flex select-none items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            s.text,
            textClassName
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
