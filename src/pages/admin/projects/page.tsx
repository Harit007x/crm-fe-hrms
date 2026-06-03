import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
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
            <span className="font-semibold text-blue hover:underline">
              <Link to={`/admin/projects/${project.id}`}>{project.name}</Link>
            </span>
            <span className="text-xs text-foreground/50">{project.code || "No Code"}</span>
          </div>
        );
      },
    },
    {
      id: "client",
      header: t("projects.labelClient", "Client"),
      cell: ({ row }) => {
        return <span>{row.original.client?.name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: t("common.status", "Status"),
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant: "green" | "orange" | "blue" | "red" = "blue";
        
        if (status === "Completed") badgeVariant = "green";
        else if (status === "Pending") badgeVariant = "orange";
        else if (status === "Delayed") badgeVariant = "red";
        
        return (
          <span className="capitalize">
            <Badge variant={badgeVariant}>{status}</Badge>
          </span>
        );
      },
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

  // Temporary local badge helper since Badge is imported from components/ui/badge
  const Badge = ({ variant, children }: { variant: "green" | "orange" | "blue" | "red" | "secondary"; children: React.ReactNode }) => {
    let classes = "bg-primary/10 text-primary";
    if (variant === "green") classes = "bg-greenBackground text-green hover:bg-greenBackground/80";
    else if (variant === "orange") classes = "bg-orangeBackground text-orange hover:bg-orangeBackground/80";
    else if (variant === "red") classes = "bg-redBackground text-red hover:bg-redBackground/80";
    else if (variant === "secondary") classes = "bg-secondary text-secondary-foreground";
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${classes}`}>
        {children}
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-4 h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("projects.title", "Projects")}</h2>
          <p className="text-sm text-foreground/60">{t("projects.description", "Track and manage ongoing projects, scopes, and assignments.")}</p>
        </div>
        <Link to="/admin/projects/new">
          <Button className="flex items-center gap-2">
            <Icons.plus className="h-4 w-4" />
            {t("projects.createBtn", "New Project")}
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
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
