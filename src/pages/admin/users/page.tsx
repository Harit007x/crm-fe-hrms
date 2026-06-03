import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import IconWrapper from "@/components/icons-wrapper";
import { Icons } from "@/components/icons";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { userService, type User } from "@/services/user.service";
import { teamService, type Team } from "@/services/team.service";
import { toast } from "sonner";

// Users Tab Actions Cell
const UserActionsCell = ({ row, onRefresh }: { row: any; onRefresh: () => void }) => {
  const { t } = useTranslation();
  const user = row.original as User;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await userService.updateUser(user.id, { name, email, role });
      toast.success("User updated successfully");
      setIsEditOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userService.deleteUser(user.id);
      toast.success("User deleted successfully");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="w-fit flex gap-1">
      <IconWrapper
        className="cursor-pointer text-blue hover:fill-blueBackground hover:bg-blueBackground hover:dark:bg-blueBackground"
        onClick={() => {
          setName(user.name);
          setEmail(user.email);
          setRole(user.role);
          setIsEditOpen(true);
        }}
      >
        <Icons.pencil className="h-4 w-4" />
      </IconWrapper>
      <IconWrapper
        className="cursor-pointer text-red hover:fill-redBackground hover:bg-redBackground hover:dark:bg-redBackground"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Icons.trash className="h-4 w-4" />
      </IconWrapper>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("users.editTitle", "Edit User Details")}</SheetTitle>
            <SheetDescription>
              {t("users.editDescription", "Modify name, email, or role permissions.")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">{t("users.labelName", "Name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">{t("users.labelEmail", "Email")}</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="role">{t("users.labelRole", "Role")}</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="TEAM_MEMBER">TEAM MEMBER</SelectItem>
                  <SelectItem value="CLIENT">CLIENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : t("common.save", "Save")}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">{t("common.close", "Close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteTitle", "Delete User")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteDescription", "Are you sure you want to delete this user? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red hover:bg-red/90 text-white">
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Teams Tab Actions Cell
const TeamActionsCell = ({
  row,
  users,
  onRefresh,
}: {
  row: any;
  users: User[];
  onRefresh: () => void;
}) => {
  const { t } = useTranslation();
  const team = row.original as Team;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [leadId, setLeadId] = useState(team.leadId);
  const [memberIds, setMemberIds] = useState<string[]>(
    team.memberIds || team.members?.map((m) => m.id) || []
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await teamService.updateTeam(team.id, { name, description, leadId, memberIds });
      toast.success("Team updated successfully");
      setIsEditOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teamService.deleteTeam(team.id);
      toast.success("Team deleted successfully");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete team");
    }
  };

  const handleToggleMember = (userId: string) => {
    setMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filter candidates for leads (usually ADMIN, MANAGER or TEAM_MEMBER)
  const leadCandidates = useMemo(() => {
    return users.filter((u) => u.role !== "CLIENT");
  }, [users]);

  // Filter candidates for members
  const memberCandidates = useMemo(() => {
    return users.filter((u) => u.role !== "CLIENT");
  }, [users]);

  return (
    <div className="w-fit flex gap-1">
      <IconWrapper
        className="cursor-pointer text-blue hover:fill-blueBackground hover:bg-blueBackground hover:dark:bg-blueBackground"
        onClick={() => {
          setName(team.name);
          setDescription(team.description || "");
          setLeadId(team.leadId);
          setMemberIds(team.memberIds || team.members?.map((m) => m.id) || []);
          setIsEditOpen(true);
        }}
      >
        <Icons.pencil className="h-4 w-4" />
      </IconWrapper>
      <IconWrapper
        className="cursor-pointer text-red hover:fill-redBackground hover:bg-redBackground hover:dark:bg-redBackground"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Icons.trash className="h-4 w-4" />
      </IconWrapper>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("teams.editTitle", "Edit Team")}</SheetTitle>
            <SheetDescription>
              {t("teams.editDescription", "Modify team structure, lead, or members.")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="teamName">{t("teams.labelName", "Team Name")}</Label>
              <Input
                id="teamName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="teamDesc">{t("teams.labelDesc", "Description")}</Label>
              <Textarea
                id="teamDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="teamLead">{t("teams.labelLead", "Team Lead / Manager")}</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leadCandidates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>{t("teams.labelMembers", "Team Members")}</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {memberCandidates.map((u) => (
                  <div key={u.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-member-${u.id}`}
                      checked={memberIds.includes(u.id)}
                      onCheckedChange={() => handleToggleMember(u.id)}
                    />
                    <label htmlFor={`edit-member-${u.id}`} className="text-sm font-medium leading-none cursor-pointer">
                      {u.name} ({u.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : t("common.save", "Save")}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">{t("common.close", "Close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("teams.deleteTitle", "Delete Team")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("teams.deleteDescription", "Are you sure you want to delete this team? Members will remain as users.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red hover:bg-red/90 text-white">
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Create Team state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLeadId, setCreateLeadId] = useState("");
  const [createMemberIds, setCreateMemberIds] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  // Create User state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "MANAGER" | "TEAM_MEMBER" | "CLIENT">("TEAM_MEMBER");
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      toast.error("Please fill in all user fields");
      return;
    }
    setNewUserLoading(true);
    try {
      await userService.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      toast.success("User created successfully");
      setIsCreateUserOpen(false);
      // Reset form
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("TEAM_MEMBER");
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setNewUserLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAllTeams();
        setTeams(data);
      } catch (error) {
        console.error("Failed to load teams", error);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [refreshTrigger]);

  const handleCreateTeam = async () => {
    if (!createName || !createLeadId) {
      toast.error("Please fill in Team Name and Lead/Manager");
      return;
    }
    setCreateLoading(true);
    try {
      await teamService.createTeam({
        name: createName,
        description: createDescription,
        leadId: createLeadId,
        memberIds: createMemberIds,
      });
      toast.success("Team created successfully");
      setIsCreateOpen(false);
      // Reset form
      setCreateName("");
      setCreateDescription("");
      setCreateLeadId("");
      setCreateMemberIds([]);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create team");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleCreateMember = (userId: string) => {
    setCreateMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Define User Columns
  const userColumns = useMemo<ColumnDef<User>[]>(() => [
    {
      header: () => t("users.labelName", "Name"),
      accessorKey: "name",
    },
    {
      header: () => t("users.labelEmail", "Email"),
      accessorKey: "email",
    },
    {
      id: "role",
      header: () => t("users.labelRole", "Role"),
      cell: ({ row }) => {
        const user = row.original;
        let badgeVariant: "red" | "orange" | "blue" | "green" = "blue";
        if (user.role === "ADMIN") badgeVariant = "red";
        else if (user.role === "MANAGER") badgeVariant = "orange";
        else if (user.role === "CLIENT") badgeVariant = "green";

        return (
          <Badge variant={badgeVariant}>
            {user.role}
          </Badge>
        );
      },
    },
    {
      header: () => t("common.createdAt", "Created At"),
      accessorKey: "createdAt",
      cell: ({ row }) => {
        return <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.actions", "Actions")} />
      ),
      cell: ({ row }) => <UserActionsCell row={row} onRefresh={handleRefresh} />,
    },
  ], [t]);

  // Define Team Columns
  const teamColumns = useMemo<ColumnDef<Team>[]>(() => [
    {
      header: () => t("teams.labelName", "Team Name"),
      accessorKey: "name",
    },
    {
      header: () => t("teams.labelLead", "Lead / Manager"),
      accessorKey: "lead.name",
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{team.lead?.name || "N/A"}</span>
            <span className="text-xs text-foreground/50">{team.lead?.email || ""}</span>
          </div>
        );
      },
    },
    {
      header: () => t("teams.labelMembersCount", "Members Count"),
      accessorKey: "members.length",
      cell: ({ row }) => {
        const count = row.original.members?.length || 0;
        return <Badge variant="secondary">{count} members</Badge>;
      },
    },
    {
      header: () => t("teams.labelDesc", "Description"),
      accessorKey: "description",
      cell: ({ row }) => {
        return <span className="text-foreground/75 truncate max-w-xs block">{row.original.description || "-"}</span>;
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.actions", "Actions")} />
      ),
      cell: ({ row }) => (
        <TeamActionsCell row={row} users={users} onRefresh={handleRefresh} />
      ),
    },
  ], [t, users]);

  // Lead and member candidates for Team Creation
  const createLeadCandidates = useMemo(() => {
    return users.filter((u) => u.role !== "CLIENT");
  }, [users]);

  const createMemberCandidates = useMemo(() => {
    return users.filter((u) => u.role !== "CLIENT");
  }, [users]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="inline-block text-xl justify-self-start font-bold tracking-tight">
            {t("users.title", "Users & Teams")}
          </h2>
          <p className="text-sm font-medium text-foreground/60">
            {t("users.description", "Manage internal employees, roles, clients, and departments.")}
          </p>
        </div>
        {activeTab === "users" ? (
          <Button onClick={() => setIsCreateUserOpen(true)} className="flex items-center gap-2">
            <Icons.plus className="h-4 w-4" />
            {t("users.createBtn", "Create User")}
          </Button>
        ) : (
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Icons.plus className="h-4 w-4" />
            {t("teams.createBtn", "Create Team")}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="users">{t("users.tabUsers", "Users")}</TabsTrigger>
          <TabsTrigger value="teams">{t("users.tabTeams", "Teams")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          {usersLoading ? (
            <div className="flex justify-center items-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={userColumns}
              data={users}
              gridCount={users.length}
            />
          )}
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          {teamsLoading ? (
            <div className="flex justify-center items-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={teamColumns}
              data={teams}
              gridCount={teams.length}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("teams.createTitle", "Create Team")}</SheetTitle>
            <SheetDescription>
              {t("teams.createDescription", "Group members under a lead to assign to projects.")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="createTeamName">{t("teams.labelName", "Team Name")}</Label>
              <Input
                id="createTeamName"
                placeholder="e.g. Frontend Team"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="createTeamDesc">{t("teams.labelDesc", "Description")}</Label>
              <Textarea
                id="createTeamDesc"
                placeholder="Brief details about the team duties"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="createTeamLead">{t("teams.labelLead", "Team Lead / Manager")}</Label>
              <Select value={createLeadId} onValueChange={setCreateLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {createLeadCandidates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>{t("teams.labelMembers", "Team Members")}</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {createMemberCandidates.map((u) => (
                  <div key={u.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-member-${u.id}`}
                      checked={createMemberIds.includes(u.id)}
                      onCheckedChange={() => handleToggleCreateMember(u.id)}
                    />
                    <label htmlFor={`create-member-${u.id}`} className="text-sm font-medium leading-none cursor-pointer">
                      {u.name} ({u.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleCreateTeam} disabled={createLoading}>
              {createLoading ? "Creating..." : t("teams.createBtn", "Create Team")}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">{t("common.close", "Close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create User Sheet */}
      <Sheet open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <SheetContent className="max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("users.createTitle", "Create User")}</SheetTitle>
            <SheetDescription>
              {t("users.createDescription", "Add a new user to the CRM with specific access permissions.")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="createUserName">{t("users.labelName", "Name")}</Label>
              <Input
                id="createUserName"
                placeholder="e.g. John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="createUserEmail">{t("users.labelEmail", "Email")}</Label>
              <Input
                id="createUserEmail"
                type="email"
                placeholder="e.g. john@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="createUserPassword">{t("users.labelPassword", "Password")}</Label>
              <Input
                id="createUserPassword"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="createUserRole">{t("users.labelRole", "Role")}</Label>
              <Select value={newUserRole} onValueChange={(val: any) => setNewUserRole(val)}>
                <SelectTrigger id="createUserRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="TEAM_MEMBER">TEAM MEMBER</SelectItem>
                  <SelectItem value="CLIENT">CLIENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleCreateUser} disabled={newUserLoading}>
              {newUserLoading ? "Creating..." : t("users.createBtn", "Create User")}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">{t("common.close", "Close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
