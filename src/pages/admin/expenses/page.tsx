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
import { expenseService, type Expense } from "@/services/expense.service";
import { projectService, type Project } from "@/services/project.service";
import { useTranslation } from "react-i18next";

export default function ExpensesPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<any>("");
  const [projectId, setProjectId] = useState("none");
  const [description, setDescription] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Load expenses and projects on mount/refresh
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expensesData, projectsData] = await Promise.all([
          expenseService.getAllExpenses(),
          projectService.getAllProjects()
        ]);
        setExpenses(expensesData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load expenses page resources", error);
        toast.error("Failed to load expenses list or projects list");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !category || !description) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setSubmitting(true);
    try {
      await expenseService.createExpense({
        date,
        amount: parseFloat(amount),
        category,
        projectId: projectId === "none" || !projectId ? undefined : projectId,
        description,
        receiptUrl: receiptUrl || "https://example.com/receipt.pdf"
      });

      toast.success("Expense submitted successfully");
      setOpenCreate(false);
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setAmount("");
      setCategory("");
      setProjectId("none");
      setDescription("");
      setReceiptUrl("");
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "Pending" | "Approved" | "Reimbursed" | "Rejected") => {
    try {
      await expenseService.updateExpense(id, { status: newStatus });
      toast.success(`Expense successfully marked as ${newStatus}`);
      setOpenView(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update expense status");
    }
  };

  const columns = useMemo<ColumnDef<Expense>[]>(() => [
    {
      accessorKey: "date",
      header: t("expenses.labelDate", "Date"),
      cell: ({ row }) => (
        <span className="font-medium">{new Date(row.original.date).toLocaleDateString()}</span>
      )
    },
    {
      accessorKey: "category",
      header: t("expenses.labelCategory", "Category"),
    },
    {
      id: "project",
      header: t("expenses.labelProject", "Project"),
      cell: ({ row }) => row.original.project?.name || <span className="text-muted-foreground italic">None</span>
    },
    {
      accessorKey: "amount",
      header: t("expenses.labelAmount", "Amount"),
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          ${row.original.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: t("common.status", "Status"),
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        
        if (status === "Approved" || status === "Reimbursed") variant = "default";
        if (status === "Rejected") variant = "destructive";
        if (status === "Pending") variant = "secondary";

        return (
          <Badge variant={variant} className={
            status === "Approved" ? "bg-greenBackground text-green hover:bg-greenBackground/90" : 
            status === "Reimbursed" ? "bg-blueBackground text-blue hover:bg-blueBackground/90" : 
            status === "Pending" ? "bg-orangeBackground text-orange hover:bg-orangeBackground/90" : ""
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
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedExpense(row.original);
              setOpenView(true);
            }}
          >
            <span className="sr-only">View Details</span>
            <Icons.eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        );
      },
    }
  ], [t]);

  return (
    <div className="flex flex-col space-y-4 h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("expenses.title", "Expenses")}</h2>
          <p className="text-muted-foreground text-sm">{t("expenses.description", "Track team expenses and manage reimbursements.")}</p>
        </div>
        
        <Sheet open={openCreate} onOpenChange={setOpenCreate}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2">
              <Icons.plus className="h-4 w-4" />
              {t("expenses.logBtn", "Log Expense")}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Log New Expense</SheetTitle>
              <SheetDescription>Submit a receipt for reimbursement.</SheetDescription>
            </SheetHeader>
            <form onSubmit={onSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Expense <span className="text-red-500">*</span></Label>
                  <Input 
                    id="date" 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) <span className="text-red-500">*</span></Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Travel">Travel & Transit</SelectItem>
                      <SelectItem value="Meals">Meals & Entertainment</SelectItem>
                      <SelectItem value="Software">Software & Services</SelectItem>
                      <SelectItem value="Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Link to project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide context for this expense..." 
                  className="min-h-[100px]" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt File URL</Label>
                <Input 
                  id="receipt" 
                  type="text" 
                  placeholder="e.g. https://example.com/receipt.pdf" 
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                />
              </div>
              
              <SheetFooter className="mt-8 pt-4 border-t flex-row justify-end space-x-2">
                <SheetClose asChild>
                  <Button variant="outline" type="button" disabled={submitting}>Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* View Details Dialog */}
        <Dialog open={openView} onOpenChange={setOpenView}>
          <DialogContent>
            {selectedExpense && (
              <>
                <DialogHeader>
                  <DialogTitle>Expense Details</DialogTitle>
                  <DialogDescription>
                    Submitted by {selectedExpense.submittedBy?.name || "N/A"} ({selectedExpense.submittedBy?.email || ""}) on {new Date(selectedExpense.date).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-3xl font-bold">${selectedExpense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <Badge variant={
                      selectedExpense.status === "Approved" || selectedExpense.status === "Reimbursed" ? "default" : 
                      selectedExpense.status === "Rejected" ? "destructive" : "secondary"
                    } className={
                      selectedExpense.status === "Approved" ? "bg-greenBackground text-green" : 
                      selectedExpense.status === "Reimbursed" ? "bg-blueBackground text-blue" : ""
                    }>
                      {selectedExpense.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground">Category</span>
                      <p>{selectedExpense.category}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground">Project</span>
                      <p>{selectedExpense.project?.name || "None"}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-semibold text-muted-foreground">Description</span>
                    <div className="p-3 bg-muted rounded-md mt-1 whitespace-pre-wrap">
                      {selectedExpense.description}
                    </div>
                  </div>

                  {selectedExpense.receiptUrl && (
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">Receipt File</span>
                      <div className="mt-1 flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <Icons.page className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-blue-500 hover:underline cursor-pointer truncate">{selectedExpense.receiptUrl}</span>
                        </div>
                        <a href={selectedExpense.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Open</Button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  {selectedExpense.status === "Pending" && (
                    <>
                      <Button variant="destructive" onClick={() => handleUpdateStatus(selectedExpense.id, "Rejected")}>Reject</Button>
                      <Button onClick={() => handleUpdateStatus(selectedExpense.id, "Approved")}>Approve</Button>
                    </>
                  )}
                  {selectedExpense.status === "Approved" && (
                    <Button className="bg-blue text-white hover:bg-blue/90" onClick={() => handleUpdateStatus(selectedExpense.id, "Reimbursed")}>Mark as Reimbursed</Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={expenses} 
            gridCount={expenses.length} 
            toolbar={true}
            searchKey="category"
          />
        )}
      </div>
    </div>
  );
}
