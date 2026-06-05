import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { leaveService, type LeaveRecord } from "@/services/leave.service";

export default function LeaveApplyPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Fetch user's leave applications on mount
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await leaveService.getMyLeaves();
        setLeaves(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load leave applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  // Leave allocation totals per type
  const LEAVE_TOTALS: Record<string, number> = {
    "Annual Leave": 15,
    "Sick Leave": 10,
    "Casual Leave": 7,
  };

  // Compute balance stats from real leave data
  const leaveStats = useMemo(() => {
    const compute = (type: string) => {
      const typeLeaves = leaves.filter((l) => l.leaveType === type);
      const approvedDays = typeLeaves
        .filter((l) => l.status === "Approved")
        .reduce((sum, l) => sum + l.duration, 0);
      const pendingDays = typeLeaves
        .filter((l) => l.status === "Pending")
        .reduce((sum, l) => sum + l.duration, 0);
      const rejectedDays = typeLeaves
        .filter((l) => l.status === "Rejected")
        .reduce((sum, l) => sum + l.duration, 0);
      const total = LEAVE_TOTALS[type] ?? 0;
      const remaining = Math.max(0, total - approvedDays);
      return { total, approvedDays, pendingDays, rejectedDays, remaining };
    };
    return {
      annual: compute("Annual Leave"),
      sick: compute("Sick Leave"),
      casual: compute("Casual Leave"),
    };
  }, [leaves]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    setSubmitting(true);
    try {
      const newLeave = await leaveService.applyLeave({ leaveType, startDate, endDate, reason });
      setLeaves([newLeave, ...leaves]);
      toast.success("Leave application submitted successfully for review!");
      setOpenCreate(false);

      // Reset form
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit leave application.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<LeaveRecord>[]>(() => [
    {
      accessorKey: "id",
      header: "Request ID",
      cell: ({ row }) => <span className="font-semibold text-xs">{row.original.id.slice(-6).toUpperCase()}</span>
    },
    {
      accessorKey: "leaveType",
      header: "Leave Type",
    },
    {
      id: "dates",
      header: "Duration Dates",
      cell: ({ row }) => {
        const { startDate, endDate, duration } = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{startDate} to {endDate}</span>
            <span className="text-xs text-muted-foreground">{duration} {duration === 1 ? 'day' : 'days'}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] block" title={row.original.reason}>
          {row.original.reason}
        </span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";

        if (status === "Approved") variant = "default";
        if (status === "Rejected") variant = "destructive";
        if (status === "Pending") variant = "secondary";

        return (
          <Badge
            variant={variant}
            className={
              status === "Approved"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : status === "Pending"
                ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                : ""
            }
          >
            {status}
          </Badge>
        );
      },
    },
  ], []);

  return (
    <div className="flex flex-col space-y-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Applications</h2>
          <p className="text-muted-foreground text-sm">Apply for leaves and track your approval status.</p>
        </div>

        <Sheet open={openCreate} onOpenChange={setOpenCreate}>
          <SheetTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Apply for Leave</SheetTitle>
              <SheetDescription>Fill in your details and submit for approval.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type <span className="text-red-500">*</span></Label>
                <Select value={leaveType} onValueChange={setLeaveType} required>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select type of leave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual Leave">Annual Leave (Vacation)</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave <span className="text-red-500">*</span></Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you are taking leave..."
                  className="min-h-[100px]"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <SheetFooter className="mt-8 pt-4 border-t flex-row justify-end space-x-2">
                <SheetClose asChild>
                  <Button variant="outline" type="button" disabled={submitting}>Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave Balance</CardTitle>
            <Icons.sun className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.annual.remaining} / {leaveStats.annual.total}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.annual.approvedDays} day{leaveStats.annual.approvedDays !== 1 ? 's' : ''} approved
              {leaveStats.annual.pendingDays > 0 && `, ${leaveStats.annual.pendingDays} pending`}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave Balance</CardTitle>
            <Icons.help className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.sick.remaining} / {leaveStats.sick.total}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.sick.approvedDays} day{leaveStats.sick.approvedDays !== 1 ? 's' : ''} approved
              {leaveStats.sick.pendingDays > 0 && `, ${leaveStats.sick.pendingDays} pending`}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casual Leave Balance</CardTitle>
            <Icons.calender className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.casual.remaining} / {leaveStats.casual.total}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.casual.approvedDays} day{leaveStats.casual.approvedDays !== 1 ? 's' : ''} approved
              {leaveStats.casual.pendingDays > 0 && `, ${leaveStats.casual.pendingDays} pending`}
              {leaveStats.casual.rejectedDays > 0 && `, ${leaveStats.casual.rejectedDays} rejected`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Table */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            Loading leave applications...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={leaves}
            gridCount={leaves.length}
            toolbar={true}
            searchKey="leaveType"
          />
        )}
      </div>
    </div>
  );
}
