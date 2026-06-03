import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { ColumnDef } from "@tanstack/react-table";
import { Icons } from "@/components/icons";

type Activity = {
  id: string;
  project: string;
  action: string;
  user: string;
  date: string;
  status: string;
};

const recentActivities: Activity[] = [
  {
    id: "ACT-001",
    project: "Website Redesign",
    action: "Milestone Completed",
    user: "Olivia Martin",
    date: "2024-05-23",
    status: "Success",
  },
  {
    id: "ACT-002",
    project: "Mobile App MVP",
    action: "Invoice Sent",
    user: "Jackson Lee",
    date: "2024-05-22",
    status: "Pending",
  },
  {
    id: "ACT-003",
    project: "CRM Integration",
    action: "Task Assigned",
    user: "Isabella Nguyen",
    date: "2024-05-21",
    status: "Success",
  },
  {
    id: "ACT-004",
    project: "Cloud Migration",
    action: "Proposal Reviewed",
    user: "William Kim",
    date: "2024-05-20",
    status: "Processing",
  },
  {
    id: "ACT-005",
    project: "Marketing Site",
    action: "Project Created",
    user: "Sofia Davis",
    date: "2024-05-19",
    status: "Success",
  },
];

const chartData = [
  { date: "2024-04-01", revenue: 2220, expenses: 1500 },
  { date: "2024-04-02", revenue: 3970, expenses: 1800 },
  { date: "2024-04-03", revenue: 4167, expenses: 1200 },
  { date: "2024-04-04", revenue: 5242, expenses: 2600 },
  { date: "2024-04-05", revenue: 3373, expenses: 2900 },
  { date: "2024-04-06", revenue: 4301, expenses: 3400 },
  { date: "2024-04-07", revenue: 5245, expenses: 1800 },
  { date: "2024-04-08", revenue: 6409, expenses: 3200 },
  { date: "2024-04-09", revenue: 4059, expenses: 1100 },
  { date: "2024-04-10", revenue: 5261, expenses: 1900 },
  { date: "2024-04-11", revenue: 4327, expenses: 3500 },
  { date: "2024-04-12", revenue: 3292, expenses: 2100 },
  { date: "2024-04-13", revenue: 4342, expenses: 3800 },
  { date: "2024-04-14", revenue: 3137, expenses: 2200 },
  { date: "2024-04-15", revenue: 4120, expenses: 1700 },
  { date: "2024-04-16", revenue: 5138, expenses: 1900 },
  { date: "2024-04-17", revenue: 6446, expenses: 3600 },
  { date: "2024-04-18", revenue: 5364, expenses: 4100 },
  { date: "2024-04-19", revenue: 4243, expenses: 1800 },
  { date: "2024-04-20", revenue: 3089, expenses: 1500 },
  { date: "2024-04-21", revenue: 4137, expenses: 2000 },
  { date: "2024-04-22", revenue: 5224, expenses: 1700 },
  { date: "2024-04-23", revenue: 4138, expenses: 2300 },
  { date: "2024-04-24", revenue: 6387, expenses: 2900 },
  { date: "2024-04-25", revenue: 5215, expenses: 2500 },
  { date: "2024-04-26", revenue: 4075, expenses: 1300 },
  { date: "2024-04-27", revenue: 6383, expenses: 4200 },
  { date: "2024-04-28", revenue: 3122, expenses: 1800 },
  { date: "2024-04-29", revenue: 5315, expenses: 2400 },
  { date: "2024-04-30", revenue: 6454, expenses: 3800 },
];

const chartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses ($)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const columns = useMemo<ColumnDef<Activity>[]>(() => [
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => {
        const act = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{act.project}</span>
            <span className="text-xs text-muted-foreground">{act.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "user",
      header: "User",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ], []);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-04-30");
    let daysToSubtract = 30;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className="flex-col align-start space-y-4 h-full">
      <div className="flex">
        <h2 className="inline-block text-2xl justify-self-start font-bold tracking-tight">
          Admin Dashboard
        </h2>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Icons.folder className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Icons.barChart2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">8 projects delayed</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Icons.scrollText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">$24,500 pending collection</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-secondary/50 cursor-pointer rounded-xl transition-colors border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Icons.billing className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142,300</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="rounded-xl border-border/50 shadow-sm">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Revenue vs Expenses Overview</CardTitle>
            <CardDescription>
              Showing financial performance for the selected period
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">Last 30 Days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="expenses"
                type="monotone"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      <div className="grid gap-4 md:grid-cols-2 w-full">
        <Card className="col-span-4 rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all projects and modules.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentActivities} gridCount={recentActivities.length} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
