import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { projectService, type Project } from "@/services/project.service";
import { userService, type User } from "@/services/user.service";
import { teamService, type Team } from "@/services/team.service";
import { milestoneService, type Milestone } from "@/services/milestone.service";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit / Delete State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<any>("Pending");
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [updating, setUpdating] = useState(false);

  // Milestone Sheet State
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<"Pending" | "In Progress" | "Completed" | "Delayed">("Pending");
  const [milestoneAssigneeIds, setMilestoneAssigneeIds] = useState<string[]>([]);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const handleOpenNewMilestone = () => {
    setEditingMilestone(null);
    setMilestoneTitle("");
    setMilestoneDueDate("");
    setMilestoneStatus("Pending");
    setMilestoneAssigneeIds([]);
    setIsMilestoneOpen(true);
  };

  const handleOpenEditMilestone = (m: Milestone) => {
    setEditingMilestone(m);
    setMilestoneTitle(m.title);
    setMilestoneDueDate(m.dueDate ? m.dueDate.split("T")[0] : "");
    setMilestoneStatus(m.status);
    setMilestoneAssigneeIds(m.assignedUserIds || m.assignedUsers?.map((u) => u.id) || []);
    setIsMilestoneOpen(true);
  };

  const handleSaveMilestone = async () => {
    if (!milestoneTitle.trim()) {
      toast.error("Milestone title is required");
      return;
    }
    if (!id) return;

    setSubmittingMilestone(true);
    try {
      if (editingMilestone) {
        await milestoneService.updateMilestone(editingMilestone.id, {
          title: milestoneTitle.trim(),
          dueDate: milestoneDueDate || undefined,
          status: milestoneStatus,
          assignedUserIds: milestoneAssigneeIds,
        });
        toast.success("Milestone updated successfully");
      } else {
        await milestoneService.createMilestone({
          title: milestoneTitle.trim(),
          dueDate: milestoneDueDate || undefined,
          status: milestoneStatus,
          projectId: id,
          assignedUserIds: milestoneAssigneeIds,
        });
        toast.success("Milestone created successfully");
      }
      setIsMilestoneOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save milestone");
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await milestoneService.deleteMilestone(milestoneId);
      toast.success("Milestone deleted successfully");
      handleRefresh();
    } catch (error: any) {
      toast.error("Failed to delete milestone");
    }
  };

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Load project details
  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
        // Pre-fill form fields
        setName(data.name);
        setCode(data.code || "");
        setDescription(data.description || "");
        setStatus(data.status);
        setProgress(data.progress);
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
        setManagerId(data.managerId);
        setClientId(data.clientId);
        setTeamId(data.teamId || "none");
      } catch (error) {
        console.error("Failed to load project details", error);
        toast.error("Project details could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, refreshTrigger]);

  useEffect(() => {
    const loadSelections = async () => {
      setLoadingLists(true);
      try {
        const [usersData, teamsData] = await Promise.all([
          userService.getAllUsers(),
          teamService.getAllTeams(),
        ]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to load select resources", error);
      } finally {
        setLoadingLists(false);
      }
    };
    loadSelections();
  }, []);

  const handleOpenEdit = () => {
    setIsEditOpen(true);
  };

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);
  const managers = useMemo(() => users.filter((u) => u.role === "MANAGER"), [users]);

  const userTeamsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    users.forEach((u) => {
      map[u.id] = [];
    });
    teams.forEach((t) => {
      t.members?.forEach((m) => {
        if (map[m.id] && !map[m.id].includes(t.name)) {
          map[m.id].push(t.name);
        }
      });
      if (t.lead && map[t.lead.id] && !map[t.lead.id].includes(t.name)) {
        map[t.lead.id].push(t.name);
      }
    });
    return map;
  }, [users, teams]);

  const selectedTeam = useMemo(() => {
    if (!project || !project.teamId) return null;
    return teams.find((t) => t.id === project.teamId) || null;
  }, [project, teams]);

  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const list = [...(selectedTeam.members || [])] as any[];
    if (selectedTeam.lead && !list.some((m) => m.id === selectedTeam.lead.id)) {
      list.unshift(selectedTeam.lead);
    }
    return list as Array<{ id: string; name: string; email: string }>;
  }, [selectedTeam]);

  const milestoneCandidates = useMemo(() => {
    const allCandidates = users.filter((u) => u.role !== "CLIENT");
    if (selectedTeam) {
      const teamMemberIds = selectedTeamMembers.map((m) => m.id);
      return [...allCandidates].sort((a, b) => {
        const aIsMember = teamMemberIds.includes(a.id) ? 1 : 0;
        const bIsMember = teamMemberIds.includes(b.id) ? 1 : 0;
        return bIsMember - aIsMember;
      });
    }
    return allCandidates;
  }, [users, selectedTeam, selectedTeamMembers]);

  const handleUpdate = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await projectService.updateProject(id, {
        name,
        code,
        description,
        status,
        progress,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        managerId,
        clientId,
        teamId: teamId === "none" || !teamId ? "" : teamId,
      });
      toast.success("Project updated successfully");
      setIsEditOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await projectService.deleteProject(id);
      toast.success("Project deleted successfully");
      navigate("/admin/projects");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center py-20">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <p className="text-lg font-semibold text-foreground/80">Project not found.</p>
        <Link to="/admin/projects" className="text-blue underline mt-2 block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 h-full pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link to="/admin/projects">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Icons.arrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
              <Badge variant="secondary" className="capitalize">
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {project.code || "No Code"} • {project.client?.name || "No Client Assigned"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenEdit}>
            <Icons.pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Icons.barChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manager</CardTitle>
            <Icons.user className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{project.manager?.name || "N/A"}</div>
            <div className="text-xs text-muted-foreground">{project.manager?.email || ""}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Icons.calender className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {project.team && <TabsTrigger value="team">Assigned Team</TabsTrigger>}
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {project.team && (
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team: {project.team.name}</CardTitle>
                <CardDescription>Members currently allocated to this project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground/80">Team Lead</h4>
                  {project.team.lead ? (
                    <div className="flex items-center gap-3 p-3 border rounded-md max-w-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{project.team.lead.name}</span>
                        <span className="text-xs text-muted-foreground">{project.team.lead.email}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No lead assigned.</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground/80">Members</h4>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {project.team.members?.map((m) => (
                      <div key={m.id} className="p-3 border rounded-md flex flex-col">
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        <TabsContent value="milestones">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Track major deliverables.</CardDescription>
              </div>
              <Button onClick={handleOpenNewMilestone} size="sm">
                <Icons.add className="mr-2 h-4 w-4" /> Create Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {!project.milestones || project.milestones.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No milestones defined yet. Click "Create Milestone" to add one.
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  {project.milestones.map((m) => {
                    const statusColors: Record<string, string> = {
                      "Completed": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
                      "In Progress": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
                      "Pending": "bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
                      "Delayed": "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300",
                    };
                    return (
                      <div key={m.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium text-foreground">{m.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "TBD"}
                          </p>
                          {m.assignedUsers && m.assignedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {m.assignedUsers.map((user) => {
                                const teamNames = userTeamsMap[user.id] || [];
                                return (
                                  <Badge key={user.id} variant="outline" className="text-[10px] py-0 px-2 font-normal flex items-center gap-1 bg-muted/30">
                                    <span>{user.name}</span>
                                    {teamNames.length > 0 && (
                                      <span className="text-[9px] text-muted-foreground">
                                        ({teamNames.join(", ")})
                                      </span>
                                    )}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className={statusColors[m.status] || ""}>
                            {m.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditMilestone(m)}
                              className="h-8 w-8"
                            >
                              <Icons.pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="h-8 w-8 text-red hover:text-red hover:bg-red/10"
                            >
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">View tasks specifically for this project.</p>
              <Link to="/admin/tasks/board">
                <Button variant="outline">
                  <Icons.clipboardCheck className="mr-2 h-4 w-4" /> Open Kanban Board
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Project Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
            <SheetDescription>Modify project timeline, status, or details.</SheetDescription>
          </SheetHeader>
          {loadingLists ? (
            <div className="flex justify-center items-center py-20">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="editName">Project Name</Label>
                <Input id="editName" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editCode">Project Code</Label>
                <Input id="editCode" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editDesc">Description</Label>
                <Textarea id="editDesc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger id="editStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editProgress">Progress ({progress}%)</Label>
                <Input
                  id="editProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input id="editStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editEndDate">End Date</Label>
                <Input id="editEndDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editClient">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="editClient">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editManager">Manager</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger id="editManager">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editTeam">Team</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger id="editTeam">
                    <SelectValue placeholder="No team assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team assigned</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this project? This will remove all associated statistics.
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

      {/* Milestone creation/editing Sheet */}
      <Sheet open={isMilestoneOpen} onOpenChange={setIsMilestoneOpen}>
        <SheetContent className="max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingMilestone ? "Edit Milestone" : "Create Milestone"}</SheetTitle>
            <SheetDescription>
              {editingMilestone ? "Modify milestone title, due date, and status." : "Add a new major deliverable or phase to the project."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="milestoneTitleInput">Milestone Title <span className="text-red-500">*</span></Label>
              <Input
                id="milestoneTitleInput"
                placeholder="e.g. Design Handover"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="milestoneDueDateInput">Due Date</Label>
              <Input
                id="milestoneDueDateInput"
                type="date"
                value={milestoneDueDate}
                onChange={(e) => setMilestoneDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="milestoneStatusInput">Status</Label>
              <Select value={milestoneStatus} onValueChange={(val: any) => setMilestoneStatus(val)}>
                <SelectTrigger id="milestoneStatusInput">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>Assigned Team Members</Label>
              {/* List of currently assigned members */}
              {milestoneAssigneeIds.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {milestoneAssigneeIds.map((userId) => {
                    const member = users.find((u) => u.id === userId);
                    if (!member) return null;
                    const teamNames = userTeamsMap[member.id] || [];
                    return (
                      <div key={userId} className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-semibold text-foreground">{member.name}</p>
                              {teamNames.map((tName) => (
                                <Badge key={tName} variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-none font-normal">
                                  {tName}
                                </Badge>
                              ))}
                              {teamNames.length === 0 && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground border-dashed font-normal">
                                  No Team
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setMilestoneAssigneeIds((prev) => prev.filter((id) => id !== userId));
                          }}
                          className="h-6 w-6 text-muted-foreground hover:text-red hover:bg-red/10"
                        >
                          <Icons.x className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic bg-muted/10 p-3 rounded-md border border-dashed text-center">
                  No team members assigned to this milestone yet.
                </p>
              )}

              {/* Add team member select dropdown */}
              {(() => {
                const unassignedUsers = milestoneCandidates.filter((u) => !milestoneAssigneeIds.includes(u.id));
                return (
                  <div className="mt-1">
                    {unassignedUsers.length > 0 ? (
                      <Select
                        value=""
                        onValueChange={(val) => {
                          if (val) {
                            setMilestoneAssigneeIds((prev) => [...prev, val]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full text-xs h-9">
                          <SelectValue placeholder="+ Assign Team Member" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedUsers.map((m) => {
                            const teamNames = userTeamsMap[m.id] || [];
                            const teamsText = teamNames.length > 0 ? ` (${teamNames.join(", ")})` : " (No Team)";
                            const prefix = selectedTeam && selectedTeamMembers.some((tm) => tm.id === m.id) ? "★ " : "";
                            return (
                              <SelectItem key={m.id} value={m.id}>
                                {prefix}{m.name}{teamsText}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-[11px] text-muted-foreground text-center">
                        All available team members have been assigned.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleSaveMilestone} disabled={submittingMilestone}>
              {submittingMilestone ? "Saving..." : editingMilestone ? "Save Changes" : "Create Milestone"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
