import SideNav from "@/components/side-nav";
import { Icons } from "@/components/icons";
import type { SideNavbar } from "@/utils/types";
import { Outlet } from "react-router-dom";
export default function AdminLayout() {
  const adminNavItems: SideNavbar[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          path: "/admin/dashboard",
          icon: <Icons.home className="w-5 h-5" />,
        },
        {
          title: "Analytics",
          path: "/admin/analytics",
          icon: <Icons.barChart2 className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Projects",
          path: "/admin/projects",
          icon: <Icons.folder className="w-5 h-5" />,
        },
        {
          title: "Tasks & Board",
          path: "/admin/tasks/board",
          icon: <Icons.clipboardCheck className="w-5 h-5" />,
        },
        {
          title: "Proposals",
          path: "/admin/proposals",
          icon: <Icons.post className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Daily Reports",
          path: "/admin/daily-reports",
          icon: <Icons.fileClock className="w-5 h-5" />,
        },
        {
          title: "Expenses",
          path: "/admin/expenses",
          icon: <Icons.billing className="w-5 h-5" />,
        },
        {
          title: "Invoices",
          path: "/admin/invoices",
          icon: <Icons.scrollText className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Organization",
      items: [
        {
          title: "Users & Teams",
          path: "/admin/users",
          icon: <Icons.users className="w-5 h-5" />,
        },
        {
          title: "Files",
          path: "/admin/files",
          icon: <Icons.cloudUpload className="w-5 h-5" />,
        },
        {
          title: "Settings",
          path: "/admin/settings",
          icon: <Icons.settings className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <SideNav navBar={adminNavItems}>
      <div className="max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </SideNav>
  );
}
