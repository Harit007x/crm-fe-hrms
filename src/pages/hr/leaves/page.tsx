import { useState, useEffect, useMemo } from "react";
import { leaveService, type LeaveRecord } from "@/services/leave.service";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/table-skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Button size="sm" variant="outline" className="text-green hover:bg-greenBackground hover:text-green" onClick={() => handleUpdate("Approved")} disabled={loading}>
        <Icons.check className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleUpdate("Rejected")} disabled={loading}>
        <Icons.x className="w-4 h-4 mr-1" /> Reject
      </Button>
    </div>
  );
};

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleResetFilters = () => {
    setSearchName("");
    setLeaveTypeFilter("All");
    setStatusFilter("All");
  };

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

  const filteredLeaves = useMemo(() => {
    let result = leaves;

    if (searchName) {
      result = result.filter((leave) =>
        leave.user?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (leaveTypeFilter !== "All") {
      result = result.filter((leave) => leave.leaveType === leaveTypeFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter((leave) => leave.status === statusFilter);
    }

    return result;
  }, [leaves, searchName, leaveTypeFilter, statusFilter]);

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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
      cell: ({ row }) => <ActionCell row={row} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />,
    }
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals"
        description="Manage and review employee leave requests."
      />

      <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label className="text-xs text-muted-foreground">Search Employee</Label>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="w-[180px] space-y-1">
            <Label className="text-xs text-muted-foreground">Leave Category</Label>
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px] space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredLeaves}
            gridCount={filteredLeaves.length}
          />
        )}
      </div>
    </div>
  );
}
