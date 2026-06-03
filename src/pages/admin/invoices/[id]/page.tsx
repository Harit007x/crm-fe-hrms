import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { invoiceService, type Invoice, type InvoiceItem } from "@/services/invoice.service";
import { userService, type User } from "@/services/user.service";
import { projectService, type Project } from "@/services/project.service";
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

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Edit / Delete State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Form Fields
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tax, setTax] = useState(10.0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<any>("Draft");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [updating, setUpdating] = useState(false);

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Fetch invoice details
  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await invoiceService.getInvoiceById(id);
        setInvoice(data);
        // Pre-fill form fields
        setClientId(data.clientId);
        setProjectId(data.projectId || "none");
        setIssueDate(data.issueDate ? data.issueDate.split("T")[0] : "");
        setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
        setTax(data.tax);
        setNotes(data.notes || "");
        setStatus(data.status);
        setItems(data.items || []);
      } catch (error) {
        console.error("Failed to load invoice details", error);
        toast.error("Invoice details could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    async function fetchProject() {
      await fetchInvoice();
    }
  }, [id, refreshTrigger]);

  // Load lists when opening edit sheet
  const handleOpenEdit = async () => {
    setIsEditOpen(true);
    if (users.length > 0) return;
    setLoadingLists(true);
    try {
      const [usersData, projectsData] = await Promise.all([
        userService.getAllUsers(),
        projectService.getAllProjects(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      toast.error("Failed to load selection lists");
    } finally {
      setLoadingLists(false);
    }
  };

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);

  // Directly update invoice status
  const handleUpdateStatus = async (newStatus: "Draft" | "Sent" | "Paid" | "Overdue") => {
    if (!id) return;
    try {
      await invoiceService.updateInvoice(id, { status: newStatus });
      toast.success(`Invoice status marked as ${newStatus}`);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update invoice status");
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await invoiceService.updateInvoice(id, {
        clientId,
        projectId: projectId === "none" || !projectId ? null : projectId,
        issueDate: issueDate || undefined,
        dueDate: dueDate || undefined,
        tax: Number(tax),
        notes,
        status,
        items: items.map(({ description, quantity, rate }) => ({
          description,
          quantity: Number(quantity) || 1,
          rate: Number(rate) || 0,
        })),
      });
      toast.success("Invoice updated successfully");
      setIsEditOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update invoice");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await invoiceService.deleteInvoice(id);
      toast.success("Invoice deleted successfully");
      navigate("/admin/invoices");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  // Add an item to edit form
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, rate: 0 },
    ]);
  };

  // Remove an item from edit form
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update an item field in edit form
  const handleUpdateItemField = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-10">
        <p className="text-lg font-semibold text-foreground/80">Invoice not found.</p>
        <Link to="/admin/invoices" className="text-blue underline mt-2 block">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto h-full pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link to="/admin/invoices">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Icons.arrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Invoice {invoice.id.slice(-6).toUpperCase()}</h2>
              <Badge variant="secondary" className="capitalize">
                {invoice.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Issued on {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenEdit}>
            <Icons.pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          {invoice.status !== "Paid" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus("Paid")}>
              <Icons.circleCheck className="mr-2 h-4 w-4" /> Mark as Paid
            </Button>
          )}
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Icons.trash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex justify-between border-b pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-bold">Enterprise CRM</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  456 Business Road<br />
                  New York, NY 10001<br />
                  billing@enterprise-crm.com
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">INVOICE</h3>
                <p className="text-sm font-medium mt-1"># {invoice.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</p>
                <p className="font-bold text-lg">{invoice.client?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{invoice.client?.email || ""}</p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-right">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                  
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium text-red-500">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              <div className="divide-y">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <div key={item.id || index} className="grid grid-cols-12 gap-4 py-4 text-sm items-center">
                      <div className="col-span-6 font-medium">{item.description}</div>
                      <div className="col-span-2 text-center text-muted-foreground">{item.quantity}</div>
                      <div className="col-span-2 text-right text-muted-foreground">${item.rate.toFixed(2)}</div>
                      <div className="col-span-2 text-right font-medium">${(item.quantity * item.rate).toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No items listed in this invoice.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-1/2">
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Tax ({invoice.tax}%)</span>
                  <span className="font-medium">${(invoice.subtotal * (invoice.tax / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 text-lg font-bold text-primary">
                  <span>Total Due</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">NOTES</p>
              <p className="text-sm text-muted-foreground">{invoice.notes || "No billing notes provided."}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.status !== "Paid" && (
                <Button className="w-full bg-blue text-white hover:bg-blue/90" onClick={() => handleUpdateStatus("Sent")}>
                  <Icons.send className="mr-2 h-4 w-4" /> Send Invoice
                </Button>
              )}
              {invoice.project && (
                <div className="p-3 border rounded-lg bg-muted/20">
                  <span className="text-xs text-muted-foreground block mb-1">Linked Project</span>
                  <Link to={`/admin/projects/${invoice.projectId}`} className="font-medium text-sm text-blue hover:underline">
                    {invoice.project.name}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Invoice Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Invoice</SheetTitle>
            <SheetDescription>Modify invoice details, tax rate, or items.</SheetDescription>
          </SheetHeader>
          {loadingLists ? (
            <div className="flex justify-center items-center py-20">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceClient">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="editInvoiceClient">
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
                <Label htmlFor="editInvoiceProject">Project (Optional)</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="editInvoiceProject">
                    <SelectValue placeholder="No project linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project linked</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceIssueDate">Issue Date</Label>
                <Input id="editInvoiceIssueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceDueDate">Due Date</Label>
                <Input id="editInvoiceDueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceTax">Tax Rate (%)</Label>
                <Input id="editInvoiceTax" type="number" step="0.1" value={tax} onChange={(e) => setTax(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceStatus">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger id="editInvoiceStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="editInvoiceNotes">Billing Notes</Label>
                <Textarea id="editInvoiceNotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              {/* Dynamic Items Area */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="flex items-center gap-1">
                    <Icons.plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="border p-3 rounded-lg relative space-y-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="absolute right-1 top-1 h-6 w-6 text-red hover:bg-red/10"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="e.g. Consulting Hours"
                          value={item.description}
                          onChange={(e) => handleUpdateItemField(idx, "description", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemField(idx, "quantity", parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rate ($)</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItemField(idx, "rate", parseFloat(e.target.value) || 0)}
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
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this invoice? This action cannot be undone.
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
