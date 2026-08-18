import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TenantApplication } from "@/lib/tenantApi";

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function statusPresentation(status: TenantApplication["status"]) {
  switch (status) {
    case "pending":
      return { label: "Pending", variant: "default" as const };
    case "approved":
      return { label: "Approved", variant: "secondary" as const };
    case "rejected":
      return { label: "Rejected", variant: "destructive" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "outline" as const };
  }
}

export function ApplicationsTable({
  applications,
}: {
  applications: TenantApplication[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Application</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const status = statusPresentation(app.status);
          return (
            <TableRow key={app.applicationId}>
              <TableCell className="font-mono font-bold">
                {app.applicationId}
              </TableCell>
              <TableCell>
                <div className="font-bold text-foreground">
                  {app.propertyTitle ?? `Property #${app.propertyId}`}
                </div>
                {app.propertyLocation && (
                  <div className="text-xs text-muted-foreground">
                    {app.propertyLocation}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
                {app.status === "rejected" && app.rejectionReason && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {app.rejectionReason}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(app.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
