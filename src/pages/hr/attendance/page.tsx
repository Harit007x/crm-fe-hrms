import { useState, useEffect, useMemo } from "react";
import { attendanceService, type AttendanceRecord } from "@/services/attendance.service";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
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
        className="cursor-pointer text-red hover:fill-redBackground hover:bg-redBackground"
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
            <AlertDialogAction onClick={handleDelete} className="bg-red hover:bg-red/90 text-white">
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
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "green" | "red" | "orange" = "green";
        if (status === "Late") variant = "orange";
        if (status === "Half-Day") variant = "red";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">View daily employee punch-in and punch-out records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-auto"
          />
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
            data={records}
            gridCount={records.length}
          />
        )}
      </div>
    </div>
  );
}
