import { Badge } from "@/components/ui/badge";
import { statusVariant } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * Renders a status string as a semantic pill. Pairs hue with the label text
 * so meaning survives color-blindness/grayscale (DESIGN.md "Color-Plus Rule").
 */
export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <Badge variant={statusVariant(status)} className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}
