import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useMemo } from "react";
import { proposalService, type Proposal, type ProposalPhase } from "@/services/proposal.service";
import { userService, type User } from "@/services/user.service";
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

export default function ProposalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Edit / Delete State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [terms, setTerms] = useState("");
  const [status, setStatus] = useState<any>("Draft");
  const [phases, setPhases] = useState<ProposalPhase[]>([]);
  const [updating, setUpdating] = useState(false);

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Fetch proposal details
  useEffect(() => {
    if (!id) return;
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const data = await proposalService.getProposalById(id);
        setProposal(data);
        // Pre-fill form fields
        setTitle(data.title);
        setClientId(data.clientId);
        setValidUntil(data.validUntil ? data.validUntil.split("T")[0] : "");
        setExecutiveSummary(data.executiveSummary || "");
        setTerms(data.terms || "");
        setStatus(data.status);
        setPhases(data.phases || []);
      } catch (error) {
        console.error("Failed to load proposal details", error);
        toast.error("Proposal details could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    async function fetchProject() {
      await fetchProposal();
    }
  }, [id, refreshTrigger]);

  // Load selection lists when opening edit sheet
  const handleOpenEdit = async () => {
    setIsEditOpen(true);
    if (users.length > 0) return;
    setLoadingLists(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load client selection list");
    } finally {
      setLoadingLists(false);
    }
  };

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);

  // Directly update proposal status
  const handleUpdateStatus = async (newStatus: "Draft" | "Sent" | "Accepted" | "Rejected") => {
    if (!id) return;
    try {
      await proposalService.updateProposal(id, { status: newStatus });
      toast.success(`Proposal marked as ${newStatus}`);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update proposal status");
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await proposalService.updateProposal(id, {
        title,
        clientId,
        validUntil: validUntil || undefined,
        executiveSummary,
        terms,
        status,
        phases: phases.map(({ name, description, estimatedHours, rate }) => ({
          name,
          description,
          estimatedHours: Number(estimatedHours) || 0,
          rate: Number(rate) || 0,
        })),
      });
      toast.success("Proposal updated successfully");
      setIsEditOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update proposal");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await proposalService.deleteProposal(id);
      toast.success("Proposal deleted successfully");
      navigate("/admin/proposals");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete proposal");
    }
  };

  // Add a phase to edit form
  const handleAddPhase = () => {
    setPhases((prev) => [
      ...prev,
      { name: "", description: "", estimatedHours: 0, rate: 100.0 },
    ]);
  };

  // Remove a phase from edit form
  const handleRemovePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a phase field in edit form
  const handleUpdatePhaseField = (index: number, field: keyof ProposalPhase, value: any) => {
    setPhases((prev) =>
      prev.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase))
    );
  };

  const totalHours = useMemo(() => {
    return proposal?.phases?.reduce((sum, phase) => sum + (phase.estimatedHours || 0), 0) || 0;
  }, [proposal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-10">
        <p className="text-lg font-semibold text-foreground/80">Proposal not found.</p>
        <Link to="/admin/proposals" className="text-blue underline mt-2 block">
          Back to Proposals
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto h-full pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link to="/admin/proposals">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Icons.arrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Proposal {proposal.id.slice(-6).toUpperCase()}</h2>
              <Badge variant="secondary" className="capitalize">
                {proposal.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {proposal.title} • Valid until {new Date(proposal.validUntil).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenEdit}>
            <Icons.pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          {proposal.status !== "Accepted" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus("Accepted")}>
              <Icons.check className="mr-2 h-4 w-4" /> Mark Accepted
            </Button>
          )}
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex justify-between border-b pb-6 mb-6">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">PROPOSAL</h3>
                <p className="text-muted-foreground mt-2 font-medium">{proposal.title}</p>
                <p className="text-sm text-muted-foreground mt-1">Prepared for: {proposal.client?.name || "N/A"}</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold">Enterprise CRM</h4>
                <p className="text-sm text-muted-foreground">crm-admin@system.com</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-bold mb-3 border-b pb-2">1. Executive Summary</h4>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {proposal.executiveSummary || "No executive summary provided."}
              </p>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-bold mb-4 border-b pb-2">2. Project Phases & Investment</h4>
              <div className="space-y-4">
                {proposal.phases && proposal.phases.length > 0 ? (
                  proposal.phases.map((phase, index) => (
                    <div key={phase.id || index} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold">Phase {index + 1}: {phase.name}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        </div>
                        <div className="text-right whitespace-nowrap pl-4">
                          <p className="font-bold text-lg">${(phase.estimatedHours * phase.rate).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{phase.estimatedHours} hrs @ ${phase.rate}/hr</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No phases listed in this proposal.</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-bold mb-3 border-b pb-2">3. Terms & Conditions</h4>
              <p className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">
                {proposal.terms || "Standard business terms apply."}
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="capitalize">{proposal.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-medium text-orange-600">{new Date(proposal.validUntil).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Estimated Investment</p>
                <p className="text-3xl font-bold text-primary">${proposal.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on {totalHours} estimated hours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{proposal.client?.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{proposal.client?.email || ""}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Proposal Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Proposal</SheetTitle>
            <SheetDescription>Modify proposal layout, value estimates, or line items.</SheetDescription>
          </SheetHeader>
          {loadingLists ? (
            <div className="flex justify-center items-center py-20">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="editProposalTitle">Proposal Title</Label>
                <Input id="editProposalTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editProposalClient">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="editProposalClient">
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
                <Label htmlFor="editProposalValidUntil">Valid Until</Label>
                <Input id="editProposalValidUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editProposalStatus">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger id="editProposalStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editProposalExec">Executive Summary</Label>
                <Textarea id="editProposalExec" value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editProposalTerms">Terms & Conditions</Label>
                <Textarea id="editProposalTerms" value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>

              {/* Dynamic Phases Area */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Project Phases</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPhase} className="flex items-center gap-1">
                    <Icons.plus className="h-3 w-3" /> Add Phase
                  </Button>
                </div>
                <div className="space-y-4">
                  {phases.map((phase, idx) => (
                    <div key={idx} className="border p-3 rounded-lg relative space-y-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePhase(idx)}
                        className="absolute right-1 top-1 h-6 w-6 text-red hover:bg-red/10"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                      <div className="space-y-1">
                        <Label className="text-xs">Phase Name</Label>
                        <Input
                          placeholder="e.g. Design Phase"
                          value={phase.name}
                          onChange={(e) => handleUpdatePhaseField(idx, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="Brief deliverables description"
                          value={phase.description}
                          onChange={(e) => handleUpdatePhaseField(idx, "description", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Hours</Label>
                          <Input
                            type="number"
                            value={phase.estimatedHours}
                            onChange={(e) => handleUpdatePhaseField(idx, "estimatedHours", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Hourly Rate ($)</Label>
                          <Input
                            type="number"
                            value={phase.rate}
                            onChange={(e) => handleUpdatePhaseField(idx, "rate", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this proposal? This action cannot be undone.
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
}
