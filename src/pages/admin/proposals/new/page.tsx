import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { userService, type User } from "@/services/user.service";
import { proposalService } from "@/services/proposal.service";
import { useTranslation } from "react-i18next";

type PhaseInput = {
  name: string;
  description: string;
  estimatedHours: number;
  rate: number;
};

export default function ProposalNewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [terms, setTerms] = useState("1. Proposal is valid for 30 days.\n2. A 50% deposit is required to commence work.\n3. Final payment is due upon delivery.");
  const [phases, setPhases] = useState<PhaseInput[]>([
    { name: "Discovery & Planning", description: "Initial requirements gathering and project scope definition.", estimatedHours: 20, rate: 100 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load user selections", error);
        toast.error("Failed to load client selection list");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);

  const addPhase = () => {
    setPhases([...phases, { name: "", description: "", estimatedHours: 0, rate: 100 }]);
  };

  const removePhase = (idx: number) => {
    if (phases.length === 1) return;
    setPhases(phases.filter((_, i) => i !== idx));
  };

  const updatePhase = (idx: number, field: keyof PhaseInput, value: string | number) => {
    setPhases(phases.map((phase, i) => i === idx ? { ...phase, [field]: value } : phase));
  };

  const totalValue = phases.reduce((sum, phase) => sum + (phase.estimatedHours * phase.rate), 0);
  const totalHours = phases.reduce((sum, phase) => sum + phase.estimatedHours, 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId || !validUntil) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setSubmitting(true);
    try {
      await proposalService.createProposal({
        title,
        clientId,
        validUntil,
        executiveSummary,
        terms,
        value: totalValue,
        phases: phases.map(({ name, description, estimatedHours, rate }) => ({
          name,
          description,
          estimatedHours: Number(estimatedHours) || 0,
          rate: Number(rate) || 0,
        })),
        status: "Draft",
      });

      toast.success("Proposal created successfully");
      navigate("/admin/proposals");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto h-full pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("/admin/proposals")}>
          <Icons.arrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("proposals.createTitle", "Create Proposal")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("proposals.createDescription", "Build a detailed project proposal to win new business.")}
          </p>
        </div>
      </div>

      {loadingUsers ? (
        <div className="flex justify-center items-center py-20">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposalTitle">Project Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="proposalTitle"
                      placeholder="e.g. E-Commerce Platform Redesign" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposalClient">Client <span className="text-red-500">*</span></Label>
                      <Select value={clientId} onValueChange={setClientId} required>
                        <SelectTrigger id="proposalClient">
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
                    <div className="space-y-2">
                      <Label htmlFor="proposalValid">Valid Until <span className="text-red-500">*</span></Label>
                      <Input 
                        id="proposalValid"
                        type="date" 
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proposalExecSummary">Executive Summary / Scope of Work</Label>
                    <Textarea 
                      id="proposalExecSummary"
                      placeholder="Briefly describe the goals, objectives, and high-level scope of the project..." 
                      className="min-h-[120px]"
                      value={executiveSummary}
                      onChange={(e) => setExecutiveSummary(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Phases & Pricing</CardTitle>
                  <CardDescription>Break down the project into logical phases to estimate costs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {phases.map((phase, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/20 relative group">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-3 -right-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhase(index)}
                        disabled={phases.length === 1}
                      >
                        <Icons.x className="h-3 w-3" />
                      </Button>
                      
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 space-y-2">
                          <Label>Phase {index + 1} Name</Label>
                          <Input 
                            placeholder="e.g. Design & Prototyping" 
                            value={phase.name}
                            onChange={(e) => updatePhase(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="col-span-12 space-y-2">
                          <Label>Deliverables / Description</Label>
                          <Textarea 
                            placeholder="What will be delivered in this phase?" 
                            className="min-h-[60px]"
                            value={phase.description}
                            onChange={(e) => updatePhase(index, 'description', e.target.value)}
                          />
                        </div>

                        <div className="col-span-4 space-y-2">
                          <Label>Est. Hours</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={phase.estimatedHours}
                            onChange={(e) => updatePhase(index, 'estimatedHours', parseInt(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div className="col-span-4 space-y-2">
                          <Label>Hourly Rate ($)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={phase.rate}
                            onChange={(e) => updatePhase(index, 'rate', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div className="col-span-4 space-y-2 flex flex-col justify-end">
                          <div className="h-10 flex items-center justify-end px-3 bg-secondary/50 rounded-md border font-bold">
                            ${(phase.estimatedHours * phase.rate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addPhase} className="w-full border-dashed">
                    <Icons.add className="h-4 w-4 mr-2" />
                    Add Project Phase
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estimation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Phases</span>
                    <span className="font-medium">{phases.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Total Hours</span>
                    <span className="font-medium">{totalHours} hrs</span>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm">Total Estimated Value</span>
                    <span className="text-3xl font-bold text-primary">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    id="proposalTerms"
                    placeholder="Standard terms..." 
                    className="min-h-[150px] text-xs" 
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} className="w-full bg-blue text-white hover:bg-blue/90 flex items-center justify-center gap-2">
                  <Icons.send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Create Proposal"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
