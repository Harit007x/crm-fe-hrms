import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/badge";

export type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

/**
 * One place that maps every domain status string to a semantic badge variant.
 * Status is meaning, never decoration (DESIGN.md "Status-Only Rule"). Pages
 * should call statusVariant() instead of re-deriving colors inline.
 *
 * blue = informational / in-progress · green = success / completed / paid
 * red = error / overdue / rejected · purple = special / pending review
 * orange = warning / on-hold / pending
 */
const STATUS_MAP: Record<string, BadgeVariant> = {
  // green — done / positive
  completed: "green",
  complete: "green",
  paid: "green",
  approved: "green",
  accepted: "green",
  active: "green",
  reimbursed: "green",
  done: "green",
  success: "green",
  open: "green",
  present: "green",

  // blue — in motion / informational
  "in progress": "blue",
  inprogress: "blue",
  ongoing: "blue",
  sent: "blue",
  processing: "blue",
  submitted: "blue",
  scheduled: "blue",

  // orange — waiting / caution
  pending: "orange",
  "on hold": "orange",
  onhold: "orange",
  "on-hold": "orange",
  draft: "orange",
  partial: "orange",
  "partially paid": "orange",
  late: "orange",
  "half day": "orange",
  "half-day": "orange",
  halfday: "orange",

  // red — failed / negative
  delayed: "red",
  overdue: "red",
  rejected: "red",
  cancelled: "red",
  canceled: "red",
  failed: "red",
  declined: "red",
  unpaid: "red",
  absent: "red",
  inactive: "red",

  // purple — special / review
  review: "purple",
  "pending review": "purple",
  "in review": "purple",
  archived: "purple",
  "on leave": "purple",
};

export function statusVariant(status?: string | null): BadgeVariant {
  if (!status) return "secondary";
  return STATUS_MAP[status.trim().toLowerCase()] ?? "secondary";
}
