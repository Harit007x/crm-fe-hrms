import SideNav from "@/components/side-nav";
import { Icons } from "@/components/icons";
import type { SideNavbar } from "@/utils/types";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const role = user?.role || "TEAM_MEMBER";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (role === "ADMIN" || role === "CLIENT") {
      logout();
      toast.error("Access Denied: Admin and Client accounts cannot access the HRMS portal.");
      navigate("/login");
    } else if (role === "HR") {
      navigate("/hr/dashboard");
    }
  }, [role, logout, navigate]);

  const navItems: SideNavbar[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          path: "/admin/dashboard",
          icon: <Icons.home className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "HR Services",
      items: [
        {
          title: "Leave Apply",
          path: "/admin/leave-apply",
          icon: <Icons.post className="w-5 h-5" />,
        },
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
          title: "Events",
          path: "/admin/events",
          icon: <Icons.calender className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Organization",
      items: [
        ...(role === "MANAGER"
          ? [
              {
                title: "Users & Teams",
                path: "/admin/users",
                icon: <Icons.users className="w-5 h-5" />,
              },
            ]
          : []),
        {
          title: "Files",
          path: "/admin/files",
          icon: <Icons.cloudUpload className="w-5 h-5" />,
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
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Settings",
          path: "/admin/settings",
          icon: <Icons.settings className="w-5 h-5" />,
        },
      ],
    },
  ].filter((category) => category.items.length > 0);

  return (
    <SideNav navBar={navItems}>
      <div key={location.pathname} className="mx-auto w-full max-w-7xl animate-page-enter">
        <Outlet />
      </div>
    </SideNav>
  );
}
