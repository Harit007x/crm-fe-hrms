import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { userService, type User } from "@/services/user.service";
import { teamService, type Team } from "@/services/team.service";
import { projectService } from "@/services/project.service";
import { useTranslation } from "react-i18next";

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Milestones State
  const [milestones, setMilestones] = useState<Array<{ title: string; dueDate?: string; status: "Pending" | "In Progress" | "Completed" | "Delayed"; assignedUserIds: string[] }>>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newMilestoneAssigneeIds, setNewMilestoneAssigneeIds] = useState<string[]>([]);

  const selectedTeam = useMemo(() => {
    return teams.find((t) => t.id === teamId);
  }, [teamId, teams]);

  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const list = [...selectedTeam.members] as any[];
    if (selectedTeam.lead && !list.some((m) => m.id === selectedTeam.lead.id)) {
      list.unshift(selectedTeam.lead);
    }
    return list as Array<{ id: string; name: string; email: string }>;
  }, [selectedTeam]);

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

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      toast.error("Milestone title cannot be empty");
      return;
    }
    setMilestones((prev) => [
      ...prev,
      {
        title: newMilestoneTitle.trim(),
        dueDate: newMilestoneDueDate || undefined,
        status: "Pending",
        assignedUserIds: newMilestoneAssigneeIds,
      },
    ]);
    setNewMilestoneTitle("");
    setNewMilestoneDueDate("");
    setNewMilestoneAssigneeIds([]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          userService.getAllUsers(),
          teamService.getAllTeams(),
        ]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to load list resources", error);
        toast.error("Failed to load user and team selections");
      } finally {
        setLoadingLists(false);
      }
    };
    loadData();
  }, []);

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);
  const managers = useMemo(() => users.filter((u) => u.role === "MANAGER"), [users]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !managerId) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }
    
    setSubmitting(true);
    try {
      await projectService.createProject({
        name,
        code: code || undefined,
        description: description || undefined,
        clientId,
        managerId,
        teamId: teamId === "none" || !teamId ? undefined : teamId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        milestones: milestones.map(m => ({
          title: m.title,
          dueDate: m.dueDate,
          status: m.status,
          assignedUserIds: m.assignedUserIds,
        })),
      });

      toast.success("Project created successfully");
      navigate("/admin/projects");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto h-full pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link to="/admin/projects">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("projects.createTitle", "Create New Project")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("projects.createDescription", "Add a new project and assign an internal team.")}
          </p>
        </div>
      </div>

      {loadingLists ? (
        <div className="flex justify-center items-center py-20">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter the core information about the project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. ERP System Update" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Project Code</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g. PRJ-204" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Briefly describe the project scope..." 
                  className="min-h-[100px]" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client <span className="text-red-500">*</span></Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Allocation</CardTitle>
              <CardDescription>Assign managers and team members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Project Manager <span className="text-red-500">*</span></Label>
                  <Select value={managerId} onValueChange={setManagerId} required>
                    <SelectTrigger id="manager">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Assigned Team (Optional)</Label>
                  <Select value={teamId} onValueChange={setTeamId}>
                    <SelectTrigger id="team">
                      <SelectValue placeholder="No team assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No team assigned</SelectItem>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} (Lead: {t.lead?.name || "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Milestones (Optional)</CardTitle>
              <CardDescription>Define initial deliverables and timelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="m-title">Milestone Title</Label>
                  <Input
                    id="m-title"
                    placeholder="e.g. Phase 1: Prototype"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-date">Due Date</Label>
                  <Input
                    id="m-date"
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleAddMilestone} variant="secondary">
                  Add Milestone
                </Button>
              </div>

              <div className="grid gap-3">
                <Label>Assigned Team Members</Label>
                {/* List of currently assigned members */}
                {newMilestoneAssigneeIds.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {newMilestoneAssigneeIds.map((userId) => {
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
                              setNewMilestoneAssigneeIds((prev) => prev.filter((id) => id !== userId));
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
                  const unassignedUsers = milestoneCandidates.filter((u) => !newMilestoneAssigneeIds.includes(u.id));
                  return (
                    <div className="mt-1">
                      {unassignedUsers.length > 0 ? (
                        <Select
                          value=""
                          onValueChange={(val) => {
                            if (val) {
                              setNewMilestoneAssigneeIds((prev) => [...prev, val]);
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

              {milestones.length > 0 && (
                <div className="border rounded-md divide-y mt-4">
                  {milestones.map((m, index) => (
                    <div key={index} className="flex justify-between items-center p-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{m.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "TBD"}</p>
                        {m.assignedUserIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {m.assignedUserIds.map((userId) => {
                              const user = users.find((u) => u.id === userId);
                              if (!user) return null;
                              const teamNames = userTeamsMap[user.id] || [];
                              return (
                                <Badge key={userId} variant="outline" className="text-[10px] py-0 px-2 font-normal flex items-center gap-1 bg-muted/30">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMilestone(index)}
                        className="text-red hover:text-red hover:bg-red/10"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link to="/admin/projects">
              <Button variant="outline" type="button" disabled={submitting}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
