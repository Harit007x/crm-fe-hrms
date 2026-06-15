import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/table-skeleton";
import { projectService, type Project } from "@/services/project.service";
import { useTranslation } from "react-i18next";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const columns = useMemo<ColumnDef<Project>[]>(() => [
    {
      accessorKey: "name",
      header: t("projects.labelName", "Project Name"),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex flex-col">
            <Link
              to={`/admin/projects/${project.id}`}
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {project.name}
            </Link>
            <span className="text-xs text-muted-foreground">{project.code || "No code"}</span>
          </div>
        );
      },
    },
    {
      id: "client",
      header: t("projects.labelClient", "Client"),
      cell: ({ row }) => {
        return <span>{row.original.clientName || row.original.client?.name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: t("common.status", "Status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },

    {
      accessorKey: "progress",
      header: t("projects.labelProgress", "Progress"),
      cell: ({ row }) => {
        const progress = row.original.progress || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-full bg-secondary rounded-full h-2 min-w-[80px]">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold">{progress}%</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <Link to={`/admin/projects/${project.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open</span>
              <Icons.chevronRight className="h-4 w-4" />
            </Button>
          </Link>
        );
      },
    }
  ], [t]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("projects.title", "Projects")}
        description={t("projects.description", "Track and manage ongoing projects, scopes, and assignments.")}
      />

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : (
          <DataTable
            columns={columns}
            data={projects}
            gridCount={projects.length}
            toolbar={true}
          />
        )}
      </div>
    </div>
  );
}
