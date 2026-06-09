import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Icons } from "@/components/icons";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import { attendanceService, type MonthlySummary, type AttendanceRecord } from "@/services/attendance.service";
import { leaveService, type LeaveRecord } from "@/services/leave.service";
import { expenseService, type Expense } from "@/services/expense.service";
import { taskService } from "@/services/task.service";
import { dailyReportService } from "@/services/dailyReport.service";
import { holidayService, type Holiday } from "@/services/holiday.service";
import { format } from "date-fns";

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

const hoursChartConfig = {
  hours: {
    label: "Hours Worked",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type EmployeeTask = {
  id: string;
  taskName: string;
  project: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | string;
  status: "To Do" | "In Progress" | "Completed" | string;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [attendanceSummary, setAttendanceSummary] = useState<MonthlySummary | null>(null);

  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [punchLoading, setPunchLoading] = useState(false);
  const [myLeaves, setMyLeaves] = useState<LeaveRecord[]>([]);
  const [, setMyExpenses] = useState<Expense[]>([]);
  const [holidaysList, setHolidaysList] = useState<Holiday[]>([]);
  const [hrEvents, setHrEvents] = useState<{
    id: string;
    type: "Leave" | "Expense";
    title: string;
    date: string;
    status: string;
    description: string;
    color: string;
    link: string;
  }[]>([]);
  
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTask[]>([]);
  const [workHoursData, setWorkHoursData] = useState<{day: string, hours: number}[]>([
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
  ]);

  const isPunchedIn = todayRecord && !todayRecord.punchOut;
  const isPunchedOut = todayRecord && todayRecord.punchOut;

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

  const fetchEmployeeUpdates = useCallback(async () => {
    try {
      const [leaveRecords, expenseRecords, holidays] = await Promise.all([
        leaveService.getMyLeaves(),
        expenseService.getAllExpenses(),
        holidayService.getHolidays(),
      ]);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= now);
      setHolidaysList(upcomingHolidays);

      const filteredExpenses = expenseRecords.filter((expense) => {
        if (!user) return true;
        return expense.submittedById === user.id || expense.submittedBy?.id === user.id;
      });

      setMyLeaves(leaveRecords);
      setMyExpenses(filteredExpenses);

      const events = [
        ...leaveRecords.map((leave) => ({
          id: `leave-${leave.id}`,
          type: "Leave" as const,
          title: `${leave.leaveType} Leave`,
          date: leave.startDate,
          status: leave.status,
          description: `${leave.duration} day(s) • ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}`,
          color: leave.status === "Approved" ? "bg-emerald-500" : leave.status === "Rejected" ? "bg-rose-500" : "bg-amber-500",
          link: "/admin/leave-apply",
        })),
        ...filteredExpenses.map((expense) => ({
          id: `expense-${expense.id}`,
          type: "Expense" as const,
          title: `${expense.category} Expense`,
          date: expense.date,
          status: expense.status,
          description: `$${expense.amount.toFixed(2)} • ${expense.description}`,
          color: expense.status === "Approved" ? "bg-emerald-500" : expense.status === "Rejected" ? "bg-rose-500" : "bg-amber-500",
          link: "/admin/expenses",
        })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setHrEvents(events);
    } catch (error) {
      console.error("Failed to fetch employee updates:", error);
    }
  }, [user]);

  const fetchEmployeeWork = useCallback(async () => {
    try {
      const [tasks, reports] = await Promise.all([
        taskService.getAllTasks(),
        dailyReportService.getMyReports(),
      ]);

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

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const hoursMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      
      reports.forEach(report => {
        const date = new Date(report.date);
        const dayName = days[date.getDay()];
        if (hoursMap[dayName as keyof typeof hoursMap] !== undefined) {
           hoursMap[dayName as keyof typeof hoursMap] += report.hours;
        }
      });

      setWorkHoursData([
        { day: "Mon", hours: hoursMap["Mon"] },
        { day: "Tue", hours: hoursMap["Tue"] },
        { day: "Wed", hours: hoursMap["Wed"] },
        { day: "Thu", hours: hoursMap["Thu"] },
        { day: "Fri", hours: hoursMap["Fri"] },
      ]);
    } catch (error) {
      console.error("Failed to fetch employee work", error);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayStatus();
    fetchMonthlySummary();
    fetchEmployeeUpdates();
    fetchEmployeeWork();
  }, [fetchTodayStatus, fetchMonthlySummary, fetchEmployeeUpdates, fetchEmployeeWork]);

  // Live timer when punched in
  useEffect(() => {
    if (!isPunchedIn || !todayRecord) return;

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(todayRecord.punchIn));
    }, 1000);

    setElapsedTime(getElapsedTime(todayRecord.punchIn));

    return () => clearInterval(interval);
  }, [isPunchedIn, todayRecord]);

  const upcomingEvents = useMemo(
    () => hrEvents.filter((event) => new Date(event.date).getTime() >= new Date().setHours(0, 0, 0, 0)),
    [hrEvents]
  );

  const pendingApprovals = useMemo(
    () => hrEvents.filter((event) => event.status === "Pending").length,
    [hrEvents]
  );

  const leaveCount = useMemo(() => myLeaves.length, [myLeaves]);

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

  return (
    <div className="flex-col align-start space-y-4 h-full">
      <div className="flex">
        <h2 className="inline-block text-2xl justify-self-start font-bold tracking-tight">
          Employee Dashboard
        </h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Leaves</CardTitle>
            <Icons.calender className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveCount}</div>
            <p className="text-xs text-muted-foreground">Active leave requests</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Icons.warning className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Leave & expense updates waiting for review</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logged Hours</CardTitle>
            <Icons.fileClock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary?.totalHours?.toFixed(1) || 0} hrs</div>
            <p className="text-xs text-muted-foreground">{attendanceSummary?.presentDays || 0} days present</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Icons.calender className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming HR updates on your calendar</p>
          </CardContent>
        </Card>
      </div>

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
            <CardTitle className="text-lg">Monthly Summary</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Work Hours This Week</CardTitle>
            <CardDescription>Track weekly logged hours for your active days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[270px]">
            <ChartContainer config={hoursChartConfig} className="h-full w-full">
              <BarChart data={workHoursData} className="h-full w-full">
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

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
          </CardContent>
        </Card>

        {/* Holiday List Card */}
        <Card className="rounded-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Holiday List</CardTitle>
            <CardDescription>Upcoming company and public holidays.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {holidaysList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Icons.calender className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No upcoming holidays scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {holidaysList.map((holiday) => (
                  <div key={holiday.id} className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none">{holiday.title}</p>
                      {holiday.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{holiday.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">
                      {format(new Date(holiday.date), "MMM dd, yyyy")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
