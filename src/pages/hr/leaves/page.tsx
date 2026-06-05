import { useState, useEffect, useMemo } from "react";
import { leaveService, type LeaveRecord } from "@/services/leave.service";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { format } from "date-fns";

const ActionCell = ({ row, onRefresh }: { row: any, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  
  const handleUpdate = async (status: "Approved" | "Rejected") => {
    setLoading(true);
    try {
      await leaveService.updateLeaveStatus(row.original.id, status);
      toast.success(`Leave request ${status.toLowerCase()}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update status`);
    } finally {
      setLoading(false);
    }
  };

  if (row.original.status !== "Pending") {
    return <span className="text-muted-foreground text-sm">Actioned</span>;
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdate("Approved")} disabled={loading}>
        <Icons.check className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdate("Rejected")} disabled={loading}>
        <Icons.x className="w-4 h-4 mr-1" /> Reject
      </Button>
    </div>
  );
};

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getAllLeaves();
      setLeaves(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [refreshTrigger]);

  const columns = useMemo<ColumnDef<LeaveRecord>[]>(() => [
    {
      header: "Employee",
      accessorKey: "user.name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.user?.name || "Unknown"}</span>
          <span className="text-xs text-muted-foreground">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      header: "Leave Type",
      accessorKey: "leaveType",
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.duration} Days</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.original.startDate), "MMM dd")} - {format(new Date(row.original.endDate), "MMM dd")}
          </span>
        </div>
      )
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: ({ row }) => <span className="text-sm truncate max-w-[200px] block">{row.original.reason || "-"}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "blue" | "green" | "red" = "blue";
        if (status === "Approved") variant = "green";
        if (status === "Rejected") variant = "red";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
      cell: ({ row }) => <ActionCell row={row} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />,
    }
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Approvals</h2>
          <p className="text-muted-foreground">Manage and review employee leave requests.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={leaves}
            gridCount={leaves.length}
          />
        )}
      </div>
    </div>
  );
}
