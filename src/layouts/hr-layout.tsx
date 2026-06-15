import SideNav from "@/components/side-nav";
import { Icons } from "@/components/icons";
import type { SideNavbar } from "@/utils/types";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function HRLayout() {
  const { user, logout } = useAuthStore();
  const role = user?.role || "TEAM_MEMBER";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (role !== "HR" && role !== "ADMIN") {
      toast.error("Access Denied: Only HR and Admin accounts can access the HR Portal.");
      navigate("/admin/dashboard");
    }
  }, [role, logout, navigate]);

  const navItems: SideNavbar[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          path: "/hr/dashboard",
          icon: <Icons.home className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "HR Management",
      items: [
        {
          title: "Employees",
          path: "/hr/employees",
          icon: <Icons.users className="w-5 h-5" />,
        },
        {
          title: "Attendance",
          path: "/hr/attendance",
          icon: <Icons.fileClock className="w-5 h-5" />,
        },
        {
          title: "Leave Approvals",
          path: "/hr/leaves",
          icon: <Icons.clipboardCheck className="w-5 h-5" />,
        },
        {
          title: "Holidays",
          path: "/hr/holidays",
          icon: <Icons.calender className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Company",
      items: [
        {
          title: "Events",
          path: "/hr/events",
          icon: <Icons.post className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Settings",
          path: "/hr/settings",
          icon: <Icons.settings className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <SideNav navBar={navItems}>
      <div key={location.pathname} className="mx-auto w-full max-w-7xl animate-page-enter">
        <Outlet />
      </div>
    </SideNav>
  );
}
