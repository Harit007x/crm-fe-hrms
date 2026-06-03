import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { projectService, type Project } from "@/services/project.service";
import { invoiceService } from "@/services/invoice.service";
import { useTranslation } from "react-i18next";

type LineItemInput = {
  description: string;
  quantity: number;
  rate: number;
};

export default function InvoiceNewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Form Fields
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [tax, setTax] = useState(10.0);
  const [notes, setNotes] = useState("Payment is due within 14 days of issue. Thank you for your business!");
  const [items, setItems] = useState<LineItemInput[]>([
    { description: "", quantity: 1, rate: 0 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, projectsData] = await Promise.all([
          userService.getAllUsers(),
          projectService.getAllProjects()
        ]);
        setUsers(usersData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load invoice creation selections", error);
        toast.error("Failed to load clients or projects list");
      } finally {
        setLoadingLists(false);
      }
    };
    loadData();
  }, []);

  const clients = useMemo(() => users.filter((u) => u.role === "CLIENT"), [users]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof LineItemInput, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (invoiceStatus: "Draft" | "Sent") => {
    if (!clientId || !issueDate || !dueDate) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setSubmitting(true);
    try {
      await invoiceService.createInvoice({
        clientId,
        projectId: projectId === "none" || !projectId ? undefined : projectId,
        issueDate,
        dueDate,
        tax,
        notes,
        status: invoiceStatus,
        items: items.map(({ description, quantity, rate }) => ({
          description,
          quantity: Number(quantity) || 1,
          rate: Number(rate) || 0,
        }))
      });

      toast.success(`Invoice successfully saved as ${invoiceStatus}`);
      navigate("/admin/invoices");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto h-full pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link to="/admin/invoices">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("invoices.createTitle", "Create Invoice")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("invoices.createDescription", "Build a new invoice to send to a client.")}
          </p>
        </div>
      </div>

      {loadingLists ? (
        <div className="flex justify-center items-center py-20">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceClient">Client <span className="text-red-500">*</span></Label>
                      <Select value={clientId} onValueChange={setClientId} required>
                        <SelectTrigger id="invoiceClient">
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
                      <Label htmlFor="invoiceProject">Project</Label>
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="invoiceProject">
                          <SelectValue placeholder="Select project (Optional)" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceIssueDate">Issue Date</Label>
                      <Input 
                        id="invoiceIssueDate" 
                        type="date" 
                        value={issueDate} 
                        onChange={(e) => setIssueDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDueDate">Due Date <span className="text-red-500">*</span></Label>
                      <Input 
                        id="invoiceDueDate" 
                        type="date" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground pb-2 border-b">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <Input 
                          placeholder="Item description" 
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="font-medium pr-2">${(item.quantity * item.rate).toFixed(2)}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addItem} className="mt-4 flex items-center gap-1">
                    <Icons.plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Tax Rate (%)</span>
                    <Input 
                      type="number" 
                      step="0.1" 
                      className="w-20 text-right h-8" 
                      value={tax} 
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax Amount</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Payment terms or thank you note..." 
                    className="min-h-[120px]" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button 
                  type="button" 
                  disabled={submitting} 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubmit("Draft")}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="button" 
                  disabled={submitting} 
                  className="w-full bg-blue text-white hover:bg-blue/90 flex items-center justify-center gap-2"
                  onClick={() => handleSubmit("Sent")}
                >
                  <Icons.send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send to Client"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
