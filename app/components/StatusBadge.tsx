"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "success"
      | "warning";
  }
> = {
  pending: { label: "Pending", variant: "outline" },
  scheduled: { label: "Scheduled", variant: "default" },
  in_progress: { label: "In Progress", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  missed: { label: "Missed", variant: "warning" },
  investigating: { label: "Investigating", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
