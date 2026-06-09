import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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

import { dailyReportService, type DailyReport } from "@/services/dailyReport.service";
import { projectService, type Project } from "@/services/project.service";
import { useAuthStore } from "@/store/auth-store";



export default function DailyReportsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: "",
    projectId: "",
    tasksWorkedOn: "",
    blockers: "",
    plan: ""
  });

  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [reportsData, projectsData] = await Promise.all([
        isManagerOrAdmin ? dailyReportService.getAllReports() : dailyReportService.getMyReports(),
        projectService.getAllProjects()
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dailyReportService.createReport({
        ...formData,
        hours: Number(formData.hours)
      });
      toast.success("Daily Work Report submitted successfully");
      setOpenCreate(false);
      fetchData(); // refresh list
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  const handleStatusChange = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await dailyReportService.updateStatus(id, status);
      toast.success(`Report ${status}`);
      fetchData(); // refresh
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns = useMemo<ColumnDef<DailyReport>[]>(() => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.date}</span>
      )
    },
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user?.name || "Unknown"}</span>
      )
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.project?.name || "Unknown"}</span>
      )
    },
    {
      accessorKey: "hours",
      header: "Logged Hours",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Icons.fileClock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.hours} hrs</span>
        </div>
      )
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
          <Badge variant={variant} className={
            status === "Approved" ? "bg-green-500 hover:bg-green-600" : 
            status === "Pending" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : ""
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">View Details</span>
                <Icons.eye className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>Submitted by {report.user?.name} on {report.date}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground">Project</span>
                    <p>{report.project?.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Hours Logged</span>
                    <p>{report.hours} hrs</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Status</span>
                    <div>
                      <Badge variant={report.status === "Approved" ? "default" : report.status === "Rejected" ? "destructive" : "secondary"}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-muted-foreground">Tasks Worked On</span>
                  <div className="p-3 bg-muted rounded-md mt-1 whitespace-pre-wrap">
                    {report.tasksWorkedOn}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-muted-foreground">Tomorrow's Plan</span>
                  <div className="p-3 bg-muted rounded-md mt-1">
                    {report.plan || "N/A"}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {report.status === "Pending" && isManagerOrAdmin && (
                  <>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={() => handleStatusChange(report.id, "Rejected")}>Reject</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleStatusChange(report.id, "Approved")}>Approve</Button>
                    </DialogClose>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      },
    }
  ], [user]);

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Work Reports</h2>
          <p className="text-muted-foreground text-sm">Review team productivity and approve reports.</p>
        </div>
        
        <Sheet open={openCreate} onOpenChange={setOpenCreate}>
          <SheetTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              Log Work
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Log Daily Work</SheetTitle>
              <SheetDescription>Submit your daily work report for approval.</SheetDescription>
            </SheetHeader>
            <form onSubmit={onSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input id="date" type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Logged <span className="text-red-500">*</span></Label>
                  <Input id="hours" type="number" step="0.5" placeholder="e.g. 8" required value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project <span className="text-red-500">*</span></Label>
                <Select required value={formData.projectId} onValueChange={(val) => setFormData({...formData, projectId: val})}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project you worked on" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks Worked On <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="tasks" 
                  placeholder="- Built navigation bar&#10;- Fixed layout bugs" 
                  className="min-h-[100px]" 
                  required 
                  value={formData.tasksWorkedOn}
                  onChange={(e) => setFormData({...formData, tasksWorkedOn: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blockers">Blockers / Issues</Label>
                <Textarea 
                  id="blockers" 
                  placeholder="Any dependencies or issues blocking your progress?" 
                  className="min-h-[80px]" 
                  value={formData.blockers}
                  onChange={(e) => setFormData({...formData, blockers: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Tomorrow's Plan</Label>
                <Input id="plan" placeholder="Briefly state what you will work on tomorrow." value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} />
              </div>
              
              <SheetFooter className="mt-8 pt-4 border-t flex-row justify-end space-x-2">
                <SheetClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </SheetClose>
                <Button type="submit">Submit Report</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={reports} 
            gridCount={reports.length} 
            toolbar={true}
            searchKey="employee"
          />
        )}
      </div>
    </div>
  );
}
