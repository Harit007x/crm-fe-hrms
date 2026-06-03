import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { proposalService, type Proposal } from "@/services/proposal.service";
import { useTranslation } from "react-i18next";

export default function ProposalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await proposalService.getAllProposals();
        setProposals(data);
      } catch (error) {
        console.error("Failed to load proposals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const columns = useMemo<ColumnDef<Proposal>[]>(() => [
    {
      accessorKey: "id",
      header: t("proposals.labelId", "Proposal ID"),
      cell: ({ row }) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-blue hover:underline" 
          onClick={() => navigate(`/admin/proposals/${row.original.id}`)}
        >
          {row.original.id}
        </Button>
      )
    },
    {
      id: "client",
      header: t("proposals.labelClient", "Client"),
      cell: ({ row }) => <span>{row.original.client?.name || "N/A"}</span>,
    },
    {
      accessorKey: "title",
      header: t("proposals.labelTitle", "Project Title"),
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
    },
    {
      accessorKey: "value",
      header: t("proposals.labelValue", "Est. Value"),
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          ${row.original.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      accessorKey: "validUntil",
      header: t("proposals.labelValidUntil", "Valid Until"),
      cell: ({ row }) => <span>{new Date(row.original.validUntil).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "status",
      header: t("common.status", "Status"),
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        
        if (status === "Accepted") variant = "default";
        if (status === "Rejected") variant = "destructive";
        if (status === "Sent") variant = "secondary";
        if (status === "Draft") variant = "outline";

        return (
          <Badge variant={variant} className={
            status === "Accepted" ? "bg-greenBackground text-green hover:bg-greenBackground/90" : 
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => navigate(`/admin/proposals/${row.original.id}`)}
          >
            <span className="sr-only">Open</span>
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        );
      },
    }
  ], [t, navigate]);

  return (
    <div className="flex flex-col space-y-4 h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("proposals.title", "Proposals")}</h2>
          <p className="text-muted-foreground text-sm">{t("proposals.description", "Create, manage, and track project proposals and quotes.")}</p>
        </div>
        <Button onClick={() => navigate("/admin/proposals/new")} className="flex items-center gap-2">
          <Icons.plus className="h-4 w-4" />
          {t("proposals.createBtn", "New Proposal")}
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
            data={proposals} 
            gridCount={proposals.length} 
            toolbar={true}
          />
        )}
      </div>
    </div>
  );
}
