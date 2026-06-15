import { useState, useEffect, useMemo } from "react";
import { attendanceService, type AttendanceRecord } from "@/services/attendance.service";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/table-skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import IconWrapper from "@/components/icons-wrapper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";

const ActionCell = ({ row, onRefresh }: { row: any, onRefresh: () => void }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await attendanceService.deleteAttendance(row.original.id);
      toast.success("Attendance record deleted successfully");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete attendance");
    }
  };

  return (
    <div className="w-fit flex gap-1">
      <IconWrapper
        className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Icons.trash className="h-4 w-4" />
      </IconWrapper>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function HRAttendancePage() {
  const [date, setDate] = useState<string>("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendances = async (selectedDate: string) => {
    setLoading(true);
    try {
      const data = await attendanceService.getAllAttendances(selectedDate);
      setRecords(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch attendances");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchAttendances(date);

  useEffect(() => {
    fetchAttendances(date);
  }, [date]);

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(() => [
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
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => {
        if (!row.original.date) return "-";
        return format(new Date(row.original.date), "MMM dd, yyyy");
      },
    },
    {
      header: "Punch In",
      accessorKey: "punchIn",
      cell: ({ row }) => {
        if (!row.original.punchIn) return "-";
        return format(new Date(row.original.punchIn), "hh:mm a");
      },
    },
    {
      header: "Punch Out",
      accessorKey: "punchOut",
      cell: ({ row }) => {
        if (!row.original.punchOut) return "-";
        return format(new Date(row.original.punchOut), "hh:mm a");
      },
    },
    {
      header: "Total Hours",
      accessorKey: "totalHours",
      cell: ({ row }) => row.original.totalHours ? `${row.original.totalHours} hrs` : "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: ({ row }) => <span className="text-sm truncate max-w-[200px] block">{row.original.notes || "-"}</span>,
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
      cell: ({ row }) => <ActionCell row={row} onRefresh={handleRefresh} />,
    }
  ], [date]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="View daily employee punch-in and punch-out records."
        actions={
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <DataTable
            columns={columns}
            data={records}
            gridCount={records.length}
          />
        )}
      </div>
    </div>
  );
}
