import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { invoiceService, type Invoice } from "@/services/invoice.service";
import { useTranslation } from "react-i18next";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getAllInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Failed to load invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    {
      accessorKey: "id",
      header: t("invoices.labelId", "Invoice ID"),
      cell: ({ row }) => (
        <Link to={`/admin/invoices/${row.original.id}`} className="font-semibold text-blue hover:underline">
          {row.original.id.slice(-6).toUpperCase()}
        </Link>
      )
    },
    {
      id: "client",
      header: t("invoices.labelClient", "Client"),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.original.client?.name || "N/A"}</span>
          <span className="text-xs text-muted-foreground">{row.original.project?.name || "No Project Linked"}</span>
        </div>
      )
    },
    {
      accessorKey: "total",
      header: t("invoices.labelAmount", "Amount"),
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          ${row.original.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      accessorKey: "issueDate",
      header: t("invoices.labelIssueDate", "Issue Date"),
      cell: ({ row }) => <span>{new Date(row.original.issueDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "dueDate",
      header: t("invoices.labelDueDate", "Due Date"),
      cell: ({ row }) => <span>{new Date(row.original.dueDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "status",
      header: t("common.status", "Status"),
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        
        if (status === "Paid") variant = "default";
        if (status === "Overdue") variant = "destructive";
        if (status === "Sent") variant = "secondary";
        if (status === "Draft") variant = "outline";

        return (
          <Badge variant={variant} className={
            status === "Paid" ? "bg-greenBackground text-green hover:bg-greenBackground/90" : 
            status === "Sent" ? "bg-blueBackground text-blue hover:bg-blueBackground/90" : 
            status === "Draft" ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/admin/invoices/${row.original.id}`}>
              <span className="sr-only">Open</span>
              <Icons.chevronRight className="h-4 w-4" />
            </Link>
          </Button>
        );
      },
    }
  ], [t]);

  return (
    <div className="flex flex-col space-y-4 h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("invoices.title", "Invoices")}</h2>
          <p className="text-muted-foreground text-sm">{t("invoices.description", "Manage billing, track payments, and send invoices to clients.")}</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/admin/invoices/new">
            <Icons.plus className="h-4 w-4" />
            {t("invoices.createBtn", "Create Invoice")}
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={invoices} 
            gridCount={invoices.length} 
            toolbar={true}
            searchKey="status"
          />
        )}
      </div>
    </div>
  );
}
