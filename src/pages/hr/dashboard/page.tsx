import { useEffect, useState, useCallback } from "react";
import { Icons } from "@/components/icons";
import { userService } from "@/services/user.service";
import { leaveService } from "@/services/leave.service";
import { holidayService } from "@/services/holiday.service";
import { attendanceService, type MonthlySummary, type AttendanceRecord } from "@/services/attendance.service";
import { taskService } from "@/services/task.service";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatTime(isoString: string | null): string {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getElapsedTime(punchIn: string): string {
  const diff = Date.now() - new Date(punchIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type EmployeeTask = {
  id: string;
  taskName: string;
  project: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | string;
  status: "To Do" | "In Progress" | "Completed" | string;
};

export default function HRDashboardPage() {
  const { user } = useAuthStore();
  
  // HR Stats
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
    upcomingHolidays: 0,
  });
  
  // Employee Stats (Personal)
  const [attendanceSummary, setAttendanceSummary] = useState<MonthlySummary | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [punchLoading, setPunchLoading] = useState(false);
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);

  const isPunchedIn = todayRecord && !todayRecord.punchOut;
  const isPunchedOut = todayRecord && todayRecord.punchOut;

  const fetchDashboardData = useCallback(async () => {
    try {
      const [users, leaves, holidays] = await Promise.all([
        userService.getAllUsers(),
        leaveService.getAllLeaves(),
        holidayService.getHolidays(),
      ]);

      const activeEmployees = users.filter((u) => u.role !== "CLIENT").length;
      const pending = leaves.filter((l) => l.status === "Pending").length;
      
      const now = new Date();
      const upcoming = holidays.filter((h) => new Date(h.date) >= now).length;

      setStats({
        employees: activeEmployees,
        pendingLeaves: pending,
        upcomingHolidays: upcoming,
      });
    } catch (error) {
      console.error("Error fetching HR dashboard data:", error);
    }
  }, []);

  const fetchTodayStatus = useCallback(async () => {
    try {
      const data = await attendanceService.getTodayStatus();
      setTodayRecord(data);
    } catch (error) {
      console.error("Failed to fetch today status:", error);
    }
  }, []);

  const fetchMonthlySummary = useCallback(async () => {
    try {
      const now = new Date();
      const data = await attendanceService.getMonthlyRecords(now.getFullYear(), now.getMonth() + 1);
      setAttendanceSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch monthly summary:", error);
    }
  }, []);

  const fetchEmployeeWork = useCallback(async () => {
    try {
      const tasks = await taskService.getAllTasks();

      const myTasks = tasks.filter((t) => t.assigneeId === user?.id).map((t) => {
        let mappedStatus = "To Do";
        if (t.status === "column-2") mappedStatus = "In Progress";
        if (t.status === "column-3") mappedStatus = "In Review";
        if (t.status === "column-4") mappedStatus = "Completed";
        
        return {
          id: t.id,
          taskName: t.content,
          project: t.project?.name || "No Project",
          dueDate: new Date().toISOString().split("T")[0],
          priority: t.priority,
          status: mappedStatus
        };
      });
      setEmployeeTasks(myTasks);
    } catch (error) {
      console.error("Failed to fetch employee work", error);
    }
  }, [user]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchTodayStatus(),
        fetchMonthlySummary(),
        fetchEmployeeWork()
      ]);
      setLoading(false);
    };
    loadAll();
  }, [fetchDashboardData, fetchTodayStatus, fetchMonthlySummary, fetchEmployeeWork]);

  // Live timer when punched in
  useEffect(() => {
    if (!isPunchedIn || !todayRecord) return;

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(todayRecord.punchIn));
    }, 1000);

    setElapsedTime(getElapsedTime(todayRecord.punchIn));

    return () => clearInterval(interval);
  }, [isPunchedIn, todayRecord]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      const record = await attendanceService.punchIn();
      setTodayRecord(record);
      toast.success("Punched in successfully! ⏰");
      fetchMonthlySummary();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to punch in";
      toast.error(msg);
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      const record = await attendanceService.punchOut();
      setTodayRecord(record);
      toast.success(`Punched out! Total: ${record.totalHours?.toFixed(2)} hours 🎉`);
      fetchMonthlySummary();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to punch out";
      toast.error(msg);
    } finally {
      setPunchLoading(false);
    }
  };

  const statusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Present": return "default";
      case "Late": return "secondary";
      case "Half-Day": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">HR Dashboard</h2>
        <p className="text-muted-foreground">Overview of human resources metrics and your personal tracking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Employees */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Employees</h3>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.employees}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Leave Requests</h3>
            <Icons.clipboardCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">Pending approvals</p>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Upcoming Holidays</h3>
            <Icons.calender className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.upcomingHolidays}</div>
            <p className="text-xs text-muted-foreground">In the future</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight pt-4">My Dashboard</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Punch Card */}
        <Card className="lg:col-span-1 rounded-xl border-border/50 shadow-sm overflow-hidden">
          <div className={`h-1.5 w-full ${isPunchedIn ? "bg-green-500 animate-pulse" : isPunchedOut ? "bg-blue-500" : "bg-muted"}`} />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.timer className="h-5 w-5 text-primary" />
              Today's Punch
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Live Timer */}
            {isPunchedIn && (
              <div className="text-center py-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Working Time</p>
                <p className="text-3xl font-mono font-bold tracking-wider text-primary">{elapsedTime}</p>
              </div>
            )}

            {isPunchedOut && todayRecord && (
              <div className="text-center py-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Hours Today</p>
                <p className="text-3xl font-mono font-bold tracking-wider text-green-600">
                  {todayRecord.totalHours?.toFixed(2)} hrs
                </p>
              </div>
            )}

            {!todayRecord && (
              <div className="text-center py-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">You haven't punched in yet today</p>
              </div>
            )}

            {/* Time Stamps */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Punch In</p>
                <p className="font-semibold text-base">{todayRecord ? formatTime(todayRecord.punchIn) : "--:--"}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Punch Out</p>
                <p className="font-semibold text-base">{todayRecord ? formatTime(todayRecord.punchOut) : "--:--"}</p>
              </div>
            </div>

            {/* Status */}
            {todayRecord && (
              <div className="flex items-center justify-center">
                <Badge
                  variant={statusBadgeVariant(todayRecord.status)}
                  className={`${todayRecord.status === "Present" ? "bg-green-500 hover:bg-green-600 text-white" : todayRecord.status === "Late" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : ""}`}
                >
                  {todayRecord.status}
                </Badge>
              </div>
            )}

            {/* Action Button */}
            {!todayRecord && (
              <Button onClick={handlePunchIn} disabled={punchLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {punchLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.circleCheck className="mr-2 h-4 w-4" />}
                Punch In
              </Button>
            )}

            {isPunchedIn && (
              <Button onClick={handlePunchOut} disabled={punchLoading} variant="destructive" className="w-full">
                {punchLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.circleX className="mr-2 h-4 w-4" />}
                Punch Out
              </Button>
            )}

            {isPunchedOut && (
              <Button disabled variant="outline" className="w-full">
                <Icons.circleCheckBig className="mr-2 h-4 w-4" />
                Completed for Today
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary Cards */}
        <Card className="lg:col-span-2 rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">My Monthly Summary</CardTitle>
            <CardDescription>
              {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()} attendance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceSummary?.totalDays || 0}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceSummary?.presentDays || 0}</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{attendanceSummary?.lateDays || 0}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Half-Day</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceSummary?.halfDays || 0}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{attendanceSummary?.totalHours?.toFixed(1) || 0}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Hrs/Day</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{attendanceSummary?.avgHoursPerDay?.toFixed(1) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks currently assigned to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employeeTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                <div>
                  <p className="text-sm font-medium">{task.taskName}</p>
                  <p className="text-xs text-muted-foreground">{task.project}</p>
                </div>
                <Badge variant={task.status === "Completed" ? "default" : task.status === "In Progress" ? "secondary" : "outline"}>
                  {task.status}
                </Badge>
              </div>
            ))}
            {employeeTasks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No tasks assigned to you.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
